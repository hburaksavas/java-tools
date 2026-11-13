(() => {
  if (window.SwaggerStudioTheme) return;
  const styleLink = document.createElement('link'); styleLink.rel = 'stylesheet'; styleLink.id = 'brsvs-effects-stylesheet';
  const themeSource = [...document.scripts].find(script => new URL(script.src, location.href).pathname.endsWith('/theme.js'))?.src || new URL('theme.js', location.href).href;
  const effectUrl = new URL('effects.css', themeSource); effectUrl.search = new URL(themeSource).search; styleLink.href = effectUrl.href; document.head.append(styleLink);
  const dark = { bg: '#0c1018', panel: '#121824', input: '#181f2d', text: '#e6eaf2', muted: '#8b99b0', line: '#283142', accent: '#a497ff', soft: '#25233d', code: '#0e131d', snow: '#e0eaff', mode: 'dark' };
  const light = { bg: '#f4f6fa', panel: '#ffffff', input: '#f6f8fb', text: '#1e293d', muted: '#63718a', line: '#dce2ec', accent: '#7057df', soft: '#eeeafa', code: '#f7f8fc', snow: '#8069dc', mode: 'light' };
  const themes = {
    system: { label: '◐ System', effect: 'none' },
    light: { label: '☀ Daylight', effect: 'none', palette: light },
    dark: { label: '◑ Midnight', effect: 'none', palette: dark },
    winter: { label: '❄ Winter', effect: 'snow', palette: { ...dark, bg: '#091622', panel: '#102131', input: '#162b3d', line: '#29455a', accent: '#83d7ef', soft: '#183b4d', snow: '#e2f6ff' } },
    cosmic: { label: '✦ Cosmic', effect: 'stars', palette: { ...dark, bg: '#120d20', panel: '#1b142d', input: '#251d3b', line: '#3d2e57', accent: '#c5a0ff', soft: '#38244f', snow: '#e4d4ff' } },
    'rainy-night': { label: '☂ Rainy Night', effect: 'rain', palette: { ...dark, bg: '#0c1726', panel: '#142437', input: '#1b3046', accent: '#8cbedc', soft: '#213e56', line: '#30485f' } },
    aurora: { label: '≋ Aurora', effect: 'aurora', palette: { ...dark, bg: '#091920', panel: '#102a30', input: '#19383e', accent: '#7ee6c1', soft: '#1b4644', line: '#2a4b50' } },
    sakura: { label: '❀ Sakura', effect: 'petals', palette: { ...light, bg: '#fbf3f5', panel: '#fffafb', input: '#f8edf1', accent: '#b95380', soft: '#f5dce7', line: '#e8cfd9', snow: '#d989aa' } },
    ember: { label: '◈ Ember', effect: 'embers', palette: { ...dark, bg: '#1c1210', panel: '#2a1b16', input: '#38251d', accent: '#efa56f', soft: '#513021', line: '#55382b', snow: '#ffd19a' } },
    ocean: { label: '≈ Ocean', effect: 'ocean', palette: { ...dark, bg: '#071d2b', panel: '#0c2b3c', input: '#133b4d', accent: '#75d9df', soft: '#164957', line: '#275265' } },
    cyberpunk: { label: '⌁ Cyberpunk', effect: 'neon', palette: { ...dark, bg: '#160d1a', panel: '#24152b', input: '#34203d', accent: '#f391d8', soft: '#4d2452', line: '#57345e', snow: '#77e9ef' } },
    blueprint: { label: '▦ Blueprint', effect: 'grid', palette: { ...dark, bg: '#102647', panel: '#16335b', input: '#20426b', accent: '#b2d9ff', soft: '#2a517b', line: '#44658c', snow: '#d0e6ff' } },
    paper: { label: '▤ Paper & Ink', effect: 'paper', palette: { ...light, bg: '#f3efe5', panel: '#fcf9f0', input: '#eee9dc', text: '#283547', muted: '#70766d', accent: '#3f607f', soft: '#dbe2e5', line: '#d6d2c5' } },
    'digital-rain': { label: '⌗ Digital Rain', effect: 'code-rain', palette: { ...dark, bg: '#06110c', panel: '#0b1d14', input: '#102b1e', text: '#d1efdf', muted: '#86ac98', line: '#244c37', accent: '#72e8a4', soft: '#163e2a', code: '#07170e', snow: '#8feabb' } },
    arrakis: { label: '∿ Arrakis', effect: 'desert', palette: { ...dark, bg: '#1b150f', panel: '#292016', input: '#382b1c', text: '#f0dfbf', muted: '#b5a082', line: '#59452c', accent: '#e0b36d', soft: '#49351e', code: '#21190f', snow: '#d4ad73' } },
    hyperspace: { label: '» Hyperspace', effect: 'starfield', palette: { ...dark, bg: '#070e1c', panel: '#0e1c31', input: '#152b46', text: '#dcecfb', muted: '#88a9c4', line: '#284c6a', accent: '#8edcff', soft: '#193c57', code: '#091425', snow: '#c7eaff' } },
    'orient-express': { label: '▰ Orient Express', effect: 'railway', palette: { ...dark, bg: '#10151e', panel: '#1a2330', input: '#253142', text: '#eee6d7', muted: '#a69d90', line: '#3d4858', accent: '#e2bc7e', soft: '#43372a', code: '#121b26', snow: '#ebcb97' } },
    'koi-garden': { label: '◌ Koi Garden', effect: 'pond', palette: { ...light, bg: '#eaf2e9', panel: '#f8fbf3', input: '#e1ebdb', text: '#2c4c43', muted: '#698575', line: '#c2d5c5', accent: '#3c806e', soft: '#d1e5d7', code: '#f0f6eb', snow: '#6eac92' } },
    moonbase: { label: '☾ Moonbase', effect: 'lunar', palette: { ...dark, bg: '#11151d', panel: '#1c2430', input: '#293442', text: '#e4eaf1', muted: '#98a8bb', line: '#3d4c60', accent: '#a8c9eb', soft: '#2c3f55', code: '#151c27', snow: '#dce5ed' } },
    'coral-reef': { label: '♧ Coral Reef', effect: 'reef', palette: { ...dark, bg: '#082730', panel: '#103a43', input: '#1a4c53', text: '#dcf0ec', muted: '#8fbab9', line: '#32636b', accent: '#efac97', soft: '#475052', code: '#0c2e37', snow: '#9ae4db' } },
    clockwork: { label: '⚙ Clockwork', effect: 'clockwork', palette: { ...dark, bg: '#1c1814', panel: '#2c251c', input: '#3d3226', text: '#f0e4ce', muted: '#b39c7f', line: '#5a4933', accent: '#dcb572', soft: '#4c3a23', code: '#231d16', snow: '#d6bc87' } },
    'firefly-camp': { label: '⋆ Firefly Camp', effect: 'camp', palette: { ...dark, bg: '#0b1918', panel: '#142b25', input: '#1e3c31', text: '#e2ead8', muted: '#92aa90', line: '#35533e', accent: '#e0bb7d', soft: '#3b412b', code: '#10211c', snow: '#d2eb99' } },
    'air-mail': { label: '➤ Air Mail', effect: 'airmail', palette: { ...light, bg: '#f5f1e6', panel: '#fffdf5', input: '#eaece5', text: '#355168', muted: '#768893', line: '#ccd7d7', accent: '#4d849f', soft: '#dce9ea', code: '#f7f8ef', snow: '#8aafbf' } },
    'volcanic-island': { label: '△ Volcanic Island', effect: 'volcano', palette: { ...dark, bg: '#171518', panel: '#262024', input: '#382a2d', text: '#f2e1d8', muted: '#b39a95', line: '#594044', accent: '#f3a17e', soft: '#53322b', code: '#20191d', snow: '#d7937d' } },
    bosphorus: { label: '≈ Bosphorus', effect: 'gulls', palette: { ...light, bg: '#eaf3f6', panel: '#f8fcfd', input: '#e3eff4', text: '#173c50', muted: '#59788b', accent: '#16759a', soft: '#cde6ee', line: '#b7d4df', code: '#f1f8fa', snow: '#375d72' } },
    autumn: { label: '❧ Autumn', effect: 'leaves', palette: { ...light, bg: '#f7efe3', panel: '#fff8ef', input: '#f2e5d5', text: '#48312a', muted: '#8b6c5e', accent: '#a55738', soft: '#efd5bd', line: '#e1c8af', snow: '#ae6a35' } },
    monsoon: { label: '☔ Monsoon', effect: 'rain-heavy', palette: { ...dark, bg: '#0b1b1e', panel: '#122b2e', input: '#1a3b3e', accent: '#85c8bf', soft: '#23494a', line: '#335354' } },
    bioluminescence: { label: '⁕ Bioluminescence', effect: 'fireflies', palette: { ...dark, bg: '#061b1a', panel: '#0d2b29', input: '#143c37', accent: '#8df0c5', soft: '#205344', line: '#2b544a', snow: '#b6ffce' } },
  };
  const responseRecipes = { 'orient-express': 'railway', 'koi-garden': 'pond', moonbase: 'lunar', 'coral-reef': 'reef', clockwork: 'clockwork', 'firefly-camp': 'camp', 'air-mail': 'airmail', 'volcanic-island': 'volcano', 'digital-rain': 'decode', arrakis: 'sandworm', hyperspace: 'jump', bosphorus: 'ferry', system: 'glow', light: 'ripple', dark: 'glow', winter: 'ice', cosmic: 'constellation', 'rainy-night': 'storm', aurora: 'aurora', sakura: 'petals', ember: 'embers', ocean: 'tide', cyberpunk: 'neon', blueprint: 'blueprint', paper: 'ink', autumn: 'leaves', monsoon: 'storm', bioluminescence: 'fireflies' };
  const retiredThemes = { forest: 'bioluminescence', terminal: 'digital-rain', sandstorm: 'arrakis', observatory: 'cosmic', infrared: 'ember', zen: 'paper', circuit: 'cyberpunk', eclipse: 'cosmic' };
  const canonical = value => typeof value === 'string' ? (Object.hasOwn(retiredThemes, value) ? retiredThemes[value] : value) : undefined;
  const atmosphereKey = 'brsvs:studio:atmosphere-v1';
  const atmosphereThemes = new Set(['bosphorus', 'winter']);
  const atmosphereChoices = ['default', 'day', 'sunset', 'night'];
  function readAtmospheres() {
    try { const value = JSON.parse(localStorage.getItem(atmosphereKey)) || {}; return Object.fromEntries(Object.entries(value).filter(([key, choice]) => atmosphereThemes.has(key) && atmosphereChoices.includes(choice))); } catch { return {}; }
  }
  let atmospheres = readAtmospheres();
  const atmosphere = () => atmospheres[current()] || 'default';
  const atmospherePalettes = {
    'orient-express': { label: '▰ Orient Express', effect: 'railway', palette: { ...dark, bg: '#10151e', panel: '#1a2330', input: '#253142', text: '#eee6d7', muted: '#a69d90', line: '#3d4858', accent: '#e2bc7e', soft: '#43372a', code: '#121b26', snow: '#ebcb97' } },
    'koi-garden': { label: '◌ Koi Garden', effect: 'pond', palette: { ...light, bg: '#eaf2e9', panel: '#f8fbf3', input: '#e1ebdb', text: '#2c4c43', muted: '#698575', line: '#c2d5c5', accent: '#3c806e', soft: '#d1e5d7', code: '#f0f6eb', snow: '#6eac92' } },
    moonbase: { label: '☾ Moonbase', effect: 'lunar', palette: { ...dark, bg: '#11151d', panel: '#1c2430', input: '#293442', text: '#e4eaf1', muted: '#98a8bb', line: '#3d4c60', accent: '#a8c9eb', soft: '#2c3f55', code: '#151c27', snow: '#dce5ed' } },
    'coral-reef': { label: '♧ Coral Reef', effect: 'reef', palette: { ...dark, bg: '#082730', panel: '#103a43', input: '#1a4c53', text: '#dcf0ec', muted: '#8fbab9', line: '#32636b', accent: '#efac97', soft: '#475052', code: '#0c2e37', snow: '#9ae4db' } },
    clockwork: { label: '⚙ Clockwork', effect: 'clockwork', palette: { ...dark, bg: '#1c1814', panel: '#2c251c', input: '#3d3226', text: '#f0e4ce', muted: '#b39c7f', line: '#5a4933', accent: '#dcb572', soft: '#4c3a23', code: '#231d16', snow: '#d6bc87' } },
    'firefly-camp': { label: '⋆ Firefly Camp', effect: 'camp', palette: { ...dark, bg: '#0b1918', panel: '#142b25', input: '#1e3c31', text: '#e2ead8', muted: '#92aa90', line: '#35533e', accent: '#e0bb7d', soft: '#3b412b', code: '#10211c', snow: '#d2eb99' } },
    'air-mail': { label: '➤ Air Mail', effect: 'airmail', palette: { ...light, bg: '#f5f1e6', panel: '#fffdf5', input: '#eaece5', text: '#355168', muted: '#768893', line: '#ccd7d7', accent: '#4d849f', soft: '#dce9ea', code: '#f7f8ef', snow: '#8aafbf' } },
    'volcanic-island': { label: '△ Volcanic Island', effect: 'volcano', palette: { ...dark, bg: '#171518', panel: '#262024', input: '#382a2d', text: '#f2e1d8', muted: '#b39a95', line: '#594044', accent: '#f3a17e', soft: '#53322b', code: '#20191d', snow: '#d7937d' } },
    bosphorus: {
      day: {},
      sunset: { bg: '#f5e9df', panel: '#fff6eb', input: '#eeddd1', text: '#493d44', muted: '#876b6a', line: '#dcc0b1', accent: '#a75e49', soft: '#efd0bb', code: '#faf0e6', snow: '#a77565', mode: 'light' },
      night: { bg: '#0a1828', panel: '#10253b', input: '#19344b', text: '#e2ecf6', muted: '#91abc2', line: '#304d64', accent: '#dfc38a', soft: '#2f3d42', code: '#0c1c2e', snow: '#b5c9dc', mode: 'dark' }
    },
    winter: {
      day: { bg: '#edf5f8', panel: '#fbfeff', input: '#e4eff4', text: '#274557', muted: '#617d8c', line: '#c3d9e2', accent: '#327e9e', soft: '#d1e8f0', code: '#f3f9fb', snow: '#6096aa', mode: 'light' },
      sunset: { bg: '#211d2e', panel: '#2c283c', input: '#39344c', text: '#f0e6ed', muted: '#b4a0b5', line: '#56465e', accent: '#edb5ac', soft: '#503b50', code: '#241f32', snow: '#edc8de', mode: 'dark' },
      night: { bg: '#060f1e', panel: '#0c1b2e', input: '#132a42', text: '#dcebf8', muted: '#8aa7c3', line: '#26415e', accent: '#a6cfee', soft: '#1a354f', code: '#081426', snow: '#d2e7ff', mode: 'dark' }
    }
  };
  const key = 'brsvs:studio:theme-v2';
  const query = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null;
  const motion = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
  let preference = 'system', explicit = false, layer, motionCleanup;
  try {
    const saved = localStorage.getItem(key) || localStorage.getItem('brsvs:studio:theme');
    const migrated = canonical(saved);
    if (migrated && Object.hasOwn(themes, migrated)) { preference = migrated; explicit = true; if (migrated !== saved) localStorage.setItem(key, migrated); }
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
  function palette() { return { ...themes[current()].palette, ...atmospherePalettes[current()]?.[atmosphere()] }; }
  function variables() { return Object.entries(palette()).filter(([k]) => k !== 'mode').map(([k,v]) => `--st-${k}:${v}`).join(';'); }
  function raiseEffects() { if (layer) document.documentElement.append(layer); }
  function effects() {
    motionCleanup?.(); motionCleanup = undefined;
    layer?.remove(); layer = undefined;
    const effect = themes[current()].effect;
    if (effect === 'none' || motion?.matches) return;
    layer = document.createElement('div'); layer.id = 'brsvs-theme-effects'; layer.className = effect; layer.dataset.atmosphere = atmosphere(); layer.setAttribute('aria-hidden', 'true');
    const sceneCleanup = window.SwaggerStudioScenes?.ambient(layer, effect);
    if (sceneCleanup) { motionCleanup = sceneCleanup; raiseEffects(); return; }
    if (['rain', 'rain-heavy'].includes(effect)) { const bolt = window.SwaggerStudioMotion?.lightningSvg(); if (bolt) { bolt.classList.add('distant-lightning'); layer.append(bolt); } }
    const scenes = ['aurora','ocean','neon','grid','paper'];
    const count = effect === 'code-rain' ? 16 : effect === 'desert' ? 28 : effect === 'starfield' ? 32 : effect === 'ocean' ? 14 : effect === 'gulls' ? 9 : effect === 'snow' ? 42 : effect === 'stars' ? 30 : scenes.includes(effect) ? 3 : 24;
    motionCleanup = window.SwaggerStudioMotion?.mount(layer, effect, count);
    if (motionCleanup) { raiseEffects(); return; }
    for (let i = 0; i < count; i++) {
      const flake = document.createElement('span'); flake.textContent = effect === 'stars' || effect === 'constellations' ? '✦' : effect === 'snow' ? i % 4 ? '•' : '❄' : effect === 'leaves' ? '❧' : '';
      flake.style.left = `${Math.random() * 100}%`; flake.style.fontSize = `${effect === 'snow' ? 11 + Math.random() * 9 : 7 + Math.random() * 7}px`;
      if (['stars','constellations','fireflies','dust'].includes(effect)) flake.style.top = `${Math.random() * 100}%`;
      flake.style.setProperty('--seed', i); flake.style.setProperty('--drift', `${20 + Math.random() * 80}px`);
      const duration = effect === 'snow' ? 10 + Math.random() * 20 : 12 + Math.random() * 16;
      flake.style.setProperty('--ambient-duration', `${duration}s`);
      flake.style.animationDuration = `${duration}s`; flake.style.animationDelay = `-${Math.random() * duration}s`; layer.append(flake);
    }
    raiseEffects();
  }
  function apply() {
    const p = palette(); document.documentElement.dataset.studioTheme = current(); document.documentElement.dataset.studioAtmosphere = atmosphere();
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
    for (const select of document.querySelectorAll('[data-atmosphere-picker]')) syncAtmospherePicker(select);
    for (const select of document.querySelectorAll('#brsvs-swagger-theme-picker')) select.value = preference;
    window.dispatchEvent(new CustomEvent('studio-theme-changed', { detail: { preference, theme: current() } }));
  }
  function setAtmosphere(value) {
    if (!atmosphereThemes.has(current()) || !atmosphereChoices.includes(value)) return;
    atmospheres[current()] = value; try { localStorage.setItem(atmosphereKey, JSON.stringify(atmospheres)); } catch {} apply();
  }
  function syncAtmospherePicker(select) { select.hidden = !atmosphereThemes.has(current()); select.value = atmosphere(); }
  function atmospherePicker() {
    const select = document.createElement('select'); select.dataset.atmospherePicker = ''; select.setAttribute('aria-label', 'Atmosphere for Studio and Swagger');
    for (const [id, label] of [['default', 'Theme light'], ['day', 'Day'], ['sunset', 'Sunset'], ['night', 'Night']]) select.append(new Option(label, id));
    select.onchange = () => setAtmosphere(select.value); syncAtmospherePicker(select); return select;
  }
  function set(value) { value = canonical(value); if (!value || !Object.hasOwn(themes, value)) return; preference = value; explicit = true; try { localStorage.setItem(key, value); } catch {} apply(); }
  function configure(config = {}) { const value = canonical(config.theme); if (!explicit && value && Object.hasOwn(themes, value)) { preference = value; apply(); } }
  function picker() {
    const select = document.createElement('select'); select.setAttribute('aria-label', 'Theme for Studio and Swagger');
    for (const [id, theme] of Object.entries(themes)) select.append(new Option(theme.label, id)); select.value = preference;
    select.onchange = () => set(select.value); return select;
  }
  query?.addEventListener?.('change', apply); motion?.addEventListener?.('change', effects);
  window.addEventListener('studio-opened', raiseEffects);
  window.addEventListener('storage', e => { if (e.key === atmosphereKey || e.key === null) { atmospheres = readAtmospheres(); apply(); }
    if (e.key === key) { const value = canonical(e.newValue); preference = value && Object.hasOwn(themes, value) ? value : 'system'; explicit = !!value && Object.hasOwn(themes, value); if (explicit && value !== e.newValue) { try { localStorage.setItem(key, value); } catch {} } apply(); } });
  window.SwaggerStudioTheme = { set, current, preference: () => preference, variables, configure, picker, atmosphere, setAtmosphere, atmospherePicker, syncAtmospherePicker,
    catalog: () => Object.entries(themes).map(([id, theme]) => ({ id, label: theme.label, effect: theme.effect, response: responseRecipes[id] })),
    responseRecipe: () => responseRecipes[current()] };
  apply();
})();
