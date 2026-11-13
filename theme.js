(() => {
  if (window.SwaggerStudioTheme) return;
  const dark = { bg: '#0c1018', panel: '#121824', input: '#181f2d', text: '#e6eaf2', muted: '#8b99b0', line: '#283142', accent: '#a497ff', soft: '#25233d', code: '#0e131d', snow: '#e0eaff', mode: 'dark' };
  const light = { bg: '#f4f6fa', panel: '#ffffff', input: '#f6f8fb', text: '#1e293d', muted: '#63718a', line: '#dce2ec', accent: '#7057df', soft: '#eeeafa', code: '#f7f8fc', snow: '#8069dc', mode: 'light' };
  const themes = {
    system: { label: '◐ System', effect: 'none' },
    light: { label: '☀ Daylight', effect: 'none', palette: light },
    dark: { label: '◑ Midnight', effect: 'none', palette: dark },
    winter: { label: '❄ Winter', effect: 'snow', palette: { ...dark, bg: '#091622', panel: '#102131', input: '#162b3d', line: '#29455a', accent: '#83d7ef', soft: '#183b4d', snow: '#e2f6ff' } },
    cosmic: { label: '✦ Cosmic', effect: 'stars', palette: { ...dark, bg: '#120d20', panel: '#1b142d', input: '#251d3b', line: '#3d2e57', accent: '#c5a0ff', soft: '#38244f', snow: '#e4d4ff' } },
    forest: { label: '♧ Forest', effect: 'none', palette: { ...dark, bg: '#0b1714', panel: '#10231d', input: '#183128', line: '#2a493c', accent: '#8cdbb3', soft: '#204334', snow: '#b4efd1' } }
  };
  const key = 'brsvs:studio:theme-v2';
  const query = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null;
  const motion = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
  let preference = 'system', explicit = false, layer;
  try {
    const saved = localStorage.getItem(key) || localStorage.getItem('brsvs:studio:theme');
    if (Object.hasOwn(themes, saved)) { preference = saved; explicit = true; }
  } catch {}
  const shared = document.createElement('style'); shared.id = 'brsvs-swagger-theme'; document.head.append(shared);
  const effectsStyle = document.createElement('style'); effectsStyle.textContent = `
    #brsvs-theme-effects{position:fixed;inset:0;pointer-events:none!important;overflow:hidden;z-index:2147483647;user-select:none}
    #brsvs-theme-effects span{position:absolute;top:-22px;color:var(--st-snow);animation:brsvs-snow linear infinite;opacity:.6;filter:drop-shadow(0 0 2px #a497ff22)}
    #brsvs-theme-effects.stars span{color:var(--st-accent);animation-name:brsvs-shimmer}
    @keyframes brsvs-snow{to{transform:translate3d(60px,105vh,0) rotate(130deg)}}
    @keyframes brsvs-shimmer{0%,100%{opacity:.12;transform:scale(.7)}50%{opacity:.75;transform:scale(1.15)}}
    @media(prefers-reduced-motion:reduce){#brsvs-theme-effects{display:none}}
  `; document.head.append(effectsStyle);
  function current() { return preference === 'system' ? query?.matches ? 'dark' : 'light' : preference; }
  function palette() { return themes[current()].palette; }
  function variables() { return Object.entries(palette()).filter(([k]) => k !== 'mode').map(([k,v]) => `--st-${k}:${v}`).join(';'); }
  function raiseEffects() { if (layer) document.documentElement.append(layer); }
  function effects() {
    layer?.remove(); layer = undefined;
    const effect = themes[current()].effect;
    if (effect === 'none' || motion?.matches) return;
    layer = document.createElement('div'); layer.id = 'brsvs-theme-effects'; layer.className = effect; layer.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < (effect === 'snow' ? 42 : 30); i++) {
      const flake = document.createElement('span'); flake.textContent = effect === 'stars' ? '✦' : i % 4 ? '•' : '❄';
      flake.style.left = `${Math.random() * 100}%`; flake.style.fontSize = `${effect === 'snow' ? 11 + Math.random() * 9 : 7 + Math.random() * 7}px`;
      if (effect === 'stars') flake.style.top = `${Math.random() * 100}%`;
      flake.style.animationDuration = `${effect === 'snow' ? 7 + Math.random() * 10 : 2 + Math.random() * 4}s`; flake.style.animationDelay = `-${Math.random() * 20}s`; layer.append(flake);
    }
    raiseEffects();
  }
  function apply() {
    const p = palette(); document.documentElement.dataset.studioTheme = current();
    // Scope stronger overrides to the Swagger page, including its method panels and syntax highlighter.
    shared.textContent = `
      :root{${variables()};color-scheme:${p.mode}}body{background:${p.bg}!important;color:${p.text}}
      html[data-studio-theme] .swagger-ui{color:${p.text}}
      html[data-studio-theme] .swagger-ui .topbar{background:${p.panel};border-bottom:1px solid ${p.line}}
      html[data-studio-theme] .swagger-ui :is(.info .title,.info p,.info li,.info h1,.info h2,.info h3,.opblock-tag,.opblock-tag small,.opblock-summary-description,.opblock-summary-path,.parameter__name,.parameter__type,.parameter__in,.response-col_status,.response-col_links,.responses-inner h4,.responses-inner h5,table thead tr td,table thead tr th,.tab li,label,.model-title,.model,.model-box,section.models h4,.btn,.modal-ux,.modal-ux h3,.modal-ux h4,.prop-type,.prop-format,.model-toggle,.renderedMarkdown,.opblock-summary-operation-id){color:${p.text}}
      html[data-studio-theme] .swagger-ui :is(.scheme-container,.modal-ux,.opblock-section-header,.responses-wrapper,.opblock-body){background:${p.panel};color:${p.text};box-shadow:none}
      html[data-studio-theme] .swagger-ui :is(input,textarea,select,.download-url-wrapper input[type=text]){background:${p.input};color:${p.text};border-color:${p.line}}
      html[data-studio-theme] .swagger-ui :is(a,.info a){color:${p.accent}}
      html[data-studio-theme] .swagger-ui :is(section.models,.opblock-tag,.modal-ux,table tbody tr td,.opblock-section-header){border-color:${p.line}}
      html[data-studio-theme] .swagger-ui :is(.model-box,.model-container,section.models .model-container){background:${p.input}}
      html[data-studio-theme] .swagger-ui :is(.opblock-description-wrapper p,.opblock-external-docs-wrapper p,.renderedMarkdown p,.response-col_description){color:${p.text}}
      html[data-studio-theme] .swagger-ui :is(.highlight-code,.microlight,.highlight-code pre,.highlight-code code){background:${p.code}!important;color:${p.text}!important}
      html[data-studio-theme] .swagger-ui .highlight-code *{background:transparent!important;color:${p.text}!important}
      html[data-studio-theme] .swagger-ui .btn.authorize{color:${p.accent};border-color:${p.accent}}
      html[data-studio-theme] .swagger-ui .opblock{background:${p.panel};box-shadow:none}
      html[data-studio-theme] .swagger-ui .opblock-summary{background:${p.input}}
      html[data-studio-theme] .swagger-ui .opblock-get{border-color:#28a987}html[data-studio-theme] .swagger-ui .opblock-post{border-color:#c79536}
      html[data-studio-theme] .swagger-ui .opblock-put,html[data-studio-theme] .swagger-ui .opblock-patch{border-color:#718fe3}html[data-studio-theme] .swagger-ui .opblock-delete{border-color:#de688a}
      html[data-studio-theme] .swagger-ui svg{fill:currentColor}
      #brsvs-studio-switcher{background:${p.accent};color:${p.mode === 'light' ? '#fff' : '#101528'}}
      #brsvs-swagger-theme-picker{position:fixed;right:180px;bottom:24px;z-index:2147483646;background:${p.input};color:${p.text};border:1px solid ${p.line};border-radius:9px;padding:10px;font:13px system-ui}
    `;
    effects();
    for (const select of document.querySelectorAll('#brsvs-swagger-theme-picker')) select.value = preference;
    window.dispatchEvent(new CustomEvent('studio-theme-changed', { detail: { preference, theme: current() } }));
  }
  function set(value) { if (!Object.hasOwn(themes, value)) return; preference = value; explicit = true; try { localStorage.setItem(key, value); } catch {} apply(); }
  function configure(config = {}) { if (!explicit && Object.hasOwn(themes, config.theme)) { preference = config.theme; apply(); } }
  function picker() {
    const select = document.createElement('select'); select.setAttribute('aria-label', 'Theme for Studio and Swagger');
    for (const [id, theme] of Object.entries(themes)) select.append(new Option(theme.label, id)); select.value = preference;
    select.onchange = () => set(select.value); return select;
  }
  query?.addEventListener?.('change', apply); motion?.addEventListener?.('change', effects);
  window.addEventListener('studio-opened', raiseEffects);
  window.addEventListener('storage', e => { if (e.key === key) { preference = Object.hasOwn(themes, e.newValue) ? e.newValue : 'system'; explicit = !!e.newValue; apply(); } });
  window.SwaggerStudioTheme = { set, current, preference: () => preference, variables, configure, picker };
  apply();
})();
