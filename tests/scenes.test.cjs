const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const themes = ['orient-express','koi-garden','moonbase','coral-reef','clockwork','firefly-camp','air-mail','volcanic-island'];
function setup(t, reduced = false) {
  const dom = new JSDOM('<html><head></head><body><div id="blank"></div><input id="form" value="unchanged"><section id="response">Readable response</section></body></html>', { url:'https://example.test/swagger-ui/index.html', runScripts:'outside-only', pretendToBeVisual:true });
  t.after(()=>dom.window.close()); const w=dom.window, frames=[];
  w.matchMedia = query => ({ matches:reduced && query.includes('reduced-motion'), addEventListener(){} });
  w.requestAnimationFrame = callback => { frames.push(callback); return frames.length; }; w.cancelAnimationFrame=()=>{};
  for (const name of ['scenes.js','theme.js','playful.js','response-effects.js']) w.eval(fs.readFileSync(require.resolve(`../${name}`),'utf8'));
  const move = (target, x=110, y=110) => { target.dispatchEvent(new w.MouseEvent('pointermove',{bubbles:true,composed:true,clientX:x,clientY:y})); const pending=frames.splice(0); for(const callback of pending) callback(w.performance.now()); };
  return { w, move };
}
test('all eight phase-one themes have distinct ambient and execution scenes with bounded cleanup', t=>{
  const {w}=setup(t); const recipes=new Set();
  for(const theme of themes) {
    w.SwaggerStudioTheme.set(theme); const recipe=w.SwaggerStudioTheme.responseRecipe(); recipes.add(recipe);
    assert.ok(w.document.querySelector(`.environment-${recipe}`)); assert.equal(w.document.querySelectorAll('.scene-dust').length,14);
    const target=w.document.getElementById('response'), fx=w.SwaggerStudioResponseEffects.start(target);
    assert.ok(fx.node.querySelector(`.feature-${recipe}`)); fx.finish(200); assert.equal(fx.node.querySelectorAll('.feature-scene').length,1);
    assert.equal(target.textContent,'Readable response');
    w.SwaggerStudioTheme.set('dark'); assert.equal(fx.node.querySelector('.feature-scene'),null); assert.equal(w.document.querySelector('.scene-environment'),null); fx.remove();
  }
  assert.equal(recipes.size,8);
});
test('koi and fox proximity reacts only over decorative space, never over forms or shadow controls', t=>{
  const {w,move}=setup(t), blank=w.document.getElementById('blank'), input=w.document.getElementById('form');
  for(const [theme,kind] of [['koi-garden','turn'],['firefly-camp','wake']]) {
    w.SwaggerStudioTheme.set(theme); const actor=w.document.querySelector(`[data-environment-actor=${kind}]`);
    actor.getBoundingClientRect=()=>({left:100,top:100,right:150,bottom:140,width:50,height:40});
    move(blank); assert.equal(actor.classList.contains('env-near'),true);
    input.focus(); move(input); assert.equal(actor.classList.contains('env-near'),false); assert.equal(input.value,'unchanged'); assert.equal(w.document.activeElement,input);
    const host=w.document.createElement('div'); w.document.body.append(host); const shadow=host.attachShadow({mode:'open'}); const field=w.document.createElement('textarea'); field.value='draft'; shadow.append(field);
    move(blank); assert.equal(actor.classList.contains('env-near'),true); move(field); assert.equal(actor.classList.contains('env-near'),false); assert.equal(field.value,'draft');
    move(blank,300,300); assert.equal(actor.classList.contains('env-near'),false); host.remove();
  }
});
test('removed response actors and switched ambient scenes stop receiving proximity events', t=>{
  const {w,move}=setup(t); w.SwaggerStudioTheme.set('koi-garden');
  const fx=w.SwaggerStudioResponseEffects.start(w.document.getElementById('response')), fish=fx.node.querySelector('[data-environment-actor]');
  fish.getBoundingClientRect=()=>({left:100,top:100,right:150,bottom:140,width:50,height:40});
  move(w.document.getElementById('blank')); assert.equal(fish.classList.contains('env-near'),true);
  fx.remove(); assert.equal(fish.classList.contains('env-near'),false); move(w.document.getElementById('blank')); assert.equal(fish.classList.contains('env-near'),false);
});
test('reduced motion retains each palette but creates no scene or reactive actors', t=>{
  const {w}=setup(t,true);
  for(const theme of themes) { w.SwaggerStudioTheme.set(theme); assert.match(w.SwaggerStudioTheme.variables(),/--st-accent:#[0-9a-f]{6}/i); const fx=w.SwaggerStudioResponseEffects.start(w.document.getElementById('response')); assert.equal(fx.node.querySelector('.feature-scene'),null); assert.equal(w.document.querySelector('.scene-environment'),null); fx.remove(); }
});
test('hidden documents pause scene animation and clear pointer reactions', t=>{
  const {w,move}=setup(t); let hidden=false; Object.defineProperty(w.document,'hidden',{get:()=>hidden});
  w.SwaggerStudioTheme.set('firefly-camp'); const actor=w.document.querySelector('[data-environment-actor]'); actor.getBoundingClientRect=()=>({left:100,top:100,right:150,bottom:140,width:50,height:40});
  move(w.document.getElementById('blank')); assert.equal(actor.classList.contains('env-near'),true);
  hidden=true; w.document.dispatchEvent(new w.Event('visibilitychange')); assert.equal(actor.classList.contains('env-near'),false); assert.equal(w.document.querySelector('.scene-environment').dataset.scenePaused,'true');
  hidden=false; w.document.dispatchEvent(new w.Event('visibilitychange')); assert.equal(w.document.querySelector('.scene-environment').dataset.scenePaused,'false');
});
