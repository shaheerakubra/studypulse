const API_BASE = import.meta.env.VITE_API_BASE || "";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(payload.message || "Request failed.");
    error.details = payload.details;
    error.status = res.status;
    throw error;
  }
  return payload;
}

export const api = {
  health: () => request("/health"),
  dashboard: () => request("/api/insights/dashboard"),
  courses: {
    list: () => request("/api/courses"),
    create: (body) => request("/api/courses", { method: "POST", body: JSON.stringify(body) }),
    update: (id, body) => request(`/api/courses/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    remove: (id) => request(`/api/courses/${id}`, { method: "DELETE" }),
  },
  tasks: {
    list: (query = "") => request(`/api/tasks${query}`),
    upcoming: (days = 14) => request(`/api/tasks/upcoming?days=${days}`),
    create: (body) => request("/api/tasks", { method: "POST", body: JSON.stringify(body) }),
    update: (id, body) => request(`/api/tasks/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    setStatus: (id, status) =>
      request(`/api/tasks/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
    remove: (id) => request(`/api/tasks/${id}`, { method: "DELETE" }),
  },
  availability: {
    get: () => request("/api/availability"),
    update: (body) => request("/api/availability", { method: "PUT", body: JSON.stringify(body) }),
  },
};
