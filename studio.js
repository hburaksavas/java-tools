(() => {
  if (window.SwaggerStudio) return;
  const core = window.SwaggerStudioCore, bridge = window.SwaggerStudioBridge;
  const source = [...document.scripts].find(s => s.src.endsWith('/studio.js'))?.src || new URL('studio.js', location.href).href;
  const stylesheet = new URL('studio.css', source).href;
  let host, shadow, spec, ui, config, ops = [], specUrl, storageKey, selected = null, tabs = [], favorites = [], recent = [], drafts = new Map(), controller, busy = false, generation = 0, activity = [], searchTerm = '', favoriteOnly = false, effect = 'none', effectChosen = false, settingsOpen = false, savedFocus, oldOverflow, renderedId, overviewScroll = 0;
  const validEffect = value => ['none', 'snow', 'stars'].includes(value) ? value : 'none';
  const el = (tag, text, cls) => { const n = document.createElement(tag); if (text !== undefined) n.textContent = text; if (cls) n.className = cls; return n; };
  const button = (label, fn, cls) => { const n = el('button', label, cls); n.type = 'button'; n.onclick = fn; return n; };
  function read(key) { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } }
  function persist() { try { localStorage.setItem(storageKey, JSON.stringify({ version: 2, favorites, tabs, selected: selected?.id || null, recent, effect, effectChosen })); } catch {} }
  function field(label, value = '', type = 'text', definition) {
    const wrap = el('label', undefined, 'field'); wrap.append(el('span', label));
    let input;
    if (definition?.enum) { input = el('select'); input.append(new Option('Select…', '')); for (const v of definition.enum) input.append(new Option(String(v), String(v))); }
    else { input = el(type === 'textarea' ? 'textarea' : 'input'); if (type !== 'textarea') input.type = type; }
    if (type !== 'file') input.value = value; input.autocomplete = 'off'; input.spellcheck = false; wrap.append(input);
    if (definition?.description) wrap.append(el('small', definition.description));
    return { wrap, input };
  }
  function themePicker() {
    const select = el('select'); select.setAttribute('aria-label', 'Theme for Studio and Swagger');
    for (const [v, label] of [['system', '◐ System'], ['dark', '◑ Dark'], ['light', '☀ Light']]) select.append(new Option(label, v));
    select.value = window.SwaggerStudioTheme?.preference() || 'system';
    select.onchange = () => window.SwaggerStudioTheme?.set(select.value); return select;
  }
  function effectPicker() {
    const select = el('select'); select.setAttribute('aria-label', 'Visual effect'); select.title = 'Visual effects';
    for (const [v, label] of [['none', 'Effects off'], ['snow', '❄ Snow'], ['stars', '✦ Stars']]) select.append(new Option(label, v));
    select.value = effect;
    select.onchange = () => {
      effect = validEffect(select.value); effectChosen = true; persist();
      for (const picker of shadow.querySelectorAll('[aria-label="Visual effect"]')) picker.value = effect;
      shadow.querySelector('.snow')?.remove(); snow(shadow.querySelector('.shell'));
    };
    return select;
  }
  function close() {
    if (!host) return;
    persist(); generation++; controller?.abort(); host.remove(); host = null; drafts.clear(); busy = false; settingsOpen = false;
    document.documentElement.style.overflow = oldOverflow;
    if (savedFocus?.isConnected) savedFocus.focus();
    window.dispatchEvent(new CustomEvent('studio-closed'));
  }
  function closeTab(id) {
    if (busy) return; tabs = tabs.filter(x => x !== id); drafts.delete(id);
    if (selected?.id === id) selected = ops.find(o => o.id === tabs.at(-1)) || null;
    persist(); render();
  }
  function select(op) {
    if (busy) return; selected = op;
    if (op) { if (!tabs.includes(op.id)) tabs.push(op.id); recent = [op.id, ...recent.filter(id => id !== op.id)].slice(0, 8); }
    persist(); render();
  }
  function opButton(op) {
    const b = button('', () => select(op), `endpoint ${selected?.id === op.id ? 'active' : ''}`);
    b.append(el('span', op.method, `method ${op.method}`), el('span', op.path)); b.title = op.summary || op.path; return b;
  }
  function render() {
    const previousMain = shadow.querySelector('.main');
    if (previousMain) {
      if (renderedId && drafts.has(renderedId)) drafts.get(renderedId).scrollTop = previousMain.scrollTop;
      else overviewScroll = previousMain.scrollTop;
    }
    // Keep the loaded stylesheet attached across view changes; removing it causes layout/scroll jumps.
    if (!shadow.querySelector('link[rel="stylesheet"]')) {
      const link = el('link'); link.rel = 'stylesheet'; link.href = stylesheet; shadow.append(link);
    }
    shadow.querySelector('.shell')?.remove();
    const shell = el('section', undefined, 'shell'); shell.setAttribute('role', 'dialog'); shell.setAttribute('aria-modal', 'true'); shell.setAttribute('aria-label', 'Swagger UI Studio');
    const top = el('header', undefined, 'top'), brand = el('div', undefined, 'brand');
    if (config.logoUrl) { try { const url = new URL(config.logoUrl, location.href); if (url.origin === location.origin && ['http:', 'https:'].includes(url.protocol)) { const img = el('img', undefined, 'logo'); img.src = url.href; img.alt = ''; brand.append(img); } } catch {} }
    brand.append(el('h1', config.title || '◈ API STUDIO'));
    const auth = button('Authorize', () => {
      if (busy) return; try { bridge.openAuth(ui); close(); } catch (e) { alert(e.message); }
    }, 'auth-button');
    top.append(brand, el('small', spec.info?.title || 'API workspace'), el('span', undefined, 'grow'), effectPicker(), auth, themePicker(), button('Settings', () => openSettings()), button('Swagger ↗', close));
    const layout = el('div', undefined, 'layout'), side = el('aside', undefined, 'side'); side.append(button('⌂ Overview', () => select(null), 'home-button'));
    const search = el('input', undefined, 'search'); search.placeholder = 'Find endpoint · Ctrl K'; search.setAttribute('aria-label', 'Search endpoints'); search.value = searchTerm; side.append(search);
    const check = el('input'); check.type = 'checkbox'; check.checked = favoriteOnly;
    const filter = el('label', undefined, 'filter'); filter.append(check, el('span', 'Favorites only')); side.append(filter);
    const list = el('nav'); list.setAttribute('aria-label', 'Endpoints'); side.append(list);
    const drawList = () => {
      list.replaceChildren(); const q = searchTerm.toLowerCase();
      const matches = ops.filter(o => (!favoriteOnly || favorites.includes(o.id)) && `${o.path} ${o.method} ${o.summary || ''} ${(o.tags || []).join(' ')}`.toLowerCase().includes(q));
      const groups = new Map(); for (const op of matches) { const tag = op.tags?.[0] || 'General'; if (!groups.has(tag)) groups.set(tag, []); groups.get(tag).push(op); }
      for (const [tag, items] of groups) { list.append(el('h3', `${tag} · ${items.length}`, 'group')); items.forEach(op => list.append(opButton(op))); }
      if (!matches.length) list.append(el('p', 'No endpoints found.', 'empty'));
    };
    search.oninput = () => { searchTerm = search.value; drawList(); }; check.onchange = () => { favoriteOnly = check.checked; drawList(); }; drawList();
    const main = el('main', undefined, 'main'), tabbar = el('div', undefined, 'tabs');
    tabbar.append(button('Overview', () => select(null), `home-tab ${selected ? '' : 'active'}`));
    for (const id of tabs) {
      const op = ops.find(o => o.id === id); if (!op) continue;
      const t = el('div', undefined, 'tab'); t.append(button(`${op.method} ${op.path}`, () => select(op), selected?.id === id ? 'active' : ''), button('×', () => closeTab(id), 'remove'));
      t.lastChild.setAttribute('aria-label', `Close ${op.method} ${op.path}`); tabbar.append(t);
    }
    main.append(tabbar, selected ? editor(selected) : dashboard()); layout.append(side, main); shell.append(top, layout); shadow.append(shell); snow(shell);
    main.scrollTop = selected ? drafts.get(selected.id)?.scrollTop || 0 : overviewScroll;
    renderedId = selected?.id || null;
  }
  function dashboard() {
    const area = el('div', undefined, 'welcome'), hero = el('div', undefined, 'hero'), intro = el('div');
    intro.append(el('p', 'YOUR API, ONE WORKSPACE', 'eyebrow'), el('h2', config.welcomeTitle || `Welcome to ${spec.info?.title || 'API Studio'}`), el('p', config.welcomeMessage || 'Explore your API, build requests and inspect responses. Everything you need, right where your API lives.'));
    const badges = el('div', undefined, 'row'); badges.append(el('span', `v${spec.info?.version || '1.0'}`, 'badge'), el('span', `OpenAPI ${spec.openapi || spec.swagger}`, 'badge'), el('span', 'Connected to this application', 'badge')); intro.append(badges);
    const browse = button('Explore endpoints ↗', () => { shadow.querySelector('.search').focus(); }, 'primary'); intro.append(browse); hero.append(intro, el('div', '{ / }', 'hero-mark')); area.append(hero);
    const groups = new Set(ops.flatMap(o => o.tags?.length ? o.tags : ['General']));
    const stats = el('div', undefined, 'stats');
    for (const [label, value, note] of [['Endpoints', ops.length, 'Ready to explore'], ['API groups', groups.size, 'Organized by tags'], ['Favorites', favorites.length, 'Saved in this browser'], ['Session requests', activity.length, activity.length ? `${activity.filter(a => a.status >= 200 && a.status < 400).length} successful` : 'Your next request starts here']]) {
      const card = el('div', undefined, 'stat'); card.append(el('span', label, 'stat-label'), el('strong', String(value)), el('small', note)); stats.append(card);
    }
    area.append(stats);
    const columns = el('div', undefined, 'columns');
    for (const [title, ids, empty] of [['★ Your favorites', favorites, 'Star an endpoint to keep it close.'], ['Recently opened', recent, 'Open an endpoint from the sidebar to begin.']]) {
      const card = el('section', undefined, 'card'); card.append(el('h3', title)); const items = ids.map(id => ops.find(o => o.id === id)).filter(Boolean).slice(0, 5);
      if (!items.length) card.append(el('p', empty, 'empty')); else items.forEach(op => card.append(opButton(op))); columns.append(card);
    }
    area.append(columns);
    const lower = el('div', undefined, 'columns'), methods = el('section', undefined, 'card'); methods.append(el('h3', 'API at a glance'));
    const counts = new Map(); for (const op of ops) counts.set(op.method, (counts.get(op.method) || 0) + 1);
    const bars = el('div', undefined, 'method-bars'), legend = el('div', undefined, 'legend'), colors = { GET: '#25ae8a', POST: '#ce982f', PUT: '#718fe3', PATCH: '#9287ff', DELETE: '#e86586' };
    for (const [method, count] of counts) { const bar = el('span'); bar.style.flex = count; bar.style.background = colors[method] || '#9287ff'; bars.append(bar); legend.append(el('span', `${method} ${count}`)); }
    methods.append(bars, legend);
    const session = el('section', undefined, 'card'); session.append(el('h3', 'Session activity'));
    if (!activity.length) session.append(el('p', 'Response status and timing will appear here after you send a request.', 'empty'));
    for (const a of activity.slice(-4).reverse()) { const row = el('div', undefined, 'activity'); row.append(el('span', `${a.method} ${a.path}`), el('span', `${a.status || 'Error'} · ${a.ms} ms`)); session.append(row); }
    lower.append(methods, session); area.append(lower);
    const footer = el('div', undefined, 'footer'); for (const [key, text] of [['Ctrl K', 'Find endpoint'], ['Ctrl Enter', 'Send request'], ['Alt W', 'Close endpoint tab'], ['Esc', 'Return to Swagger']]) { const item = el('span'); item.append(el('kbd', key, 'shortcut'), document.createTextNode(` ${text}`)); footer.append(item); } area.append(footer); return area;
  }
  function newDraft(op) {
    const types = Object.keys(core.bodyInfo(spec, op));
    const sys = ui?.getSystem?.() || ui;
    let base = core.baseUrl(spec, op, specUrl, location.href);
    try { const selectedServer = sys?.oas3Selectors?.selectedServer?.(`${op.path}:${op.method.toLowerCase()}`) || sys?.oas3Selectors?.selectedServer?.(); if (selectedServer) base = new URL(selectedServer, specUrl || location.href).href; } catch {}
    return { values: Object.create(null), form: Object.create(null), files: Object.create(null), body: '', auth: '', base, contentType: types.find(core.isJson) || types[0] || '', accept: '' };
  }
  function editor(op) {
    const draft = drafts.get(op.id) || newDraft(op); drafts.set(op.id, draft);
    const area = el('div', undefined, 'editor'), heading = el('div', undefined, 'heading');
    const star = button(favorites.includes(op.id) ? '★' : '☆', () => { if (busy) return; favorites = favorites.includes(op.id) ? favorites.filter(x => x !== op.id) : [...favorites, op.id]; persist(); render(); }); star.setAttribute('aria-label', 'Toggle favorite');
    heading.append(el('span', op.method, `method ${op.method}`), el('h2', op.path), star); area.append(heading, el('p', [op.summary, op.description].filter(Boolean).join('\n'), 'description'));
    const base = field('Server URL', draft.base); base.input.oninput = () => draft.base = base.input.value; area.append(base.wrap);
    const schemes = bridge.authSummary(ui); area.append(el('p', schemes.length ? `Using Swagger authorization: ${schemes.join(', ')}` : 'Authorization is shared with Swagger. Use Authorize to sign in.', 'notice'));
    const authDetails = el('details'); authDetails.append(el('summary', 'Override Authorization header for this request'));
    const auth = field('Authorization override · memory only', draft.auth, 'password'); auth.input.placeholder = 'Bearer …'; auth.input.oninput = () => draft.auth = auth.input.value; authDetails.append(auth.wrap); area.append(authDetails);
    for (const p of op.parameters.filter(p => !['body', 'formData'].includes(p.in))) {
      const key = `${p.in}:${p.name}`, s = core.schema(spec, p.schema || p); const f = field(`${p.name}${p.required ? ' *' : ''} · ${p.in} · ${s.type || 'string'}`, draft.values[key], 'text', { ...s, description: p.description || s.description });
      if (p.in === 'cookie') { f.input.disabled = true; f.input.placeholder = 'Managed by your browser session'; }
      else { f.input.placeholder = ['array','object'].includes(s.type) ? 'Enter JSON' : String(p.example ?? s.default ?? ''); f.input.oninput = () => draft.values[key] = f.input.value; }
      area.append(f.wrap);
    }
    const contents = core.bodyInfo(spec, op), types = Object.keys(contents);
    if (types.length) {
      const typeField = el('label', undefined, 'field'); typeField.append(el('span', 'Request content type')); const type = el('select'); type.setAttribute('aria-label', 'Request content type'); types.forEach(t => type.append(new Option(t, t))); type.value = draft.contentType;
      type.onchange = () => { if (busy) return; draft.contentType = type.value; draft.files = Object.create(null); render(); }; typeField.append(type); area.append(typeField);
      const definition = contents[draft.contentType], s = core.schema(spec, definition.schema);
      if (draft.contentType === 'multipart/form-data' || draft.contentType === 'application/x-www-form-urlencoded') {
        for (const [name, raw] of Object.entries(s.properties || {})) {
          const property = core.schema(spec, raw), binary = property.format === 'binary' || property.type === 'file' || property.type === 'array' && core.schema(spec, property.items).format === 'binary';
          const f = field(`${name}${s.required?.includes(name) ? ' *' : ''} · ${binary ? 'file' : property.type || 'string'}`, draft.form[name], binary ? 'file' : 'text', property);
          if (binary) { f.input.multiple = property.type === 'array'; f.input.onchange = () => { draft.files[name] = f.input.multiple ? Array.from(f.input.files) : f.input.files[0]; }; if (draft.files[name]) f.wrap.append(el('small', `Selected: ${[draft.files[name]].flat().map(file => file.name).join(', ')}. Reselect to replace.`)); }
          else f.input.oninput = () => draft.form[name] = f.input.value;
          area.append(f.wrap);
        }
      } else {
        const body = field(core.isJson(draft.contentType) ? 'JSON request body' : 'Request body', draft.body, 'textarea'); body.input.placeholder = '{\n  \n}'; body.input.oninput = () => draft.body = body.input.value; area.append(body.wrap);
        const tools = el('div', undefined, 'row'); tools.append(button('Generate example', () => { if (busy) return; const example = core.bodyExample(spec, op, draft.contentType); draft.body = core.isJson(draft.contentType) ? JSON.stringify(example ?? {}, null, 2) : typeof example === 'string' ? example : ''; body.input.value = draft.body; }));
        if (core.isJson(draft.contentType)) tools.append(button('Format JSON', () => { try { draft.body = JSON.stringify(JSON.parse(body.input.value), null, 2); body.input.value = draft.body; validation.textContent = 'JSON formatted.'; } catch (e) { validation.textContent = e.message; } }));
        const validation = el('p', '', 'notice'); validation.setAttribute('aria-live', 'polite'); area.append(tools, validation);
      }
      const model = el('details'); model.append(el('summary', 'Request schema'), el('pre', JSON.stringify(s, null, 2))); area.append(model);
    }
    area.append(el('p', 'Uses Swagger authorization and request/response interceptors. Request data stays in memory until Studio closes.', 'notice'));
    const controls = el('div', undefined, 'row'), send = button('Send request ↗', run, 'send'), cancel = button('Cancel', () => controller?.abort()); cancel.hidden = true; controls.append(send, cancel); area.append(controls);
    const output = el('section', undefined, 'response'); output.setAttribute('aria-live', 'polite'); output.setAttribute('aria-label', 'Response'); output.tabIndex = -1; area.append(output); if (draft.response) show(draft.response);
    function focusResponse() {
      const main = shadow.querySelector('.main'); if (!main || !output.isConnected) return;
      const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      const top = Math.max(0, main.scrollTop + output.getBoundingClientRect().top - main.getBoundingClientRect().top - 58);
      if (main.scrollTo) main.scrollTo({ top, behavior: reduced ? 'instant' : 'smooth' }); else main.scrollTop = top;
      output.focus({ preventScroll: true });
      output.classList.remove('arrived');
      if (!reduced) { void output.offsetWidth; output.classList.add('arrived'); }
    }
    function show(result) {
      output.replaceChildren(); if (result.error) { output.append(el('h3', 'Response'), el('p', result.error, 'error')); return; }
      const status = el('div', undefined, 'response-heading'); status.append(el('h3', 'Response'), el('strong', `${result.status} ${result.statusText || ''}`, `status ${result.status < 400 ? 'ok' : 'fail'}`), el('span', `${result.ms} ms`, 'muted'), el('span', undefined, 'grow'));
      const copy = button('Copy body', async () => { try { await navigator.clipboard.writeText(result.body); copy.textContent = 'Copied'; } catch { copy.textContent = 'Copy unavailable'; } }, 'text-button'); status.append(copy); output.append(status);
      const details = el('details'); details.append(el('summary', 'Response headers'), el('pre', result.headers)); output.append(details, el('pre', result.body));
    }
    async function run() {
      if (busy) return;
      let options; try { options = core.requestOptions(spec, op, draft, specUrl, location.href); } catch (e) { show({ error: e.message }); focusResponse(); return; }
      busy = true; send.setAttribute('aria-disabled', 'true'); send.textContent = 'Sending…'; cancel.hidden = false; output.setAttribute('aria-busy', 'true'); controller = new AbortController(); const current = generation, start = performance.now(); output.replaceChildren(el('p', 'Waiting for response…', 'pending'));
      try {
        const response = await bridge.send(ui, options, { signal: controller.signal, manualAuth: draft.auth, confirmOrigin: origin => confirm(`Send ${op.method} request and its credentials to ${origin}?`) });
        if (current !== generation) return;
        let body = response.text ?? response.data ?? ''; if (typeof body !== 'string') body = JSON.stringify(body, null, 2); try { body = JSON.stringify(JSON.parse(body), null, 2); } catch {}
        if (response.headers?.['x-studio-truncated'] === 'true') body += '\n[Response truncated at 1 MiB]';
        draft.response = { status: response.status, statusText: response.statusText, ms: Math.round(performance.now() - start), headers: Object.entries(response.headers || {}).map(([k,v]) => `${k}: ${v}`).join('\n'), body };
        activity.push({ method: op.method, path: op.path, status: response.status, ms: draft.response.ms }); activity = activity.slice(-100); show(draft.response); focusResponse();
      } catch (e) { if (current === generation) { draft.response = { error: e.name === 'AbortError' ? 'Request cancelled.' : `${e.message}. Check network, CORS, certificate and page policy restrictions.` }; show(draft.response); focusResponse(); activity.push({ method: op.method, path: op.path, status: 0, ms: Math.round(performance.now() - start) }); } }
      finally { if (current === generation) { busy = false; send.removeAttribute('aria-disabled'); send.textContent = 'Send request ↗'; cancel.hidden = true; output.removeAttribute('aria-busy'); } }
    }
    return area;
  }
  function snow(shell) {
    if (effect === 'none' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const layer = el('div', undefined, `snow ${effect}`); layer.setAttribute('aria-hidden', 'true');
    const count = effect === 'snow' ? 42 : 30;
    for (let i = 0; i < count; i++) {
      const flake = el('span', effect === 'stars' ? '✦' : i % 4 ? '•' : '❄', 'flake'); flake.style.left = `${Math.random() * 100}%`; flake.style.fontSize = `${effect === 'snow' ? 11 + Math.random() * 9 : 7 + Math.random() * 7}px`;
      if (effect === 'stars') flake.style.top = `${Math.random() * 100}%`;
      flake.style.animationDuration = `${effect === 'snow' ? 7 + Math.random() * 10 : 2 + Math.random() * 4}s`; flake.style.animationDelay = `-${Math.random() * 20}s`; layer.append(flake);
    } shell.append(layer);
  }
  function openSettings() {
    if (settingsOpen || busy) return; settingsOpen = true;
    const backdrop = el('div', undefined, 'settings-backdrop'), panel = el('section', undefined, 'settings'); panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Studio settings');
    const header = el('div', undefined, 'heading'); header.append(el('h2', 'Make it yours'), el('span', undefined, 'grow'), button('Close settings', () => { settingsOpen = false; backdrop.remove(); })); panel.append(header);
    const theme = el('label', undefined, 'field'); theme.append(el('span', 'Shared Studio + Swagger theme'), themePicker()); panel.append(theme);
    const select = effectPicker();
    const label = el('label', undefined, 'field'); label.append(el('span', 'Visual effect'), select); panel.append(label, el('p', 'Effects respect your reduced-motion preference and do not intercept clicks.', 'notice'));
    panel.append(el('p', 'Favorites, open tabs, recent endpoints and appearance stay in this browser. Tokens, request bodies and responses are never saved by Studio.', 'notice'));
    panel.append(button('Reset workspace preferences', () => { favorites = []; tabs = []; recent = []; selected = null; effect = 'none'; persist(); settingsOpen = false; render(); }));
    backdrop.append(panel); shadow.querySelector('.shell').append(backdrop); panel.querySelector('button').focus();
  }
  async function open(data) {
    if (host) { close(); return; }
    savedFocus = document.activeElement; oldOverflow = document.documentElement.style.overflow; document.documentElement.style.overflow = 'hidden';
    host = el('div'); host.id = 'brsvs-studio-host'; host.style.cssText = 'position:fixed;inset:0;z-index:2147483647;'; shadow = host.attachShadow({ mode: 'open' }); document.documentElement.append(host);
    const current = ++generation;
    try {
      spec = data.spec; ui = data.ui || window.ui || window.swaggerUi; config = data.config || {}; specUrl = data.specUrl ? new URL(data.specUrl, location.href).href : '';
      if (!spec?.paths || !(spec.openapi || spec.swagger === '2.0')) throw new Error('Swagger API definition is not ready.');
      ops = core.operations(spec); storageKey = `studio:v2:${location.origin}${location.pathname}:${specUrl}`;
      const saved = read(storageKey) || {}, ids = new Set(ops.map(o => o.id));
      const clean = values => Array.isArray(values) ? [...new Set(values.filter(id => typeof id === 'string' && ids.has(id)))].slice(0, 100) : [];
      favorites = clean(saved.favorites); tabs = clean(saved.tabs); recent = clean(saved.recent); selected = ops.find(o => o.id === saved.selected && tabs.includes(o.id)) || null;
      effectChosen = saved.effectChosen === true; effect = validEffect(effectChosen ? saved.effect : config.effect); if (!localStorageAvailableTheme() && ['dark','light','system'].includes(config.theme)) window.SwaggerStudioTheme?.set(config.theme);
      if (current !== generation) return;
      searchTerm = ''; favoriteOnly = false; render(); shadow.querySelector('button')?.focus(); persist();
    } catch (e) { close(); alert(e.message); }
  }
  function localStorageAvailableTheme() { try { return localStorage.getItem('brsvs:studio:theme'); } catch { return null; } }
  document.addEventListener('keydown', e => {
    if (!host) return;
    if (e.key === 'Escape') { e.preventDefault(); if (settingsOpen) { settingsOpen = false; shadow.querySelector('.settings-backdrop')?.remove(); } else close(); }
    else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); shadow.querySelector('.search')?.focus(); }
    else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); shadow.querySelector('.send')?.click(); }
    else if (e.altKey && e.key.toLowerCase() === 'w' && selected) { e.preventDefault(); closeTab(selected.id); }
    else if (e.key === 'Tab') {
      const scope = settingsOpen ? shadow.querySelector('.settings') : shadow;
      const nodes = [...scope.querySelectorAll('button,input,textarea,select,[tabindex="0"]')].filter(n => !n.disabled && !n.hidden && n.getClientRects().length && !n.closest('details:not([open])'));
      if (!nodes.length) return; const first = nodes[0], last = nodes.at(-1), active = shadow.activeElement;
      if (e.shiftKey && (active === first || !nodes.includes(active))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (active === last || !nodes.includes(active))) { e.preventDefault(); first.focus(); }
    }
  });
  window.addEventListener('studio-theme-changed', () => { if (host) for (const select of shadow.querySelectorAll('[aria-label="Theme for Studio and Swagger"]')) select.value = window.SwaggerStudioTheme.preference(); });
  window.SwaggerStudio = { open, close };
})();
