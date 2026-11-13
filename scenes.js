(() => {
  if (window.SwaggerStudioScenes) return;
  const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const supported = new Set(['railway', 'pond', 'lunar', 'reef', 'clockwork', 'camp', 'airmail', 'volcano']);
  const environments = new Set(), reactive = new Set();
  let scheduled = false, pointer;
  const quiet = () => !!media?.matches;
  const blocked = event => event.composedPath().some(element => element?.matches?.('input,textarea,select,button,label,form,[contenteditable]:not([contenteditable="false"]),[role="textbox"],.field,.request,.response,pre,code,.tabs,.side,.opblock-body,.opblock-summary'));
  function clearProximity() { for (const actor of reactive) actor.classList.remove('env-near'); }
  function proximity() {
    scheduled = false;
    if (!pointer || pointer.blocked || quiet() || document.hidden) { clearProximity(); return; }
    for (const actor of reactive) {
      const rect = actor.getBoundingClientRect();
      const dx = Math.max(rect.left - pointer.x, 0, pointer.x - rect.right), dy = Math.max(rect.top - pointer.y, 0, pointer.y - rect.bottom);
      actor.classList.toggle('env-near', actor.isConnected && rect.width > 0 && rect.height > 0 && Math.hypot(dx, dy) < 55);
    }
  }
  document.addEventListener('pointermove', event => {
    pointer = { x: event.clientX, y: event.clientY, blocked: event.pointerType === 'touch' || blocked(event) };
    if (pointer.blocked) { clearProximity(); return; }
    if (!scheduled) { scheduled = true; if (window.requestAnimationFrame) window.requestAnimationFrame(proximity); else window.setTimeout(proximity, 16); }
  }, { passive: true });
  document.addEventListener('pointerout', event => { if (!event.relatedTarget) { pointer = undefined; clearProximity(); } }, { passive: true });
  const teeth = (cx, cy, radius) => Array.from({ length: 12 }, (_, i) => `<rect x="${cx - 2}" y="${cy - radius - 3}" width="4" height="7" rx="1" transform="rotate(${i * 30} ${cx} ${cy})"/>`).join('');
  const gear = (cx, cy, radius, reverse = false) => `<g class="gear-cog${reverse ? ' reverse' : ''}">${teeth(cx, cy, radius)}<circle cx="${cx}" cy="${cy}" r="${radius}"/><circle cx="${cx}" cy="${cy}" r="${radius * .45}" fill="var(--st-panel)"/><circle cx="${cx}" cy="${cy}" r="2"/></g>`;
  const art = {
    train: ['280 80', '<path class="train-track" d="M0 71H280"/><g class="train-body"><path d="M12 53V31H50V14H77V58H12Z"/><path d="M15 30V20H25V30M30 30V14H38V30"/><rect x="51" y="18" width="19" height="17" class="train-window"/><path d="M3 59H80L72 66H12Z"/><rect x="86" y="20" width="85" height="44" rx="5"/><rect x="178" y="20" width="85" height="44" rx="5"/>'+[96,119,142,188,211,234].map(x=>`<rect class="train-window" x="${x}" y="28" width="15" height="17" rx="2"/>`).join('')+'</g>'+[22,58,103,153,195,245].map(x=>`<g class="train-wheel"><circle cx="${x}" cy="65" r="8"/><path d="M${x-5} 65H${x+5}M${x} 60V70"/></g>`).join('')+'<g class="train-steam"><circle cx="27" cy="11" r="5"/><circle cx="18" cy="5" r="7"/></g>'],
    koi: ['120 60', '<g class="koi-tail"><path d="M29 29L3 12L12 30L3 49L30 35Z"/></g><path class="koi-body" d="M25 31C35 7 88 7 112 30C88 55 36 55 25 31Z"/><path class="koi-patch" d="M46 15Q70 17 62 38L45 45L36 35Z M86 17L99 22L96 40L83 44Q90 30 86 17Z"/><path class="koi-fin" d="M60 17L43 4L45 20M62 45L46 57L48 43"/><circle cx="100" cy="27" r="2.4" class="creature-eye"/>'],
    astronaut: ['100 120', '<path class="astronaut-tether" d="M48 80Q3 105 8 120"/><g class="astronaut-body"><rect x="26" y="51" width="47" height="42" rx="13"/><path d="M31 63L12 51L7 59L27 77M69 63L87 46L94 52L74 78M35 88L31 112H43L49 90M56 88L61 111H74L67 87"/><circle cx="49" cy="31" r="27"/><rect class="astronaut-visor" x="28" y="14" width="42" height="31" rx="13"/><path class="astronaut-glint" d="M36 21Q45 15 56 20"/><rect class="astronaut-panel" x="38" y="60" width="23" height="19" rx="3"/></g>'],
    turtle: ['140 80', '<g class="turtle-flippers"><path d="M43 28Q21 0 15 13L31 39M42 53Q16 77 13 62L32 46M85 27Q93 7 106 14L97 37M85 55Q94 77 107 66L96 45"/></g><path class="turtle-head" d="M94 31Q134 19 134 39Q129 54 98 48Z"/><path class="turtle-shell" d="M26 39C28 4 102 3 108 39C102 76 29 76 26 39Z"/><path class="turtle-tiles" d="M51 19L76 17L91 38L76 60L52 59L40 39Z M52 19L43 13M76 17L83 13M91 38L108 39M76 60L84 65M52 59L44 65M40 39L26 39"/><circle cx="124" cy="35" r="2" class="creature-eye"/>'],
    gears: ['140 90', gear(28,48,20)+gear(72,48,17,true)+'<g class="clock-lock"><rect x="102" y="44" width="29" height="26" rx="4"/><path class="lock-shackle" d="M107 44V33Q116 16 126 33V44"/><circle cx="116" cy="55" r="3" fill="var(--st-panel)"/></g>'],
    fox: ['140 85', '<path class="fox-tail" d="M57 62C-12 86-2 8 43 34C18 29 18 59 50 48Z"/><path class="fox-tail-tip" d="M18 28Q0 44 12 62L24 55Q14 42 29 32Z"/><ellipse class="fox-body" cx="78" cy="59" rx="39" ry="21"/><path class="fox-head" d="M69 29L68 5L87 18L107 8L111 36L96 56L79 52Z"/><path class="fox-cheeks" d="M71 34L89 39L108 33L96 53L83 50Z"/><g class="fox-eyes-closed"><path d="M77 30L83 32M94 31L101 28"/></g><g class="fox-eyes-open"><circle cx="81" cy="30" r="2.4"/><circle cx="97" cy="29" r="2.4"/></g><path class="fox-nose" d="M86 40L95 39L91 44Z"/>'],
    plane: ['140 70', '<path class="plane-light" d="M4 30L134 4L81 65L61 39Z"/><path class="plane-shadow" d="M61 39L134 4L72 48L81 65Z"/><path class="plane-fold" d="M61 39L57 61L72 48M4 30L61 39L134 4"/>'],
    envelope: ['100 70', '<rect class="envelope-body" x="5" y="12" width="90" height="55" rx="5"/><path class="envelope-lines" d="M6 64L47 33L94 64"/><path class="envelope-flap" d="M6 13L50 47L94 13Z"/>'],
    fire: ['80 80', '<path class="fire-logs" d="M10 67L69 75M12 75L65 65"/><path class="camp-flame" d="M17 65C1 42 33 41 31 10C61 30 78 50 57 68Z"/><path class="camp-flame-inner" d="M32 65Q19 51 44 35Q41 51 54 64Z"/>'],
    lily: ['100 70', '<path class="lily-leaf" d="M50 39L94 22C113 66 15 83 4 45C-5 10 75 2 89 16Z"/><g class="lily-flower"><path d="M50 44Q12 11 37 20L50 38Q43-1 58 12L57 36Q79 5 80 23L63 42Z"/></g>'],
    coral: ['160 100', '<path class="coral-stem" d="M25 100V38M25 69L4 50V29M25 53L47 32V12M97 100V18M97 65L68 49V29M97 44L121 21V4M97 81L143 55V30M143 47L157 34"/>'],
    island: ['200 100', '<path class="island-rock" d="M0 99L52 70L83 22L114 20L152 72L200 99Z"/><path class="island-lava" d="M85 24L100 35L95 47L117 65L112 80L140 98M114 22L118 40L137 58"/>']
  };
  function svg(name, cls = '') {
    const element = document.createElementNS('http://www.w3.org/2000/svg', 'svg'), entry = art[name];
    element.setAttribute('viewBox', `0 0 ${entry[0]}`); element.setAttribute('aria-hidden', 'true'); element.classList.add('scene-art');
    if (cls) element.classList.add(cls); element.innerHTML = entry[1]; return element;
  }
  function actor(name, reaction) {
    const element = document.createElement('div'); element.className = `scene-actor actor-${name}`; element.append(svg(name));
    if (reaction && !quiet()) { element.dataset.environmentActor = reaction; reactive.add(element); }
    return element;
  }
  function track(root) {
    environments.add(root); root.dataset.scenePaused = String(!!document.hidden);
    return () => { for (const actor of root.querySelectorAll('[data-environment-actor]')) { actor.classList.remove('env-near'); reactive.delete(actor); } environments.delete(root); root.remove(); };
  }
  function ambient(layer, effect) {
    if (!supported.has(effect) || quiet()) return null;
    const root = document.createElement('div'); root.className = `scene-environment environment-${effect}`; root.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < 14; i++) { const mote = document.createElement('b'); mote.className = 'scene-dust'; mote.style.setProperty('--x', `${Math.random()*100}%`); mote.style.setProperty('--y', `${10+Math.random()*80}%`); mote.style.setProperty('--phase', `${-Math.random()*25}s`); mote.style.setProperty('--duration', `${14+Math.random()*16}s`); root.append(mote); }
    if (effect === 'pond') { root.append(svg('lily','lily-left'), svg('lily','lily-right')); for (let i=0;i<2;i++) { const fish = actor('koi','turn'); fish.style.setProperty('--n',i); root.append(fish); } }
    if (effect === 'reef') root.append(svg('coral','coral-left'),svg('coral','coral-right'));
    if (effect === 'clockwork') root.append(svg('gears','ambient-gears'));
    if (effect === 'camp') root.append(svg('fire','ambient-fire'),actor('fox','wake'));
    if (effect === 'volcano') root.append(svg('island','ambient-island'));
    layer.append(root); return track(root);
  }
  function response(node, recipe) {
    if (!supported.has(recipe) || quiet()) return null;
    const root = document.createElement('div'); root.className = `feature-scene feature-${recipe}`; root.setAttribute('aria-hidden','true'); node.dataset.featureScene = recipe;
    const names = { railway:'train', lunar:'astronaut', reef:'turtle', clockwork:'gears', camp:'fox', airmail:'plane' };
    if (recipe === 'pond') for (let i=0;i<2;i++) { const orbit = document.createElement('div'); orbit.className='koi-orbit'; orbit.style.setProperty('--n',i); orbit.append(actor('koi','turn')); root.append(orbit); }
    else if (recipe === 'volcano') { const bubble = document.createElement('i'); bubble.className='lava-orb'; root.append(bubble); for (let i=0;i<7;i++) { const spark = document.createElement('b'); spark.className='lava-spark'; spark.style.setProperty('--n',i); root.append(spark); } }
    else root.append(actor(names[recipe], recipe === 'camp' ? 'wake' : undefined));
    if (recipe === 'camp') root.append(svg('fire','response-fire'));
    if (recipe === 'airmail') root.append(svg('envelope','response-envelope'));
    node.append(root); const dispose = track(root);
    return () => { dispose(); delete node.dataset.featureScene; };
  }
  document.addEventListener('visibilitychange', () => { for (const root of environments) root.dataset.scenePaused=String(!!document.hidden); if (document.hidden) clearProximity(); });
  window.addEventListener('blur', clearProximity); window.addEventListener('pagehide', clearProximity); media?.addEventListener?.('change', clearProximity);
  window.SwaggerStudioScenes = { ambient, response };
})();
