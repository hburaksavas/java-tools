(function (root) {
  const methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace'];
  function resolve(spec, value, seen = new Set()) {
    if (!value?.$ref) return value;
    if (!value.$ref.startsWith('#/')) throw new Error('External references must first be resolved by Swagger UI.');
    if (seen.has(value.$ref)) return {};
    seen.add(value.$ref);
    const target = value.$ref.slice(2).split('/').reduce((o, k) => o?.[k.replace(/~1/g, '/').replace(/~0/g, '~')], spec);
    if (!target) throw new Error(`Unresolved reference: ${value.$ref}`);
    return { ...resolve(spec, target, seen), ...Object.fromEntries(Object.entries(value).filter(([k]) => k !== '$ref')) };
  }
  function schema(spec, value, depth = 0) {
    if (!value || depth > 12) return {};
    const s = resolve(spec, value);
    const merged = (s.allOf || []).reduce((acc, part) => {
      const v = schema(spec, part, depth + 1);
      return { ...acc, ...v, properties: { ...acc.properties, ...v.properties }, required: [...(acc.required || []), ...(v.required || [])] };
    }, {});
    return { ...merged, ...s, properties: { ...merged.properties, ...s.properties } };
  }
  function sample(spec, value, depth = 0, seen = new Set()) {
    if (depth > 6 || value?.$ref && seen.has(value.$ref)) return undefined;
    const next = new Set(seen); if (value?.$ref) next.add(value.$ref);
    const s = schema(spec, value);
    for (const key of ['example', 'default', 'const']) if (s[key] !== undefined) return s[key];
    if (s.examples?.length) return s.examples[0];
    if (s.enum?.length) return s.enum[0];
    if (s.oneOf || s.anyOf) return sample(spec, (s.oneOf || s.anyOf)[0], depth + 1, next);
    const type = Array.isArray(s.type) ? s.type.find(t => t !== 'null') : s.type;
    if (type === 'object' || Object.keys(s.properties || {}).length) {
      const result = {};
      for (const [name, child] of Object.entries(s.properties || {})) {
        if (resolve(spec, child)?.readOnly) continue;
        const v = sample(spec, child, depth + 1, next); if (v !== undefined) result[name] = v;
      }
      return result;
    }
    if (type === 'array') return [sample(spec, s.items, depth + 1, next)].filter(v => v !== undefined);
    if (type === 'integer' || type === 'number') return s.minimum ?? 1;
    if (type === 'boolean') return true;
    if (s.format === 'binary' || s.type === 'file') return undefined;
    if (s.format === 'email') return 'name@example.test';
    if (s.format === 'date') return '2026-01-01';
    if (s.format === 'date-time') return '2026-01-01T12:00:00Z';
    if (s.format === 'uuid') return '00000000-0000-4000-8000-000000000001';
    return 'string';
  }
  function operations(spec) {
    return Object.entries(spec.paths || {}).flatMap(([path, raw]) => {
      const item = resolve(spec, raw);
      return methods.filter(m => item[m]).map(method => {
        const op = item[method], params = new Map();
        for (const rawParam of [...(item.parameters || []), ...(op.parameters || [])]) {
          const p = resolve(spec, rawParam); params.set(`${p.in}:${p.name}`, p);
        }
        return { ...op, method: method.toUpperCase(), path, id: `${method}:${path}`, parameters: [...params.values()], servers: op.servers || item.servers || spec.servers };
      });
    });
  }
  function baseUrl(spec, op, specUrl, pageUrl) {
    if (spec.swagger === '2.0') return `${spec.schemes?.[0] || new URL(pageUrl).protocol.slice(0, -1)}://${spec.host || new URL(pageUrl).host}${spec.basePath || '/'}`;
    const server = op.servers?.[0];
    const url = (server?.url || '/').replace(/\{([^}]+)\}/g, (_, key) => server.variables?.[key]?.default ?? `{${key}}`);
    return new URL(url, specUrl || pageUrl).href;
  }
  function bodyInfo(spec, op) {
    if (spec.openapi) return resolve(spec, op.requestBody)?.content || {};
    const param = op.parameters.find(p => p.in === 'body');
    const fields = op.parameters.filter(p => p.in === 'formData');
    if (!param && !fields.length) return {};
    const types = op.consumes || spec.consumes || [fields.length ? 'application/x-www-form-urlencoded' : 'application/json'];
    const s = param?.schema || { type: 'object', properties: Object.fromEntries(fields.map(p => [p.name, p])), required: fields.filter(p => p.required).map(p => p.name) };
    return Object.fromEntries(types.map(t => [t, { schema: s }]));
  }
  const isJson = type => /(^application\/json$|\+json$)/i.test(type || '');
  function typedValue(spec, definition, value, label) {
    const s = schema(spec, definition);
    let result = value;
    if (typeof value === 'string') {
      if (s.type === 'array' || s.type === 'object') {
        try { result = JSON.parse(value); } catch { throw new Error(`${label}: enter valid JSON.`); }
      } else if (s.type === 'integer' || s.type === 'number') {
        result = Number(value); if (!Number.isFinite(result) || s.type === 'integer' && !Number.isInteger(result)) throw new Error(`${label}: enter a valid ${s.type}.`);
      } else if (s.type === 'boolean') { if (!['true', 'false'].includes(value)) throw new Error(`${label}: use true or false.`); result = value === 'true'; }
    }
    const errors = validate(spec, definition, result, label);
    if (errors.length) throw new Error(errors.join('\n'));
    return result;
  }
  function validate(spec, definition, value, label = 'Body', depth = 0) {
    if (depth > 10) return [];
    const s = schema(spec, definition), errors = [], type = s.type;
    if (value === null && (s.nullable || Array.isArray(type) && type.includes('null'))) return errors;
    const types = Array.isArray(type) ? type : type ? [type] : Object.keys(s.properties || {}).length ? ['object'] : [];
    const matches = t => t === 'object' ? value !== null && typeof value === 'object' && !Array.isArray(value) : t === 'array' ? Array.isArray(value) : t === 'integer' ? Number.isInteger(value) : t === 'number' ? typeof value === 'number' && Number.isFinite(value) : t === 'null' ? value === null : typeof value === t;
    if (types.length && !types.some(matches)) return [`${label}: expected ${types.join(' or ')}.`];
    if (s.enum && !s.enum.some(v => JSON.stringify(v) === JSON.stringify(value))) errors.push(`${label}: choose ${s.enum.join(', ')}.`);
    if (typeof value === 'string') {
      if (s.minLength !== undefined && value.length < s.minLength) errors.push(`${label}: minimum length ${s.minLength}.`);
      if (s.maxLength !== undefined && value.length > s.maxLength) errors.push(`${label}: maximum length ${s.maxLength}.`);
    }
    if (typeof value === 'number') {
      if (s.minimum !== undefined && value < s.minimum) errors.push(`${label}: minimum ${s.minimum}.`);
      if (s.maximum !== undefined && value > s.maximum) errors.push(`${label}: maximum ${s.maximum}.`);
    }
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      for (const name of s.required || []) if (value[name] === undefined) errors.push(`${label}.${name} is required.`);
      for (const [name, child] of Object.entries(s.properties || {})) if (value[name] !== undefined) errors.push(...validate(spec, child, value[name], `${label}.${name}`, depth + 1));
    }
    if (Array.isArray(value)) {
      if (s.minItems !== undefined && value.length < s.minItems) errors.push(`${label}: minimum ${s.minItems} items.`);
      value.forEach((v, i) => errors.push(...validate(spec, s.items, v, `${label}[${i}]`, depth + 1)));
    }
    return errors;
  }
  function requestOptions(spec, op, draft, specUrl, pageUrl) {
    const parameters = Object.create(null);
    for (const p of op.parameters.filter(p => !['body', 'formData'].includes(p.in))) {
      const value = draft.values[`${p.in}:${p.name}`];
      if (value === undefined || value === '') { if (p.required || p.in === 'path') throw new Error(`${p.name} is required.`); continue; }
      if (p.in === 'cookie') throw new Error('Browsers manage Cookie headers. Set cookies through the application login flow.');
      parameters[`${p.in}.${p.name}`] = typedValue(spec, p.schema || p, value, p.name);
    }
    const contents = bodyInfo(spec, op), content = contents[draft.contentType], bodySchema = schema(spec, content?.schema);
    let requestBody;
    if (draft.contentType === 'multipart/form-data' || draft.contentType === 'application/x-www-form-urlencoded') {
      requestBody = Object.create(null);
      for (const [name, definition] of Object.entries(bodySchema.properties || {})) {
        const s = schema(spec, definition), binary = s.format === 'binary' || s.type === 'file' || s.type === 'array' && schema(spec, s.items).format === 'binary';
        const value = binary ? draft.files?.[name] : draft.form?.[name];
        if (value === undefined || value === '' || Array.isArray(value) && !value.length) { if (bodySchema.required?.includes(name)) throw new Error(`${name} is required.`); continue; }
        requestBody[name] = binary ? value : typedValue(spec, definition, value, name);
      }
      if (spec.swagger === '2.0') for (const [key, value] of Object.entries(requestBody)) parameters[`formData.${key}`] = value;
    } else if (draft.body?.trim()) {
      if (isJson(draft.contentType)) {
        try { requestBody = JSON.parse(draft.body); } catch { throw new Error('Request body is not valid JSON.'); }
        const errors = validate(spec, content?.schema, requestBody); if (errors.length) throw new Error(errors.join('\n'));
      } else requestBody = draft.body;
    }
    const bodyRequired = resolve(spec, op.requestBody)?.required || op.parameters.some(p => p.in === 'body' && p.required);
    if (bodyRequired && requestBody === undefined) throw new Error('Request body is required.');
    if (requestBody !== undefined && ['GET', 'HEAD'].includes(op.method)) throw new Error('GET/HEAD cannot have a body.');
    if (spec.swagger === '2.0') { const p = op.parameters.find(p => p.in === 'body'); if (p && requestBody !== undefined) parameters[`body.${p.name}`] = requestBody; }
    const base = new URL(draft.base, pageUrl);
    if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password || base.search || base.hash) throw new Error('Server must be an HTTP(S) URL without credentials, query or fragment.');
    // Resolve the current operation's parameter/body refs before Swagger Client builds it.
    const original = resolve(spec, spec.paths[op.path]);
    const cleanOp = { ...original[op.method.toLowerCase()], parameters: op.parameters, requestBody: op.requestBody ? { ...resolve(spec, op.requestBody), content: Object.fromEntries(Object.entries(contents).map(([type, entry]) => [type, { ...entry, schema: schema(spec, entry.schema) }])) } : undefined };
    const executionSpec = { ...spec, paths: { ...spec.paths, [op.path]: { ...original, parameters: [], [op.method.toLowerCase()]: cleanOp } } };
    return { spec: executionSpec, pathName: op.path, method: op.method.toLowerCase(), operationId: op.operationId,
      parameters, requestBody: spec.openapi ? requestBody : undefined, baseURL: base.href.replace(/\/$/, ''),
      contextUrl: specUrl || pageUrl, requestContentType: draft.contentType || undefined, responseContentType: draft.accept || 'application/json' };
  }
  function bodyExample(spec, op, type) {
    const entry = bodyInfo(spec, op)[type];
    if (!entry) return {};
    return entry.example ?? Object.values(entry.examples || {}).map(e => resolve(spec, e)?.value).find(v => v !== undefined) ?? sample(spec, entry.schema);
  }
  const api = { resolve, schema, sample, operations, baseUrl, bodyInfo, bodyExample, isJson, validate, typedValue, requestOptions };
  if (typeof module !== 'undefined') module.exports = api; else root.SwaggerStudioCore = api;
})(globalThis);
