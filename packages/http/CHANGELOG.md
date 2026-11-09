# @lit-material/http

## 1.4.0

## 1.3.0

## 1.2.1

## 1.2.0

## 1.1.0

## 1.0.0

### Major Changes

- 65ac716: lit-material 1.0. Every package now shares one version (Changesets `fixed`): install any set of `@lit-material/*` packages at the same version and they work together, with no compatibility matrix. From here on the packages follow semantic versioning under the published [versioning and support policy](https://github.com/bohdaq/lit-material/blob/main/VERSIONING.md): breaking changes only in a major, deprecations announced a minor ahead, and the previous major supported with security fixes for 12 months after the next one ships.

## 0.1.0

### Minor Changes

- 05d1b14: Data and forms.

  - `@lit-material/task`: give a `TaskController` a `key` and results are cached in a shared `TaskCache` (`taskCache`): a cached value shows at once while a background fetch refreshes it (`refreshing`), `staleTime` skips fetching while it's fresh, controllers on one key share one request, and `taskCache.invalidate(prefix)` / `set(key, value)` reach every controller showing it. `retry`/`retryDelay` retry failed runs; `refetchOnFocus`, `refetchOnReconnect` and `refetchInterval` refresh in the background; `refresh()` forces a fetch. A controller reconnected while its run was pending runs again. Without the new options it behaves as before.
  - New `@lit-material/http`: `createHttp({ baseUrl, headers, timeout, interceptors })` with `get`/`post`/`put`/`patch`/`delete` — JSON in and out, query objects, `HttpError` (status and parsed body) for non-2xx, timeouts, and request/response interceptors whose `retry()` re-sends after refreshing a token on 401.
  - `@lit-material/form`: `new FormController(host, { form, validators, schema, validateOn, debounce })` — `values` from the form (dotted names nest into objects and arrays), sync and async field validators (debounced, superseded runs aborted, `validating`), any Standard Schema (zod, valibot, arktype), messages shown on the fields (`error`/`errorText` on lit-material fields, custom validity on native ones; errors the app set are left alone), `errors`/`error(name)`/`formErrors`, `validate()`, and `handleSubmit(onValid)` with `submitting`. `FieldArrayController` manages repeating rows with stable keys. `new FormController(host, getForm)` works as before.
