(function (root) {
  function system(ui) { return ui?.getSystem?.() || ui; }
  function authorized(ui) { return system(ui)?.authSelectors?.authorized?.()?.toJS?.() || {}; }
  function build(ui, options, manualAuth = '') {
    const sys = system(ui);
    if (!sys?.fn?.buildRequest || !sys?.fn?.execute) throw new Error('Swagger request engine is unavailable. Reload the page.');
    // Read authorization at send time: OAuth refresh and logout immediately apply.
    const operation = options.spec.paths[options.pathName][options.method];
    const operationId = sys.fn.opId ? sys.fn.opId(operation, options.pathName, options.method) : options.operationId || `${options.method}-${options.pathName}`;
    const request = sys.fn.buildRequest({ ...options, operationId, securities: { authorized: authorized(ui) } });
    if (options.spec.openapi && options.requestBody !== undefined && /(^application\/json$|\+json$)/i.test(options.requestContentType || '')) {
      request.body = JSON.stringify(options.requestBody);
      request.headers['Content-Type'] = options.requestContentType;
    }
    if ((request.body && Object.prototype.toString.call(request.body) === '[object Object]') || Array.isArray(request.body)) request.body = JSON.stringify(request.body);
    if (manualAuth.trim()) {
      for (const key of Object.keys(request.headers)) if (key.toLowerCase() === 'authorization') delete request.headers[key];
      request.headers.Authorization = manualAuth.trim();
    }
    return request;
  }
  async function send(ui, options, { signal, manualAuth = '', confirmOrigin = () => false, origin = location.origin } = {}) {
    const sys = system(ui), config = ui.getConfigs?.() || sys.getConfigs?.() || {};
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
      const response = await userFetch(url, { ...init, signal, redirect: 'error' });
      const reader = response.body?.getReader(); const chunks = []; let size = 0, truncated = false;
      if (reader) while (true) {
        const { done, value } = await reader.read(); if (done) break;
        const remaining = 1024 * 1024 - size;
        chunks.push(value.slice(0, remaining)); size += Math.min(value.length, remaining);
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
  const api = { build, send, authSummary, openAuth };
  if (typeof module !== 'undefined') module.exports = api; else root.SwaggerStudioBridge = api;
})(globalThis);
