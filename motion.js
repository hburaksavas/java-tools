(function (root) {
  const supported = new Set(['snow', 'petals', 'leaves', 'rain', 'rain-heavy', 'embers', 'fireflies', 'dust']);
  const range = (random, min, max) => min + random() * (max - min);
  function particle(effect, random = Math.random) {
    const depth = range(random, .35, 1), phase = random(), wind = range(random, -12, 12);
    const origin = range(random, -8, 108), wave = range(random, 0, Math.PI * 2), turns = range(random, .5, 1.8);
    const rain = effect === 'rain' || effect === 'rain-heavy', rising = effect === 'embers';
    const drifting = effect === 'dust', floating = effect === 'fireflies';
    const baseDuration = rain ? range(random, 900, 1700) : rising ? range(random, 10000, 20000) : range(random, 15000, 32000);
    const duration = baseDuration / (.55 + depth * .65), sway = rain ? 0 : range(random, 2, 9) * depth;
    const alpha = rain ? range(random, .08, .2) : range(random, .18, .45) * depth;
    const size = (effect === 'snow' ? range(random, 2, 5) : effect === 'leaves' || effect === 'petals' ? range(random, 7, 15) : range(random, 2, 4)) * (.5 + depth * .65);
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
      frames.push({ offset: p, transform: `translate3d(${x.toFixed(3)}vw,${y.toFixed(3)}vh,0)`, opacity: floating ? alpha * (.15 + .85 * Math.sin(p * Math.PI) ** 2) : alpha * envelope });
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
  const api = { particle, mount };
  if (typeof module !== 'undefined') module.exports = api; else root.SwaggerStudioMotion = api;
})(globalThis);
