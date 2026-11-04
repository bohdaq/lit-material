import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createHttp, HttpError } from "./index.js";

type Handler = (request: Request, signal?: AbortSignal) => Response | Promise<Response>;
function fakeFetch(handler: Handler) {
  const seen: Request[] = [];
  const fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = input as Request;
    seen.push(request);
    return handler(request, init?.signal ?? undefined);
  };
  return { fetch: fetch as typeof globalThis.fetch, seen };
}
const json = (value: unknown, status = 200) =>
  new Response(JSON.stringify(value), { status, headers: { "content-type": "application/json" } });

describe("createHttp (no browser)", () => {
  it("joins the base URL, adds the query, parses JSON", async () => {
    const { fetch, seen } = fakeFetch(() => json({ id: 1 }));
    const api = createHttp({ baseUrl: "https://api.test/v1/", fetch });
    const user = await api.get<{ id: number }>("/users", { query: { page: 2, tag: ["a", "b"], skip: undefined } });
    assert.deepEqual(user, { id: 1 });
    assert.equal(seen[0]!.url, "https://api.test/v1/users?page=2&tag=a&tag=b");
    assert.equal(seen[0]!.method, "GET");
  });

  it("sends objects as JSON, native bodies as they are", async () => {
    const { fetch, seen } = fakeFetch(() => new Response(null, { status: 204 }));
    const api = createHttp({ baseUrl: "https://api.test", fetch });
    assert.equal(await api.post("/a", { name: "x" }), undefined);
    assert.equal(seen[0]!.headers.get("content-type"), "application/json");
    assert.equal(await seen[0]!.text(), '{"name":"x"}');
    const form = new FormData();
    form.set("f", "1");
    await api.put("/b", form);
    assert.match(seen[1]!.headers.get("content-type") ?? "", /multipart\/form-data/);
  });

  it("reads text when the response isn't JSON", async () => {
    const { fetch } = fakeFetch(() => new Response("plain", { headers: { "content-type": "text/plain" } }));
    assert.equal(await createHttp({ fetch }).get("https://x.test/"), "plain");
  });

  it("rejects non-2xx with HttpError carrying the parsed body", async () => {
    const { fetch } = fakeFetch(() => json({ message: "nope" }, 422));
    const error = await createHttp({ fetch }).get("https://x.test/").catch((e: unknown) => e);
    assert.ok(error instanceof HttpError);
    assert.equal(error.status, 422);
    assert.deepEqual(error.body, { message: "nope" });
  });

  it("merges default, per-call and interceptor headers", async () => {
    const { fetch, seen } = fakeFetch(() => json({}));
    let token = "t1";
    const api = createHttp({ fetch, headers: () => ({ authorization: `Bearer ${token}`, "x-app": "a" }) });
    const remove = api.use({
      request: (request) => {
        request.headers.set("x-trace", "1");
        return request;
      },
    });
    await api.get("https://x.test/", { headers: { "x-app": "b" } });
    assert.equal(seen[0]!.headers.get("authorization"), "Bearer t1");
    assert.equal(seen[0]!.headers.get("x-app"), "b");
    assert.equal(seen[0]!.headers.get("x-trace"), "1");
    remove();
    token = "t2";
    await api.get("https://x.test/");
    assert.equal(seen[1]!.headers.get("x-trace"), null);
    assert.equal(seen[1]!.headers.get("authorization"), "Bearer t2");
  });

  it("refreshes a token on 401 and retries once, with the body intact", async () => {
    let token = "old";
    const { fetch, seen } = fakeFetch((request) =>
      request.headers.get("authorization") === "Bearer new" ? json({ ok: true }) : json({}, 401),
    );
    const api = createHttp({
      fetch,
      interceptors: [
        {
          request: (request) => {
            request.headers.set("authorization", `Bearer ${token}`);
            return request;
          },
          response: async (response, { retry, attempt }) => {
            if (response.status !== 401 || attempt > 1) return response;
            token = "new";
            return retry();
          },
        },
      ],
    });
    assert.deepEqual(await api.post("https://x.test/save", { a: 1 }), { ok: true });
    assert.equal(seen.length, 2);
    assert.equal(await seen[1]!.text(), '{"a":1}');
  });

  it("gives up after the interceptor stops retrying", async () => {
    const { fetch, seen } = fakeFetch(() => json({}, 401));
    const api = createHttp({
      fetch,
      interceptors: [{ response: (response, { retry, attempt }) => (response.status === 401 && attempt < 2 ? retry() : response) }],
    });
    await assert.rejects(api.get("https://x.test/"), (e: unknown) => e instanceof HttpError && e.status === 401);
    assert.equal(seen.length, 2);
  });

  it("times out, and passes the caller's abort through", async () => {
    const hang: Handler = (_request, signal) =>
      new Promise((_, reject) => {
        if (signal!.aborted) reject(signal!.reason);
        signal!.addEventListener("abort", () => reject(signal!.reason));
      });
    const { fetch } = fakeFetch(hang);
    const api = createHttp({ fetch, timeout: 20 });
    await assert.rejects(api.get("https://x.test/"), (e: unknown) => (e as DOMException).name === "TimeoutError");
    const controller = new AbortController();
    const pending = api.get("https://x.test/", { signal: controller.signal, timeout: 10_000 });
    controller.abort(new DOMException("stop", "AbortError"));
    await assert.rejects(pending, (e: unknown) => (e as DOMException).name === "AbortError");
  });

  it("returns the raw Response or a Blob when asked", async () => {
    const { fetch } = fakeFetch(() => new Response("bytes"));
    const api = createHttp({ fetch });
    assert.ok((await api.get("https://x.test/", { responseType: "response" })) instanceof Response);
    assert.equal(await (await api.get<Blob>("https://x.test/", { responseType: "blob" })).text(), "bytes");
  });
});
