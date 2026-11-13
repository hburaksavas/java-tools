(() => {
  let ui, ready, config = {};
  const switcher = document.createElement('button'); switcher.id = 'brsvs-studio-switcher';
  switcher.type = 'button'; switcher.textContent = 'Open API Studio';
  switcher.style.cssText = 'position:fixed;right:24px;bottom:24px;z-index:2147483646;border:0;border-radius:9px;padding:12px 20px;font:14px system-ui;cursor:pointer;box-shadow:0 4px 20px #0004';
  document.body.append(switcher);
  const themePicker = window.SwaggerStudioTheme.picker(); themePicker.id = 'brsvs-swagger-theme-picker'; document.body.append(themePicker);
  const atmosphere = window.SwaggerStudioTheme.atmospherePicker?.(); if (atmosphere) { atmosphere.id = 'brsvs-swagger-atmosphere-picker'; document.body.append(atmosphere); }
  const script = [...document.scripts].find(s => new URL(s.src, location.href).pathname.endsWith('/studio/bootstrap.js'));
  const configUrl = script ? new URL('./config.json', script.src) : null;
  const configReady = configUrl ? fetch(configUrl, { credentials: 'same-origin' }).then(r => r.ok ? r.json() : {}).then(value => { config = value; window.SwaggerStudioTheme.configure(config); }).catch(() => {}) : Promise.resolve();
  function snapshot() {
    try {
      ui = window.ui || window.swaggerUi;
      const spec = ui?.specSelectors?.specJson()?.toJS();
      if (spec && (spec.openapi || spec.swagger === '2.0') && spec.paths) return { spec, ui, config, specUrl: ui.specSelectors.url?.() || ui.getConfigs?.().url || '' };
    } catch {}
  }
  switcher.onclick = () => { const data = snapshot() || ready; if (data) SwaggerStudio.open(data); };
  const start = performance.now();
  async function waitForSwagger() {
    await configReady; ready = snapshot();
    if (ready) { switcher.disabled = false; SwaggerStudio.open(ready); return; }
    if (performance.now() - start < 20000) { switcher.disabled = true; setTimeout(waitForSwagger, 100); }
    else { switcher.disabled = false; switcher.textContent = 'Retry API Studio'; switcher.title = 'Resolve the Swagger API definition error, then retry.'; }
  }
  waitForSwagger();
})();
