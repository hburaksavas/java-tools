(() => {
  if (window.SwaggerStudio) return;
  const core = window.SwaggerStudioCore, bridge = window.SwaggerStudioBridge, syntax = window.SwaggerStudioJson;
  const jsonCode = (text, force = false) => syntax ? syntax.code(text, force) : el('pre', text);
  const source = [...document.scripts].find(s => new URL(s.src, location.href).pathname.endsWith('/studio.js'))?.src || new URL('studio.js', location.href).href;
  const styleUrl = new URL('studio.css', source); styleUrl.search = new URL(source).search; const stylesheet = styleUrl.href;
  let host, shadow, spec, ui, config, ops = [], specUrl, storageKey, selected = null, tabs = [], favorites = [], recent = [], drafts = new Map(), controller, busy = false, generation = 0, activity = [], searchTerm = '', favoriteOnly = false, savedFocus, oldOverflow, renderedId, overviewScroll = 0;
  const el = (tag, text, cls) => { const n = document.createElement(tag); if (text !== undefined) n.textContent = text; if (cls) n.className = cls; return n; };
  const button = (label, fn, cls) => { const n = el('button', label, cls); n.type = 'button'; n.onclick = fn; return n; };
  function read(key) { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } }
  let responseViews = Object.create(null), groups = [], switchGroup, groupLoading = false;
  function persist() { try { localStorage.setItem(storageKey, JSON.stringify({ version: 2, favorites, tabs, selected: selected?.id || null, recent, views: responseViews })); } catch {} }
  function field(label, value = '', type = 'text', definition) {
    const wrap = el('label', undefined, 'field'); wrap.append(el('span', label));
    let input;
    if (definition?.enum) { input = el('select'); input.append(new Option('Select…', '')); for (const v of definition.enum) input.append(new Option(String(v), String(v))); }
    else { input = el(type === 'textarea' ? 'textarea' : 'input'); if (type !== 'textarea') input.type = type; }
    if (type !== 'file') input.value = value; input.autocomplete = 'off'; input.spellcheck = false; wrap.append(input);
    if (definition?.description) wrap.append(el('small', definition.description));
    return { wrap, input };
  }
  // Array controls share JSON as their source of truth, preserving omitted/empty values.
  function createListField(label, definition, get, set, state) {
    const wrap = el('section', undefined, 'field list-field'); wrap.setAttribute('aria-label', label);
    const bar = el('div', undefined, 'list-heading'), mode = el('select'), enabled = el('input');
    enabled.type = 'checkbox'; enabled.checked = get() !== undefined; enabled.setAttribute('aria-label', `Send ${label}`);
    mode.setAttribute('aria-label', `${label} input mode`); mode.append(new Option('Value rows', 'items'), new Option('JSON', 'json')); mode.value = state.mode || 'items';
    bar.append(el('strong', `${label}${definition.requiredField ? ' *' : ''}`));
    const content = el('div', undefined, 'list-values'), error = el('small', '', 'error'), status = el('small', '', 'list-status'); error.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
    const advanced = el('details', undefined, 'list-options'); advanced.append(el('summary', 'JSON & sending options'));
    const sendLabel = el('label', undefined, 'list-include'); sendLabel.append(enabled, el('span', 'Include this field in the request'));
    const modeLabel = el('label', undefined, 'list-mode'); modeLabel.append(el('span', 'Edit as'), mode);
    advanced.append(sendLabel, modeLabel);
    wrap.append(bar);
    if (definition.description) wrap.append(el('small', definition.description));
    wrap.append(content, error, status, advanced);
    let saved = state.raw ?? get() ?? '[]';
    function updateStatus() {
      let values; try { values = JSON.parse(saved); } catch {}
      status.textContent = !enabled.checked ? 'Not included in this request. Type a value to include it.' : Array.isArray(values) && !values.length ? (label.endsWith(' · query') ? 'No values. The query parameter may be omitted; see Request preview.' : 'Empty list: 0 values will be sent.') : `${Array.isArray(values) ? values.length : 'Invalid'} value${values?.length === 1 ? '' : 's'} in this request.`;
      wrap.dataset.included = String(enabled.checked);
    }
    function commit(value) { state.raw = saved = value; enabled.checked = true; set(value); updateStatus(); }
    function draw() {
      content.replaceChildren(); error.textContent = ''; updateStatus();
      let values;
      try { values = JSON.parse(saved); if (!Array.isArray(values)) throw Error('Expected an array.'); }
      catch (e) { mode.value = 'json'; error.textContent = e.message; }
      if (mode.value === 'json') {
        const input = el('textarea'); input.value = saved; input.setAttribute('aria-label', `${label} JSON`);
        try { if (enabled.checked) core.typedValue(spec, definition, saved, label); } catch (e) { input.setCustomValidity(e.message); error.textContent = e.message; }
        input.oninput = () => { try { core.typedValue(spec, definition, input.value, label); input.setCustomValidity(''); error.textContent = ''; commit(input.value); } catch (e) { state.raw = saved = input.value; input.setCustomValidity(e.message); error.textContent = e.message; } };
        content.append(input); return;
      }
      const placeholderOnly = values.length === 0;
      (placeholderOnly ? [''] : values).forEach((value, i) => {
        const row = el('div', undefined, 'list-item'), input = el('input'); input.type = 'text'; input.value = typeof value === 'string' ? value : JSON.stringify(value);
        input.setAttribute('aria-label', `${label} item ${i + 1}`); input.placeholder = 'Enter a value…'; input.autocomplete = 'off';
        row.append(el('span', String(i + 1), 'list-index'));
        const initialErrors = placeholderOnly || !enabled.checked ? [] : core.validate(spec, definition.items, value, `${label}[${i}]`); input.setCustomValidity(initialErrors.join(' '));
        input.oninput = () => {
          if (!remove.isConnected) row.append(remove); remove.hidden = false;
          try { values[i] = core.typedValue(spec, definition.items || {}, input.value, `${label}[${i}]`); input.setCustomValidity(''); error.textContent = ''; commit(JSON.stringify(values)); }
          catch (e) { values[i] = input.value; commit(JSON.stringify(values)); input.setCustomValidity(e.message); error.textContent = e.message; }
        };
        const remove = button('×', () => { values.splice(i, 1); commit(JSON.stringify(values)); draw(); }); remove.setAttribute('aria-label', `Remove ${label} item ${i + 1}`); remove.title = 'Remove value'; remove.hidden = placeholderOnly;
        row.append(input); if (!placeholderOnly) row.append(remove); content.append(row);
      });
      content.append(button('+ Add item', () => { const item = core.schema(spec, definition.items); values.push(item.type === 'integer' || item.type === 'number' ? 0 : item.type === 'boolean' ? false : item.type === 'object' ? {} : ''); commit(JSON.stringify(values)); draw(); content.querySelectorAll('.list-item input')[values.length - 1]?.focus(); }, 'text-button'));

    }
    enabled.onchange = () => { set(enabled.checked ? saved : undefined); draw(); };
    mode.onchange = () => { if (enabled.checked && content.querySelector(':invalid')) { error.textContent = 'Correct the invalid list value before switching modes.'; mode.value = mode.value === 'json' ? 'items' : 'json'; return; } state.mode = mode.value; draw(); }; draw(); return wrap;
  }
  function tableSources(value) {
    const found = [], pending = [{value, path: '$'}]; let visited = 0;
    while (pending.length && visited++ < 5000 && found.length < 50) {
      const item = pending.shift();
      if (Array.isArray(item.value)) {
        if (item.value.every(row => row !== null && typeof row === 'object' && !Array.isArray(row))) found.push(item);
        // Arrays inside individual rows are expanded in cells, rather than scanned as separate tables.
      } else if (item.value && typeof item.value === 'object') {
        for (const [key, child] of Object.entries(item.value)) if (child && typeof child === 'object') pending.push({value: child, path: `${item.path}[${JSON.stringify(key)}]`});
      }
    }
    return found;
  }
  const layoutKey = 'brsvs:studio:request-layout';
  let requestLayout = read(layoutKey) === 'stacked' ? 'stacked' : 'split';
  function applyLayout() {
    const editor = shadow?.querySelector('.editor');
    if (editor) editor.dataset.layout = requestLayout;
    for (const control of shadow?.querySelectorAll('[data-request-layout]') || []) control.setAttribute('aria-pressed', String(control.dataset.requestLayout === requestLayout));
  }
  function themePicker() { return window.SwaggerStudioTheme.picker(); }
  function close() {
    if (!host) return;
    persist(); generation++; controller?.abort(); host.remove(); host = null; drafts.clear(); busy = false;
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
    if (busy) return;
    const previousId = selected?.id, from = shadow.querySelector('.tabs button.active')?.getBoundingClientRect();
    selected = op;
    if (op) { if (!tabs.includes(op.id)) tabs.push(op.id); recent = [op.id, ...recent.filter(id => id !== op.id)].slice(0, 8); }
    persist(); render();
    if (previousId !== op?.id) window.SwaggerStudioPlayful?.travel(from, shadow.querySelector('.tabs button.active')?.getBoundingClientRect());
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
    brand.append(el('h1', config.title || 'API Studio'));
    const auth = button('Authorize', () => {
      if (busy || groupLoading) return; try { bridge.openAuth(ui); close(); } catch (e) { alert(e.message); }
    }, 'auth-button');
    top.append(brand, el('small', spec.info?.title || 'API workspace'), el('span', undefined, 'grow'));
    if (groups.length > 1) {
      const group = el('select'); group.setAttribute('aria-label', 'API definition');
      for (const item of groups) {
        const option = el('option', item.name);
        option.value = item.url;
        option.selected = new URL(item.url, location.href).href === specUrl;
        group.append(option);
      }
      group.disabled = groupLoading;
      const groupStatus = el('span'); groupStatus.setAttribute('role', 'status');
      group.onchange = async () => {
        if (busy || groupLoading) { group.value = groups.find(item => new URL(item.url, location.href).href === specUrl)?.url || ''; return; }
        groupLoading = true; group.disabled = true; groupStatus.textContent = 'Loading API definition…';
        const current = generation;
        try {
          const next = await switchGroup(group.value);
          if (current === generation) { close(); overviewScroll = 0; renderedId = null; await open(next); }
        } catch (e) {
          if (current === generation) { close(); alert(e.message); }
        } finally {
          groupLoading = false;
          const activePicker = shadow?.querySelector('[aria-label="API definition"]');
          if (activePicker) activePicker.disabled = false;
        }
      };
      top.append(group, groupStatus);
    }
    if (ops.some(op => core.authorizationSchemes(spec, op).length)) top.append(auth);
    top.append(themePicker(), window.SwaggerStudioTheme.atmospherePicker(), button('Swagger ↗', close));
    const layout = el('div', undefined, 'layout'), side = el('aside', undefined, 'side');
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
    main.append(tabbar, selected ? editor(selected) : dashboard()); layout.append(side, main);
    shell.append(top, layout); shadow.append(shell);
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
    const footer = el('div', undefined, 'footer'); for (const [key, text] of [['Ctrl K', 'Find endpoint'], ['Ctrl Enter', 'Execute'], ['Alt W', 'Close endpoint tab'], ['Esc', 'Return to Swagger']]) { const item = el('span'); item.append(el('kbd', key, 'shortcut'), document.createTextNode(` ${text}`)); footer.append(item); } area.append(footer); return area;
  }
  function newDraft(op) {
    const types = Object.keys(core.bodyInfo(spec, op));
    const sys = ui?.getSystem?.() || ui;
    let base = core.baseUrl(spec, op, specUrl, location.href);
    try { const selectedServer = sys?.oas3Selectors?.selectedServer?.(`${op.path}:${op.method.toLowerCase()}`) || sys?.oas3Selectors?.selectedServer?.(); if (selectedServer) base = new URL(selectedServer, specUrl || location.href).href; } catch {}
    return { values: Object.create(null), form: Object.create(null), files: Object.create(null), bodies: Object.create(null), headers: [], body: undefined, auth: '', base, contentType: types.find(core.isJson) || types[0] || '', accept: '' };
  }
  function editor(op) {
    const draft = drafts.get(op.id) || newDraft(op); drafts.set(op.id, draft);
    draft.listStates ||= Object.create(null);
    const listField = (label, definition, get, set) => createListField(label, definition, get, set, draft.listStates[label] ||= {});
    const securityNames = core.authorizationSchemes(spec, op), secured = securityNames.length > 0;
    const area = el('div', undefined, 'editor'), heading = el('div', undefined, 'heading');
    const star = button(favorites.includes(op.id) ? '★' : '☆', () => { if (busy) return; favorites = favorites.includes(op.id) ? favorites.filter(x => x !== op.id) : [...favorites, op.id]; persist(); render(); }); star.setAttribute('aria-label', 'Toggle favorite');
    const copyApi = button('', async () => {
      let built; try { built = bridge.build?.(ui, core.requestOptions(spec, op, draft, specUrl, location.href)); } catch {}
      try { await navigator.clipboard.writeText(core.operationReport(spec, op, draft, built)); copyStatus.textContent = 'API details copied.'; }
      catch { copyStatus.textContent = 'Copy unavailable. Check clipboard permissions.'; }
    }, 'copy-api');
    copyApi.title = 'Copy API details'; copyApi.setAttribute('aria-label', 'Copy API details');
    const copyStatus = el('span', '', 'copy-status'); copyStatus.setAttribute('role', 'status');
    const curlMenu = el('details', undefined, 'curl-menu');
    const curlSummary = el('summary', 'cURL');
    curlMenu.append(curlSummary);
    const credentials = el('input'); credentials.type = 'checkbox';
    const credentialsLabel = el('label', undefined, 'row');
    credentialsLabel.append(credentials, el('span', secured ? 'Include authorization and custom headers' : 'Include custom headers'));
    const copyCurl = button('Copy cURL', async () => {
      try {
        const options = core.requestOptions(spec, op, draft, specUrl, location.href);
        const command = bridge.curl(ui, options, secured ? draft.auth : '', credentials.checked, location.href);
        await navigator.clipboard.writeText(command);
        copyStatus.textContent = 'cURL copied.';
        credentials.checked = false;
        curlMenu.open = false;
        curlSummary.focus();
      } catch (e) { copyStatus.textContent = e.message; }
    }, 'text-button');
    const curlOptions = el('div', undefined, 'curl-options');
    curlOptions.append(credentialsLabel, copyCurl, el('small', 'Bash or Zsh · before request interceptor'));
    curlMenu.append(curlOptions);
    const layouts = el('div', undefined, 'layout-picker'); layouts.setAttribute('role', 'group'); layouts.setAttribute('aria-label', 'Request and response layout');
    for (const [value, label] of [['split', 'Side by side'], ['stacked', 'Stacked']]) {
      const control = button(label, () => { requestLayout = value; try { localStorage.setItem(layoutKey, JSON.stringify(value)); } catch {} applyLayout(); });
      control.dataset.requestLayout = value; control.setAttribute('aria-pressed', String(requestLayout === value)); layouts.append(control);
    }
    area.dataset.layout = requestLayout;
    heading.append(el('span', op.method, `method ${op.method}`), el('h2', op.path), star, copyApi, curlMenu, copyStatus, el('span', undefined, 'grow'), layouts); area.append(heading, el('p', [op.summary, op.description].filter(Boolean).join('\n'), 'description'));
    const server = el('div', undefined, 'server-inline'), serverLabel = button(draft.base, () => { serverLabel.hidden = true; serverInput.hidden = false; serverInput.value = draft.base; serverInput.focus(); serverInput.select(); }, 'server-label');
    serverLabel.title = 'Edit Server URL'; serverLabel.setAttribute('aria-label', 'Edit Server URL');
    const serverInput = el('input'); serverInput.value = draft.base; serverInput.hidden = true; serverInput.setAttribute('aria-label', 'Server URL'); serverInput.spellcheck = false;
    const finishServer = save => { if (save) draft.base = serverInput.value.trim(); serverLabel.textContent = draft.base || 'Set Server URL'; serverInput.hidden = true; serverLabel.hidden = false; };
    serverInput.oninput = () => draft.base = serverInput.value;
    let serverBefore = draft.base;
    serverLabel.addEventListener('click', () => { serverBefore = draft.base; });
    serverInput.onblur = () => finishServer(true);
    serverInput.onkeydown = event => { if (event.key === 'Enter' || event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); if (event.key === 'Escape') { draft.base = serverBefore; serverInput.value = serverBefore; } finishServer(event.key === 'Enter'); serverLabel.focus(); } };
    server.append(serverLabel, serverInput); heading.insertBefore(server, copyStatus);

    const requestStart = area.children.length;
    if (secured) {
      const authDetails = el('details'); authDetails.append(el('summary', 'Override Authorization header for this request'));
      const auth = field('Authorization override', draft.auth, 'password'); auth.input.placeholder = 'Bearer …'; auth.input.oninput = () => draft.auth = auth.input.value; authDetails.append(auth.wrap); area.append(authDetails);
    }
    for (const p of op.parameters.filter(p => !['body', 'formData'].includes(p.in))) {
      const key = `${p.in}:${p.name}`, s = core.schema(spec, p.schema || p); const f = field(`${p.name}${p.required ? ' *' : ''} · ${p.in} · ${s.type || 'string'}`, draft.values[key], 'text', { ...s, description: p.description || s.description });
      if (p.in === 'cookie') { f.input.disabled = true; f.input.placeholder = 'Managed by your browser session'; }
      else { f.input.placeholder = ['array','object'].includes(s.type) ? 'Enter JSON' : String(p.example ?? s.default ?? ''); f.input.oninput = () => draft.values[key] = f.input.value; }
      if (s.type === 'array' && p.in !== 'cookie') area.append(listField(`${p.name} · ${p.in}`, { ...s, requiredField: p.required, description: p.description || s.description }, () => draft.values[key], value => draft.values[key] = value));
      else area.append(f.wrap);
    }
    const headersSection = el('section', undefined, 'request-headers'), headerBar = el('div', undefined, 'headers-heading'), headerRows = el('div', undefined, 'header-rows');
    const addHeader = button('+ Add', () => { draft.headers.push({ name:'', value:'', enabled:true }); drawHeaders(); headerRows.lastChild?.querySelector('input[type=text]')?.focus(); }, 'text-button');
    addHeader.setAttribute('aria-label', 'Add header'); addHeader.title = 'Add header'; headerBar.append(el('h3', 'Headers'), el('span', undefined, 'grow'), addHeader); headersSection.append(headerBar, headerRows); area.append(headersSection);
    function drawHeaders() {
      headerRows.replaceChildren();
      draft.headers.forEach((header, index) => {
        const row = el('div', undefined, 'header-row'), enabled = el('input'), name = el('input'), value = el('input');
        enabled.type = 'checkbox'; enabled.checked = header.enabled !== false; enabled.setAttribute('aria-label', `Enable header ${index + 1}`); row.dataset.enabled = String(enabled.checked);
        enabled.onchange = () => { header.enabled = enabled.checked; row.dataset.enabled = String(enabled.checked); };
        name.type = value.type = 'text'; name.placeholder = 'Header'; value.placeholder = 'Value'; name.value = header.name; value.value = header.value;
        name.setAttribute('aria-label', `Header name ${index + 1}`); value.setAttribute('aria-label', `Header value ${index + 1}`);
        for (const input of [name, value]) { input.autocomplete = 'off'; input.spellcheck = false; }
        name.oninput = () => header.name = name.value; value.oninput = () => header.value = value.value;
        const remove = button('×', () => { draft.headers.splice(index, 1); drawHeaders(); (headerRows.children[index]?.querySelector('input[type=text]') || addHeader).focus(); }, 'remove-header');
        remove.setAttribute('aria-label', `Remove header ${index + 1}`); remove.title = 'Remove header'; row.append(enabled, name, value, remove); headerRows.append(row);
      });
    }
    drawHeaders();
    const contents = core.bodyInfo(spec, op), types = Object.keys(contents);
    if (types.length) {
      const typeField = el('label', undefined, 'field'); typeField.append(el('span', 'Request content type')); const type = el('select'); type.setAttribute('aria-label', 'Request content type'); types.forEach(t => type.append(new Option(t, t))); type.value = draft.contentType;
      type.onchange = () => { if (busy) return; draft.bodies[draft.contentType] = draft.body; draft.contentType = type.value; draft.body = draft.bodies[type.value]; draft.files = Object.create(null); render(); }; typeField.append(type); area.append(typeField);
      const definition = contents[draft.contentType], s = core.schema(spec, definition.schema);
      if (draft.contentType === 'multipart/form-data' || draft.contentType === 'application/x-www-form-urlencoded') {
        for (const [name, raw] of Object.entries(s.properties || {})) {
          const property = core.schema(spec, raw), binary = property.format === 'binary' || property.type === 'file' || property.type === 'array' && core.schema(spec, property.items).format === 'binary';
          const f = field(`${name}${s.required?.includes(name) ? ' *' : ''} · ${binary ? 'file' : property.type || 'string'}`, draft.form[name], binary ? 'file' : 'text', property);
          if (binary) { f.input.multiple = property.type === 'array'; f.input.onchange = () => { draft.files[name] = f.input.multiple ? Array.from(f.input.files) : f.input.files[0]; }; if (draft.files[name]) f.wrap.append(el('small', `Selected: ${[draft.files[name]].flat().map(file => file.name).join(', ')}. Reselect to replace.`)); }
          else f.input.oninput = () => draft.form[name] = f.input.value;
          if (!binary && property.type === 'array') area.append(listField(name, {...property, requiredField:s.required?.includes(name)}, () => draft.form[name], value => draft.form[name] = value));
          else area.append(f.wrap);
        }
      } else {
        if (draft.body === undefined) {
          const example = core.bodyExample(spec, op, draft.contentType);
          draft.body = core.isJson(draft.contentType) ? JSON.stringify(example ?? {}, null, 2) : typeof example === 'string' ? example : '';
        }
        const body = field(core.isJson(draft.contentType) ? 'JSON request body' : 'Request body', draft.body, 'textarea'); body.input.id = 'studio-request-body'; body.input.placeholder = '{\n  \n}'; body.input.oninput = () => draft.body = body.input.value;
        const bodyField = el('div', undefined, 'field body-field'), header = el('div', undefined, 'body-heading');
        const caption = el('label', core.isJson(draft.contentType) ? 'JSON request body' : 'Request body'); caption.htmlFor = body.input.id; header.append(caption);
        const jsonEditor = core.isJson(draft.contentType) ? syntax?.editor(body.input) : undefined;
        const validation = el('p', '', 'notice'); validation.setAttribute('aria-live', 'polite'); validation.hidden = true;
        if (core.isJson(draft.contentType)) {
          const format = button('{ }', () => { try { draft.body = JSON.stringify(JSON.parse(body.input.value), null, 2); body.input.value = draft.body; jsonEditor?.refresh(); validation.textContent = 'JSON formatted.'; } catch (e) { validation.textContent = e.message; } validation.hidden = false; }, 'format-icon');
          format.title = 'Format JSON'; format.setAttribute('aria-label', 'Format JSON'); header.append(format);
        }
        bodyField.append(header, jsonEditor?.element || body.input, validation); area.append(bodyField);
        if (core.isJson(draft.contentType)) {
          const lists = el('details', undefined, 'body-lists'); lists.append(el('summary', 'Edit list values')); lists.open = true;
          const listControls = el('div'); lists.append(listControls);
          function drawBodyLists(manual = false) {
            listControls.replaceChildren(); let parsed;
            try { parsed = JSON.parse(draft.body); } catch { listControls.append(el('small', 'Enter valid JSON to edit list fields.')); return; }
            function walk(raw, path = [], depth = 0) {
              if (depth > 8) return;
              const definition = core.schema(spec, raw);
              if (definition.type === 'array') {
                let parent = parsed;
                for (const key of path.slice(0, -1)) { if (parent === undefined) break; parent = parent && Object.hasOwn(parent, key) ? parent[key] : undefined; }
                if (path.length && parent !== undefined && (!parent || typeof parent !== 'object' || Array.isArray(parent))) return;
                const label = path.length ? path.join('.') : 'Body';
                const get = () => { let value = JSON.parse(draft.body); for (const key of path) value = value && Object.hasOwn(value, key) ? value[key] : undefined; return value === undefined ? undefined : JSON.stringify(value); };
                const stateKey = `body:${draft.contentType}:${label}`; if (manual) delete draft.listStates[stateKey];
                const state = draft.listStates[stateKey] ||= {};
                listControls.append(createListField(label, definition, get, value => {
                  let root = JSON.parse(draft.body), target = root;
                  if (!path.length) root = value === undefined ? undefined : JSON.parse(value);
                  else { for (const key of path.slice(0, -1)) { if (!Object.hasOwn(target, key)) { if (value === undefined) return; Object.defineProperty(target, key, {value: {}, enumerable:true, configurable:true, writable:true}); } target = target[key]; } if (value === undefined) delete target[path.at(-1)]; else { try { Object.defineProperty(target, path.at(-1), {value: JSON.parse(value), enumerable:true, configurable:true, writable:true}); } catch { validation.textContent = `${label}: enter valid JSON before updating the body.`; validation.hidden = false; return; } } }
                  draft.body = root === undefined ? '' : JSON.stringify(root, null, 2); body.input.value = draft.body; jsonEditor?.refresh();
                }, state));
              } else for (const [key, child] of Object.entries(definition.properties || {})) walk(child, [...path, key], depth + 1);
            }
            walk(s); lists.hidden = !listControls.children.length;
          }
          body.input.addEventListener('input', () => drawBodyLists(true));
          drawBodyLists(); area.insertBefore(lists, bodyField);
        }
      }
      const model = el('details'); model.append(el('summary', 'Request schema'), jsonCode(JSON.stringify(s, null, 2), true)); area.append(model);
    }
    const preview = el('details', undefined, 'request-preview'); preview.append(el('summary', 'Request preview'));
    const previewBody = el('div'); preview.append(previewBody); area.append(preview);
    function updatePreview() {
      if (!host || !preview.isConnected || !preview.open) return;
      try {
        const invalid = [...request.querySelectorAll('input,textarea')].find(input => input.closest('.list-field')?.dataset.included !== 'false' && !input.checkValidity());
        if (invalid) throw new Error(invalid.validationMessage);
        const options = core.requestOptions(spec, op, draft, specUrl, location.href), built = bridge.build(ui, options, secured ? draft.auth : '');
        let body = built.body;
        if (body instanceof FormData) body = [...body.entries()].map(([key,value]) => [key, typeof value === 'string' ? value : `[File: ${value.name}]`]);
        previewBody.replaceChildren(el('pre', `${op.method} ${built.url}`), el('pre', typeof body === 'string' ? body : JSON.stringify(body ?? null, null, 2)), el('small', 'Preview before request interceptor. Empty query lists may serialize to no parameter; check the service contract.'));
      } catch (e) { previewBody.replaceChildren(el('p', e.message, 'error')); }
    }
    preview.ontoggle = updatePreview;
    area.addEventListener('input', updatePreview); area.addEventListener('change', updatePreview); area.addEventListener('click', () => queueMicrotask(updatePreview));
    const controls = el('div', undefined, 'request-actions'), send = button('Execute', run, 'send'), cancel = button('Cancel', () => controller?.abort()); cancel.hidden = true; controls.append(send, cancel);
    const output = el('section', undefined, 'response'); output.setAttribute('aria-live', 'polite'); output.setAttribute('aria-label', 'Response'); output.dataset.studioPanel = 'true'; output.tabIndex = -1; const panels = el('div', undefined, 'request-response'), request = el('section', undefined, 'request'); request.setAttribute('aria-label', 'Request');
    const requestHeading = el('div', undefined, 'panel-heading'); requestHeading.append(el('h3', 'Request'), el('span', undefined, 'grow'), controls); request.append(requestHeading);
    for (const node of [...area.children].slice(requestStart)) request.append(node);
    output.append(responseHeader(), el('p', 'Execute a request to see the response.', 'empty response-placeholder'), responseSchema());
    panels.append(request, output); area.append(panels); if (draft.response) show(draft.response);
    function responseHeader() { const header = el('div', undefined, 'response-heading'); header.append(el('h3', 'Response')); return header; }
    function responseSchema() {
      const panel = el('details', undefined, 'response-schema'); panel.append(el('summary', 'Response schema')); panel.open = !!draft.schemaOpen;
      panel.ontoggle = () => { if (panel.isConnected) draft.schemaOpen = panel.open; };
      const definitions = core.responseDefinitions(spec, op), preferred = draft.schemaStatus ?? draft.response?.status;
      const initial = core.selectResponseDefinition(definitions, preferred);
      if (!definitions.length) { panel.append(el('p', 'No response schema defined.', 'schema-empty')); return panel; }
      const controls = el('div', undefined, 'schema-controls'), statusField = el('label', undefined, 'field'), typeField = el('label', undefined, 'field');
      const status = el('select'), type = el('select'), body = el('div'); status.setAttribute('aria-label', 'Schema response status'); type.setAttribute('aria-label', 'Schema content type');
      statusField.append(el('span', 'Status'), status); typeField.append(el('span', 'Content type'), type); controls.append(statusField, typeField); panel.append(controls, body);
      for (const item of definitions) status.append(new Option(item.status, item.status));
      if (!initial && preferred !== undefined) status.append(new Option(`${preferred} · Not defined`, String(preferred)));
      status.value = initial?.status || String(preferred);
      function drawSchema() {
        const definition = definitions.find(item => item.status === status.value), media = definition?.media.find(item => item.type === type.value);
        body.replaceChildren(media && media.schema !== undefined ? jsonCode(JSON.stringify(core.resolve(spec, media.schema), null, 2), true) : el('p', 'No response schema defined.', 'schema-empty'));
      }
      function drawTypes() {
        const definition = definitions.find(item => item.status === status.value), media = definition?.media || [];
        type.replaceChildren(...media.map(item => new Option(item.type, item.type))); typeField.hidden = !media.length;
        const responseType = draft.response?.contentType;
        type.value = media.find(item => item.type === draft.schemaType)?.type || media.find(item => item.type === responseType)?.type || media.find(item => responseType && (item.type === '*/*' || item.type.endsWith('/*') && responseType.startsWith(item.type.slice(0,-1))))?.type || media.find(item => core.isJson(item.type))?.type || media[0]?.type || '';
        drawSchema();
      }
      status.onchange = () => { draft.schemaStatus = status.value; draft.schemaType = undefined; drawTypes(); };
      type.onchange = () => { draft.schemaType = type.value; drawSchema(); }; drawTypes(); return panel;
    }
    function focusResponse() {
      const main = shadow.querySelector('.main'); if (!main || !output.isConnected) return;
      const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      const top = Math.max(0, main.scrollTop + output.getBoundingClientRect().top - main.getBoundingClientRect().top - 58);
      const bounds = output.getBoundingClientRect(), viewport = main.getBoundingClientRect();
      const visible = bounds.top >= viewport.top + 54 && bounds.top < viewport.bottom - 64;
      if (!visible && main.scrollTo) main.scrollTo({ top, behavior: reduced ? 'instant' : 'smooth' }); else if (!visible) main.scrollTop = top;
      output.focus({ preventScroll: true });
      output.classList.remove('arrived');
      if (!reduced) { void output.offsetWidth; output.classList.add('arrived'); }
    }
    function show(result) {
      output.replaceChildren(); if (result.error) { output.append(responseHeader(), el('p', result.error, 'error'), responseSchema()); return; }
      const status = el('div', undefined, 'response-heading'); status.append(el('h3', 'Response'), el('strong', `${result.status} ${result.statusText || ''}`, `status ${result.status < 400 ? 'ok' : 'fail'}`), el('span', `${result.ms} ms`, 'muted'), el('span', undefined, 'grow'));
      const copy = button('Copy body', async () => { try { await navigator.clipboard.writeText(result.body); copy.textContent = 'Copied'; } catch { copy.textContent = 'Copy unavailable'; } }, 'text-button'); status.append(copy); output.append(status);
      const details = el('details'); details.append(el('summary', 'Response headers'), el('pre', result.headers)); output.append(details);
      let sources = [];
      if (result.status < 400) { try { sources = tableSources(JSON.parse(result.body)); } catch {} }
      const content = el('div', undefined, 'response-body');
      if (!sources.length) { output.append(jsonCode(result.body), responseSchema()); return; }
      const toolbar = el('div', undefined, 'row response-view'), source = el('select'); source.setAttribute('aria-label', 'Table array');
      for (const item of sources) source.append(new Option(item.path, item.path));
      source.value = sources.some(item => item.path === draft.tablePath) ? draft.tablePath : sources[0].path;
      const json = button('JSON', () => choose('json')), table = button('Table', () => choose('table'));
      toolbar.append(json, table, source); output.append(toolbar, content, responseSchema());
      let page = 0;
      function choose(view) { responseViews[op.id] = view; persist(); page = 0; draw(); }
      function draw() {
        const tabular = responseViews[op.id] === 'table'; source.hidden = !tabular || sources.length < 2;
        json.setAttribute('aria-pressed', String(!tabular)); table.setAttribute('aria-pressed', String(tabular)); content.replaceChildren();
        if (!tabular) { content.append(jsonCode(result.body)); return; }
        const rows = sources.find(item => item.path === source.value).value, columns = [...new Set(rows.flatMap(row => Object.keys(row)))];
        if (!rows.length) { content.append(el('p', 'Empty array · 0 rows', 'empty')); return; }
        const scroll = el('div', undefined, 'table-scroll'), grid = el('table', undefined, 'response-table'), head = el('thead'), heading = el('tr'), body = el('tbody');
        // Keep wide or large responses usable without dropping the original JSON.
        const visibleColumns = columns.slice(0, 100);
        for (const name of visibleColumns) { const cell = el('th', name); cell.scope = 'col'; heading.append(cell); } head.append(heading);
        for (const row of rows.slice(page * 100, (page + 1) * 100)) {
          const tr = el('tr');
          for (const name of visibleColumns) {
            const cell = el('td');
            if (!Object.hasOwn(row, name)) cell.append(el('span', '—', 'muted'));
            else if (row[name] && typeof row[name] === 'object') { const nested = el('details'); nested.append(el('summary', Array.isArray(row[name]) ? `Array (${row[name].length})` : 'Object'), jsonCode(JSON.stringify(row[name], null, 2), true)); cell.append(nested); }
            else cell.textContent = row[name] === null ? 'null' : String(row[name]);
            tr.append(cell);
          }
          body.append(tr);
        }
        grid.append(head, body); scroll.append(grid); content.append(scroll);
        const paging = el('div', undefined, 'row'), previous = button('Previous', () => { page--; draw(); }), next = button('Next', () => { page++; draw(); }); previous.disabled = page === 0; next.disabled = (page + 1) * 100 >= rows.length;
        paging.append(previous, el('span', `${page * 100 + 1}–${Math.min((page + 1) * 100, rows.length)} / ${rows.length} rows`), next); content.append(paging);
        if (columns.length > 100) content.append(el('small', 'First 100 columns shown. JSON contains all columns.'));
      }
      source.onchange = () => { draft.tablePath = source.value; page = 0; draw(); }; draw();
    }
    function networkJourney() {
      const scene = el('div', undefined, 'network-journey'); scene.dataset.phase = 'preparing';
      const title = el('div', undefined, 'journey-title'); title.append(el('span', 'REQUEST JOURNEY'), el('small', 'Visual simulation'));
      const art = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      art.setAttribute('viewBox', '0 0 600 180'); art.setAttribute('aria-hidden', 'true');
      art.innerHTML = `<path class="journey-track" d="M112 83H488M112 107H488"/><path class="journey-dashes" d="M112 83H488"/>
        <g class="journey-client"><rect class="journey-node" x="26" y="53" width="86" height="68" rx="10"/><path class="journey-line" d="M27 69h84m-70-8h2m6 0h2m6 0h2m-12 27-8 7 8 7m28-14 8 7-8 7m-10-18-6 22"/><text x="69" y="151">BROWSER</text></g>
        <g class="journey-gateway"><rect class="journey-node" x="260" y="60" width="80" height="60" rx="15"/><path class="journey-line" d="M281 81h38m-38 9h38m-38 9h20m-24 11h1m7 0h1m7 0h1"/><text x="300" y="151">NETWORK</text></g>
        <g class="journey-server"><circle class="journey-orbit" cx="530" cy="87" r="51"/><rect class="journey-node" x="488" y="45" width="84" height="84" rx="12"/><path class="journey-line" d="M497 72h66m-66 27h66m-56-40h28m-28 27h28m-28 27h28"/><circle class="journey-led" cx="552" cy="59" r="3"/><circle class="journey-led" cx="552" cy="86" r="3"/><circle class="journey-led" cx="552" cy="113" r="3"/><text x="530" y="151">SERVER</text></g>
        <g class="journey-outbound"><rect x="0" y="-6" width="19" height="12" rx="4"/><path d="m5-2 4 3 5-3"/></g>
        <g class="journey-return"><rect x="0" y="-6" width="19" height="12" rx="4"/><path d="m5-2 4 3 5-3"/></g>
        <g class="journey-spark"><path d="m400 76 8 8-8 8m16-16-8 8 8 8"/></g>`;
      const detail = el('div', undefined, 'journey-detail'), label = el('span', 'Preparing request'), bytes = el('small', '');
      label.setAttribute('role', 'status'); detail.append(el('i', undefined, 'journey-dot'), label, el('span', undefined, 'grow'), bytes);
      const steps = el('div', undefined, 'journey-steps');
      for (const text of ['Prepare', 'Send', 'Receive', 'Complete']) steps.append(el('span', text));
      scene.append(title, art, detail, steps);
      let finished = false;
      function phase(name, info = {}) {
        if (finished || !scene.isConnected) return;
        scene.dataset.phase = name;
        const labels = { preparing: 'Preparing request', waiting: 'Waiting for server response', receiving: 'Receiving response' };
        label.textContent = labels[name] || labels.preparing;
        if (info.bytes !== undefined) bytes.textContent = `${(info.bytes / 1024).toFixed(1)} KiB received`;
        if (info.status !== undefined) scene.dataset.outcome = info.status >= 400 ? 'error' : info.status >= 300 ? 'redirect' : 'success';
      }
      function finish(status, error) {
        if (finished) return; finished = true;
        scene.dataset.phase = 'complete';
        scene.dataset.outcome = error?.name === 'AbortError' ? 'cancelled' : error || !status ? 'offline' : status >= 400 ? 'error' : status >= 300 ? 'redirect' : 'success';
        label.textContent = error?.name === 'AbortError' ? 'Request cancelled' : error ? 'Server offline' : `HTTP ${status} · Response received`;
        scene.classList.add('journey-finished');
        if (error && error.name !== 'AbortError') bytes.textContent = 'Unreachable or blocked';
      }
      return { scene, phase, finish };
    }
    async function run() {
      if (busy || groupLoading) return;
      const invalid = [...request.querySelectorAll('input,textarea')].find(input => input.closest('.list-field')?.dataset.included !== 'false' && !input.checkValidity());
      if (invalid) { show({error: invalid.validationMessage}); invalid.reportValidity(); return; }
      let options; try { options = core.requestOptions(spec, op, draft, specUrl, location.href); } catch (e) { show({ error: e.message }); focusResponse(); return; }
      busy = true; send.setAttribute('aria-disabled', 'true'); send.setAttribute('aria-busy', 'true'); cancel.hidden = false; output.setAttribute('aria-busy', 'true'); controller = new AbortController(); const current = generation, start = performance.now(); const journey = networkJourney(); output.replaceChildren(responseHeader(), journey.scene, responseSchema());
      const feedback = window.SwaggerStudioResponseEffects?.start(shadow.querySelector('.shell'), 'studio-execute'); focusResponse();
      try {
        const response = await bridge.send(ui, options, { signal: controller.signal, onPhase: journey.phase, manualAuth: secured ? draft.auth : '', confirmOrigin: origin => confirm(`Send ${op.method} request and its credentials to ${origin}?`) });
        if (current !== generation) return;
        let body = response.text ?? response.data ?? ''; if (typeof body !== 'string') body = JSON.stringify(body, null, 2); try { body = JSON.stringify(JSON.parse(body), null, 2); } catch {}
        if (response.headers?.['x-studio-truncated'] === 'true') body += '\n[Response truncated at 1 MiB]';
        draft.response = { status: response.status, statusText: response.statusText, ms: Math.round(performance.now() - start), contentType: String(Object.entries(response.headers || {}).find(([key]) => key.toLowerCase() === 'content-type')?.[1] || '').split(';')[0].trim(), headers: Object.entries(response.headers || {}).map(([k,v]) => `${k}: ${v}`).join('\n'), body };
        draft.schemaStatus = undefined; draft.schemaType = undefined;
        activity.push({ method: op.method, path: op.path, status: response.status, ms: draft.response.ms }); activity = activity.slice(-100); journey.finish(response.status); show(draft.response); focusResponse(); feedback?.finish(response.status);
      } catch (e) { if (current === generation) { draft.response = { error: e.name === 'AbortError' ? 'Request cancelled.' : `${e.message}. Check network, CORS, certificate and page policy restrictions.` }; const offline = e.name !== 'AbortError' && journey.scene.dataset.phase === 'waiting';
        journey.finish(undefined, e); feedback?.finish(undefined, e);
        if (offline) {
          cancel.hidden = true;
          await new Promise(resolve => window.setTimeout(resolve, 1100));
          if (current !== generation || !output.isConnected) return;
        }
        show(draft.response); focusResponse(); activity.push({ method: op.method, path: op.path, status: 0, ms: Math.round(performance.now() - start) }); } }
      finally { if (current === generation) { busy = false; send.removeAttribute('aria-disabled'); send.removeAttribute('aria-busy'); send.textContent = 'Execute'; cancel.hidden = true; output.removeAttribute('aria-busy'); } }
    }
    return area;
  }
  async function open(data) {
    if (host) { close(); return; }
    savedFocus = document.activeElement; oldOverflow = document.documentElement.style.overflow; document.documentElement.style.overflow = 'hidden';
    host = el('div'); host.id = 'brsvs-studio-host'; host.style.cssText = 'position:fixed;inset:0;z-index:2147483647;'; shadow = host.attachShadow({ mode: 'open' }); document.documentElement.append(host);
    const current = ++generation;
    try {
      spec = data.spec; ui = data.ui || window.ui || window.swaggerUi; config = data.config || {}; specUrl = data.specUrl ? new URL(data.specUrl, location.href).href : '';
      groups = data.groups || []; switchGroup = data.switchGroup;
      if (!spec?.paths || !(spec.openapi || spec.swagger === '2.0')) throw new Error('Swagger API definition is not ready.');
      ops = core.operations(spec); storageKey = `studio:v2:${location.origin}${location.pathname}:${specUrl}`;
      const saved = read(storageKey) || {}; responseViews = Object.create(null);
      for (const [id, view] of Object.entries(saved.views || {})) if (view === 'table') responseViews[id] = view;
      const ids = new Set(ops.map(o => o.id));
      const clean = values => Array.isArray(values) ? [...new Set(values.filter(id => typeof id === 'string' && ids.has(id)))].slice(0, 100) : [];
      favorites = clean(saved.favorites); tabs = clean(saved.tabs); recent = clean(saved.recent); selected = ops.find(o => o.id === saved.selected && tabs.includes(o.id)) || null;
      window.SwaggerStudioTheme.configure(config);
      if (current !== generation) return;
      searchTerm = ''; favoriteOnly = false; render(); shadow.querySelector('button')?.focus(); persist(); window.dispatchEvent(new CustomEvent('studio-opened'));
    } catch (e) { close(); alert(e.message); }
  }
  document.addEventListener('keydown', e => {
    if (!host) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); shadow.querySelector('.search')?.focus(); }
    else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); shadow.querySelector('.send')?.click(); }
    else if (e.altKey && e.key.toLowerCase() === 'w' && selected) { e.preventDefault(); closeTab(selected.id); }
    else if (e.key === 'Tab') {
      const scope = shadow;
      const nodes = [...scope.querySelectorAll('button,input,textarea,select,summary,[tabindex="0"]')].filter(n => !n.disabled && !n.hidden && n.getClientRects().length && (n.tagName === 'SUMMARY' || !n.closest('details:not([open])')));
      const bowling = document.querySelector('#brsvs-theme-effects .bowling-control:not(:disabled)');
      if (bowling?.getClientRects().length) {
        if (e.shiftKey && shadow.activeElement === nodes[0]) { e.preventDefault(); bowling.focus(); return; }
        if (!e.shiftKey && shadow.activeElement === nodes.at(-1)) { e.preventDefault(); bowling.focus(); return; }
        if (document.activeElement === bowling) {
          e.preventDefault(); (e.shiftKey ? nodes.at(-1) : nodes[0])?.focus(); return;
        }
      }
      if (!nodes.length) return; const first = nodes[0], last = nodes.at(-1), active = shadow.activeElement;
      if (e.shiftKey && (active === first || !nodes.includes(active))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (active === last || !nodes.includes(active))) { e.preventDefault(); first.focus(); }
    }
  });
  window.addEventListener('studio-theme-changed', () => { if (host) { for (const select of shadow.querySelectorAll('[aria-label="Theme for Studio and Swagger"]')) select.value = window.SwaggerStudioTheme.preference(); for (const select of shadow.querySelectorAll('[data-atmosphere-picker]')) window.SwaggerStudioTheme.syncAtmospherePicker(select); } });
  window.addEventListener('storage', event => {
    if (event.key === layoutKey || event.key === null) { requestLayout = read(layoutKey) === 'stacked' ? 'stacked' : 'split'; if (host) applyLayout(); }
  });
  window.SwaggerStudio = { open, close };
})();
