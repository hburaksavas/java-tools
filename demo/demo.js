window.ui = SwaggerUIBundle({ url: '/v3/api-docs', dom_id: '#swagger-ui', deepLinking: true });
async function openStudio() {
  const response = await fetch('/v3/api-docs');
  await SwaggerStudio.open({ spec: await response.json(), ui: window.ui, specUrl: new URL('/v3/api-docs', location.href).href });
}
document.getElementById('open-studio').addEventListener('click', openStudio);
if (new URLSearchParams(location.search).has('studio')) openStudio();
