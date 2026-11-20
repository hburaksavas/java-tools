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
    'rainy-night': { label: '☂ Rainy Night', effect: 'rain', palette: { ...dark, bg: '#0c1726', panel: '#142437', input: '#1b3046', accent: '#8cbedc', soft: '#213e56', line: '#30485f' } },
    sakura: { label: '❀ Sakura', effect: 'petals', palette: { ...light, bg: '#fbf3f5', panel: '#fffafb', input: '#f8edf1', accent: '#b95380', soft: '#f5dce7', line: '#e8cfd9', snow: '#d989aa' } },
    ocean: { label: '≈ Ocean', effect: 'ocean', palette: { ...dark, bg: '#071d2b', panel: '#0c2b3c', input: '#133b4d', accent: '#75d9df', soft: '#164957', line: '#275265' } },
    cyberpunk: { label: '⌁ Cyberpunk', effect: 'neon', palette: { ...dark, bg: '#160d1a', panel: '#24152b', input: '#34203d', accent: '#f391d8', soft: '#4d2452', line: '#57345e', snow: '#77e9ef' } },
    paper: { label: '▤ Paper & Ink', effect: 'paper', palette: { ...light, bg: '#f3efe5', panel: '#fcf9f0', input: '#eee9dc', text: '#283547', muted: '#70766d', accent: '#3f607f', soft: '#dbe2e5', line: '#d6d2c5' } },
    'digital-rain': { label: '⌗ Digital Rain', effect: 'code-rain', palette: { ...dark, bg: '#06110c', panel: '#0b1d14', input: '#102b1e', text: '#d1efdf', muted: '#86ac98', line: '#244c37', accent: '#72e8a4', soft: '#163e2a', code: '#07170e', snow: '#8feabb' } },
    'orient-express': { label: '▰ Orient Express', effect: 'railway', palette: { ...dark, bg: '#10151e', panel: '#1a2330', input: '#253142', text: '#eee6d7', muted: '#a69d90', line: '#3d4858', accent: '#e2bc7e', soft: '#43372a', code: '#121b26', snow: '#ebcb97' } },
    'koi-garden': { label: '◌ Koi Garden', effect: 'pond', palette: { ...light, bg: '#eaf2e9', panel: '#f8fbf3', input: '#e1ebdb', text: '#2c4c43', muted: '#698575', line: '#c2d5c5', accent: '#3c806e', soft: '#d1e5d7', code: '#f0f6eb', snow: '#6eac92' } },
    moonbase: { label: '☾ Moonbase', effect: 'lunar', palette: { ...dark, bg: '#11151d', panel: '#1c2430', input: '#293442', text: '#e4eaf1', muted: '#98a8bb', line: '#3d4c60', accent: '#a8c9eb', soft: '#2c3f55', code: '#151c27', snow: '#dce5ed' } },
    'coral-reef': { label: '♧ Coral Reef', effect: 'reef', palette: { ...dark, bg: '#082730', panel: '#103a43', input: '#1a4c53', text: '#dcf0ec', muted: '#8fbab9', line: '#32636b', accent: '#efac97', soft: '#475052', code: '#0c2e37', snow: '#9ae4db' } },
    'air-mail': { label: '➤ Air Mail', effect: 'airmail', palette: { ...light, bg: '#f5f1e6', panel: '#fffdf5', input: '#eaece5', text: '#355168', muted: '#768893', line: '#ccd7d7', accent: '#4d849f', soft: '#dce9ea', code: '#f7f8ef', snow: '#8aafbf' } },
    'volcanic-island': { label: '△ Volcanic Island', effect: 'volcano', palette: { ...dark, bg: '#171518', panel: '#262024', input: '#382a2d', text: '#f2e1d8', muted: '#b39a95', line: '#594044', accent: '#f3a17e', soft: '#53322b', code: '#20191d', snow: '#d7937d' } },
    bosphorus: { label: '≈ Bosphorus', effect: 'gulls', palette: { ...light, bg: '#eaf3f6', panel: '#f8fcfd', input: '#e3eff4', text: '#173c50', muted: '#59788b', accent: '#16759a', soft: '#cde6ee', line: '#b7d4df', code: '#f1f8fa', snow: '#375d72' } },
    'paper-city': { label: '▥ Paper City', effect: 'paper-city', palette: { ...dark, bg: '#252a35', panel: '#343a47', input: '#414958', text: '#eee7da', muted: '#a8a3a6', line: '#414958', accent: '#cdbfa5', soft: '#414958', code: '#252a35', snow: '#cdbfa5' } },
    'cable-car': { label: '▰ Cable Car', effect: 'cable-car', palette: { ...dark, bg: '#1c2c36', panel: '#2a3b46', input: '#354b57', text: '#e2eeed', muted: '#a8a3a6', line: '#354b57', accent: '#b1d2c8', soft: '#354b57', code: '#1c2c36', snow: '#b1d2c8' } },
    'watchmaker': { label: '◷ Watchmaker', effect: 'watchmaker', palette: { ...dark, bg: '#141f30', panel: '#202d40', input: '#2c3c51', text: '#e5e8ec', muted: '#a8a3a6', line: '#2c3c51', accent: '#c5b597', soft: '#2c3c51', code: '#141f30', snow: '#c5b597' } },
    'bonsai-seasons': { label: '♧ Bonsai Seasons', effect: 'bonsai-seasons', palette: { ...dark, bg: '#202b26', panel: '#2c3930', input: '#39493c', text: '#e8e9dc', muted: '#a8a3a6', line: '#39493c', accent: '#b8c59a', soft: '#39493c', code: '#202b26', snow: '#b8c59a' } },
    'silk-lanterns': { label: '◇ Silk Lanterns', effect: 'silk-lanterns', palette: { ...dark, bg: '#241d31', panel: '#33283e', input: '#43344e', text: '#efe2dd', muted: '#a8a3a6', line: '#43344e', accent: '#e7b08f', soft: '#43344e', code: '#241d31', snow: '#e7b08f' } },
    'miniature-harbor': { label: '⚓ Miniature Harbor', effect: 'miniature-harbor', palette: { ...dark, bg: '#162a35', panel: '#233b46', input: '#304d58', text: '#e5eceb', muted: '#a8a3a6', line: '#304d58', accent: '#d5ba89', soft: '#304d58', code: '#162a35', snow: '#d5ba89' } },
    'darkroom': { label: '▣ Darkroom', effect: 'darkroom', palette: { ...dark, bg: '#211416', panel: '#321e22', input: '#42282d', text: '#efe0dc', muted: '#a8a3a6', line: '#42282d', accent: '#d9948e', soft: '#42282d', code: '#211416', snow: '#d9948e' } },
    'prism-room': { label: '△ Prism Room', effect: 'prism', palette: { ...dark, bg: '#1c1f27', panel: '#292e39', input: '#363d49', text: '#ececf1', muted: '#a1a6b7', line: '#363d49', accent: '#c3cbdc', soft: '#363d49', code: '#1c1f27', snow: '#c3cbdc' } },
    'wind-tunnel': { label: '↝ Wind Tunnel', effect: 'wind', palette: { ...dark, bg: '#182326', panel: '#253438', input: '#30464b', text: '#e2edeb', muted: '#a1a6b7', line: '#30464b', accent: '#93d4cf', soft: '#30464b', code: '#182326', snow: '#93d4cf' } },
    'ink-in-water': { label: '◉ Ink in Water', effect: 'ink-water', palette: { ...dark, bg: '#131c2b', panel: '#1e2b40', input: '#2b3a50', text: '#e5e5f3', muted: '#a1a6b7', line: '#2b3a50', accent: '#bf9fe5', soft: '#2b3a50', code: '#131c2b', snow: '#bf9fe5' } },
    'pendulum-wave': { label: '⋮ Pendulum Wave', effect: 'pendulums', palette: { ...dark, bg: '#172331', panel: '#243244', input: '#304258', text: '#e8e8ea', muted: '#a1a6b7', line: '#304258', accent: '#d7c39f', soft: '#304258', code: '#172331', snow: '#d7c39f' } },
    'plasma-globe': { label: '✧ Plasma Globe', effect: 'plasma', palette: { ...dark, bg: '#171024', panel: '#281b39', input: '#35264a', text: '#e8ddf3', muted: '#a1a6b7', line: '#35264a', accent: '#bc99ee', soft: '#35264a', code: '#171024', snow: '#bc99ee' } },
    'kinetic-sand': { label: '∿ Kinetic Sand', effect: 'sand-table', palette: { ...dark, bg: '#24211e', panel: '#302b25', input: '#3c342b', text: '#eee3d1', muted: '#b5a38b', line: '#564936', accent: '#d9b47b', soft: '#4a3b28', code: '#29241e', snow: '#c9ac80' } },
    'ripple-tank': { label: '≋ Ripple Tank', effect: 'wave-tank', palette: { ...dark, bg: '#101f28', panel: '#192e39', input: '#223d49', text: '#dfedf0', muted: '#8caab6', line: '#365561', accent: '#85cdd8', soft: '#224954', code: '#142630', snow: '#a1dce0' } },
    'magnetic-lab': { label: '⊙ Magnetic Lab', effect: 'magnetic', palette: { ...dark, bg: '#191e23', panel: '#242c32', input: '#2e3840', text: '#e9e4dd', muted: '#a99e93', line: '#495057', accent: '#d49a73', soft: '#493b32', code: '#1e262d', snow: '#b9c5ca' } },
    'marble-run': { label: '◉ Marble Run', effect: 'marbles', palette: { ...dark, bg: '#171f26', panel: '#222e36', input: '#2c3b44', text: '#e2ecec', muted: '#96adb2', line: '#405862', accent: '#8ed3ce', soft: '#29494b', code: '#1b272f', snow: '#a3d3d8' } },
    'neon-bowling': { label: '◈ Neon Bowling', effect: 'bowling', palette: { ...dark, bg: '#180f29', panel: '#251b39', input: '#322446', text: '#f0e5f5', muted: '#b49bc9', line: '#533967', accent: '#e994d5', soft: '#49294d', code: '#20152f', snow: '#91dce6' } },
    cappadocia: { label: '♧ Cappadocia', effect: 'balloons', palette: { ...dark, bg: '#20283e', panel: '#2b3249', input: '#343b53', text: '#e6e1eb', muted: '#aaa3b9', line: '#484b65', accent: '#d39aa9', soft: '#4b3b53', code: '#252c42', snow: '#c18b9e' } },
    autumn: { label: '❧ Autumn', effect: 'leaves', palette: { ...light, bg: '#f7efe3', panel: '#fff8ef', input: '#f2e5d5', text: '#48312a', muted: '#8b6c5e', accent: '#a55738', soft: '#efd5bd', line: '#e1c8af', snow: '#ae6a35' } },
  };
  const responseRecipes = { 'paper-city':'paper-city','cable-car':'cable-car','watchmaker':'watchmaker','bonsai-seasons':'bonsai-seasons','silk-lanterns':'silk-lanterns','miniature-harbor':'miniature-harbor','darkroom':'darkroom', 'plasma-globe': 'plasma', 'pendulum-wave': 'pendulums', 'ink-in-water': 'ink-water', 'wind-tunnel': 'wind', 'prism-room': 'prism', 'kinetic-sand': 'sand-table', 'ripple-tank': 'wave-tank', 'magnetic-lab': 'magnetic', 'marble-run': 'marbles', 'neon-bowling': 'bowling', cappadocia: 'balloons', 'orient-express': 'railway', 'koi-garden': 'pond', moonbase: 'lunar', 'coral-reef': 'reef', 'air-mail': 'airmail', 'volcanic-island': 'volcano', 'digital-rain': 'decode', bosphorus: 'ferry', system: 'glow', light: 'ripple', dark: 'glow', winter: 'ice', 'rainy-night': 'storm', sakura: 'petals', ocean: 'tide', cyberpunk: 'neon', paper: 'ink', autumn: 'leaves', };
  const retiredThemes = { 'forest': 'koi-garden', 'terminal': 'digital-rain', 'sandstorm': 'volcanic-island', 'observatory': 'moonbase', 'infrared': 'volcanic-island', 'zen': 'paper', 'circuit': 'cyberpunk', 'eclipse': 'moonbase', 'bioluminescence': 'koi-garden', 'firefly-camp': 'koi-garden', 'clockwork': 'orient-express', 'hyperspace': 'moonbase', 'arrakis': 'volcanic-island', 'blueprint': 'dark', 'ember': 'volcanic-island', 'aurora': 'ocean', 'cosmic': 'moonbase', 'monsoon': 'rainy-night' };
  const canonical = value => typeof value === 'string' ? (Object.hasOwn(retiredThemes, value) ? retiredThemes[value] : value) : undefined;
  const atmosphereKey = 'brsvs:studio:atmosphere-v1';
  const atmosphereThemes = new Set(['bosphorus', 'winter']);
  const atmosphereChoices = ['default', 'day', 'sunset', 'night'];
  function readAtmospheres() {
    try { const value = JSON.parse(localStorage.getItem(atmosphereKey)) || {}; return Object.fromEntries(Object.entries(value).filter(([key, choice]) => atmosphereThemes.has(key) && atmosphereChoices.includes(choice))); } catch { return {}; }
  }
  let atmospheres = readAtmospheres();
  const normalizeAtmosphere = (theme, value) => atmosphereThemes.has(theme) && (!value || value === 'default' || value === 'sunset') ? 'day' : value || 'default';
  const atmosphere = () => normalizeAtmosphere(current(), atmospheres[current()]);
  const atmospherePalettes = {
    'orient-express': { label: '▰ Orient Express', effect: 'railway', palette: { ...dark, bg: '#10151e', panel: '#1a2330', input: '#253142', text: '#eee6d7', muted: '#a69d90', line: '#3d4858', accent: '#e2bc7e', soft: '#43372a', code: '#121b26', snow: '#ebcb97' } },
    'koi-garden': { label: '◌ Koi Garden', effect: 'pond', palette: { ...light, bg: '#eaf2e9', panel: '#f8fbf3', input: '#e1ebdb', text: '#2c4c43', muted: '#698575', line: '#c2d5c5', accent: '#3c806e', soft: '#d1e5d7', code: '#f0f6eb', snow: '#6eac92' } },
    moonbase: { label: '☾ Moonbase', effect: 'lunar', palette: { ...dark, bg: '#11151d', panel: '#1c2430', input: '#293442', text: '#e4eaf1', muted: '#98a8bb', line: '#3d4c60', accent: '#a8c9eb', soft: '#2c3f55', code: '#151c27', snow: '#dce5ed' } },
    'coral-reef': { label: '♧ Coral Reef', effect: 'reef', palette: { ...dark, bg: '#082730', panel: '#103a43', input: '#1a4c53', text: '#dcf0ec', muted: '#8fbab9', line: '#32636b', accent: '#efac97', soft: '#475052', code: '#0c2e37', snow: '#9ae4db' } },
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
  function variables() { const p = palette(), tokens = window.SwaggerStudioJson?.palette(p) || {}; return Object.entries({ ...p, ...tokens }).filter(([k]) => k !== 'mode').map(([k,v]) => `--st-${k}:${v}`).join(';'); }
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
      html[data-studio-theme] .swagger-ui .highlight-code *{background:transparent!important}
      html[data-studio-theme] .swagger-ui :is(.highlight-code,.microlight) :is(.hljs-attr,.hljs-attribute,.token.property){color:var(--st-json-key,${p.accent})!important}
      html[data-studio-theme] .swagger-ui :is(.highlight-code,.microlight) :is(.hljs-string,.token.string){color:var(--st-json-string,${p.text})!important}
      html[data-studio-theme] .swagger-ui :is(.highlight-code,.microlight) :is(.hljs-number,.token.number){color:var(--st-json-number,${p.text})!important}
      html[data-studio-theme] .swagger-ui :is(.highlight-code,.microlight) :is(.hljs-literal,.token.boolean,.token.null){color:var(--st-json-literal,${p.text})!important}
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
    value = normalizeAtmosphere(current(), value);
    atmospheres[current()] = value; try { localStorage.setItem(atmosphereKey, JSON.stringify(atmospheres)); } catch {} apply();
  }
  function syncAtmospherePicker(select) { select.hidden = !atmosphereThemes.has(current()); select.replaceChildren(); for (const [id, label] of [['default', 'Theme light'], ['day', 'Day'], ['sunset', 'Sunset'], ['night', 'Night']]) { if (['default', 'sunset'].includes(id)) continue; select.append(new Option(label, id)); } select.value = atmosphere(); }
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
