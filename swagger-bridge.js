(function (root) {
  function system(ui) { return ui?.getSystem?.() || ui; }
  function authorized(ui) { return system(ui)?.authSelectors?.authorized?.()?.toJS?.() || {}; }
  function build(ui, options, manualAuth = '', includeCredentials = true) {
    const sys = system(ui);
    if (!sys?.fn?.buildRequest || !sys?.fn?.execute) throw new Error('Swagger request engine is unavailable. Reload the page.');
    // Read authorization at send time: OAuth refresh and logout immediately apply.
    const operation = options.spec.paths[options.pathName][options.method];
    const operationId = sys.fn.opId ? sys.fn.opId(operation, options.pathName, options.method) : options.operationId || `${options.method}-${options.pathName}`;
    const { customHeaders = {}, ...buildOptions } = options;
    const request = sys.fn.buildRequest({ ...buildOptions, operationId, securities: { authorized: includeCredentials ? authorized(ui) : {} } });
    if (options.spec.openapi && options.requestBody !== undefined && /(^application\/json$|\+json$)/i.test(options.requestContentType || '')) {
      request.body = JSON.stringify(options.requestBody);
      request.headers['Content-Type'] = options.requestContentType;
    }
    if ((request.body && Object.prototype.toString.call(request.body) === '[object Object]') || Array.isArray(request.body)) request.body = JSON.stringify(request.body);
    if (manualAuth.trim()) {
      for (const key of Object.keys(request.headers)) if (key.toLowerCase() === 'authorization') delete request.headers[key];
      request.headers.Authorization = manualAuth.trim();
    }
    for (const [name, value] of Object.entries(customHeaders)) {
      for (const key of Object.keys(request.headers)) if (key.toLowerCase() === name.toLowerCase()) delete request.headers[key];
      Object.defineProperty(request.headers, name, { value, enumerable:true, writable:true, configurable:true });
    }
    return request;
  }
  function curl(ui, options, manualAuth, includeCredentials, pageUrl) {
    const exportOptions = includeCredentials ? options : { ...options, customHeaders: {} };
    const request = build(ui, exportOptions, includeCredentials ? manualAuth : '', includeCredentials);
    const url = new URL(request.url, pageUrl);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('Invalid HTTP request URL.');
    const quote = value => "'" + String(value).replaceAll("'", "'\"'\"'") + "'";
    const args = ['curl', '--globoff', '--request', quote(options.method.toUpperCase()), '--url', quote(url.href)];
    const multipart = typeof request.body?.entries === 'function' && Object.prototype.toString.call(request.body) === '[object FormData]';
    for (const [name, value] of Object.entries(request.headers)) {
      if (multipart && /^content-type$/i.test(name)) continue;
      if (!includeCredentials && !/^(accept|content-type)$/i.test(name)) continue;
      args.push('--header', quote(value === '' ? name + ';' : name + ': ' + value));
    }
    if (multipart) {
      for (const [name, value] of request.body.entries()) {
        if (typeof value !== 'string') throw new Error('Copy cURL supports multipart text fields only. Add local files in your terminal.');
        if (name.includes('=')) throw new Error('This multipart field name cannot be exported to cURL.');
        args.push('--form-string', quote(name + '=' + value));
      }
    } else if (request.body != null) {
      if (typeof request.body !== 'string' || request.body.includes('\0')) throw new Error('This request body cannot be exported to cURL.');
      args.push('--data-raw', quote(request.body));
    }
    return args.join(' ');
  }
  async function send(ui, options, { signal, manualAuth = '', confirmOrigin = () => false, origin = location.origin, onPhase = () => {} } = {}) {
    const sys = system(ui), config = ui.getConfigs?.() || sys.getConfigs?.() || {};
    const phase = (name, detail = {}) => { try { onPhase(name, detail); } catch {} };
    phase('preparing');
    let request = build(ui, options, manualAuth);
    if (config.requestInterceptor) request = (await config.requestInterceptor(request)) || request;
    const target = new URL(request.url, location.href);
    if (!['http:', 'https:'].includes(target.protocol) || target.username || target.password) throw new Error('Only HTTP(S) request URLs without credentials are allowed.');
    if (target.origin !== origin && !await confirmOrigin(target.origin)) throw new Error('Cross-origin request cancelled.');
    if (signal?.aborted) throw new DOMException('Request cancelled.', 'AbortError');
    // Run Swagger's transport hooks while keeping abort/redirect and response size bounds.
    const userFetch = request.userFetch || config.userFetch || fetch;
    const boundedFetch = async (url, init) => {
      const actual = new URL(typeof url === 'string' ? url : url.url, location.href);
      if (actual.origin !== target.origin || !['http:', 'https:'].includes(actual.protocol)) throw new Error('Transport changed the approved request origin.');
      phase('waiting');
      const response = await userFetch(url, { ...init, signal, redirect: 'error' });
      phase('receiving', { status: response.status });
      const reader = response.body?.getReader(); const chunks = []; let size = 0, truncated = false;
      if (reader) while (true) {
        const { done, value } = await reader.read(); if (done) break;
        const remaining = 1024 * 1024 - size;
        chunks.push(value.slice(0, remaining)); size += Math.min(value.length, remaining);
        phase('receiving', { status: response.status, bytes: size });
        if (value.length > remaining || size >= 1024 * 1024) { truncated = true; await reader.cancel(); break; }
      }
      const bytes = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
      const headers = new Headers(response.headers); if (truncated) headers.set('x-studio-truncated', 'true');
      const limited = new Response([101, 204, 205, 304].includes(response.status) ? null : bytes, { status: response.status, statusText: response.statusText, headers });
      Object.defineProperty(limited, 'url', { value: response.url || target.href });
      return limited;
    };
    // The request interceptor has already run, before origin approval, so do not run it twice.
    request = { ...request, signal, userFetch: boundedFetch, credentials: config.withCredentials ? 'include' : (request.credentials || 'same-origin'), requestInterceptor: undefined, responseInterceptor: config.responseInterceptor };
    try { return await sys.fn.fetch(request); } catch (e) { if (e.response) return e.response; throw e; }
  }
  function authSummary(ui) {
    return Object.keys(authorized(ui));
  }
  function openAuth(ui) {
    const sys = system(ui);
    if (!sys?.authActions?.showDefinitions || !sys?.authSelectors?.definitionsToAuthorize) throw new Error('Swagger authorization is unavailable.');
    sys.authActions.showDefinitions(sys.authSelectors.definitionsToAuthorize());
  }
  const api = { build, curl, send, authSummary, openAuth };
  if (typeof module !== 'undefined') module.exports = api; else root.SwaggerStudioBridge = api;
})(globalThis);
