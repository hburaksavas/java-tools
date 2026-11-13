(function (root) {
  if (root.SwaggerStudioJson) return;
  const limit = 128 * 1024, tokenLimit = 12000;
  function tokenize(value) {
    const text = String(value ?? '');
    if (text.length > limit) return [{ type:'plain', text }];
    const pattern = /"(?:\\[\s\S]|[^"\\])*"?|\b(?:true|false|null)\b|-?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+-]?\d*)?|[{}\[\],:]/g;
    const result = []; let end = 0, match;
    while ((match = pattern.exec(text))) {
      if (result.length >= tokenLimit) return [{ type:'plain', text }];
      if (match.index > end) result.push({type:'plain',text:text.slice(end,match.index)});
      const raw = match[0]; end = pattern.lastIndex;
      const type = raw[0] === '"' ? /^\s*:/.test(text.slice(end)) ? 'key' : 'string' : /^(true|false|null)$/.test(raw) ? 'literal' : /^[{}\[\],:]$/.test(raw) ? 'punctuation' : 'number';
      result.push({type,text:raw});
    }
    if (end < text.length) result.push({type:'plain',text:text.slice(end)});
    return result;
  }
  function highlight(node, text) {
    const fragment = root.document.createDocumentFragment();
    for (const token of tokenize(text)) {
      if (token.type === 'plain') fragment.append(root.document.createTextNode(token.text));
      else { const span = root.document.createElement('span'); span.className=`json-${token.type}`; span.textContent=token.text; fragment.append(span); }
    }
    node.replaceChildren(fragment);
  }
  function isJson(text) { try { JSON.parse(text); return true; } catch { return false; } }
  function code(text, force = false) {
    const pre = root.document.createElement('pre');
    if (force || isJson(text)) { pre.className='json-code'; highlight(pre,text); } else pre.textContent=text;
    return pre;
  }
  function editor(input) {
    const element = root.document.createElement('div'), mirror = root.document.createElement('pre');
    element.className='json-editor'; mirror.className='json-mirror'; mirror.setAttribute('aria-hidden','true');
    input.classList.add('json-input'); input.wrap='off'; input.autocapitalize='off'; input.setAttribute('autocorrect','off'); input.spellcheck=false;
    element.append(mirror,input);
    function sync() { mirror.scrollTop=input.scrollTop; mirror.scrollLeft=input.scrollLeft; }
    function refresh() { highlight(mirror,input.value); mirror.append(root.document.createTextNode('\n')); sync(); }
    input.addEventListener('input',refresh); input.addEventListener('scroll',sync,{passive:true});
    refresh(); return {element,refresh};
  }
  function hue(hex) {
    const [r,g,b]=hex.match(/[a-f0-9]{2}/gi).map(v=>parseInt(v,16)/255), max=Math.max(r,g,b), delta=max-Math.min(r,g,b);
    if (!delta) return 210;
    return ((max===r ? (g-b)/delta : max===g ? (b-r)/delta+2 : (r-g)/delta+4)*60+360)%360;
  }
  function hsl(h,s,l) {
    s/=100; l/=100; const a=s*Math.min(l,1-l);
    return '#'+[0,8,4].map(n=>{ const k=(n+h/30)%12; return Math.round(255*(l-a*Math.max(-1,Math.min(k-3,9-k,1)))).toString(16).padStart(2,'0'); }).join('');
  }
  function luminance(hex) { return hex.match(/[a-f0-9]{2}/gi).map(v=>{const x=parseInt(v,16)/255; return x<=.04045 ? x/12.92 : ((x+.055)/1.055)**2.4;}).reduce((sum,x,i)=>sum+x*[.2126,.7152,.0722][i],0); }
  function contrast(a,b) { const x=luminance(a),y=luminance(b); return (Math.max(x,y)+.05)/(Math.min(x,y)+.05); }
  function palette(p) {
    const light=p.mode==='light', base=hue(p.accent), backgrounds=[p.code,p.input];
    const color = (h,s=light?52:65) => { let l=light?32:74, value=hsl(h,s,l); for(let i=0;i<30 && backgrounds.some(bg=>contrast(value,bg)<4.5);i++) { l=Math.max(0,Math.min(100,l+(light?-2:2))); value=hsl(h,s,l); } return value; };
    return {'json-key':color(base),'json-string':color((base+95)%360),'json-number':color((base+210)%360),'json-literal':color((base+300)%360),'json-punctuation':color(hue(p.muted),15)};
  }
  function swaggerPlugin() {
    const style = { hljs:{display:'block',overflowX:'auto',padding:'1em',background:'var(--st-code)',color:'var(--st-text)'} };
    for (const [token,kind] of Object.entries({'hljs-attr':'key','hljs-attribute':'key','hljs-string':'string','hljs-number':'number','hljs-literal':'literal','hljs-keyword':'literal','hljs-punctuation':'punctuation'})) style[token]={color:`var(--st-json-${kind})`};
    const syntaxHighlighting={styles:{},defaultStyle:style};
    return { rootInjects:{syntaxHighlighting}, wrapComponents:{SyntaxHighlighter:(Original,system)=>props=>system.React.createElement(Original,{...props,syntaxHighlighting})} };
  }
  if (typeof root.SwaggerUIBundle === 'function') {
    const original=root.SwaggerUIBundle;
    const wrapped=function(options={},...rest) { return original({...options,plugins:[...(options.plugins||[]),swaggerPlugin]},...rest); };
    Object.assign(wrapped,original); root.SwaggerUIBundle=wrapped;
  }
  const api={tokenize,highlight,isJson,code,editor,palette,swaggerPlugin};
  if (typeof module!=='undefined') module.exports=api; else root.SwaggerStudioJson=api;
})(globalThis);
