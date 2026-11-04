// API Client with event emitter for live API Inspector Console

let apiListeners = [];

export const subscribeToApiLogs = (listener) => {
  apiListeners.push(listener);
  return () => {
    apiListeners = apiListeners.filter((l) => l !== listener);
  };
};

const notifyApiLog = (logEntry) => {
  apiListeners.forEach((listener) => {
    try {
      listener(logEntry);
    } catch (e) {
      console.error('Error notifying API listener:', e);
    }
  });
};

// Smart API base resolver:
// If running inside VS Code Live Server (port 5500, etc.) or standalone file,
// route API requests to Express backend at http://localhost:5000/api.
// Otherwise (same-origin port 5000 or Vite proxy 5173), use relative '/api'.
const isStaticLiveServer = typeof window !== 'undefined' && 
  window.location.port !== '5000' && 
  window.location.port !== '5173';

const API_BASE = (typeof window !== 'undefined' && window.__CAMPUS_CONNECT_API__)
  ? window.__CAMPUS_CONNECT_API__
  : isStaticLiveServer
  ? 'http://localhost:5000/api'
  : '/api';

/**
 * Execute an API call with automatic logging for the interactive console
 */
export async function apiFetch(endpoint, options = {}, authUser = null) {
  const startTime = performance.now();
  const url = `${API_BASE}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (authUser) {
    if (authUser.role) headers['x-user-role'] = authUser.role;
    if (authUser.email) headers['x-user-email'] = authUser.email;
    if (authUser.organizerId) headers['x-organizer-id'] = authUser.organizerId;
    if (authUser.id) headers['x-user-id'] = authUser.id;
  }

  const logEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toLocaleTimeString(),
    method: options.method || 'GET',
    endpoint,
    fullUrl: url,
    headers,
    requestBody: options.body ? JSON.parse(options.body) : null,
    status: null,
    statusText: '',
    durationMs: 0,
    responseBody: null,
    isError: false
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    const duration = Math.round(performance.now() - startTime);
    logEntry.status = res.status;
    logEntry.statusText = res.statusText;
    logEntry.durationMs = duration;

    let data;
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      const text = await res.text();
      data = { text };
    }

    logEntry.responseBody = data;
    logEntry.isError = !res.ok;

    notifyApiLog(logEntry);

    if (!res.ok) {
      const err = new Error(data.message || `API error ${res.status}: ${res.statusText}`);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (err) {
    if (logEntry.status === null) {
      logEntry.status = 500;
      logEntry.statusText = 'Network / Fetch Failed';
      logEntry.durationMs = Math.round(performance.now() - startTime);
      logEntry.responseBody = { error: err.message };
      logEntry.isError = true;
      notifyApiLog(logEntry);
    }
    throw err;
  }
}

// 1. GET /api/events
export async function getEvents(params = {}) {
  const query = new URLSearchParams();
  if (params.category && params.category !== 'All events') query.append('category', params.category);
  if (params.q) query.append('q', params.q);
  if (params.availableOnly) query.append('availableOnly', 'true');

  const queryString = query.toString() ? `?${query.toString()}` : '';
  return apiFetch(`/events${queryString}`, { method: 'GET' });
}

// 2. GET /api/events/{id}
export async function getEventDetails(eventId) {
  return apiFetch(`/events/${eventId}`, { method: 'GET' });
}

// 3. POST /api/registrations (Returns 201 or 409)
export async function registerForEvent(payload, authUser) {
  return apiFetch('/registrations', {
    method: 'POST',
    body: JSON.stringify(payload)
  }, authUser);
}

// 4. GET /api/me/registrations
export async function getMyRegistrations(authUser) {
  return apiFetch('/me/registrations', { method: 'GET' }, authUser);
}

// 5. GET /api/events/{id}/registrations (Owning organizer only)
export async function getEventRegistrations(eventId, authUser) {
  return apiFetch(`/events/${eventId}/registrations`, { method: 'GET' }, authUser);
}

// Helper: Toggle Check-in
export async function checkinAttendee(eventId, regId, authUser) {
  return apiFetch(`/events/${eventId}/registrations/${regId}/checkin`, {
    method: 'PATCH'
  }, authUser);
}

// Helper: Reset Seed Database
export async function resetDatabase() {
  return apiFetch('/seed/reset', { method: 'POST' });
}
