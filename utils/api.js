import Cookies from "js-cookie";

export async function apiFetch(endpoint, options = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  const token = Cookies.get("accessToken");

  const headers = {
    "ngrok-skip-browser-warning": "true",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (options.body && !(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json?.message || "Request failed");
  }
  return json;
}
