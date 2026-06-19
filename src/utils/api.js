/* ==========================================================================
   GymSync — API Client Utility
   Handles all HTTP requests with automatic JWT auth headers
   ========================================================================== */

const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('gymsync_token');
}

async function request(method, url, data = null) {
  const token = getToken();
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    config.body = JSON.stringify(data);
  }

  const res = await fetch(`${API_BASE}${url}`, config);

  // Handle 401 — redirect to login
  if (res.status === 401) {
    localStorage.removeItem('gymsync_token');
    localStorage.removeItem('gymsync_user');
    if (window.location.hash !== '#/login') {
      window.location.hash = '#/login';
    }
    throw new Error('Session expired. Please log in again.');
  }

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error || `Request failed with status ${res.status}`);
  }

  return json;
}

const api = {
  get: (url) => request('GET', url),
  post: (url, data) => request('POST', url, data),
  put: (url, data) => request('PUT', url, data),
  delete: (url) => request('DELETE', url),
};

export default api;
