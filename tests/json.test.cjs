const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const json = require('../json.js');
function setup(t) {
  const dom = new JSDOM('<html><head></head><body></body></html>', { url:'https://example.test', runScripts:'outside-only' }); t.after(()=>dom.window.close());
  const w=dom.window; w.matchMedia=()=>({matches:false,addEventListener(){}}); w.eval(fs.readFileSync(require.resolve('../json.js'),'utf8')); return w;
}
test('JSON tokens preserve escaped strings, keys, primitives and incomplete drafts exactly', ()=>{
  for(const text of ['{"name":"İstanbul <svg onload=x>","count":-1.25e+3,"ok":true,"empty":null}', '{\n  "escaped\\\"key": "hello\\nworld",\n  "draft": "unfinished', 'false', '[0,12,-3,false,null,"true"]']) {
    const tokens=json.tokenize(text); assert.equal(tokens.map(token=>token.text).join(''),text);
    if(text.includes('count')) { assert.ok(tokens.some(token=>token.type==='key')); assert.ok(tokens.some(token=>token.type==='number' && token.text==='-1.25e+3')); assert.ok(tokens.some(token=>token.type==='literal')); }
  }
});
test('JSON rendering never interprets HTML and leaves non-JSON responses plain', t=>{
  const w=setup(t), text='{"html":"<img src=x onerror=alert(1)>","ok":true}';
  const code=w.SwaggerStudioJson.code(text); assert.equal(code.textContent,text); assert.equal(code.querySelector('img'),null); assert.ok(code.querySelector('.json-string'));
  const plain=w.SwaggerStudioJson.code('<h1>not JSON</h1>'); assert.equal(plain.textContent,'<h1>not JSON</h1>'); assert.equal(plain.children.length,0);
});
test('editable highlighting preserves native draft selection and scroll synchronization', t=>{
  const w=setup(t), input=w.document.createElement('textarea'); input.value='{"name":"Ada"}'; let draft;
  input.oninput=()=>draft=input.value;
  const editor=w.SwaggerStudioJson.editor(input); w.document.body.append(editor.element);
  input.focus(); input.value='{"name":"Ada","ok":true}'; input.setSelectionRange(10,13); input.dispatchEvent(new w.Event('input'));
  assert.equal(draft,input.value); assert.equal(input.selectionStart,10); assert.equal(input.selectionEnd,13); assert.equal(w.document.activeElement,input);
  assert.equal(editor.element.querySelector('.json-mirror').textContent,input.value+'\n');
  input.scrollTop=100; input.scrollLeft=25; input.dispatchEvent(new w.Event('scroll')); assert.equal(editor.element.querySelector('pre').scrollTop,100); assert.equal(editor.element.querySelector('pre').scrollLeft,25);
  input.value=JSON.stringify(JSON.parse(input.value),null,2); editor.refresh(); assert.equal(editor.element.querySelector('pre').textContent,input.value+'\n');
});
test('large JSON remains complete without producing an unbounded token tree', ()=>{
  const text=JSON.stringify({data:'x'.repeat(150000)}), tokens=json.tokenize(text); assert.equal(tokens.length,1); assert.equal(tokens[0].text,text);
});
test('every theme and atmosphere supplies readable token colors on code and input backgrounds', t=>{
  const w=setup(t); w.eval(fs.readFileSync(require.resolve('../theme.js'),'utf8'));
  const lum=color=>{const channels=color.slice(1).match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return channels[0]*.2126+channels[1]*.7152+channels[2]*.0722;};
  for(const theme of w.SwaggerStudioTheme.catalog()) {
    w.SwaggerStudioTheme.set(theme.id);
    for(const atmosphere of ['default',...(['bosphorus','winter'].includes(theme.id)?['day','sunset','night']:[])]) {
      w.SwaggerStudioTheme.setAtmosphere(atmosphere);
      const values=Object.fromEntries(w.SwaggerStudioTheme.variables().split(';').map(v=>v.split(':')));
      for(const key of ['key','string','number','literal','punctuation']) for(const background of ['code','input']) {
        const a=lum(values['--st-json-'+key]),b=lum(values['--st-'+background]),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
        assert.ok(ratio>=4.5,`${theme.id}/${atmosphere} ${key} ${background}: ${ratio}`);
      }
    }
  }
});
test('Swagger native highlighter receives the same CSS token variables without replacing plugins', t=>{
  const w=setup(t); delete w.SwaggerStudioJson;
  w.eval(fs.readFileSync(require.resolve('swagger-ui-dist/swagger-ui-bundle.js'),'utf8'));
  w.eval(fs.readFileSync(require.resolve('../json.js'),'utf8'));
  const ui=w.SwaggerUIBundle({dom_id:null,spec:{openapi:'3.0.3',info:{title:'JSON',version:'1'},paths:{}},plugins:[()=>({rootInjects:{customPluginKept:true}})]});
  const sys=ui.getSystem(); assert.equal(sys.customPluginKept,true);
  assert.equal(sys.syntaxHighlighting.defaultStyle['hljs-string'].color,'var(--st-json-string)');
  assert.equal(sys.syntaxHighlighting.defaultStyle['hljs-number'].color,'var(--st-json-number)');
  assert.equal(typeof w.SwaggerUIBundle.plugins.DownloadUrl,'function');
});
test('rendered Swagger examples use theme variables instead of fixed inline token colors', async t=>{
  const w=setup(t); w.scrollTo=()=>{}; delete w.SwaggerStudioJson; const mount=w.document.createElement('div'); mount.id='swagger-ui'; w.document.body.append(mount);
  w.eval(fs.readFileSync(require.resolve('swagger-ui-dist/swagger-ui-bundle.js'),'utf8')); w.eval(fs.readFileSync(require.resolve('../json.js'),'utf8'));
  const post={requestBody:{content:{'application/json':{schema:{type:'object',properties:{name:{type:'string'},amount:{type:'integer'}}},example:{name:'Ada',amount:42}}}},responses:{200:{description:'OK'}}};
  w.SwaggerUIBundle({dom_id:'#swagger-ui',spec:{openapi:'3.0.3',info:{title:'JSON',version:'1'},paths:{'/pets':{post}}}});
  await new Promise(resolve=>setTimeout(resolve,50)); mount.querySelector('.opblock-summary-control').click(); for (let i=0;i<50 && !mount.querySelector('.microlight span');i++) await new Promise(resolve=>setTimeout(resolve,20));
  const tokens=[...mount.querySelectorAll('.microlight span')]; assert.ok(tokens.some(node=>node.style.color==='var(--st-json-string)'),'Swagger string token must use the shared theme variable'); assert.ok(tokens.some(node=>node.style.color==='var(--st-json-number)'));
});
