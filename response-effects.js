(() => {
  if (window.SwaggerStudioResponseEffects) return;
  const active = new Set();
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
  function start(target, requestKey) {
    for (const record of active) if (record.target === target || requestKey && record.requestKey === requestKey) record.remove();
    if (active.size >= 6) active.values().next().value.remove();
    const node = document.createElement('div'); node.setAttribute('aria-hidden', 'true'); node.dataset.state = 'pending';
    let frame, timer, playful, sceneCleanup, finished = false, removed = false, lastPaint = -Infinity;
    const record = { target, requestKey, node, remove, finish, refresh };
    function refresh() {
      sceneCleanup?.(); sceneCleanup = undefined;
      const recipe = window.SwaggerStudioTheme?.responseRecipe() || 'glow';
      node.className = `brsvs-response-fx ${recipe}${motion?.matches ? ' reduced' : ''}`;
      if (recipe === 'ferry' && !motion?.matches && !node.querySelector('.ferry-boat')) {
        const boat = document.createElement('i'); boat.className = 'ferry-boat'; boat.append(document.createElement('b')); node.append(boat);
      } else if (recipe !== 'ferry' || motion?.matches) node.querySelector('.ferry-boat')?.remove();
      node.querySelector('.whale-lane')?.remove();
      if (recipe === 'tide' && !motion?.matches) {
        const lane = document.createElement('i'); lane.className = 'whale-lane';
        lane.innerHTML = '<svg class="ocean-whale" viewBox="0 0 120 70" xmlns="http://www.w3.org/2000/svg"><path class="whale-body" d="M29 38C34 17 64 12 85 23C99 30 104 43 95 51C84 63 48 62 31 49L19 43C13 46 7 45 3 39L15 35L7 23C20 23 26 28 29 38Z"/><path class="whale-belly" d="M38 48Q69 65 96 45Q100 57 75 59Q51 60 38 48Z"/><path class="whale-fin" d="M61 43Q50 68 43 55L49 40Z"/><circle cx="88" cy="35" r="2.3" fill="#effcff"/><path d="M82 45Q89 48 95 43" fill="none" stroke="#c4eff3" stroke-width="1.5" stroke-linecap="round"/><path class="whale-spout" d="M76 22Q76 10 69 5M76 22Q80 6 88 8M76 20L77 3" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';
        node.append(lane);
      }
      node.querySelector('.snowman-lane')?.remove();
      if (recipe === 'ice' && !motion?.matches) {
        const lane = document.createElement('i'); lane.className = 'snowman-lane';
        lane.innerHTML = '<svg class="winter-snowman" viewBox="0 0 100 110" xmlns="http://www.w3.org/2000/svg"><g class="snowman-base"><path d="M23 70L5 56M78 69L94 54M10 60L7 49M88 60L97 62" fill="none" stroke="#96724e" stroke-width="3" stroke-linecap="round"/><ellipse cx="51" cy="88" rx="30" ry="21" fill="#d8eff5"/><ellipse cx="51" cy="84" rx="28" ry="21" fill="#f1fbff"/></g><g class="snowman-middle"><circle cx="51" cy="62" r="22" fill="#e8f8ff"/><circle cx="51" cy="57" r="2" fill="#34536b"/><circle cx="51" cy="68" r="2" fill="#34536b"/></g><g class="snowman-head"><circle cx="51" cy="32" r="17" fill="#f7fdff"/><circle cx="46" cy="29" r="1.8" fill="#253f51"/><circle cx="57" cy="29" r="1.8" fill="#253f51"/><path d="M51 32L68 35L51 37Z" fill="#eb964e"/><path d="M44 40Q51 45 57 40" fill="none" stroke="#34536b" stroke-width="1.5" stroke-linecap="round"/><path d="M33 17L70 17M40 16L42 3L61 3L64 16" fill="#25455e" stroke="#25455e" stroke-width="4" stroke-linejoin="round"/><path d="M33 46Q51 51 68 45L69 52Q51 57 33 52Z" fill="#db7b79"/><path d="M61 50L69 51L67 70L59 66Z" fill="#db7b79"/></g></svg>';
        node.append(lane);
      }
      node.querySelector('.storm-lane')?.remove();
      if (recipe === 'storm' && !motion?.matches) {
        const lane = document.createElement('i'); lane.className = 'storm-lane';
        const bolt = window.SwaggerStudioMotion?.lightningSvg(); if (bolt) { bolt.classList.add('storm-bolt'); lane.append(bolt); }
        node.append(lane);
      }
      node.querySelector('.cinema-scene')?.remove();
      if (['decode', 'sandworm', 'jump'].includes(recipe) && !motion?.matches) {
        const scene = document.createElement('i'); scene.className = 'cinema-scene';
        if (recipe === 'sandworm') {
          scene.innerHTML = '<svg class="sandworm-creature" viewBox="0 0 240 70" xmlns="http://www.w3.org/2000/svg"><path class="worm-body" d="M8 68C40 25 100 7 171 26C199 34 219 49 231 68Z"/><path class="worm-rings" d="M30 65L43 38M48 58L60 28M68 48L78 22M90 42L98 19M113 42L119 19M137 45L140 23M159 50L161 28M180 58L181 36M201 66L200 46"/><path class="worm-ridge" d="M13 65Q110 -9 222 63" fill="none"/></svg>';
        } else {
          for (let i = 0; i < 24; i++) {
            const shape = document.createElement('b'); shape.style.setProperty('--n', i); shape.style.setProperty('--angle', `${i * 15}deg`);
            if (recipe === 'decode') shape.textContent = ['01', 'ア', '10', 'キ', '00', 'コ'][i % 6];
            scene.append(shape);
          }
        }
        node.append(scene);
      }
      node.querySelector('.response-scene')?.remove();
      if (['tide', 'ice', 'petals'].includes(recipe) && !motion?.matches) {
        const scene = document.createElement('i'); scene.className = 'response-scene';
        for (let i = 0; i < 7; i++) { const shape = document.createElement('b'); shape.style.setProperty('--n', i); scene.append(shape); }
        node.append(scene);
      }
      node.dataset.theme = window.SwaggerStudioTheme?.current() || 'dark';
      sceneCleanup = window.SwaggerStudioScenes?.response(node, recipe);
      playful?.refresh();
    }
    function position(time) {
      if (removed) return;
      if (time - lastPaint >= 32) {
        lastPaint = time;
        const element = typeof target === 'function' ? target() : target;
        const rect = element?.isConnected ? element.getBoundingClientRect() : null;
        node.dataset.panelMode = element?.classList.contains('shell') ? 'ambient' : element?.dataset?.studioDock === 'true' ? 'dock' : element?.dataset?.studioPanel === 'true' ? 'embedded' : 'external';
        node.hidden = !rect || !rect.width || !rect.height || rect.bottom <= 0 || rect.top >= innerHeight;
        if (!node.hidden) Object.assign(node.style, { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px` });
      }
      frame = raf(position);
    }
    function remove() {
      if (removed) return; removed = true; sceneCleanup?.(); playful?.remove(); caf(frame); clearTimeout(timer); node.remove(); active.delete(record);
    }
    function finish(status, error) {
      if (removed || finished) return; finished = true;
      node.dataset.state = classify(status, error); node.replaceChildren(); refresh(); playful?.finish(status, error);
      if (!motion?.matches && node.dataset.state === 'success') for (let i = 0; i < 9; i++) {
        const particle = document.createElement('span');
        particle.style.setProperty('--x', `${8 + i * 10}%`); particle.style.setProperty('--dx', `${i % 2 ? 12 : -12}px`); particle.style.setProperty('--delay', `${i * 15}ms`); node.append(particle);
      }
      clearTimeout(timer); timer = window.setTimeout(remove, motion?.matches ? 600 : node.dataset.featureScene || playful ? 3600 : node.querySelector('.cinema-scene') ? 3000 : node.classList.contains('storm') ? 2600 : node.classList.contains('ice') ? 3400 : node.classList.contains('tide') ? 3600 : node.classList.contains('ferry') ? 2800 : node.querySelector('.response-scene') ? 2000 : 1000);
    }
    active.add(record); refresh(); playful = window.SwaggerStudioPlayful?.attach(node); document.documentElement.append(node); frame = raf(position);
    timer = window.setTimeout(remove, 120000);
    return record;
  }
  function clear() { for (const record of [...active]) record.remove(); }
  window.addEventListener('studio-closed', clear);
  window.addEventListener('pagehide', clear);
  window.addEventListener('studio-theme-changed', () => { for (const record of active) record.refresh(); });
  motion?.addEventListener?.('change', () => { for (const record of active) record.refresh(); });
  window.SwaggerStudioResponseEffects = { start, classify, clear };
})();
