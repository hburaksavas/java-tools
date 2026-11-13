(() => {
  if (window.SwaggerStudioTheme) return;
  const styleLink = document.createElement('link'); styleLink.rel = 'stylesheet'; styleLink.id = 'brsvs-effects-stylesheet';
  const themeSource = [...document.scripts].find(script => script.src.endsWith('/theme.js'))?.src || new URL('theme.js', location.href).href;
  styleLink.href = new URL('effects.css', themeSource).href; document.head.append(styleLink);
  const dark = { bg: '#0c1018', panel: '#121824', input: '#181f2d', text: '#e6eaf2', muted: '#8b99b0', line: '#283142', accent: '#a497ff', soft: '#25233d', code: '#0e131d', snow: '#e0eaff', mode: 'dark' };
  const light = { bg: '#f4f6fa', panel: '#ffffff', input: '#f6f8fb', text: '#1e293d', muted: '#63718a', line: '#dce2ec', accent: '#7057df', soft: '#eeeafa', code: '#f7f8fc', snow: '#8069dc', mode: 'light' };
  const themes = {
    system: { label: '◐ System', effect: 'none' },
    light: { label: '☀ Daylight', effect: 'none', palette: light },
    dark: { label: '◑ Midnight', effect: 'none', palette: dark },
    winter: { label: '❄ Winter', effect: 'snow', palette: { ...dark, bg: '#091622', panel: '#102131', input: '#162b3d', line: '#29455a', accent: '#83d7ef', soft: '#183b4d', snow: '#e2f6ff' } },
    cosmic: { label: '✦ Cosmic', effect: 'stars', palette: { ...dark, bg: '#120d20', panel: '#1b142d', input: '#251d3b', line: '#3d2e57', accent: '#c5a0ff', soft: '#38244f', snow: '#e4d4ff' } },
    forest: { label: '♧ Forest', effect: 'none', palette: { ...dark, bg: '#0b1714', panel: '#10231d', input: '#183128', line: '#2a493c', accent: '#8cdbb3', soft: '#204334', snow: '#b4efd1' } },
    'rainy-night': { label: '☂ Rainy Night', effect: 'rain', palette: { ...dark, bg: '#0c1726', panel: '#142437', input: '#1b3046', accent: '#8cbedc', soft: '#213e56', line: '#30485f' } },
    aurora: { label: '≋ Aurora', effect: 'aurora', palette: { ...dark, bg: '#091920', panel: '#102a30', input: '#19383e', accent: '#7ee6c1', soft: '#1b4644', line: '#2a4b50' } },
    sakura: { label: '❀ Sakura', effect: 'petals', palette: { ...light, bg: '#fbf3f5', panel: '#fffafb', input: '#f8edf1', accent: '#b95380', soft: '#f5dce7', line: '#e8cfd9', snow: '#d989aa' } },
    ember: { label: '◈ Ember', effect: 'embers', palette: { ...dark, bg: '#1c1210', panel: '#2a1b16', input: '#38251d', accent: '#efa56f', soft: '#513021', line: '#55382b', snow: '#ffd19a' } },
    ocean: { label: '≈ Ocean', effect: 'ocean', palette: { ...dark, bg: '#071d2b', panel: '#0c2b3c', input: '#133b4d', accent: '#75d9df', soft: '#164957', line: '#275265' } },
    cyberpunk: { label: '⌁ Cyberpunk', effect: 'neon', palette: { ...dark, bg: '#160d1a', panel: '#24152b', input: '#34203d', accent: '#f391d8', soft: '#4d2452', line: '#57345e', snow: '#77e9ef' } },
    terminal: { label: '> Terminal', effect: 'scan', palette: { ...dark, bg: '#08100b', panel: '#0d1c12', input: '#14281b', text: '#c8ebce', muted: '#85a88c', accent: '#8ada93', soft: '#1c3c26', line: '#2d4c35' } },
    blueprint: { label: '▦ Blueprint', effect: 'grid', palette: { ...dark, bg: '#102647', panel: '#16335b', input: '#20426b', accent: '#b2d9ff', soft: '#2a517b', line: '#44658c', snow: '#d0e6ff' } },
    eclipse: { label: '◉ Eclipse', effect: 'eclipse', palette: { ...dark, bg: '#171615', panel: '#23211e', input: '#302d27', accent: '#e6c57c', soft: '#463d29', line: '#514831' } },
    paper: { label: '▤ Paper & Ink', effect: 'paper', palette: { ...light, bg: '#f3efe5', panel: '#fcf9f0', input: '#eee9dc', text: '#283547', muted: '#70766d', accent: '#3f607f', soft: '#dbe2e5', line: '#d6d2c5' } },
    observatory: { label: '⋆ Observatory', effect: 'constellations', palette: { ...dark, bg: '#0b1325', panel: '#141f35', input: '#202d46', accent: '#b7c9ed', soft: '#2b3856', line: '#394962' } },
    bosphorus: { label: '≈ Bosphorus', effect: 'gulls', palette: { ...light, bg: '#eaf3f6', panel: '#f8fcfd', input: '#e3eff4', text: '#173c50', muted: '#59788b', accent: '#16759a', soft: '#cde6ee', line: '#b7d4df', code: '#f1f8fa', snow: '#375d72' } },
    autumn: { label: '❧ Autumn', effect: 'leaves', palette: { ...light, bg: '#f7efe3', panel: '#fff8ef', input: '#f2e5d5', text: '#48312a', muted: '#8b6c5e', accent: '#a55738', soft: '#efd5bd', line: '#e1c8af', snow: '#ae6a35' } },
    monsoon: { label: '☔ Monsoon', effect: 'rain-heavy', palette: { ...dark, bg: '#0b1b1e', panel: '#122b2e', input: '#1a3b3e', accent: '#85c8bf', soft: '#23494a', line: '#335354' } },
    circuit: { label: '⌘ Circuit', effect: 'circuit', palette: { ...dark, bg: '#081c24', panel: '#0f2b35', input: '#163b47', accent: '#74d8ff', soft: '#1e4c59', line: '#2a5262' } },
    sandstorm: { label: '∴ Sandstorm', effect: 'dust', palette: { ...light, bg: '#efe4d0', panel: '#faf0de', input: '#e8d9c0', text: '#463a2b', muted: '#83735d', accent: '#9e6347', soft: '#dfc4a1', line: '#ceba9c' } },
    bioluminescence: { label: '⁕ Bioluminescence', effect: 'fireflies', palette: { ...dark, bg: '#061b1a', panel: '#0d2b29', input: '#143c37', accent: '#8df0c5', soft: '#205344', line: '#2b544a', snow: '#b6ffce' } },
    infrared: { label: '◌ Infrared', effect: 'heat', palette: { ...dark, bg: '#1c1018', panel: '#2d1824', input: '#3d2030', accent: '#f29b98', soft: '#582b38', line: '#5e3444' } },
    zen: { label: '○ Zen', effect: 'mist', palette: { ...light, bg: '#eff1eb', panel: '#f8faf4', input: '#e7ece0', text: '#36483b', muted: '#73816f', accent: '#608568', soft: '#d5e2cf', line: '#cbd6c4' } }
  };
  const responseRecipes = { bosphorus: 'ferry', system: 'glow', light: 'ripple', dark: 'glow', winter: 'ice', cosmic: 'constellation', forest: 'leaves', 'rainy-night': 'storm', aurora: 'aurora', sakura: 'petals', ember: 'embers', ocean: 'tide', cyberpunk: 'neon', terminal: 'terminal', blueprint: 'blueprint', eclipse: 'eclipse', paper: 'ink', observatory: 'constellation', autumn: 'leaves', monsoon: 'storm', circuit: 'circuit', sandstorm: 'dust', bioluminescence: 'fireflies', infrared: 'heat', zen: 'ripple' };
  const key = 'brsvs:studio:theme-v2';
  const query = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null;
  const motion = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
  let preference = 'system', explicit = false, layer, motionCleanup;
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
    motionCleanup?.(); motionCleanup = undefined;
    layer?.remove(); layer = undefined;
    const effect = themes[current()].effect;
    if (effect === 'none' || motion?.matches) return;
    layer = document.createElement('div'); layer.id = 'brsvs-theme-effects'; layer.className = effect; layer.setAttribute('aria-hidden', 'true');
    const scenes = ['aurora','ocean','neon','scan','grid','eclipse','paper','circuit','heat','mist'];
    const count = effect === 'ocean' ? 14 : effect === 'gulls' ? 9 : effect === 'snow' ? 42 : effect === 'stars' ? 30 : scenes.includes(effect) ? 3 : 24;
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
  window.SwaggerStudioTheme = { set, current, preference: () => preference, variables, configure, picker,
    catalog: () => Object.entries(themes).map(([id, theme]) => ({ id, label: theme.label, effect: theme.effect, response: responseRecipes[id] })),
    responseRecipe: () => responseRecipes[current()] };
  apply();
})();
