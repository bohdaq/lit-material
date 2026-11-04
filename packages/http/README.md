# @lit-material/http

A small client over `fetch` for [lit-material](https://github.com/bohdaq/lit-material) apps: a base URL,
JSON in and out, query objects, typed HTTP errors, timeouts, and request/response interceptors for auth
headers and refresh-and-retry on 401. No dependencies; works in browsers and Node.

## Install

```sh
npm install @lit-material/http
```

## Usage

```ts
import { createHttp, HttpError } from "@lit-material/http";

export const api = createHttp({
  baseUrl: "/api",
  headers: () => ({ Authorization: `Bearer ${session.token}` }), // called per request
  timeout: 15_000,
});

const users = await api.get<User[]>("/users", { query: { page: 2, tag: ["admin", "ops"] } }); // /api/users?page=2&tag=admin&tag=ops
const created = await api.post<User>("/users", { name: "Ada" }); // sent as JSON
await api.delete(`/users/${id}`);                                 // 204 → undefined
```

- Objects and arrays go out as JSON (with `content-type: application/json`); `FormData`, `Blob`, strings,
  `URLSearchParams` and streams go as they are.
- A JSON response is parsed, anything else read as text, an empty one is `undefined`. Ask for something else
  with `responseType: "text" | "blob" | "response"`.
- A status outside 200–299 rejects with `HttpError`: `status`, `statusText`, `body` (the parsed error body),
  `response`, `request`.
- `signal` aborts a request; `timeout` (per client or per call) aborts it with a `TimeoutError`.

### With `TaskController`

Requests take the task's `AbortSignal` and reject on errors, so they fit `@lit-material/task` as they are:

```ts
private readonly user = new TaskController(this, {
  task: ([id], signal) => api.get<User>(`/users/${id}`, { signal }),
  args: () => [this.userId] as const,
  key: ([id]) => ["user", id],
  retry: (failures, error) => failures < 3 && !(error instanceof HttpError && error.status < 500),
});
```

## Interceptors

`request` interceptors see each request before it's sent and may change or replace it; `response`
interceptors see each response before it's read and may return a different one. `retry()` sends the request
again through the request interceptors, so a refreshed token is picked up:

```ts
api.use({
  request: (request) => {
    request.headers.set("x-request-id", crypto.randomUUID());
    return request;
  },
  response: async (response, { retry, attempt }) => {
    if (response.status !== 401 || attempt > 1) return response;
    await session.refresh();   // one refresh, then one retry
    return retry();
  },
});
```

`use()` returns a function that removes the interceptor; `createHttp({ interceptors: [...] })` sets them up
front. A 401 that survives the retry rejects with `HttpError` as usual, which is where to send the user to
sign in.

## API

| Export | |
| --- | --- |
| `createHttp(options?)` | `{ baseUrl?, headers?, timeout?, interceptors?, fetch? }` → client with `get`, `delete` (`path, options?`), `post`, `put`, `patch` (`path, body?, options?`), `request(method, path, options?)` and `use(interceptor)`. |
| `RequestOptions` | `{ query?, headers?, signal?, timeout?, responseType? }`. |
| `HttpError` | Thrown for non-2xx: `status`, `statusText`, `body`, `response`, `request`. |
| `Interceptor` | `{ request?(request), response?(response, { request, retry, attempt }) }`. |

## License

MIT
