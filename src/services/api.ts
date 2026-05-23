const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions<TBody = unknown> {
  method: HttpMethod;
  endpoint: string;
  body?: TBody;
  headers?: Record<string, string>;
}

interface ApiError {
  message: string;
  statusCode: number;
}

// Lee el token directamente de localStorage para no acoplar al store
function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function refreshAuthToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;

  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  })
    .then(async (res) => {
      if (!res.ok) throw new Error("Refresh failed");
      const data = await res.json();
      const newAccessToken = data.tokens?.accessToken;
      const newRefreshToken = data.tokens?.refreshToken;

      if (!newAccessToken) {
        throw new Error("No access token returned");
      }

      localStorage.setItem("token", newAccessToken);
      if (newRefreshToken) {
        localStorage.setItem("refreshToken", newRefreshToken);
      }
      return newAccessToken;
    })
    .catch(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      window.dispatchEvent(new Event("auth:logout"));
      return null;
    })
    .finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });

  return refreshPromise;
}

async function request<TResponse, TBody = unknown>({
  method,
  endpoint,
  body,
  headers = {},
}: RequestOptions<TBody>): Promise<TResponse> {
  const executeRequest = async (authHeader: Record<string, string>) => {
    const config: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...authHeader,
        ...headers,
      },
    };

    if (body !== undefined) {
      config.body = JSON.stringify(body);
    }

    return fetch(`${BASE_URL}${endpoint}`, config);
  };

  let response = await executeRequest(getAuthHeader());

  // Intenta parsear JSON siempre, incluso en errores
  let data = await response.json().catch(() => null);

  // Si da 401 y no es login/refresh, intentamos refrescar token
  if (
    response.status === 401 &&
    !endpoint.includes("/auth/login") &&
    !endpoint.includes("/auth/refresh") &&
    localStorage.getItem("refreshToken")
  ) {
    const newToken = await refreshAuthToken();
    if (newToken) {
      // Reintentar con el nuevo token
      response = await executeRequest({ Authorization: `Bearer ${newToken}` });
      data = await response.json().catch(() => null);
    }
  }

  if (!response.ok) {
    const error: ApiError = {
      message: data?.message ?? "An unexpected error occurred",
      statusCode: response.status,
    };
    throw error;
  }

  return data as TResponse;
}

// Métodos de conveniencia
const api = {
  get: <TResponse>(endpoint: string, headers?: Record<string, string>) =>
    request<TResponse>({ method: "GET", endpoint, headers }),

  post: <TResponse, TBody = unknown>(endpoint: string, body: TBody, headers?: Record<string, string>) =>
    request<TResponse, TBody>({ method: "POST", endpoint, body, headers }),

  put: <TResponse, TBody = unknown>(endpoint: string, body: TBody, headers?: Record<string, string>) =>
    request<TResponse, TBody>({ method: "PUT", endpoint, body, headers }),

  patch: <TResponse, TBody = unknown>(endpoint: string, body: TBody, headers?: Record<string, string>) =>
    request<TResponse, TBody>({ method: "PATCH", endpoint, body, headers }),

  delete: <TResponse>(endpoint: string, headers?: Record<string, string>) =>
    request<TResponse>({ method: "DELETE", endpoint, headers }),
};

export default api;
export type { ApiError };
