const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const apiFetch = async (path, { method = "GET", body, headers, ...rest } = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined,
    ...rest
  });

  let payload;
  try {
    payload = await response.json();
  } catch (err) {
    payload = null;
  }

  if (!response.ok) {
    const message = payload?.message || "Request failed";
    const error = new Error(message);
    error.status = response.status;
    if (payload?.issues) error.issues = payload.issues;
    throw error;
  }

  return payload;
};
