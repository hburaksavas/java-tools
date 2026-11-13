const { test } = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const fs = require('node:fs');
const motion = require('../motion.js');
test('leaves have curved paths, varied depth/speed/phase and independent tumble timing', () => {
  let seed = 817;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const samples = Array.from({ length: 30 }, () => motion.particle('leaves', random));
  assert.equal(new Set(samples.map(p => p.duration)).size, 30);
  assert.equal(new Set(samples.map(p => p.phase)).size, 30);
  assert.ok(samples.some(p => p.depth < .6) && samples.some(p => p.depth > .8));
  for (const p of samples) {
    const positions = p.frames.map(f => [...f.transform.matchAll(/(-?[0-9.]+)(?:vw|vh)/g)].map(m => Number(m[1])));
    const slopes = positions.slice(1).map((v,i) => v[0] - positions[i][0]);
    assert.ok(Math.max(...slopes) - Math.min(...slopes) > .05, 'wind changes the horizontal velocity');
    assert.equal(p.frames[0].opacity, 0); assert.equal(p.frames.at(-1).opacity, 0);
  }
});
test('rain falls, embers rise and fireflies loop without falling', () => {
  const y = frame => Number(frame.transform.match(/,(-?[0-9.]+)vh/)[1]);
  const rain = motion.particle('rain'), embers = motion.particle('embers'), firefly = motion.particle('fireflies');
  assert.ok(y(rain.frames.at(-1)) > y(rain.frames[0]));
  assert.ok(y(embers.frames.at(-1)) < y(embers.frames[0]));
  assert.equal(firefly.frames[0].transform, firefly.frames.at(-1).transform);
  assert.ok(rain.duration < embers.duration);
});
test('mount cancels old animations and pauses when the document is hidden', t => {
  const dom = new JSDOM('<div id="layer"></div>', { runScripts: 'outside-only' }); t.after(() => dom.window.close());
  const w = dom.window, calls = []; let hidden = false;
  Object.defineProperty(w.document, 'hidden', { get: () => hidden });
  w.Element.prototype.animate = function (frames, options) { const a = { frames, options, currentTime: 0, cancelled: false, paused: false, pause() { this.paused = true; }, play() { this.paused = false; }, cancel() { this.cancelled = true; } }; calls.push(a); return a; };
  w.eval(fs.readFileSync(require.resolve('../motion.js'), 'utf8'));
  const cleanup = w.SwaggerStudioMotion.mount(w.document.getElementById('layer'), 'leaves', 12);
  assert.equal(calls.length, 24); assert.equal(w.document.querySelectorAll('.mote').length, 12);
  assert.ok(new Set(calls.filter((_,i) => i % 2 === 0).map(a => a.currentTime)).size > 1);
  hidden = true; w.document.dispatchEvent(new w.Event('visibilitychange')); assert.ok(calls.every(a => a.paused));
  cleanup(); assert.ok(calls.every(a => a.cancelled));
});

test('gulls cross horizontally in both directions without falling through the page', () => {
  const x = frame => Number(frame.transform.match(/\((-?[0-9.]+)vw/)[1]);
  const y = frame => Number(frame.transform.match(/,(-?[0-9.]+)vh/)[1]);
  for (const seed of [.2, .8]) {
    const bird = motion.particle('gulls', () => seed);
    assert.ok(Math.abs(x(bird.frames.at(-1)) - x(bird.frames[0])) > 120);
    assert.ok(Math.abs(y(bird.frames.at(-1)) - y(bird.frames[0])) < 16);
    assert.equal(Math.sign(x(bird.frames.at(-1)) - x(bird.frames[0])), seed > .5 ? 1 : -1);
  }
});

test('Ocean highlights loop near the horizon instead of falling across content', () => {
  const water = motion.particle('ocean', () => .5);
  assert.equal(water.frames[0].transform, water.frames.at(-1).transform);
  for (const frame of water.frames) {
    const y = Number(frame.transform.match(/,(-?[0-9.]+)vh/)[1]);
    assert.ok(y > 65 && y < 100);
  }
  assert.equal(water.frames[0].opacity, 0);
});

test('lightning has a varied irregular channel with connected branches', () => {
  const a = motion.lightning(() => .3), b = motion.lightning(() => .7);
  assert.notEqual(a.trunk, b.trunk); assert.equal(a.branches.length, 3);
  assert.equal((a.trunk.match(/L/g) || []).length, 14);
  for (const branch of a.branches) assert.equal((branch.match(/L/g) || []).length, 3);
});

test('cinema ambient paths distinguish code columns, low sand and radial star travel', () => {
  const coords = frame => [...frame.transform.matchAll(/(-?[0-9.]+)(?:vw|vh)/g)].map(match => Number(match[1]));
  const code = motion.particle('code-rain', () => .6), sand = motion.particle('desert', () => .6), star = motion.particle('starfield', () => .6);
  assert.equal(coords(code.frames[0])[0], coords(code.frames.at(-1))[0]);
  assert.ok(coords(code.frames.at(-1))[1] - coords(code.frames[0])[1] > 150);
  assert.ok(sand.frames.every(frame => coords(frame)[1] > 60));
  const distance = frame => Math.hypot(coords(frame)[0] - 50, coords(frame)[1] - 42);
  assert.ok(distance(star.frames.at(-1)) > distance(star.frames[0]) * 10);
});
