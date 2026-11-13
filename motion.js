(function (root) {
  const supported = new Set(['ocean', 'gulls', 'snow', 'petals', 'leaves', 'rain', 'rain-heavy', 'embers', 'fireflies', 'dust']);
  const range = (random, min, max) => min + random() * (max - min);
  function particle(effect, random = Math.random) {
    const depth = range(random, .35, 1), phase = random(), wind = range(random, -12, 12);
    const origin = range(random, -8, 108), wave = range(random, 0, Math.PI * 2), turns = range(random, .5, 1.8);
    const rain = effect === 'rain' || effect === 'rain-heavy', rising = effect === 'embers';
    const bird = effect === 'gulls', direction = random() > .5 ? 1 : -1;
    const water = effect === 'ocean';
    const drifting = effect === 'dust', floating = effect === 'fireflies';
    const baseDuration = rain ? range(random, 900, 1700) : rising ? range(random, 10000, 20000) : range(random, 15000, 32000);
    const duration = baseDuration / (.55 + depth * .65), sway = rain ? 0 : range(random, 2, 9) * depth;
    const alpha = rain ? range(random, .08, .2) : range(random, .18, .45) * depth;
    const size = water ? range(random, 20, 65) : bird ? range(random, 14, 28) * depth : (effect === 'snow' ? range(random, 2, 5) : effect === 'leaves' || effect === 'petals' ? range(random, 7, 15) : range(random, 2, 4)) * (.5 + depth * .65);
    const centerY = range(random, 10, 95), centerX = range(random, 2, 98);
    const frames = [];
    for (let i = 0; i <= 24; i++) {
      const p = i / 24, envelope = Math.min(1, p * 12, (1 - p) * 12);
      let x = origin + wind * p + sway * (Math.sin(wave + p * Math.PI * 2 * turns) - Math.sin(wave));
      let y = rising ? 110 - 125 * p : -12 + 125 * p;
      if (!rain) y += Math.sin(p * Math.PI) * Math.sin(wave + p * 9) * (effect === 'snow' ? 1 : 3);
      if (rain) x = origin - rangeFixed(wind, 5, 11) * p;
      if (drifting) { x = -12 + 125 * p; y = centerY + Math.sin(wave + p * 8) * 5; }
      if (floating) { x = centerX + Math.sin(wave + p * Math.PI * 2) * 2.5; y = centerY + Math.cos(wave + p * Math.PI * 2) * 4; }
      if (effect === 'snow') x += Math.sin(wave + p * 4) * 5 * depth + Math.sin(p * Math.PI) * wind;
      if (effect === 'petals') { x += Math.sin(wave + p * 5) * 12 * depth; y += Math.sin(wave + p * 10) * 5 * depth; }
      if (water) { x = centerX + Math.sin(wave + p * Math.PI * 2) * 7; y = 65 + centerY * .32 + Math.cos(wave + p * Math.PI * 2) * 2; }
      if (bird) { x = direction === 1 ? -12 + 124 * p : 112 - 124 * p; y = centerY * .55 + 6 + Math.sin(wave + p * 6) * (3 + depth * 5); }
      frames.push({ offset: p, transform: `translate3d(${x.toFixed(3)}vw,${y.toFixed(3)}vh,0)`, opacity: water ? alpha * Math.sin(p * Math.PI) ** 2 : floating ? alpha * (.15 + .85 * Math.sin(p * Math.PI) ** 2) : alpha * envelope });
    }
    return { frames, duration, phase, size, depth, spin: range(random, -160, 160), spinDuration: range(random, 6000, 16000), length: range(random, 16, effect === 'rain-heavy' ? 75 : 42), color: Math.floor(random() * 4) };
  }
  function rangeFixed(value, min, max) { return min + Math.abs(value) / 12 * (max - min); }
  const active = new Set();
  function mount(layer, effect, count) {
    if (!supported.has(effect) || !root.Element?.prototype.animate) return null;
    layer.classList.add('organic'); const animations = [];
    for (let i = 0; i < count; i++) {
      const model = particle(effect), carrier = root.document.createElement('span'), shape = root.document.createElement('i');
      shape.className = `mote tone-${model.color}`;
      shape.style.setProperty('--mote-size', `${model.size}px`); shape.style.setProperty('--streak-length', `${model.length}px`);
      shape.style.filter = `blur(${((1 - model.depth) * .65).toFixed(2)}px)`;
      carrier.append(shape); layer.append(carrier);
      const movement = carrier.animate(model.frames, { duration: model.duration, iterations: Infinity, easing: 'linear' }); movement.currentTime = model.phase * model.duration; animations.push(movement);
      if (effect === 'gulls') {
        shape.style.setProperty('--wing-duration', `${1800 + Math.random() * 1400}ms`);
        shape.style.setProperty('--wing-phase', `${-Math.random() * 4000}ms`);
      }
      if (effect === 'leaves' || effect === 'petals') {
        const turn = shape.animate([
          { transform: `rotate(${model.spin}deg) rotateX(20deg) rotateY(10deg)` },
          { transform: `rotate(${model.spin + 40}deg) rotateX(65deg) rotateY(-25deg)`, offset: .3 },
          { transform: `rotate(${model.spin - 25}deg) rotateX(-25deg) rotateY(50deg)`, offset: .7 },
          { transform: `rotate(${model.spin}deg) rotateX(20deg) rotateY(10deg)` }
        ], { duration: model.spinDuration, iterations: Infinity, easing: 'ease-in-out' });
        turn.currentTime = Math.random() * model.spinDuration; animations.push(turn);
      }
    }
    for (const animation of animations) { active.add(animation); if (root.document.hidden) animation.pause(); }
    return () => { for (const animation of animations) { animation.cancel(); active.delete(animation); } };
  }
  root.document?.addEventListener('visibilitychange', () => { for (const animation of active) root.document.hidden ? animation.pause() : animation.play(); });
  function lightning(random = Math.random) {
    let x = range(random, 70, 110);
    const points = [[x, 0]];
    for (let i = 1; i <= 14; i++) { x += range(random, -24, 24); x = Math.max(30, Math.min(170, x)); points.push([x, i * 20]); }
    const path = values => values.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)}`).join(' ');
    const branches = [4, 7, 10].map((index, i) => {
      const start = points[index], direction = i % 2 ? -1 : 1;
      return path([start, [start[0] + direction * range(random, 16, 28), start[1] + 10], [start[0] + direction * range(random, 22, 38), start[1] + 28], [start[0] + direction * range(random, 40, 60), start[1] + 37]]);
    });
    return { trunk: path(points), branches };
  }
  function lightningSvg() {
    const ns = 'http://www.w3.org/2000/svg', svg = root.document.createElementNS(ns, 'svg'), model = lightning();
    svg.setAttribute('viewBox', '0 0 200 300'); svg.setAttribute('preserveAspectRatio', 'none'); svg.setAttribute('aria-hidden', 'true');
    for (const [d, cls] of [[model.trunk, 'lightning-glow'], [model.trunk, 'lightning-core'], ...model.branches.map(d => [d, 'lightning-branch'])]) {
      const line = root.document.createElementNS(ns, 'path'); line.setAttribute('d', d); line.setAttribute('class', cls); svg.append(line);
    }
    return svg;
  }
  const api = { particle, mount, lightning, lightningSvg };
  if (typeof module !== 'undefined') module.exports = api; else root.SwaggerStudioMotion = api;
})(globalThis);
