(() => {
  if (window.SwaggerStudioResponseEffects) return;
  const active = new Set(), requests = new Map();
  const motion = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
  const raf = callback => window.requestAnimationFrame ? window.requestAnimationFrame(callback) : window.setTimeout(() => callback(performance.now()), 32);
  const caf = id => window.cancelAnimationFrame ? window.cancelAnimationFrame(id) : window.clearTimeout(id);
  function classify(status, error) {
    if (error?.name === 'AbortError') return 'cancelled';
    if (error || !Number.isFinite(Number(status)) || Number(status) < 100) return 'error';
    if (Number(status) >= 500) return 'error';
    if (Number(status) >= 300) return 'warning';
    return Number(status) >= 200 ? 'success' : 'error';
  }
  function start(target) {
    for (const record of active) if (record.target === target) record.remove();
    if (active.size >= 6) active.values().next().value.remove();
    const node = document.createElement('div'); node.setAttribute('aria-hidden', 'true'); node.dataset.state = 'pending';
    let frame, timer, removed = false, lastPaint = -Infinity;
    const record = { target, node, remove, finish, refresh };
    function refresh() {
      const recipe = window.SwaggerStudioTheme?.responseRecipe() || 'glow';
      node.className = `brsvs-response-fx ${recipe}${motion?.matches ? ' reduced' : ''}`;
      if (recipe === 'ferry' && !motion?.matches && !node.querySelector('.ferry-boat')) {
        const boat = document.createElement('i'); boat.className = 'ferry-boat'; boat.append(document.createElement('b')); node.append(boat);
      } else if (recipe !== 'ferry' || motion?.matches) node.querySelector('.ferry-boat')?.remove();
      node.dataset.theme = window.SwaggerStudioTheme?.current() || 'dark';
    }
    function position(time) {
      if (removed) return;
      if (time - lastPaint >= 32) {
        lastPaint = time;
        const element = typeof target === 'function' ? target() : target;
        const rect = element?.isConnected ? element.getBoundingClientRect() : null;
        node.hidden = !rect || !rect.width || !rect.height || rect.bottom <= 0 || rect.top >= innerHeight;
        if (!node.hidden) Object.assign(node.style, { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px` });
      }
      frame = raf(position);
    }
    function remove() {
      if (removed) return; removed = true; caf(frame); clearTimeout(timer); node.remove(); active.delete(record);
      for (const [key, value] of requests) if (value === record) requests.delete(key);
    }
    function finish(status, error) {
      if (removed) return;
      node.dataset.state = classify(status, error); node.replaceChildren(); refresh();
      if (!motion?.matches && node.dataset.state === 'success') for (let i = 0; i < 9; i++) {
        const particle = document.createElement('span');
        particle.style.setProperty('--x', `${8 + i * 10}%`); particle.style.setProperty('--dx', `${i % 2 ? 12 : -12}px`); particle.style.setProperty('--delay', `${i * 15}ms`); node.append(particle);
      }
      clearTimeout(timer); timer = window.setTimeout(remove, motion?.matches ? 600 : node.classList.contains('ferry') ? 2800 : 1000);
    }
    active.add(record); refresh(); document.documentElement.append(node); frame = raf(position);
    timer = window.setTimeout(remove, 120000);
    return record;
  }
  function operationRoot(path, method) {
    return [...document.querySelectorAll('.swagger-ui .opblock')].find(block => {
      const label = block.querySelector('.opblock-summary-path');
      return (label?.getAttribute('data-path') || label?.textContent?.replace(/\s/g, '')) === path && block.querySelector('.opblock-summary-method')?.textContent?.trim().toLowerCase() === method.toLowerCase();
    });
  }
  function responseTarget(path, method) {
    const block = operationRoot(path, method);
    return block?.querySelector('.live-responses-table') || block?.querySelector('.responses-wrapper') || block;
  }
  function plugin() {
    return { statePlugins: { spec: { wrapActions: {
      executeRequest: original => request => {
        const path = request.pathName, method = request.method;
        if (!path || !method) return original(request);
        const key = `${method}:${path}`;
        requests.get(key)?.remove(); requests.set(key, start(() => {
          const execute = operationRoot(path, method)?.querySelector('button.execute');
          return requests.has(key) && execute ? execute.parentElement : responseTarget(path, method);
        }));
        try { return original(request); } catch (error) { requests.get(key)?.finish(undefined, error); requests.delete(key); throw error; }
      },
      setResponse: original => (path, method, response) => {
        const result = original(path, method, response), key = `${method}:${path}`, record = requests.get(key);
        requests.delete(key);
        if (record) window.setTimeout(() => {
          const status = response?.status || response?.err?.status || response?.err?.response?.status;
          const error = response?.err?.name === 'AbortError' || response?.error && !status ? response.err || new Error('Request failed') : undefined;
          record.finish(status, error);
          const target = responseTarget(path, method);
          if (target && !document.getElementById('brsvs-studio-host')) {
            target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true });
            target.scrollIntoView?.({ behavior: motion?.matches ? 'instant' : 'smooth', block: 'nearest' });
          }
        }, 0);
        return result;
      }
    } } } };
  }
  // Install before Springdoc's window.onload initializer. Preserve presets, plugins and existing hooks.
  if (typeof window.SwaggerUIBundle === 'function') {
    const original = window.SwaggerUIBundle;
    const wrapped = function (options = {}, ...rest) { return original({ ...options, plugins: [...(options.plugins || []), plugin] }, ...rest); };
    Object.assign(wrapped, original); window.SwaggerUIBundle = wrapped;
  }
  function clear() { for (const record of [...active]) record.remove(); requests.clear(); }
  window.addEventListener('studio-closed', clear);
  window.addEventListener('pagehide', clear);
  window.addEventListener('studio-theme-changed', () => { for (const record of active) record.refresh(); });
  motion?.addEventListener?.('change', () => { for (const record of active) record.refresh(); });
  window.SwaggerStudioResponseEffects = { start, classify, clear };
})();
