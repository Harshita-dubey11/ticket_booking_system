const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

function getToken() {
  return localStorage.getItem("token");
}

const friendlyErrors = {
  400: "Invalid request. Please check your input.",
  401: "Please log in to continue.",
  403: "You don't have permission to perform this action.",
  404: "The requested resource was not found.",
  409: "This action conflicts with the current state. The seat may already be taken.",
  429: "Too many requests. Please wait a moment and try again.",
  500: "Something went wrong on our end. Please try again.",
};

export async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const serverMsg = body.error || "";
    const friendly = friendlyErrors[res.status] || "An unexpected error occurred.";
    const msg = serverMsg ? `${friendly} ${serverMsg}` : friendly;
    throw new Error(msg);
  }

  return res.json();
}

export const api = {
  get: (path) => request(path),
  post: (path, body) =>
    request(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: (path, body) =>
    request(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  delete: (path, body) =>
    request(path, { method: "DELETE", body: body ? JSON.stringify(body) : undefined }),
};
