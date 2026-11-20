(() => {
  let ui, config = {};
  const switcher = document.createElement('button'); switcher.id = 'brsvs-studio-switcher';
  const icon = paths => `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
  switcher.type = 'button'; switcher.title = 'Open API Studio'; switcher.setAttribute('aria-label', 'Open API Studio');
  switcher.innerHTML = icon('<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M9 4v16M13 9l3 3-3 3"/>');
  const dock = document.createElement('div'); dock.id = 'brsvs-studio-dock';
  const themeButton = document.createElement('button'); themeButton.type = 'button'; themeButton.title = 'Theme and atmosphere'; themeButton.setAttribute('aria-label', 'Theme and atmosphere'); themeButton.setAttribute('aria-expanded', 'false'); themeButton.setAttribute('aria-controls', 'brsvs-theme-menu');
  themeButton.innerHTML = icon('<path d="M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 1-4c-1-1 0-3 2-3h2a3 3 0 0 0 3-3 9 9 0 0 0-9-8Z"/><path d="M7 10h.01M10 6h.01M15 7h.01M6 14h.01"/>');
  const menu = document.createElement('div'); menu.id = 'brsvs-theme-menu'; menu.hidden = true;
  const themePicker = window.SwaggerStudioTheme.picker(); themePicker.id = 'brsvs-swagger-theme-picker';
  const themeLabel = document.createElement('label'); themeLabel.textContent = 'Theme'; themeLabel.append(themePicker); menu.append(themeLabel);
  const atmosphere = window.SwaggerStudioTheme.atmospherePicker?.();
  if (atmosphere) { atmosphere.id = 'brsvs-swagger-atmosphere-picker'; const label = document.createElement('label'); label.textContent = 'Atmosphere'; label.append(atmosphere); menu.append(label); }
  function hideMenu() { menu.hidden = true; themeButton.setAttribute('aria-expanded', 'false'); }
  themeButton.onclick = () => { menu.hidden = !menu.hidden; themeButton.setAttribute('aria-expanded', String(!menu.hidden)); if (!menu.hidden) themePicker.focus(); };
  document.addEventListener('pointerdown', event => { if (!dock.contains(event.target)) hideMenu(); });
  dock.addEventListener('keydown', event => { if (event.key === 'Escape') { hideMenu(); themeButton.focus(); } });
  window.addEventListener('studio-opened', () => { hideMenu(); dock.hidden = true; });
  window.addEventListener('studio-closed', () => { dock.hidden = false; });
  dock.append(themeButton, switcher, menu); document.body.append(dock);
  const script = [...document.scripts].find(s => new URL(s.src, location.href).pathname.endsWith('/studio/bootstrap.js'));
  const configUrl = script ? new URL('./config.json', script.src) : null;
  const configReady = configUrl ? fetch(configUrl, { credentials: 'same-origin' }).then(r => r.ok ? r.json() : {}).then(value => { config = value; window.SwaggerStudioTheme.configure(config); }).catch(() => {}) : Promise.resolve();
  function snapshot() {
    try {
      ui = window.ui || window.swaggerUi;
      const status = ui?.specSelectors?.loadingStatus?.();
      if (status === 'loading' || status === 'failed' || status === 'failedConfig') return;
      const spec = ui?.specSelectors?.specJson()?.toJS();
      if (spec && (spec.openapi || spec.swagger === '2.0') && spec.paths) {
        const nativePicker = document.querySelector('.download-url-wrapper select');
        const groups = Array.from(nativePicker?.options || [], option => ({ url: option.value, name: option.textContent }));
        return { spec, ui, config, specUrl: ui.specSelectors.url?.() || ui.getConfigs?.().url || '', groups, switchGroup };
      }
    } catch {}
  }
  async function switchGroup(url) {
    const picker = document.querySelector('.download-url-wrapper select');
    if (!picker || picker.disabled || !Array.from(picker.options).some(option => option.value === url)) throw new Error('Swagger cannot select this API definition.');
    const previousSpec = ui.specSelectors.specJson();
    picker.value = url;
    picker.dispatchEvent(new Event('change', { bubbles: true }));
    const target = new URL(url, location.href).href;
    const deadline = performance.now() + 20000;
    while (performance.now() < deadline) {
      const status = ui.specSelectors.loadingStatus?.();
      if (status === 'failed' || status === 'failedConfig') break;
      const data = snapshot();
      if (data?.specUrl && new URL(data.specUrl, location.href).href === target &&
          (status === 'success' || ui.specSelectors.specJson() !== previousSpec)) return data;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error('The selected API definition did not load. Check Swagger and try again.');
  }
  switcher.onclick = () => { const data = snapshot(); if (data) SwaggerStudio.open(data); };
  const start = performance.now();
  async function waitForSwagger() {
    await configReady; const ready = snapshot();
    if (ready) { switcher.disabled = false; SwaggerStudio.open(ready); return; }
    if (performance.now() - start < 20000) { switcher.disabled = true; setTimeout(waitForSwagger, 100); }
    else { switcher.disabled = false; switcher.setAttribute('aria-label', 'Retry API Studio'); switcher.title = 'Resolve the Swagger API definition error, then retry.'; }
  }
  waitForSwagger();
})();
