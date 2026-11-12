(() => {
  const palettes = {
    dark: { bg: '#0b1020', panel: '#10192b', input: '#172338', text: '#e8edf8', muted: '#94a5c2', line: '#293752', accent: '#9287ff', soft: '#24234b', code: '#080e1a' },
    light: { bg: '#f2f5fc', panel: '#ffffff', input: '#f5f7fc', text: '#17233b', muted: '#586a86', line: '#dbe2ef', accent: '#6352d9', soft: '#eeebff', code: '#f6f8fc' }
  };
  const query = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null;
  let preference = 'system';
  try { const v = localStorage.getItem('brsvs:studio:theme'); if (['dark', 'light', 'system'].includes(v)) preference = v; } catch {}
  const shared = document.createElement('style'); shared.id = 'brsvs-swagger-theme'; document.head.append(shared);
  function current() { return preference === 'system' ? query?.matches ? 'dark' : 'light' : preference; }
  function variables() { return Object.entries(palettes[current()]).map(([k,v]) => `--st-${k}:${v}`).join(';'); }
  function apply() {
    const p = palettes[current()];
    document.documentElement.dataset.studioTheme = current();
    shared.textContent = `
      :root{${variables()};color-scheme:${current()}}body{background:${p.bg};color:${p.text}}
      .swagger-ui{color:${p.text}}.swagger-ui .topbar{background:${p.panel};border-bottom:1px solid ${p.line}}
      .swagger-ui .info .title,.swagger-ui .info p,.swagger-ui .info li,.swagger-ui .info h1,.swagger-ui .info h2,.swagger-ui .info h3,.swagger-ui .opblock-tag,.swagger-ui .opblock-tag small,.swagger-ui .opblock .opblock-summary-description,.swagger-ui .opblock .opblock-summary-path,.swagger-ui .parameter__name,.swagger-ui .parameter__type,.swagger-ui .parameter__in,.swagger-ui .response-col_status,.swagger-ui .response-col_links,.swagger-ui .responses-inner h4,.swagger-ui .responses-inner h5,.swagger-ui table thead tr td,.swagger-ui table thead tr th,.swagger-ui .tab li,.swagger-ui label,.swagger-ui .model-title,.swagger-ui .model,.swagger-ui .model-box,.swagger-ui section.models h4,.swagger-ui .btn,.swagger-ui .dialog-ux .modal-ux,.swagger-ui .dialog-ux .modal-ux h3,.swagger-ui .dialog-ux .modal-ux h4{color:${p.text}}
      .swagger-ui .scheme-container,.swagger-ui .dialog-ux .modal-ux,.swagger-ui .opblock .opblock-section-header{background:${p.panel};color:${p.text};box-shadow:none}
      .swagger-ui input,.swagger-ui textarea,.swagger-ui select,.swagger-ui .download-url-wrapper input[type=text]{background:${p.input};color:${p.text};border-color:${p.line}}
      .swagger-ui a,.swagger-ui .info a{color:${p.accent}}.swagger-ui section.models,.swagger-ui .opblock-tag,.swagger-ui .dialog-ux .modal-ux{border-color:${p.line}}
      .swagger-ui .model-box,.swagger-ui .model-container,.swagger-ui section.models .model-container{background:${p.input}}
      .swagger-ui .opblock-description-wrapper p,.swagger-ui .opblock-external-docs-wrapper p,.swagger-ui .renderedMarkdown p,.swagger-ui .response-col_description{color:${p.text}}
      .swagger-ui .highlight-code,.swagger-ui .microlight{background:${p.code}!important;color:${p.text}!important}
      .swagger-ui .btn.authorize{color:${p.accent};border-color:${p.accent}}.swagger-ui svg{fill:currentColor}
      #brsvs-studio-switcher{background:${p.accent};color:${current() === 'light' ? '#fff' : '#101528'}}
    `;
    window.dispatchEvent(new CustomEvent('studio-theme-changed', { detail: { preference, theme: current() } }));
  }
  function set(value) { if (!['dark','light','system'].includes(value)) return; preference = value; try { localStorage.setItem('brsvs:studio:theme', value); } catch {} apply(); }
  query?.addEventListener?.('change', apply);
  window.addEventListener('storage', e => { if (e.key === 'brsvs:studio:theme') { preference = ['dark','light','system'].includes(e.newValue) ? e.newValue : 'system'; apply(); } });
  window.SwaggerStudioTheme = { set, current, preference: () => preference, variables };
  apply();
})();
