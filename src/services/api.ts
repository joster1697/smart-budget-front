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

async function request<TResponse, TBody = unknown>({
  method,
  endpoint,
  body,
  headers = {},
}: RequestOptions<TBody>): Promise<TResponse> {
  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
      ...headers,
    },
  };

  if (body !== undefined) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  // Intenta parsear JSON siempre, incluso en errores
  const data = await response.json().catch(() => null);

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
