/** Query parameters: arrays repeat the name, `undefined`/`null` are left out. */
export type Query = Record<string, string | number | boolean | null | undefined | readonly (string | number | boolean)[]>;

export interface RequestOptions {
  query?: Query;
  headers?: HeadersInit;
  signal?: AbortSignal;
  /** Milliseconds before the request is aborted with a `TimeoutError`. Overrides the client's. */
  timeout?: number;
  /**
   * How to read the body: `"json"`, `"text"`, `"blob"`, or `"response"` for the raw `Response`. Default: JSON
   * when the response says so, else text; `undefined` for an empty body (204).
   */
  responseType?: "json" | "text" | "blob" | "response";
}

export interface ResponseContext {
  request: Request;
  /** Sends the request again, through the request interceptors (so a refreshed token is picked up). */
  retry: () => Promise<Response>;
  /** `1` for the first response, `2` after one `retry()`, … */
  attempt: number;
}

export interface Interceptor {
  /** Change or replace the request before it's sent: add an `Authorization` header, a trace id. */
  request?: (request: Request) => Request | void | Promise<Request | void>;
  /** See every response before it's read: return a different one (`retry()` after refreshing a token on 401). */
  response?: (response: Response, context: ResponseContext) => Response | void | Promise<Response | void>;
}

export interface HttpOptions {
  /** Prefix for relative paths: `"/api"`, `"https://api.example.com/v1"`. */
  baseUrl?: string;
  /** Headers on every request; a function is called per request. */
  headers?: HeadersInit | (() => HeadersInit);
  /** Default timeout (ms) for every request. */
  timeout?: number;
  interceptors?: Interceptor[];
  /** The `fetch` to use. Default: the global one. */
  fetch?: typeof fetch;
}

/** A response outside 200–299. `body` is the parsed error body (JSON or text), if any. */
export class HttpError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly body: unknown;
  readonly response: Response;
  readonly request: Request;

  constructor(request: Request, response: Response, body: unknown) {
    super(`${request.method} ${request.url}: ${response.status} ${response.statusText}`.trim());
    this.name = "HttpError";
    this.status = response.status;
    this.statusText = response.statusText;
    this.body = body;
    this.response = response;
    this.request = request;
  }
}

export interface HttpClient {
  get<T = unknown>(path: string, options?: RequestOptions): Promise<T>;
  delete<T = unknown>(path: string, options?: RequestOptions): Promise<T>;
  post<T = unknown>(path: string, body?: unknown, options?: RequestOptions): Promise<T>;
  put<T = unknown>(path: string, body?: unknown, options?: RequestOptions): Promise<T>;
  patch<T = unknown>(path: string, body?: unknown, options?: RequestOptions): Promise<T>;
  request<T = unknown>(method: string, path: string, options?: RequestOptions & { body?: unknown }): Promise<T>;
  /** Adds an interceptor; returns a function that removes it. */
  use(interceptor: Interceptor): () => void;
}

function withQuery(url: string, query?: Query): string {
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [name, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    for (const item of Array.isArray(value) ? value : [value]) params.append(name, String(item));
  }
  const text = params.toString();
  return text ? `${url}${url.includes("?") ? "&" : "?"}${text}` : url;
}

function joinUrl(base: string | undefined, path: string): string {
  if (!base || /^[a-z][a-z\d+.-]*:/i.test(path)) return path;
  return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

/** A body `fetch` takes as it is; anything else (objects, arrays, numbers) is sent as JSON. */
function isNativeBody(body: unknown): body is BodyInit {
  return (
    typeof body === "string" ||
    body instanceof Blob ||
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof ArrayBuffer ||
    ArrayBuffer.isView(body) ||
    (typeof ReadableStream !== "undefined" && body instanceof ReadableStream)
  );
}

async function readBody(response: Response, type: RequestOptions["responseType"]): Promise<unknown> {
  if (type === "response") return response;
  if (type === "blob") return response.blob();
  if (type === "text") return response.text();
  if (response.status === 204 || response.headers.get("content-length") === "0") return undefined;
  const text = await response.text();
  if (text === "") return undefined;
  const json = type === "json" || /[/+]json\b/i.test(response.headers.get("content-type") ?? "");
  return json ? JSON.parse(text) : text;
}

function timeoutSignal(ms: number | undefined, signal: AbortSignal | undefined): { signal?: AbortSignal; done: () => void } {
  if (!ms) return { signal, done: () => {} };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new DOMException(`Timed out after ${ms} ms`, "TimeoutError")), ms);
  const forward = () => controller.abort(signal!.reason);
  if (signal?.aborted) forward();
  else signal?.addEventListener("abort", forward, { once: true });
  return {
    signal: controller.signal,
    done: () => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", forward);
    },
  };
}

/**
 * A small client over `fetch`. Requests resolve to the parsed body and reject with `HttpError` for non-2xx
 * statuses, so they drop straight into a `TaskController`:
 *
 * ```ts
 * const api = createHttp({ baseUrl: "/api", headers: () => ({ Authorization: `Bearer ${token()}` }) });
 * new TaskController(this, { task: ([id], signal) => api.get<User>(`/users/${id}`, { signal }), args: () => [this.id] });
 * ```
 */
export function createHttp(options: HttpOptions = {}): HttpClient {
  const interceptors = [...(options.interceptors ?? [])];
  const fetchImpl = options.fetch ?? ((input: RequestInfo | URL, init?: RequestInit) => fetch(input, init));

  async function send(base: Request, signal: AbortSignal | undefined): Promise<Response> {
    const prepare = async (): Promise<Request> => {
      let request = base.clone();
      for (const interceptor of interceptors) request = (await interceptor.request?.(request)) ?? request;
      return request;
    };
    let attempt = 0;
    const deliver = async (): Promise<{ response: Response; request: Request }> => {
      attempt++;
      const request = await prepare();
      signal?.throwIfAborted();
      // The signal goes in explicitly: a cloned or interceptor-built Request may not carry it along.
      let response = await fetchImpl(request, { signal });
      const context: ResponseContext = { request, attempt, retry: async () => (await deliver()).response };
      for (const interceptor of interceptors) response = (await interceptor.response?.(response, context)) ?? response;
      return { response, request };
    };
    return (await deliver()).response;
  }

  async function request<T>(method: string, path: string, init: RequestOptions & { body?: unknown } = {}): Promise<T> {
    const headers = new Headers(typeof options.headers === "function" ? options.headers() : options.headers);
    new Headers(init.headers).forEach((value, name) => headers.set(name, value));
    let body: BodyInit | undefined;
    if (init.body !== undefined) {
      if (isNativeBody(init.body)) body = init.body;
      else {
        body = JSON.stringify(init.body);
        if (!headers.has("content-type")) headers.set("content-type", "application/json");
      }
    }
    if (!headers.has("accept") && init.responseType !== "blob") headers.set("accept", "application/json, text/plain, */*");
    const { signal, done } = timeoutSignal(init.timeout ?? options.timeout, init.signal);
    try {
      const url = new URL(withQuery(joinUrl(options.baseUrl, path), init.query), globalThis.location?.href ?? "http://localhost");
      const base = new Request(url, { method, headers, body, signal });
      const response = await send(base, signal);
      if (!response.ok) {
        const errorBody = await readBody(response, undefined).catch(() => undefined);
        throw new HttpError(base, response, errorBody);
      }
      return (await readBody(response, init.responseType)) as T;
    } finally {
      done();
    }
  }

  return {
    request,
    get: (path, o) => request("GET", path, o),
    delete: (path, o) => request("DELETE", path, o),
    post: (path, body, o) => request("POST", path, { ...o, body }),
    put: (path, body, o) => request("PUT", path, { ...o, body }),
    patch: (path, body, o) => request("PATCH", path, { ...o, body }),
    use(interceptor) {
      interceptors.push(interceptor);
      return () => {
        const i = interceptors.indexOf(interceptor);
        if (i >= 0) interceptors.splice(i, 1);
      };
    },
  };
}
