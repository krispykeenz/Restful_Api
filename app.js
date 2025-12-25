// DEMO MODE ONLY: This is a static API explorer with mocked responses.
// Remove the /demo folder when publishing a real deployment.

const ENDPOINTS = [
  {
    id: 'health',
    method: 'GET',
    path: '/health',
    description: 'Gateway health check',
    curl: "curl -s https://example-gateway/health",
    response: { status: 'ok', service: 'api-gateway', timestamp: '2025-01-01T12:00:00Z' },
  },
  {
    id: 'register',
    method: 'POST',
    path: '/auth/register',
    description: 'Create a user account',
    curl:
      "curl -s -X POST https://example-gateway/auth/register \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"username\":\"demo\",\"email\":\"demo@example.com\",\"password\":\"********\"}'",
    response: { success: true, userId: 'u_demo_123', token: 'jwt_demo_token...' },
  },
  {
    id: 'profile',
    method: 'GET',
    path: '/auth/profile',
    description: 'Fetch current user profile (JWT required)',
    curl:
      "curl -s https://example-gateway/auth/profile \\\n  -H 'Authorization: Bearer jwt_demo_token'",
    response: { id: 'u_demo_123', email: 'demo@example.com', tier: 'basic' },
  },
  {
    id: 'services',
    method: 'GET',
    path: '/api/services',
    description: 'List registered microservice routes',
    curl:
      "curl -s https://example-gateway/api/services \\\n  -H 'Authorization: Bearer jwt_demo_token'",
    response: {
      routes: [
        { prefix: '/api/users', target: 'http://user-service:3001' },
        { prefix: '/api/orders', target: 'http://order-service:3002' },
        { prefix: '/api/products', target: 'http://product-service:3003' },
      ],
    },
  },
];

const els = {
  endpointSelect: document.getElementById('endpointSelect'),
  requestPre: document.getElementById('requestPre'),
  responsePre: document.getElementById('responsePre'),
  sendBtn: document.getElementById('sendBtn'),
  copyCurlBtn: document.getElementById('copyCurlBtn'),
  statusLine: document.getElementById('statusLine'),
};

function toPrettyJson(obj) {
  return JSON.stringify(obj, null, 2);
}

function renderOptions() {
  els.endpointSelect.innerHTML = '';
  for (const ep of ENDPOINTS) {
    const opt = document.createElement('option');
    opt.value = ep.id;
    opt.textContent = `${ep.method} ${ep.path}`;
    els.endpointSelect.appendChild(opt);
  }
}

function getSelectedEndpoint() {
  const id = els.endpointSelect.value;
  return ENDPOINTS.find((e) => e.id === id) ?? ENDPOINTS[0];
}

function renderRequest(ep) {
  const request = {
    method: ep.method,
    path: ep.path,
    headers:
      ep.path.startsWith('/auth/') || ep.path.startsWith('/api/')
        ? { Authorization: 'Bearer jwt_demo_token' }
        : { 'Content-Type': 'application/json' },
    body: ep.method === 'POST' ? { note: 'Demo payload omitted' } : undefined,
  };
  els.requestPre.textContent = toPrettyJson(request);
}

function renderResponse(ep) {
  els.responsePre.textContent = toPrettyJson(ep.response);
}

function setStatus(text) {
  els.statusLine.textContent = text;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    setStatus('Copied to clipboard.');
  } catch {
    setStatus('Could not copy (browser permissions).');
  }
}

function wire() {
  els.endpointSelect.addEventListener('change', () => {
    const ep = getSelectedEndpoint();
    renderRequest(ep);
    renderResponse(ep);
    setStatus(ep.description);
  });

  els.sendBtn.addEventListener('click', () => {
    const ep = getSelectedEndpoint();
    setStatus('Sending request… (simulated)');
    setTimeout(() => {
      renderResponse(ep);
      setStatus(`200 OK — ${ep.description} (simulated)`);
    }, 450);
  });

  els.copyCurlBtn.addEventListener('click', () => {
    const ep = getSelectedEndpoint();
    copyText(ep.curl);
  });
}

renderOptions();
wire();
const first = getSelectedEndpoint();
renderRequest(first);
renderResponse(first);
setStatus(first.description);
