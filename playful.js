(() => {
  if (window.SwaggerStudioPlayful) return;
  const motion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  let streak = 0, traveller, travelTimer;
  const quiet = () => !!motion?.matches;
  const theme = () => window.SwaggerStudioTheme?.current() || 'dark';
  const species = () => ({ bosphorus: 'ferry', ocean: 'whale', winter: 'snowman', arrakis: 'worm', sakura: 'flower', 'rainy-night': 'cloud', monsoon: 'cloud', hyperspace: 'star', cosmic: 'star', 'digital-rain': 'robot', terminal: 'robot' })[theme()] || 'sprite';
  const bodies = {
    whale: '<path d="M18 28Q30 5 55 18Q72 26 61 40Q40 56 20 38L7 35L2 23L15 27L14 18Z"/><path d="M34 37L28 51L42 39" opacity=".5"/>',
    ferry: '<path d="M5 34H65L55 46H18Z"/><path d="M18 33V17H51V33M28 17V9H36V17"/><path d="M24 23H46" stroke="var(--st-panel)" stroke-width="4"/>',
    snowman: '<circle cx="35" cy="36" r="18"/><circle cx="35" cy="17" r="13"/><path d="M22 7H49M28 7V1H42V7" stroke="currentColor" stroke-width="4"/><path d="M21 28H48L46 33H23Z" fill="#d88583"/>',
    worm: '<path d="M3 47Q12 5 38 12Q60 14 68 47Z"/><path d="M15 42L21 22M28 40L31 16M43 40L43 18M56 43L53 24" stroke="var(--st-panel)" stroke-width="3" opacity=".5"/>',
    flower: '<path d="M35 28C3 20 10 0 28 12C23-6 52-2 43 14C66 2 76 29 50 31C77 49 46 63 38 42C23 66 1 46 23 34Z"/>',
    cloud: '<path d="M17 42C-3 39 3 21 18 22C18 3 43 1 48 19C64 12 76 34 60 42Z"/>',
    star: '<path d="M35 2L44 19L65 22L50 37L54 55L35 45L16 55L20 37L5 22L26 19Z"/>',
    robot: '<rect x="11" y="13" width="49" height="37" rx="8"/><path d="M35 13V4M29 4H41M6 24V39M65 24V39" stroke="currentColor" stroke-width="3"/>',
    dolphin: '<path d="M3 40Q19 15 39 24L48 14L49 26Q60 29 68 34L53 37Q38 46 24 35L18 44L17 33L5 47Z"/>',
    teapot: '<path d="M18 20H51L54 39Q34 56 16 39Z"/><path d="M49 25Q75 12 65 39L52 40M18 25L4 18L10 35L19 38" fill="none" stroke="currentColor" stroke-width="4"/><path d="M17 18H53M34 18V11M29 11H39" stroke="currentColor" stroke-width="3"/>',
    sprite: '<path d="M10 29C8 2 60 2 61 30L64 48L51 44L40 50L29 45L15 50Z"/>'
  };
  function character(kind = species(), mood = 'happy') {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 72 62'); svg.setAttribute('aria-hidden', 'true');
    const eyesY = kind === 'snowman' ? 15 : 28, mouthY = eyesY + 9;
    const mouth = mood === 'surprised' ? `<circle cx="36" cy="${mouthY}" r="3"/>` : mood === 'error' ? `<path d="M28 ${mouthY + 3}Q36 ${mouthY - 4}44 ${mouthY + 3}"/>` : `<path d="M28 ${mouthY}Q36 ${mouthY + 8}44 ${mouthY}"/>`;
    svg.innerHTML = `<g fill="currentColor">${bodies[kind] || bodies.sprite}</g><g class="mascot-face" fill="var(--st-panel)" stroke="var(--st-panel)" stroke-width="1.6" stroke-linecap="round"><circle cx="29" cy="${eyesY}" r="1.8"/><circle cx="43" cy="${eyesY}" r="1.8"/>${mouth}</g>`;
    return svg;
  }
  function attach(node, { now = () => performance.now(), random = Math.random } = {}) {
    const started = now(), rare = random() < .08;
    let done = false, removed = false, stage = 0, state = 'pending', celebrate = false, streakAtFinish = 0;
    const clock = document.createElement('small'); clock.className = 'request-clock'; node.append(clock);
    const interval = window.setInterval(tick, 250);
    const visibility = () => { node.dataset.pageHidden = String(document.hidden); };
    document.addEventListener('visibilitychange', visibility); visibility();
    function refresh() {
      if (removed) return;
      for (const element of node.querySelectorAll('.rare-visitors,.streak-party,.perched-gull')) element.remove();
      if (!clock.isConnected) node.append(clock);
      node.classList.add('playful');
      node.dataset.waitStage = String(stage); clock.hidden = done;
      if (quiet()) return;
      if (stage >= 1 && !done && theme() === 'bosphorus') {
        const gull = document.createElement('i'); gull.className = 'perched-gull'; node.querySelector('.ferry-boat')?.append(gull);
      }
      if (rare && ['arrakis', 'ocean', 'bosphorus'].includes(theme()) && (state === 'pending' || state === 'success')) {
        const visitors = document.createElement('i'); visitors.className = `rare-visitors ${theme()}`;
        const kind = theme() === 'arrakis' ? 'worm' : theme() === 'ocean' ? 'whale' : 'dolphin';
        for (let i = 0; i < (theme() === 'bosphorus' ? 3 : 1); i++) { const visitor = character(kind); visitor.style.setProperty('--n', i); visitors.append(visitor); }
        node.append(visitors);
      }
      if (celebrate) {
        const party = document.createElement('i'); party.className = 'streak-party';
        const label = document.createElement('small'); label.textContent = `${streakAtFinish} in a row`; party.append(label);
        for (let i = 0; i < 8; i++) { const bit = document.createElement('b'); bit.style.setProperty('--n', i); party.append(bit); }
        node.append(party);
      }
    }
    function tick() {
      if (done || removed) return;
      const elapsed = Math.max(0, (now() - started) / 1000), next = elapsed >= 8 ? 2 : elapsed >= 4 ? 1 : 0;
      clock.textContent = `Waiting Â· ${elapsed.toFixed(1)} s`;
      if (next !== stage) { stage = next; refresh(); }
    }
    function finish(code, error) {
      if (done || removed) return;
      done = true; state = node.dataset.state; window.clearInterval(interval);
      streak = !error && Number(code) >= 200 && Number(code) < 300 ? streak + 1 : 0;
      streakAtFinish = streak;
      celebrate = streak > 0 && streak % 5 === 0;
      refresh();
    }
    function remove() { if (removed) return; removed = true; window.clearInterval(interval); document.removeEventListener('visibilitychange', visibility); }
    tick(); refresh();
    return { refresh, tick, finish, remove };
  }
  function clearTravel() { traveller?.remove(); traveller = undefined; window.clearTimeout(travelTimer); }
  function travel(from, to) {
    clearTravel();
    if (quiet() || !from || !to || !from.width || !to.width) return;
    const x = rect => Math.max(20, Math.min(innerWidth - 30, rect.left + rect.width / 2));
    traveller = document.createElement('i'); traveller.className = 'endpoint-traveller'; traveller.setAttribute('aria-hidden', 'true'); traveller.append(character());
    Object.assign(traveller.style, { left: `${x(from) - 12}px`, top: `${to.bottom - 16}px` });
    traveller.style.setProperty('--travel-x', `${x(to) - x(from)}px`); document.documentElement.append(traveller);
    travelTimer = window.setTimeout(clearTravel, 650);
  }
  window.addEventListener('studio-closed', () => { if (document.querySelector('.brsvs-response-fx[data-state=pending]')) streak = 0; clearTravel(); });
  window.addEventListener('studio-theme-changed', clearTravel);
  window.addEventListener('pagehide', () => { clearTravel(); streak = 0; });
  motion?.addEventListener?.('change', clearTravel);
  window.SwaggerStudioPlayful = { attach, travel, character };
})();
