const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const themes = ['orient-express','koi-garden','moonbase','coral-reef','air-mail','volcanic-island'];
function setup(t, reduced = false) {
  const dom = new JSDOM('<html><head></head><body><div id="blank"></div><input id="form" value="unchanged"><section id="response">Readable response</section></body></html>', { url:'https://example.test/swagger-ui/index.html', runScripts:'outside-only', pretendToBeVisual:true });
  t.after(()=>dom.window.close()); const w=dom.window, frames=[];
  w.matchMedia = query => ({ matches:reduced && query.includes('reduced-motion'), addEventListener(){} });
  w.requestAnimationFrame = callback => { frames.push(callback); return frames.length; }; w.cancelAnimationFrame=()=>{};
  for (const name of ['scenes.js','theme.js','playful.js','response-effects.js']) w.eval(fs.readFileSync(require.resolve(`../${name}`),'utf8'));
  const move = (target, x=110, y=110) => { target.dispatchEvent(new w.MouseEvent('pointermove',{bubbles:true,composed:true,clientX:x,clientY:y})); const pending=frames.splice(0); for(const callback of pending) callback(w.performance.now()); };
  return { w, move };
}
test('all retained scene themes have distinct ambient and execution scenes with bounded cleanup', t=>{
  const {w}=setup(t); const recipes=new Set();
  for(const theme of themes) {
    w.SwaggerStudioTheme.set(theme); const recipe=w.SwaggerStudioTheme.responseRecipe(); recipes.add(recipe);
    assert.ok(w.document.querySelector(`.environment-${recipe}`)); assert.equal(w.document.querySelectorAll('.scene-dust').length,14);
    const target=w.document.getElementById('response'), fx=w.SwaggerStudioResponseEffects.start(target);
    assert.ok(fx.node.querySelector(`.feature-${recipe}`)); fx.finish(200); assert.equal(fx.node.querySelectorAll('.feature-scene').length,1);
    assert.equal(target.textContent,'Readable response');
    w.SwaggerStudioTheme.set('dark'); assert.equal(fx.node.querySelector('.feature-scene'),null); assert.equal(w.document.querySelector('.scene-environment'),null); fx.remove();
  }
  assert.equal(recipes.size,6);
});
test('koi proximity reacts only over decorative space, never over forms or shadow controls', t=>{
  const {w,move}=setup(t), blank=w.document.getElementById('blank'), input=w.document.getElementById('form');
  for(const [theme,kind] of [['koi-garden','turn']]) {
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
  const target=w.document.getElementById('response'); target.classList.add('response'); const stage=w.document.createElement('div'); stage.className='response-stage'; target.append(stage);
  move(stage); assert.equal(fish.classList.contains('env-near'),true, 'embedded decorative stage remains reactive');
  const text=w.document.createElement('pre'); text.textContent='JSON'; target.append(text); move(text); assert.equal(fish.classList.contains('env-near'),false, 'response text is protected');
  fx.remove(); assert.equal(fish.classList.contains('env-near'),false); move(w.document.getElementById('blank')); assert.equal(fish.classList.contains('env-near'),false);
});
test('reduced motion retains each palette but creates no scene or reactive actors', t=>{
  const {w}=setup(t,true);
  for(const theme of themes) { w.SwaggerStudioTheme.set(theme); assert.match(w.SwaggerStudioTheme.variables(),/--st-accent:#[0-9a-f]{6}/i); const fx=w.SwaggerStudioResponseEffects.start(w.document.getElementById('response')); assert.equal(fx.node.querySelector('.feature-scene'),null); assert.equal(w.document.querySelector('.scene-environment'),null); fx.remove(); }
});
test('hidden documents pause scene animation and clear pointer reactions', t=>{
  const {w,move}=setup(t); let hidden=false; Object.defineProperty(w.document,'hidden',{get:()=>hidden});
  w.SwaggerStudioTheme.set('koi-garden'); const actor=w.document.querySelector('[data-environment-actor]'); actor.getBoundingClientRect=()=>({left:100,top:100,right:150,bottom:140,width:50,height:40});
  move(w.document.getElementById('blank')); assert.equal(actor.classList.contains('env-near'),true);
  hidden=true; w.document.dispatchEvent(new w.Event('visibilitychange')); assert.equal(actor.classList.contains('env-near'),false); assert.equal(w.document.querySelector('.scene-environment').dataset.scenePaused,'true');
  hidden=false; w.document.dispatchEvent(new w.Event('visibilitychange')); assert.equal(w.document.querySelector('.scene-environment').dataset.scenePaused,'false');
});


test('Cappadocia has dawn balloons, staggered launches and burner illumination with lifecycle cleanup', t => {
  const { w } = setup(t); w.SwaggerStudioTheme.set('cappadocia');
  const scene = w.document.querySelector('.environment-balloons');
  assert.ok(scene.querySelector('.cappadocia-landscape'));
  assert.equal(scene.querySelectorAll('.cappadocia-flight').length, 7);
  assert.equal(scene.querySelectorAll('.launching').length, 3);
  assert.equal(scene.querySelectorAll('.balloon-flame').length, 7);
  assert.equal(new Set([...scene.querySelectorAll('.cappadocia-flight')].map(n => n.style.getPropertyValue('--burn-delay'))).size, 7);
  const fx = w.SwaggerStudioResponseEffects.start(w.document.getElementById('response'));
  assert.equal(fx.node.querySelectorAll('.feature-balloons .cappadocia-flight').length, 3);
  w.SwaggerStudioTheme.set('dark'); assert.equal(scene.isConnected, false); assert.equal(fx.node.querySelector('.feature-balloons'), null); fx.remove();
  const reduced = setup(t, true).w; reduced.SwaggerStudioTheme.set('cappadocia');
  assert.equal(reduced.document.querySelector('.environment-balloons'), null);
  assert.equal(reduced.SwaggerStudioTheme.current(), 'cappadocia');
});


test('marble and bowling themes build separate bounded scenes and clean up after theme switches', t => {
  const { w } = setup(t);
  for (const [theme, recipe, selector, count] of [['marble-run','marbles','.rolling-marble',1],['neon-bowling','bowling','.bowling-pin',10]]) {
    w.SwaggerStudioTheme.set(theme);
    assert.equal(w.document.querySelectorAll(`.environment-${recipe} ${selector}`).length,count);
    const fx = w.SwaggerStudioResponseEffects.start(w.document.getElementById('response'));
    const original = w.document.querySelector(`.environment-${recipe} .play-track`);
    assert.equal(fx.node.querySelector('.play-track'),null);
    assert.equal(w.document.querySelectorAll(`.environment-${recipe} ${selector}`).length,count);
    assert.equal(original.parentElement.dataset.requestState,'pending');
    fx.finish(500); assert.equal(fx.node.dataset.state,'error');
    assert.equal(fx.node.querySelectorAll(`.feature-${recipe}`).length,0);
    assert.equal(w.document.querySelector(`.environment-${recipe} .play-track`),original);
    assert.equal(original.parentElement.dataset.requestState,'error');
    w.SwaggerStudioTheme.set('dark'); assert.equal(fx.node.querySelector('.play-track'),null); fx.remove();
    assert.equal(w.document.querySelector('.play-track'),null);
  }
  const reduced = setup(t,true).w;
  for (const theme of ['marble-run','neon-bowling']) { reduced.SwaggerStudioTheme.set(theme); assert.equal(reduced.document.querySelector('.play-track'),null); }
});


test('bowling supports keyboard throws, pin collisions, API ownership and cleanup', t => {
  const { w } = setup(t); const frames=[];
  w.requestAnimationFrame=callback=>{ frames.push(callback); return frames.length; };
  w.SwaggerStudioTheme.set('neon-bowling');
  const root=w.document.querySelector('.environment-bowling'), button=root.querySelector('.bowling-control');
  assert.equal(button.disabled,false);
  assert.equal(w.document.getElementById('brsvs-theme-effects').hasAttribute('aria-hidden'),false);
  const key=value=>button.dispatchEvent(new w.KeyboardEvent('keydown',{key:value,bubbles:true,cancelable:true}));
  key('ArrowUp'); key(' '); assert.equal(root.dataset.game,'rolling');
  frames.shift()(w.performance.now()+2000);
  assert.equal(root.dataset.game,'result'); assert.ok(root.querySelectorAll('[data-hit=true]').length>0);
  assert.match(root.querySelector('output').textContent,/pins|STRIKE/);
  const fx=w.SwaggerStudioResponseEffects.start(w.document.getElementById('response'));
  assert.equal(root.dataset.game,undefined); assert.equal(button.disabled,true);
  key(' '); assert.equal(root.dataset.game,undefined);
  fx.finish(200); assert.equal(root.dataset.requestState,'success');
  fx.remove(); assert.equal(button.disabled,false);
  w.SwaggerStudioTheme.set('dark'); assert.equal(root.isConnected,false);
});


test('Magnetic Lab reacts in decorative space and reuses its field for requests', t => {
  const {w,move}=setup(t); w.SwaggerStudioTheme.set('magnetic-lab');
  const lab=w.document.querySelector('.magnetic-lab'), field=lab.querySelector('.magnetic-field');
  assert.equal(lab.querySelectorAll('.magnetic-bead').length,18);
  lab.getBoundingClientRect=()=>({left:0,top:0,width:460,height:230});
  const before=field.getAttribute('d'); move(w.document.getElementById('blank'),300,90);
  assert.notEqual(field.getAttribute('d'),before);
  const fx=w.SwaggerStudioResponseEffects.start(w.document.getElementById('response')); fx.finish(200);
  assert.equal(w.document.querySelectorAll('.magnetic-lab').length,1);
  assert.equal(lab.parentElement.dataset.requestState,'success');
  fx.remove(); assert.equal(lab.parentElement.dataset.requestState,undefined);
  w.SwaggerStudioTheme.set('dark'); assert.equal(lab.isConnected,false);
  const reduced=setup(t,true).w; reduced.SwaggerStudioTheme.set('magnetic-lab'); assert.equal(reduced.document.querySelector('.magnetic-lab'),null);
});


test('sand and ripple surfaces render, share request state and dispose without intercepting forms', t => {
  const {w,move}=setup(t); let dots=0,strokes=0;
  w.CanvasRenderingContext2D=function(){};
  w.HTMLCanvasElement.prototype.getContext=()=>({setTransform(){},clearRect(){},fillRect(){dots++;},beginPath(){},moveTo(){},lineTo(){},ellipse(){},stroke(){strokes++;}});
  for(const [theme,effect] of [['kinetic-sand','sand-table'],['ripple-tank','wave-tank']]) {
    w.SwaggerStudioTheme.set(theme);
    const root=w.document.querySelector(`.environment-${effect}`),canvas=root.querySelector('canvas');
    canvas.getBoundingClientRect=()=>({left:0,top:0,width:640,height:210});
    move(w.document.getElementById('blank'),320,100);
    if(effect==='sand-table')assert.ok(dots>0);else assert.ok(strokes>0);
    w.document.getElementById('blank').dispatchEvent(new w.MouseEvent('pointerdown',{bubbles:true,composed:true,clientX:320,clientY:100,button:0}));
    const fx=w.SwaggerStudioResponseEffects.start(w.document.getElementById('response')); fx.finish(200);
    assert.equal(w.document.querySelectorAll('.interactive-surface').length,1);
    assert.equal(root.dataset.requestState,'success'); assert.equal(fx.node.querySelector('canvas'),null);
    move(w.document.getElementById('form'),320,100); assert.equal(w.document.getElementById('form').value,'unchanged');
    fx.remove();w.SwaggerStudioTheme.set('dark');assert.equal(canvas.isConnected,false);
  }
});


test('five physics themes draw distinct scenes, react to input, reuse requests and respect reduced motion', t => {
  const {w,move}=setup(t);let draws=0;
  w.CanvasRenderingContext2D=function(){};
  w.HTMLCanvasElement.prototype.getContext=()=>new Proxy({}, {get:(_,name)=>()=>{draws++;},set:()=>true});
  for(const [theme,effect] of [['plasma-globe','plasma'],['pendulum-wave','pendulums'],['ink-in-water','ink-water'],['wind-tunnel','wind'],['prism-room','prism']]) {
    w.SwaggerStudioTheme.set(theme);const root=w.document.querySelector(`.environment-${effect}`),canvas=root.querySelector('canvas');
    canvas.getBoundingClientRect=()=>({left:0,top:0,width:640,height:220});
    const before=draws;move(w.document.getElementById('blank'),350,100);assert.ok(draws>before,theme);
    w.document.getElementById('blank').dispatchEvent(new w.MouseEvent('pointerdown',{bubbles:true,composed:true,clientX:350,clientY:100,button:0}));
    const fx=w.SwaggerStudioResponseEffects.start(w.document.getElementById('response'));fx.finish(200);
    assert.equal(root.dataset.requestState,'success');assert.equal(w.document.querySelectorAll('.physics-canvas').length,1);assert.equal(fx.node.querySelector('canvas'),null);
    fx.remove();w.SwaggerStudioTheme.set('dark');assert.equal(canvas.isConnected,false);
    const reduced=setup(t,true).w;reduced.SwaggerStudioTheme.set(theme);assert.equal(reduced.document.querySelector('.physics-canvas'),null);
  }
});


test('planned crafted themes share one scene, expose controls, and release state on theme changes', t => {
  const {w,move}=setup(t);
  let simulatedTime=100;w.performance.now=()=>simulatedTime+=50;
  const themes=['paper-city','cable-car','watchmaker','bonsai-seasons','silk-lanterns','miniature-harbor','darkroom'];
  for(const theme of themes){
    w.SwaggerStudioTheme.set(theme);const root=w.document.querySelector(`.environment-${theme}`),stage=root.querySelector('.crafted-scene');
    stage.getBoundingClientRect=()=>({left:0,top:0,width:600,height:230});
    move(w.document.getElementById('blank'),300,110);
    if(theme==='watchmaker'){const crown=root.querySelector('button');crown.dispatchEvent(new w.KeyboardEvent('keydown',{key:' ',bubbles:true,cancelable:true}));move(w.document.getElementById('blank'));assert.ok(stage.classList.contains('watch-running'));}
    if(theme==='miniature-harbor'){const buttons=root.querySelectorAll('button');buttons[2].click();assert.equal(buttons[2].getAttribute('aria-pressed'),'true');assert.equal(buttons[0].getAttribute('aria-pressed'),'false');}
    if(theme==='bonsai-seasons'){w.document.getElementById('blank').dispatchEvent(new w.MouseEvent('pointerdown',{button:0,bubbles:true,composed:true,clientX:300,clientY:110}));move(w.document.getElementById('blank'));assert.equal(stage.dataset.season,'1');}
    const fx=w.SwaggerStudioResponseEffects.start(w.document.getElementById('response'));fx.finish(200);move(w.document.getElementById('blank'));
    assert.equal(w.document.querySelectorAll('.crafted-scene').length,1);assert.equal(root.querySelector('canvas'),null);assert.equal(fx.node.querySelector('svg'),null);assert.equal(root.dataset.requestState,'success');
    if(theme==='darkroom')assert.equal(stage.style.getPropertyValue('--development'),'1');
    fx.remove();w.SwaggerStudioTheme.set('dark');assert.equal(stage.isConnected,false);
    const reduced=setup(t,true).w;reduced.SwaggerStudioTheme.set(theme);assert.equal(reduced.document.querySelector('.crafted-scene'),null);
  }
});
