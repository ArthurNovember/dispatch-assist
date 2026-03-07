export class ApiError extends Error {
  status: number;
  bodyText?: string;
  constructor(message: string, status: number, bodyText?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.bodyText = bodyText;
  }
}
const BASE_URL = "/api/v1";
const LOGIN = import.meta.env.VITE_GPSDOZOR_LOGIN;
const PASSWORD = import.meta.env.VITE_GPSDOZOR_PASSWORD;

function getAuthHeader(): string {
  if (!LOGIN || !PASSWORD) {
    throw new Error(
      "Missing API credentials. Set VITE_GPSDOZOR_LOGIN and VITE_GPSDOZOR_PASSWORD in .env",
    );
  }

  const token = btoa(`${LOGIN}:${PASSWORD}`);
  return `Basic ${token}`;
}
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type ApiRequestOptions = {
  method?: HttpMethod;

  body?: unknown;

  headers?: Record<string, string>;

  responseType?: "json" | "text";
};

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const method = options.method ?? "GET";
  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: getAuthHeader(),
    ...options.headers,
  };
  let body: string | undefined = undefined;
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }
  const url = `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  let res: Response;
  try {
    res = await fetch(url, { method, headers, body });
  } catch (err) {
    throw new ApiError(
      `Network error while calling ${method} ${url}`,
      0,
      err instanceof Error ? err.message : String(err),
    );
  }

  const responseType = options.responseType ?? "json";
  if (!res.ok) {
    const bodyText = await res.text().catch(() => "");
    throw new ApiError(
      `API error ${res.status} (${res.statusText}) for ${method} ${path}`,
      res.status,
      bodyText,
    );
  }
  if (responseType === "text") {
    return (await res.text()) as unknown as T;
  }

  return (await res.json()) as T;
}
