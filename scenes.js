(() => {
  if (window.SwaggerStudioScenes) return;
  const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const supported = new Set(['paper-city','cable-car','watchmaker','bonsai-seasons','silk-lanterns','miniature-harbor','darkroom','plasma', 'pendulums', 'ink-water', 'wind', 'prism', 'sand-table', 'wave-tank', 'magnetic', 'marbles', 'bowling', 'balloons', 'railway', 'pond', 'lunar', 'reef', 'clockwork', 'camp', 'airmail', 'volcano']);
  const environments = new Set(), reactive = new Set();
  let scheduled = false, pointer;
  const quiet = () => !!media?.matches;
  const blocked = event => {
    const path = event.composedPath(), stage = path.some(element => element?.matches?.('.response-stage'));
    return path.some(element => element?.matches?.('input,textarea,select,button,label,form,[contenteditable]:not([contenteditable="false"]),[role="textbox"],.field,.request,pre,code,.tabs,.side,.opblock-body,.opblock-summary')) || !stage && path.some(element => element?.matches?.('.response'));
  };
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
    return () => { root.disposeGame?.(); root.disposeScene?.(); for (const actor of root.querySelectorAll('[data-environment-actor]')) { actor.classList.remove('env-near'); reactive.delete(actor); } environments.delete(root); root.remove(); };
  }
  const bowlingPins = [[240,69],[228,58],[252,58],[216,47],[240,47],[264,47],[204,36],[228,36],[252,36],[276,36]];
  function playTrack(root, kind) {
    const stage = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    stage.setAttribute('viewBox', kind === 'bowling' ? '0 0 480 186' : '0 0 480 140'); stage.setAttribute('aria-hidden', 'true'); stage.classList.add('play-track', `track-${kind}`);
    if (kind === 'marbles') {
      stage.innerHTML = '<path class="marble-support" d="M24 25v105m172-62v62m111-12v12m145-16v16M10 132h456"/><path class="marble-rail" d="M20 29h155q43 0 43 25t-43 25H66q-42 0-42 21t42 21h384"/><path class="marble-rail inner" d="M20 20h155q52 0 52 34t-52 34H66q-33 0-33 12t33 12h384"/><g class="marble-wheel"><circle cx="302" cy="103" r="19"/><path d="M283 103h38m-19-19v38m-13-32 26 26m0-26-26 26"/></g><path class="marble-finish" d="M444 91v33m0-33h20l-4 7h-16"/><g class="rolling-marble"><circle class="marble-glass" r="7"/><path class="marble-glint" d="M-4-1q0-3 4-3"/><path class="marble-swirl" d="M-4 5Q6 2 1-5"/></g><g class="marble-arrived"><circle class="marble-glass" cx="438" cy="105" r="7"/><path class="marble-glint" d="M434 104q0-3 4-3"/></g>';
    } else {
      stage.innerHTML = '<path class="bowling-lane" d="M101 177 178 22h124l77 155Z"/><path class="bowling-gutter" d="m94 179 80-160m132 0 80 160"/><path class="bowling-guides" d="m148 177 50-154m-3 154 24-154m21 154V23m45 154-24-154m71 154-50-154"/><path class="bowling-arrow" d="m205 143 5-7 4 7m22 0 4-8 4 8m22 0 4-7 5 7"/>';
      const rack = document.createElementNS('http://www.w3.org/2000/svg', 'g'); rack.classList.add('bowling-rack');
      bowlingPins.forEach(([x,y],i) => {
        const placement = document.createElementNS('http://www.w3.org/2000/svg', 'g'); placement.setAttribute('transform', `translate(${x} ${y})`);
        placement.innerHTML = `<g class="bowling-pin" style="--pin-delay:${i * 35}ms;--pin-turn:${i % 2 ? 65 : -65}deg"><path d="M-3-13q-4-8 0-11h6q4 3 0 11l-1 5q8 10 5 17H-7q-3-7 5-17Z"/><path class="pin-stripe" d="M-3-11h6m-6 3h6"/></g>`; rack.append(placement);
      });
      stage.append(rack);
      const shadow = document.createElementNS(stage.namespaceURI, 'ellipse');
      shadow.classList.add('bowling-shadow');
      shadow.setAttribute('rx', '12'); shadow.setAttribute('ry', '3.5');
      stage.append(shadow);
      const ball = document.createElementNS('http://www.w3.org/2000/svg', 'g'); ball.classList.add('bowling-ball');
      ball.innerHTML = '<circle r="11"/><g class="ball-holes"><circle cx="-3" cy="-4" r="1.4"/><circle cx="2" cy="-5" r="1.4"/><circle cx="0" cy="0" r="1.8"/></g><path class="marble-glint" d="M-7-2q0-5 5-5"/>'; stage.append(ball);
    }
    root.append(stage);
    if (kind === 'bowling') bowlingGame(root, stage);
  }
  function bowlingGame(root, stage) {
    root.removeAttribute('aria-hidden');
    const control = document.createElement('button');
    control.type = 'button'; control.className = 'bowling-control';
    control.setAttribute('aria-label', 'Bowl. Arrow keys aim and adjust power. Enter or Space throws.');
    const score = document.createElement('output');
    score.className = 'bowling-score'; score.setAttribute('aria-live', 'polite');
    root.append(control, score);
    const ball = stage.querySelector('.bowling-ball'), shadow = stage.querySelector('.bowling-shadow'), pins = [...stage.querySelectorAll('.bowling-pin')];
    let aim = 0, power = .7, drag, frame, timer, playing = false, disposed = false;
    let shot = 1, nextRack = false;
    const fallen = new Set();
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const launchX = () => 240 + aim * 67;
    const available = () => !disposed && !playing && !root.dataset.requestState && !quiet() && !document.hidden;

    function drawBall(x, y, scale = 1, spin = 0, lift = 0) {
      root.style.setProperty('--bowling-aim', aim);
      ball.style.transform = `translate(${x}px,${y - lift}px) scale(${scale}) rotate(${spin}deg)`;
      shadow.style.transform = `translate(${x + 2}px,${y + 8 * scale}px) scale(${scale})`;
      shadow.style.opacity = String(.52 - lift * .025);
    }
    function showReady() {
      if (nextRack) { fallen.clear(); nextRack = false; showRack(); }
      score.textContent = '';
      drawBall(launchX(), 164);
    }
    function showRack() {
      pins.forEach((pin, index) => {
        pin.removeAttribute('data-hit');
        pin.style.removeProperty('transform');
        pin.style.removeProperty('opacity');
        pin.toggleAttribute('data-fallen', fallen.has(index));
      });
    }
    function cancelDrag() {
      const pointer = drag;
      drag = undefined;
      control.classList.remove('dragging');
      if (pointer && control.hasPointerCapture?.(pointer.id)) control.releasePointerCapture(pointer.id);
      if (root.dataset.game === 'aiming') {
        delete root.dataset.game;
        ball.removeAttribute('style');
      }
    }
    function settle() {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      cancelDrag();
      playing = false;
      delete root.dataset.game;
      delete root.dataset.strike;
      ball.removeAttribute('style');
      shadow.removeAttribute('style');
      showRack();
      control.disabled = !!root.dataset.requestState;
    }

    function shoot() {
      if (!available()) return;
      const pull = drag?.pull || 0;
      cancelDrag();
      playing = true; root.dataset.game = 'rolling';
      const start = performance.now(), duration = 1450 - power * 530;
      const release = 95 + pull * 1.1;
      const originX = launchX();
      drawBall(originX, 164 + pull, 1, -pull);
      const contacts = new Map();
      if (power >= .26 && Math.abs(aim) < .95) {
        bowlingPins.forEach(([x, y], index) => {
          const impact = (164 - y - 6) / 147;
          if (!fallen.has(index) && Math.abs(originX - x) <= 6 + power * 7) contacts.set(index, impact);
        });
        const pocket = Math.abs(originX - 240) >= 8 && Math.abs(originX - 240) <= 16;
        const passes = power >= .86 && pocket ? 3 : power >= .68 ? 1 : 0;
        for (let pass = 0; pass < passes; pass++) {
          for (const [index, impact] of [...contacts]) {
            const [x, y] = bowlingPins[index];
            bowlingPins.forEach(([otherX, otherY], neighbor) => {
              if (fallen.has(neighbor) || contacts.has(neighbor) || otherY >= y) return;
              if (Math.hypot(otherX - x, otherY - y) <= 17) contacts.set(neighbor, impact + .06);
            });
          }
        }
      }
      function draw(now) {
        if (!playing || disposed || root.dataset.requestState || !root.isConnected) return;
        const elapsed = now - start;
        if (elapsed < release) {
          const swing = clamp(elapsed / release, 0, 1);
          drawBall(originX, 164 + pull * (1 - swing * swing), 1, -pull * (1 - swing), Math.sin(swing * Math.PI) * 6);
          frame = window.requestAnimationFrame(draw);
          return;
        }
        const time = clamp((elapsed - release) / duration, 0, 1);
        const t = time * (1.32 - .32 * time);
        const bounce = time < .18 ? Math.sin(time / .18 * Math.PI) * power * 5 : 0;
        drawBall(originX, 164 - 147 * t, 1 - .51 * t, t * 520, bounce);
        for (const [index, impact] of contacts) {
          if (t < impact) continue;
          const fall = clamp((t - impact) / .23, 0, 1);
          const direction = bowlingPins[index][0] < originX ? -1 : 1;
          pins[index].style.transform = 'translate(' + (fall * direction * 11) + 'px,' + (-fall * 8) + 'px) rotate(' + (fall * direction * 80) + 'deg)';
          pins[index].style.opacity = String(1 - fall * .78);
          pins[index].dataset.hit = 'true';
        }
        if (t < 1) { frame = window.requestAnimationFrame(draw); return; }
        const strike = shot === 1 && contacts.size === 10;
        contacts.forEach((_, index) => fallen.add(index));
        const spare = !strike && fallen.size === 10;
        root.dataset.game = 'result';
        root.dataset.strike = String(strike);
        score.textContent = strike ? 'STRIKE' : spare ? 'SPARE' : contacts.size + ' pins · ' + (10 - fallen.size) + ' left';
        if (strike || shot === 2) { shot = 1; nextRack = true; }
        else shot = 2;
        timer = window.setTimeout(() => { settle(); showReady(); }, 1250);
      }
      frame = window.requestAnimationFrame(draw);
    }

    control.onpointerdown = event => {
      if (!available() || drag || event.button !== 0) return;
      event.preventDefault();
      control.focus({ preventScroll: true });
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY, aim, power, moved: false };
      control.setPointerCapture?.(event.pointerId);
      control.classList.add('dragging');
      root.dataset.game = 'aiming';
    };
    control.onpointermove = event => {
      if (!drag || drag.id !== event.pointerId) return;
      const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) < 5) return;
      drag.moved = true;
      const width = stage.getBoundingClientRect().width || 480;
      aim = clamp(dx / (width * .22), -1, 1);
      power = clamp(.24 + dy / (width * .22), .15, 1);
      drag.pull = clamp(dy * 480 / width, 0, 49);
      drawBall(launchX(), 164 + drag.pull, 1, -drag.pull);
      score.textContent = 'Power ' + Math.round(power * 100) + '%';
    };
    control.onpointerup = event => { if (drag?.id === event.pointerId) shoot(); };
    function abortGesture(event) {
      if (!drag || drag.id !== event.pointerId) return;
      aim = drag.aim; power = drag.power;
      cancelDrag(); showReady();
    }
    control.onpointercancel = abortGesture;
    control.onlostpointercapture = abortGesture;
    control.onclick = event => { if (event.detail === 0) shoot(); };
    control.onkeydown = event => {
      if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' ','Enter'].includes(event.key)) event.preventDefault();
      else return;
      if (!available()) return;
      if (event.key === ' ' || event.key === 'Enter') { if (!event.repeat) shoot(); return; }
      const aimDelta = { ArrowLeft: -.12, ArrowRight: .12 }[event.key] || 0;
      const powerDelta = { ArrowDown: -.1, ArrowUp: .1 }[event.key] || 0;
      aim = clamp(aim + aimDelta, -1, 1);
      power = clamp(power + powerDelta, .15, 1);
      drawBall(launchX(), 164);
      score.textContent = 'Power ' + Math.round(power * 100) + '%';
    };

    root.pauseGame = () => {
      settle();
      for (const pin of pins) pin.removeAttribute('data-fallen');
      control.disabled = true;
      score.textContent = 'API request in progress';
    };
    root.resumeGame = () => { settle(); showReady(); };
    const stopHidden = () => { if (document.hidden && !root.dataset.requestState) { settle(); showReady(); } };
    document.addEventListener('visibilitychange', stopHidden);
    root.disposeGame = () => { disposed = true; settle(); document.removeEventListener('visibilitychange', stopHidden); };
    showReady();
  }
  function magneticLab(root) {
    const lab = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); lab.setAttribute('viewBox','0 0 460 230'); lab.setAttribute('aria-hidden','true'); lab.classList.add('magnetic-lab');
    lab.innerHTML = '<ellipse class="magnetic-platform" cx="230" cy="200" rx="190" ry="13"/><path class="magnetic-grid" d="M60 197h340m-310-8h280m-250-7h220M110 181l-24 27m74-27-12 27m62-27v27m50-27 12 27m38-27 24 27"/><g class="magnetic-fields"></g><g class="magnet-body"><path class="magnet-shell" d="M158 82h35v64q0 35 37 35t37-35V82h35v64q0 69-72 69t-72-69Z"/><path class="magnet-cap north" d="M158 82h35v28h-35Z"/><path class="magnet-cap south" d="M267 82h35v28h-35Z"/><path class="magnet-shine" d="M167 121v25q0 57 63 57"/><text x="175" y="101">N</text><text x="284" y="101">S</text></g><g class="magnetic-beads"></g><text class="magnetic-label" x="230" y="225">MAGNETIC FIELD · Fe</text>';
    const fields=lab.querySelector('.magnetic-fields'), beads=lab.querySelector('.magnetic-beads');
    const lines=Array.from({length:7},(_,i)=>{ const path=document.createElementNS('http://www.w3.org/2000/svg','path'); path.classList.add('magnetic-field'); path.style.setProperty('--field-delay',`${-i*.6}s`); fields.append(path); return path; });
    const spheres=Array.from({length:18},(_,i)=>{
      const bead=document.createElementNS('http://www.w3.org/2000/svg','g'); bead.classList.add('magnetic-bead');
      const side=i%2 ? 284 : 175, angle=(i/2)*.66;
      const home={x:side+Math.cos(angle)*(18+i%3*9),y:70-Math.sin(angle)*26-i%4*4};
      bead.innerHTML=`<circle class="magnetic-metal" r="${3+i%3}"/><circle class="magnetic-glint" cx="-1" cy="-1.5" r="1"/>`;
      beads.append(bead); return {bead,home,x:home.x,y:home.y};
    });
    let frame, target, disposed=false, bend=0, last=0;
    function paint() {
      lines.forEach((line,i)=>{ const lift=30+i*8; line.setAttribute('d',`M175 86 C${120-i*13+bend} ${-lift*.2} ${340+i*13+bend} ${-lift*.2} 284 86`); });
      for(const sphere of spheres) sphere.bead.setAttribute('transform',`translate(${sphere.x} ${sphere.y})`);
    }
    function tick(time) {
      frame=undefined; if(disposed || document.hidden || quiet()) return;
      const step=Math.min(2,Math.max(.3,(time-last)/16)); last=time;
      const desired=target ? (target.x-230)*.2 : 0; bend+=(desired-bend)*.12*step;
      let moving=Math.abs(desired-bend)>.15;
      for(const sphere of spheres) {
        const dx=(target?.x||0)-sphere.home.x,dy=(target?.y||0)-sphere.home.y;
        const distance=Math.hypot(dx,dy)||1, attraction=target ? Math.max(0,1-distance/170)*22 : 0;
        const x=sphere.home.x+dx/distance*attraction,y=sphere.home.y+dy/distance*attraction;
        sphere.x+=(x-sphere.x)*.1*step; sphere.y+=(y-sphere.y)*.1*step;
        moving ||= Math.hypot(x-sphere.x,y-sphere.y)>.15;
      }
      paint(); if(moving) frame=window.requestAnimationFrame(tick);
    }
    function schedule() { if(frame===undefined && !disposed) {last=performance.now();frame=window.requestAnimationFrame(tick);} }
    function clear() { target=undefined; schedule(); }
    function move(event) {
      if(blocked(event) || event.pointerType==='touch' || document.hidden) { clear();return; }
      const rect=lab.getBoundingClientRect(); if(!rect.width || !rect.height) return;
      const x=(event.clientX-rect.left)*460/rect.width,y=(event.clientY-rect.top)*230/rect.height;
      target=x>=-30 && x<=490 && y>=-30 && y<=260 ? {x,y}:undefined; schedule();
    }
    const visibility=()=>{ if(document.hidden) {window.cancelAnimationFrame(frame);frame=undefined;target=undefined;} else schedule(); };
    document.addEventListener('pointermove',move,{passive:true}); window.addEventListener('blur',clear); document.addEventListener('visibilitychange',visibility);
    root.disposeScene=()=>{disposed=true;window.cancelAnimationFrame(frame);document.removeEventListener('pointermove',move);window.removeEventListener('blur',clear);document.removeEventListener('visibilitychange',visibility);};
    root.append(lab); paint();
  }
  function interactiveSurface(root, kind) {
    const canvas=document.createElement('canvas'); canvas.className=`interactive-surface surface-${kind}`; canvas.setAttribute('aria-hidden','true');
    const caption=document.createElement('small'); caption.className='surface-caption'; caption.textContent=kind==='sand-table'?'KINETIC SAND · move over empty space':'RIPPLE TANK · tap empty space';
    root.append(canvas,caption);
    // jsdom and browsers without canvas retain the palette and static surface styling.
    let ctx; try { if (typeof window.CanvasRenderingContext2D!=='undefined') ctx=canvas.getContext('2d'); } catch {}
    if(!ctx) return;
    let width=640,height=210,frame,disposed=false,point,lastInput=-Infinity,lastWave=0,settling=0;
    const waves=[], grains=[];
    function resize() {
      const rect=canvas.getBoundingClientRect(); width=Math.max(1,rect.width||640);height=Math.max(1,rect.height||210);
      const ratio=Math.min(window.devicePixelRatio||1,1.5);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);
      grains.length=0;
      for(let y=12;y<height;y+=9) for(let x=10;x<width;x+=10) {const jitter=Math.sin(x*17+y*31)*2; grains.push({hx:x+jitter,hy:y+jitter,x:x+jitter,y:y+jitter,vx:0,vy:0});}
      settling=80;schedule();
    }
    function schedule() {if(frame===undefined&&!disposed&&!document.hidden)frame=window.requestAnimationFrame(draw);}
    function wave(x,y,power=1) {if(waves.length>=8)waves.shift();waves.push({x,y,start:performance.now(),power});schedule();}
    function draw(time) {
      frame=undefined;if(disposed||document.hidden||quiet())return;
      ctx.clearRect(0,0,width,height);
      const colors=getComputedStyle(root),accent=colors.getPropertyValue('--st-accent').trim()||'#85cdd8';
      if(root.dataset.requestState==='pending'&&time-lastWave>1100){lastWave=time;wave(width*.72,height*.55,.55);}
      while(waves.length && time-waves[0].start>3200)waves.shift();
      if(kind==='sand-table') {
        ctx.fillStyle=accent;ctx.globalAlpha=.45;
        for(const grain of grains) {
          let fx=(grain.hx-grain.x)*.028,fy=(grain.hy-grain.y)*.028;
          if(point){const dx=grain.x-point.x,dy=grain.y-point.y,d=Math.hypot(dx,dy)||1;if(d<48){const push=(1-d/48)*1.6;fx+=dx/d*push;fy+=dy/d*push;}}
          for(const w of waves){const dx=grain.hx-w.x,dy=grain.hy-w.y,d=Math.hypot(dx,dy)||1,front=(time-w.start)*.09;if(Math.abs(d-front)<18){fx+=dx/d*.1*w.power;fy+=dy/d*.1*w.power;}}
          grain.vx=(grain.vx+fx)*.82;grain.vy=(grain.vy+fy)*.82;grain.x+=grain.vx;grain.y+=grain.vy;
          ctx.fillRect(grain.x,grain.y,1.4,1.1);
        }
      } else {
        ctx.strokeStyle=accent;ctx.lineWidth=.8;
        // Superpose travelling radial waves; crossings add and cancel their heights.
        for(let y=12;y<height;y+=9){ctx.beginPath();for(let x=0;x<=width;x+=6){let z=0;for(const w of waves){const d=Math.hypot(x-w.x,y-w.y),age=(time-w.start)/1000,front=age*100;const envelope=Math.exp(-Math.pow((d-front)/32,2))*(1-age/3.2);z+=Math.sin(d*.12-age*12)*envelope*8*w.power;}if(x===0)ctx.moveTo(x,y+z);else ctx.lineTo(x,y+z);}ctx.globalAlpha=.18+(waves.length? .12:0);ctx.stroke();}
        for(const w of waves){const age=(time-w.start)/1000;ctx.globalAlpha=Math.max(0,(1-age/3.2)*.25);ctx.beginPath();ctx.ellipse(w.x,w.y,Math.max(1,age*100),Math.max(1,age*100),0,0,Math.PI*2);ctx.stroke();}
      }
      ctx.globalAlpha=1;
      if(point||waves.length||root.dataset.requestState==='pending'||settling-->0)schedule();
    }
    function local(event) {
      if(blocked(event)||quiet()||document.hidden)return;
      const rect=canvas.getBoundingClientRect();if(!rect.width)return;
      const x=event.clientX-rect.left,y=event.clientY-rect.top;
      if(x<0||x>width||y<0||y>height)return;return {x,y};
    }
    function move(event) {point=event.pointerType==='touch'?undefined:local(event);settling=130;if(kind==='sand-table')schedule();}
    function press(event) {const p=local(event);if(!p||event.button!==0)return;if(kind==='wave-tank'&&performance.now()-lastInput>80){lastInput=performance.now();wave(p.x,p.y);}else if(kind==='sand-table'){point=p;settling=130;schedule();}}
    function leave(){point=undefined;settling=130;schedule();}
    function visibility(){if(document.hidden){window.cancelAnimationFrame(frame);frame=undefined;point=undefined;}else{settling=60;schedule();}}
    root.reactToRequest=state=>{wave(width*.72,height*.55,state==='success'?1: .65);settling=100;};
    document.addEventListener('pointermove',move,{passive:true});document.addEventListener('pointerdown',press,{passive:true});window.addEventListener('blur',leave);document.addEventListener('pointerout',leave);document.addEventListener('visibilitychange',visibility);window.addEventListener('resize',resize);
    const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(resize):null;observer?.observe(canvas);
    root.disposeScene=()=>{disposed=true;window.cancelAnimationFrame(frame);observer?.disconnect();document.removeEventListener('pointermove',move);document.removeEventListener('pointerdown',press);window.removeEventListener('blur',leave);document.removeEventListener('pointerout',leave);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('resize',resize);};
    resize();
  }
  const physicsThemes = new Set(['plasma','pendulums','ink-water','wind','prism']);
  function physicsScene(root, kind) {
    const canvas=document.createElement('canvas');canvas.className=`physics-canvas physics-${kind}`;canvas.setAttribute('aria-hidden','true');
    const label=document.createElement('small');label.className='physics-caption';
    label.textContent={plasma:'PLASMA GLOBE · bring the pointer close',pendulums:'PENDULUM WAVE · tap to disturb','ink-water':'INK IN WATER · tap to release pigment',wind:'WIND TUNNEL · move through the flow',prism:'PRISM ROOM · move to turn the glass'}[kind];
    root.append(canvas,label);
    let ctx;try{if(typeof window.CanvasRenderingContext2D!=='undefined')ctx=canvas.getContext('2d');}catch{} if(!ctx)return;
    let frame,disposed=false,point,angle=0,impulse=0,last=-Infinity,burst=0,previous=0,width=640,height=220;
    const drops=[],colors=['#d79be8','#7abbdc','#efafbc','#9fe1c7'];
    function drop(x,y){for(let i=0;i<28;i++){if(drops.length>=224)drops.shift();const a=i*2.399;drops.push({x,y,vx:Math.cos(a)*(.2+i*.015),vy:Math.sin(a)*.3+.12,age:0,color:colors[Math.floor(i/7)%4]});}schedule();}
    function resize(){const r=canvas.getBoundingClientRect();width=r.width||640;height=r.height||220;const d=Math.min(window.devicePixelRatio||1,1.5);canvas.width=Math.round(width*d);canvas.height=Math.round(height*d);ctx.setTransform(d,0,0,d,0,0);burst=80;schedule();}
    function schedule(){if(frame===undefined&&!disposed&&!document.hidden)frame=window.requestAnimationFrame(draw);}
    function path(points,stroke,alpha=1,line=1){ctx.globalAlpha=alpha;ctx.strokeStyle=stroke;ctx.lineWidth=line;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();}
    function circle(x,y,r,fill,alpha=1){ctx.globalAlpha=alpha;ctx.fillStyle=fill;ctx.beginPath();ctx.arc(x,y,Math.max(.1,r),0,Math.PI*2);ctx.fill();}
    function draw(time){
      frame=undefined;if(disposed||document.hidden||quiet())return;
      if(time-last<32){schedule();return;}const dt=Math.min(2,(time-last)/32)||1;last=time;
      const t=time/1000,style=getComputedStyle(root),accent=style.getPropertyValue('--st-accent').trim()||'#bc99ee',text=style.getPropertyValue('--st-text').trim()||'#eee';
      const cx=width*.55,cy=height*.48,r=Math.min(88,height*.39);ctx.clearRect(0,0,width,height);
      impulse*=.97;burst=Math.max(0,burst-1);
      if(kind==='plasma'){
        ctx.globalAlpha=.25;ctx.strokeStyle=accent;ctx.lineWidth=1;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();
        path([[cx-r*.45,cy+r+15],[cx+r*.45,cy+r+15]],accent,.45,6);
        for(let i=0;i<13;i++){const a=i*Math.PI*2/13+t*.035, target=point&&Math.hypot(point.x-cx,point.y-cy)<r*1.6&&i<5?Math.atan2(point.y-cy,point.x-cx)+(i-2)*.025:a;
          const points=[[cx,cy]];for(let j=1;j<=12;j++){const f=j/12,jitter=Math.sin(t*5+i*3+j*2)*6*Math.sin(f*Math.PI);points.push([cx+Math.cos(target)*r*f-Math.sin(target)*jitter,cy+Math.sin(target)*r*f+Math.cos(target)*jitter]);}
          path(points,accent,.12+impulse*.05,4);path(points,i%3?'#c49bf2':'#ef9ccc',.65,1);}
        circle(cx,cy,10,accent,.3);circle(cx,cy,4,text,.8);
      }else if(kind==='pendulums'){
        const span=Math.min(width*.75,480),left=cx-span/2;path([[left-15,20],[left+span+15,20]],accent,.4,3);
        for(let i=0;i<16;i++){const x=left+i*span/15,length=75+i*5,swing=Math.sin(t*(18+i)*Math.PI*2/60+impulse*(i%3-1))*.4;
          const bx=x+Math.sin(swing)*length,by=20+Math.cos(swing)*length;path([[x,20],[bx,by]],text,.18);circle(bx,by,5.5,accent,.7);circle(bx-1.5,by-2,1.2,text,.6);}
      }else if(kind==='ink-water'){
        if(!drops.length&&time-previous>7000){previous=time;drop(cx,35);}
        for(let i=drops.length-1;i>=0;i--){const d=drops[i];d.age+=dt;d.vx+=Math.sin(d.y*.035+t*.4)*.008;d.x+=d.vx*dt;d.y+=(d.vy+.15)*dt;const size=2+d.age*.045;
          circle(d.x,d.y,size,d.color,Math.max(0,(1-d.age/230)*.11));if(d.age>230||d.y>height+30)drops.splice(i,1);}
      }else if(kind==='wind'){
        const obstacle=point||{x:cx,y:height*.52};
        for(let lane=0;lane<18;lane++){const y=12+lane*(height-24)/17,pts=[];for(let x=0;x<=width;x+=8){const dx=x-obstacle.x,dy=y-obstacle.y,dist=Math.max(18,Math.hypot(dx,dy));const bend=Math.exp(-dx*dx/5000)*(dy<0?-1:1)*27*Math.exp(-Math.abs(dy)/80);const wake=dx>0?Math.sin(dx*.065-t*3+lane*.3)*Math.exp(-dx/170)*Math.exp(-Math.abs(dy)/60)*12:0;pts.push([x,y+bend+wake]);}ctx.setLineDash([30,18]);ctx.lineDashOffset=-t*(root.dataset.requestState==='pending'?75:45);path(pts,accent,.22,1);ctx.setLineDash([]);}
        circle(obstacle.x,obstacle.y,15,accent,.12);ctx.globalAlpha=.35;ctx.strokeStyle=accent;ctx.beginPath();ctx.arc(obstacle.x,obstacle.y,15,0,Math.PI*2);ctx.stroke();
      }else{
        angle+=((point?(point.x/width-.5)*.7:0)-angle)*.08;
        const top=[cx+Math.sin(angle)*35,cy-65],left=[cx-65,cy+48],right=[cx+65,cy+48];
        ctx.globalAlpha=.07;ctx.fillStyle=text;ctx.beginPath();ctx.moveTo(...top);ctx.lineTo(...left);ctx.lineTo(...right);ctx.closePath();ctx.fill();path([top,left,right,top],text,.4,1.5);
        const entry=[cx-32,cy+6];path([[Math.max(0,cx-230),cy+6],entry],text,.65,2);
        ['#d38cbf','#dda28b','#dfcd91','#9eceaa','#8cbfdc','#a59be0'].forEach((color,i)=>{const n=1.5+(5-i)*.012,refraction=Math.asin(Math.sin(.55+angle)/n),exitY=cy+10+(i-2.5)*1.6;path([entry,[cx+40,exitY]],color,.2,1);const a=.15+(i-2.5)*(.038+impulse*.008)-refraction*.4;path([[cx+40,exitY],[Math.min(width,cx+245),exitY+Math.tan(a)*205]],color,.55,2);});
      }
      ctx.globalAlpha=1;if(kind==='plasma'||kind==='pendulums'||kind==='wind'||drops.length||point||burst||root.dataset.requestState==='pending')schedule();
    }
    function local(event){if(blocked(event)||document.hidden||quiet())return;const r=canvas.getBoundingClientRect();if(!r.width)return;const x=event.clientX-r.left,y=event.clientY-r.top;if(x>=0&&x<=width&&y>=0&&y<=height)return{x,y};}
    function move(event){point=event.pointerType==='touch'?undefined:local(event);burst=60;schedule();}
    function press(event){const p=local(event);if(!p||event.button!==0)return;if(kind==='ink-water')drop(p.x,p.y);if(kind==='pendulums'){impulse=2;burst=120;}schedule();}
    function leave(){point=undefined;burst=60;schedule();}
    function visibility(){if(document.hidden){window.cancelAnimationFrame(frame);frame=undefined;point=undefined;}else{last=-Infinity;schedule();}}
    root.reactToRequest=state=>{impulse=state==='success'?1.2:.5;burst=90;if(kind==='ink-water')drop(width*.55,35);schedule();};
    document.addEventListener('pointermove',move,{passive:true});document.addEventListener('pointerdown',press,{passive:true});window.addEventListener('blur',leave);document.addEventListener('pointerout',leave);document.addEventListener('visibilitychange',visibility);window.addEventListener('resize',resize);
    const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(resize):null;observer?.observe(canvas);
    root.disposeScene=()=>{disposed=true;window.cancelAnimationFrame(frame);observer?.disconnect();document.removeEventListener('pointermove',move);document.removeEventListener('pointerdown',press);window.removeEventListener('blur',leave);document.removeEventListener('pointerout',leave);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('resize',resize);};resize();
  }
  const plannedThemes=new Set(['paper-city','cable-car','watchmaker','bonsai-seasons','silk-lanterns','miniature-harbor','darkroom']);
  function craftedScene(root,kind,layer) {
    const ns='http://www.w3.org/2000/svg',stage=document.createElementNS(ns,'svg');stage.setAttribute('viewBox','0 0 600 230');stage.setAttribute('aria-hidden','true');stage.classList.add('crafted-scene',`crafted-${kind}`);
    const rect=(x,y,w,h,cls)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" class="${cls}"/>`;
    const artworks={
      'paper-city':Array.from({length:8},(_,i)=>{const x=55+i*64,h=40+(i*37)%90;return `<g class="paper-building" style="--building-delay:${i*.22}s"><path class="paper-wall" d="M${x} 205V${205-h}l28-17 28 17v${h}Z"/><path class="paper-fold" d="M${x+28} ${188-h}V205M${x} ${205-h}l28 13 28-13"/>${Array.from({length:6},(_,j)=>rect(x+8+j%3*17,220-h+Math.floor(j/3)*20,7,10,'paper-window')).join('')}</g>`;}).join('')+'<path class="crafted-line" d="M30 206h540"/>',
      'cable-car':'<path class="valley-far" d="m0 186 95-112 88 80 110-132 105 128 65-77 137 120v37H0Z"/><path class="valley-near" d="m0 230 135-105 135 105 151-102 179 102Z"/><path class="cable-line" d="M72 62q225 55 456 0"/><path class="crafted-line" d="M72 62v126m456-126v126"/><g class="cable-cabin"><path class="crafted-line" d="M0 0v22"/><rect class="cabin-shell" x="-23" y="22" width="46" height="43" rx="7"/><path class="cabin-window" d="M-16 29h32v17h-32Z"/><path class="cabin-door" d="M0 47v15"/></g><g class="station-doors"><path class="station-wall" d="M35 152h75v52H35ZM490 152h75v52h-75Z"/><path class="station-door" d="M61 166h22v38H61Zm455 0h22v38h-22Z"/></g>',
      'watchmaker':`<circle class="watch-case" cx="300" cy="120" r="91"/><circle class="watch-dial" cx="300" cy="120" r="79"/>${gear(270,114,28)}${gear(329,114,24,true)}${gear(300,163,16)}<path class="watch-spring" d="M285 66q30-22 43 4t-24 21q-15-8 3-16"/><path class="watch-hand" d="M300 120V63"/><circle class="watch-center" cx="300" cy="120" r="4"/><path class="crafted-line" d="M391 108h17v23h-17"/>`,
      'bonsai-seasons':'<path class="bonsai-pot" d="M216 185h168l-18 32H234Z"/><path class="bonsai-trunk" d="M297 184q-27-28-5-50t-4-38q-15-22 2-46m4 86-60-32m61 8 58-33m-59 18 36-39"/>'+Array.from({length:28},(_,i)=>{const x=217+(i*47)%156,y=43+(i*19)%75;return `<ellipse class="bonsai-leaf" cx="${x}" cy="${y}" rx="${12+i%4*3}" ry="${7+i%3*2}" style="--leaf-n:${i}"/>`;}).join('')+'<g class="bonsai-blossoms">'+Array.from({length:12},(_,i)=>`<circle cx="${222+i*13}" cy="${53+i%4*16}" r="3"/>`).join('')+'</g>',
      'silk-lanterns':'<path class="lantern-wire" d="M30 30q270 45 540 0"/>'+Array.from({length:5},(_,i)=>`<g class="silk-lantern" style="--lantern-x:${100+i*100}px;--lantern-n:${i}"><path class="crafted-line" d="M0 0v${32+i%2*15}"/><g transform="translate(0 ${62+i%2*15})"><ellipse class="lantern-halo" rx="47" ry="58"/><ellipse class="lantern-silk" rx="24" ry="34"/><path class="lantern-ribs" d="M-20-19h40m-44 19h48m-44 19h40M0-34q-18 34 0 68m0-68q18 34 0 68"/><path class="crafted-line" d="M0 34v19"/><rect class="lantern-cap" x="-10" y="-37" width="20" height="5" rx="2"/></g></g>`).join(''),
      'miniature-harbor':'<path class="harbor-water" d="M15 179h570v42H15Z"/><path class="crafted-line" d="M20 182h560m-500 16h80m48 7h76m49-9h92m40 11h70"/><path class="crane-frame" d="M120 177V45h260M109 177l22-120m-11-12 42 44h218"/><g class="harbor-hoist"><path class="hoist-cable" d="M0 0v65"/><rect class="cargo-lift" x="-20" y="65" width="40" height="22" rx="2"/></g><path class="harbor-ship" d="m270 168 30 36h208l40-36Z"/>'+[0,1,2].map(i=>rect(311+i*55,141,48,26,`cargo-stack cargo-${i}`)).join('')+'<path class="ship-cabin" d="M473 141v-30h35v30"/>',
      'darkroom':'<path class="darkroom-wire" d="M60 24h480"/><path class="darkroom-lamp" d="M480 24v17m-21 23 21-23 21 23Z"/><ellipse class="darkroom-glow" cx="480" cy="75" rx="54" ry="30"/><g class="developing-tray"><rect class="tray-rim" x="155" y="78" width="290" height="128" rx="12"/><rect class="tray-liquid" x="166" y="89" width="268" height="105" rx="7"/><rect class="photo-paper" x="209" y="98" width="180" height="87" rx="1"/><g class="photo-image"><rect x="216" y="105" width="166" height="70"/><circle cx="345" cy="122" r="9"/><path d="m216 175 39-49 40 34 29-24 58 39Z"/><path d="M216 166h166"/></g><path class="liquid-reflection" d="M178 109q20-12 25 0m192 60q20 10 27-1"/></g>'
    };
    stage.innerHTML=artworks[kind];root.append(stage);
    const hint=document.createElement('small');hint.className='crafted-caption';hint.textContent={'paper-city':'PAPER CITY · approach the windows','cable-car':'CABLE CAR · move to sway',watchmaker:'WATCHMAKER · drag the crown','bonsai-seasons':'BONSAI SEASONS · tap to grow','silk-lanterns':'SILK LANTERNS · move to stir the air','miniature-harbor':'MINIATURE HARBOR · choose the next cargo',darkroom:'DARKROOM · move to rock the tray'}[kind];root.append(hint);
    let frame,disposed=false,point,drag,energy=0,season=0,cargo=0,development=0,last=-Infinity,elapsed=0,watchTurn=0;
    const controls=[];
    function control(label,cls){const b=document.createElement('button');b.type='button';b.className=`crafted-control ${cls}`;b.setAttribute('aria-label',label);b.title=label;root.append(b);controls.push(b);root.removeAttribute('aria-hidden');layer.removeAttribute('aria-hidden');return b;}
    if(kind==='watchmaker'){
      const crown=control('Wind watch: drag up or press Space','watch-crown');
      crown.onpointerdown=e=>{if(e.button!==0)return;e.preventDefault();drag={id:e.pointerId,y:e.clientY};crown.setPointerCapture?.(e.pointerId);};
      crown.onpointermove=e=>{if(!drag||drag.id!==e.pointerId)return;energy=Math.min(12,energy+Math.abs(e.clientY-drag.y)*.015);drag.y=e.clientY;schedule();};
      const end=()=>{drag=undefined;};crown.onpointerup=end;crown.onpointercancel=end;crown.onlostpointercapture=end;
      crown.onkeydown=e=>{if(e.key===' '||e.key==='Enter'||e.key==='ArrowUp'){e.preventDefault();energy=Math.min(12,energy+2);schedule();}};
    }
    if(kind==='miniature-harbor')for(let i=0;i<3;i++){const b=control(`Load cargo ${i+1}`,`harbor-choice cargo-choice-${i}`);b.textContent=String(i+1);b.setAttribute('aria-pressed',String(i===0));b.onclick=()=>{cargo=i;controls.forEach((c,j)=>c.setAttribute('aria-pressed',String(j===i)));stage.style.setProperty('--cargo-color',['#b99273','#83a7a6','#b1a1c2'][i]);energy=3;schedule();};}
    function schedule(){if(frame===undefined&&!disposed&&!document.hidden)frame=window.requestAnimationFrame(draw);}
    function draw(time){frame=undefined;if(disposed||document.hidden||quiet())return;if(time-last<32){schedule();return;}const dt=last===-Infinity?0:Math.min(.05,(time-last)/1000);last=time;elapsed+=dt;energy=Math.max(0,energy-dt*.3);
      const p=point?(point.x-300)/300:0,request=root.dataset.requestState;
      if(kind==='paper-city'){for(const building of stage.querySelectorAll('.paper-building')){const box=building.getBBox?.();const close=point&&box&&Math.abs(point.x-(box.x+box.width/2))<65;building.classList.toggle('window-lit',!!close||request==='success');}}
      if(kind==='cable-car'){const f=(1-Math.cos(elapsed*.18))/2,x=72+456*f,y=62+38*Math.sin(f*Math.PI);stage.querySelector('.cable-cabin').setAttribute('transform',`translate(${x} ${y}) rotate(${p*5+Math.sin(elapsed)*1.5})`);stage.classList.toggle('at-station',f<.035||f>.965);}
      if(kind==='watchmaker'){watchTurn+=dt*(energy>0?10+energy*6:request==='pending'?20:0);const turn=watchTurn;stage.style.setProperty('--watch-speed',`${Math.max(.6,8-energy*.6)}s`);stage.classList.toggle('watch-running',energy>0||request==='pending');stage.querySelector('.watch-hand').setAttribute('transform',`rotate(${turn} 300 120)`);}
      if(kind==='bonsai-seasons'){stage.dataset.season=String(season);stage.style.setProperty('--growth',String(.72+Math.min(1,energy/3)*.28));}
      if(kind==='silk-lanterns'){for(const [i,node]of [...stage.querySelectorAll('.silk-lantern')].entries())node.setAttribute('transform',`translate(${100+i*100} 43) rotate(${Math.sin(elapsed*.6+i)*2+p*7})`);}
      if(kind==='miniature-harbor'){const cycle=(elapsed*.13)%1,x=170+Math.sin(cycle*Math.PI)*240,y=47+Math.sin(cycle*Math.PI*2)*8;stage.querySelector('.harbor-hoist').setAttribute('transform',`translate(${x} ${y})`);stage.style.setProperty('--cargo-color',['#b99273','#83a7a6','#b1a1c2'][cargo]);}
      if(kind==='darkroom'){development=request==='success'?1:request==='pending'?Math.min(.85,development+dt*.05):Math.min(1,development+dt*.025);stage.style.setProperty('--development',String(development));stage.querySelector('.developing-tray').setAttribute('transform',`rotate(${p*2} 300 145)`);}
      if(['cable-car','silk-lanterns','miniature-harbor'].includes(kind)||kind==='darkroom'&&development<1||point||energy>0||request==='pending')schedule();
    }
    function local(event){if(blocked(event)||document.hidden||quiet())return;const r=stage.getBoundingClientRect();if(!r.width)return;const x=(event.clientX-r.left)*600/r.width,y=(event.clientY-r.top)*230/r.height;if(x>=0&&x<=600&&y>=0&&y<=230)return{x,y};}
    function move(e){point=e.pointerType==='touch'?undefined:local(e);schedule();}
    function press(e){if(kind==='bonsai-seasons'&&e.button===0&&local(e)){season=(season+1)%4;energy=3;schedule();}}
    function leave(){point=undefined;schedule();}
    function visibility(){if(document.hidden){window.cancelAnimationFrame(frame);frame=undefined;point=undefined;drag=undefined;}else{last=-Infinity;schedule();}}
    root.reactToRequest=state=>{energy=state==='success'?4:2;if(kind==='darkroom'){if(state==='pending')development=0;if(state==='success')development=1;}if(kind==='bonsai-seasons'&&state==='success')season=(season+1)%4;schedule();};
    document.addEventListener('pointermove',move,{passive:true});document.addEventListener('pointerdown',press,{passive:true});window.addEventListener('blur',leave);document.addEventListener('pointerout',leave);document.addEventListener('visibilitychange',visibility);
    root.disposeScene=()=>{disposed=true;window.cancelAnimationFrame(frame);document.removeEventListener('pointermove',move);document.removeEventListener('pointerdown',press);window.removeEventListener('blur',leave);document.removeEventListener('pointerout',leave);document.removeEventListener('visibilitychange',visibility);};schedule();
  }
  function balloonLandscape(root, compact = false) {
    const landscape = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    landscape.setAttribute('viewBox', '0 0 1200 200'); landscape.setAttribute('preserveAspectRatio', 'none');
    landscape.classList.add('cappadocia-landscape'); landscape.setAttribute('aria-hidden', 'true');
    landscape.innerHTML = '<path class="cappadocia-ridge far" d="M0 125 60 102 110 115 190 64 240 94 310 71 370 115 450 86 520 120 600 69 670 101 730 82 810 110 900 54 980 93 1050 70 1120 109 1200 87V200H0Z"/><path class="cappadocia-ridge near" d="m0 170 60-18 20-49 10-8 12 7 18 48 45 18 30-74 12-8 13 8 26 77 60 12 36-37 14-64 10-10 12 10 20 71 70 20 70-11 23-63 13-7 13 8 21 64 78 15 60-32 25-76 12-6 12 6 30 77 53 25 58-12 22-50 12-9 12 8 20 56 74 25V200H0Z"/>';
    root.append(landscape);
    const positions = compact ? [12, 46, 78] : [3, 16, 34, 55, 73, 86, 95];
    positions.forEach((left, i) => {
      const flight = document.createElement('div'); flight.className = `cappadocia-flight ${i % 3 === 0 ? 'launching' : 'airborne'}`;
      flight.style.setProperty('--balloon-x', `${left}%`); flight.style.setProperty('--balloon-size', `${compact ? 30 + i * 5 : 32 + (i * 13) % 34}px`);
      flight.style.setProperty('--flight-time', `${compact ? 16 + i * 4 : 38 + i * 7}s`); flight.style.setProperty('--flight-delay', `${i % 3 === 0 ? -i * 2 : -i * 9}s`);
      flight.style.setProperty('--float-height', `${compact ? 12 + i * 6 : 18 + (i * 17) % 46}%`);
      flight.style.setProperty('--burn-delay', `${-i * 1.7}s`); flight.style.setProperty('--burn-time', `${7 + i * .9}s`);
      const balloon = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); balloon.setAttribute('viewBox', '0 0 80 110'); balloon.setAttribute('aria-hidden', 'true');
      balloon.classList.add('cappadocia-balloon'); balloon.style.setProperty('--fabric', ['#b87883','#b6a4c5','#c89b79','#8e9db8'][i % 4]);
      balloon.innerHTML = '<path class="balloon-envelope" d="M40 5C-3 5-2 47 16 66L30 84h20l14-18C82 47 83 5 40 5Z"/><path class="balloon-stripe" d="M40 5C15 11 16 51 34 84h12C64 51 65 11 40 5Z"/><path class="balloon-seam" d="M40 5v79M12 52q28 10 56 0M24 75h32"/><path class="balloon-warmth" d="M18 53q22-12 44 0L49 83H31Z"/><path class="balloon-ropes" d="m30 84 3 12m17-12-3 12"/><path class="balloon-flame" d="M35 88q-2-5 5-17 7 12 5 17Z"/><path class="balloon-flame-core" d="m38 88 2-10 2 10Z"/><rect class="balloon-basket" x="31" y="95" width="18" height="11" rx="2"/>';
      flight.append(balloon); root.append(flight);
    });
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
    if (effect === 'marbles' || effect === 'bowling') playTrack(root, effect);
    if (effect === 'bowling') layer.removeAttribute('aria-hidden');
    if (effect === 'sand-table' || effect === 'wave-tank') interactiveSurface(root,effect);
    if (plannedThemes.has(effect)) craftedScene(root,effect,layer);
    if (physicsThemes.has(effect)) physicsScene(root,effect);
    if (effect === 'magnetic') magneticLab(root);
    if (effect === 'balloons') balloonLandscape(root);
    layer.append(root); return track(root);
  }
  function response(node, recipe) {
    if (!supported.has(recipe) || quiet()) return null;
    if (plannedThemes.has(recipe) || physicsThemes.has(recipe) || recipe === 'marbles' || recipe === 'bowling' || recipe === 'magnetic' || recipe === 'sand-table' || recipe === 'wave-tank') {
      const existing = document.querySelector(`.environment-${recipe}`);
      if (!existing) return null;
      const owner = {}; existing.requestOwner = owner;
      existing.pauseGame?.(); existing.dataset.requestState = node.dataset.state; existing.reactToRequest?.(node.dataset.state);
      return () => { if (existing.requestOwner === owner) { delete existing.dataset.requestState; delete existing.requestOwner; existing.resumeGame?.(); } };
    }
    const root = document.createElement('div'); root.className = `feature-scene feature-${recipe}`; root.setAttribute('aria-hidden','true'); node.dataset.featureScene = recipe;
    const names = { railway:'train', lunar:'astronaut', reef:'turtle', clockwork:'gears', camp:'fox', airmail:'plane' };
    if (recipe === 'balloons') balloonLandscape(root, true);
    else if (recipe === 'pond') for (let i=0;i<2;i++) { const orbit = document.createElement('div'); orbit.className='koi-orbit'; orbit.style.setProperty('--n',i); orbit.append(actor('koi','turn')); root.append(orbit); }
    else if (recipe === 'volcano') {
      root.append(svg('island','eruption-island'));
      const glow = document.createElement('i'); glow.className='crater-glow'; root.append(glow);
      for (let i=0;i<4;i++) { const smoke = document.createElement('i'); smoke.className='volcanic-smoke'; smoke.style.setProperty('--n',i); root.append(smoke); }
      for (let i=0;i<14;i++) { const spark = document.createElement('b'); spark.className='eruption-spark'; spark.style.setProperty('--n',i); spark.style.setProperty('--drift',`${(i % 2 ? 1 : -1) * (18 + (i * 17) % 65)}px`); spark.style.setProperty('--rise',`${24 + (i * 13) % 32}px`); root.append(spark); }
    }
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
