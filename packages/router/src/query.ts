/** One query parameter's parser: reads its raw values (every `?name=` occurrence) into a typed value. */
export interface QueryParam<V> {
  parse(values: string[]): V;
  /** Writes the value back as zero or more raw values; omitted from the URL when it equals the default. */
  format(value: V): string[];
}

export type QuerySchema = Record<string, QueryParam<unknown>>;

/** The typed object a schema parses to: `{ page: number, tags: string[], ... }`. */
export type QueryValues<S extends QuerySchema> = { [K in keyof S]: S[K] extends QueryParam<infer V> ? V : never };

function single<V>(fallback: V, read: (raw: string) => V | undefined, write: (value: V) => string): QueryParam<V> {
  return {
    parse: (values) => {
      const raw = values[values.length - 1];
      if (raw === undefined) return fallback;
      const value = read(raw);
      return value === undefined ? fallback : value;
    },
    format: (value) => (value === fallback || value === undefined ? [] : [write(value)]),
  };
}

/**
 * Parsers for `parseQuery()`/`formatQuery()`. Each takes the value to use when the parameter is missing or
 * doesn't parse, so a hand-edited URL (`?page=abc`) never reaches the page as `NaN`.
 */
export const queryParam = {
  /** Pass `undefined` explicitly for an optional parameter (`string | undefined`); the default is `""`. */
  string<V extends string | undefined = string>(...fallback: [] | [V]): QueryParam<string | V> {
    return single<string | V>(fallback.length ? fallback[0]! : ("" as V), (raw) => raw, (value) => String(value));
  },
  /** Pass `undefined` explicitly for an optional parameter (`number | undefined`); the default is `0`. */
  number<V extends number | undefined = number>(...fallback: [] | [V]): QueryParam<number | V> {
    return single<number | V>(
      fallback.length ? fallback[0]! : (0 as V),
      (raw) => {
        const value = raw.trim() === "" ? NaN : Number(raw);
        return Number.isFinite(value) ? value : undefined;
      },
      (value) => String(value),
    );
  },
  /** `?open` / `?open=true` / `?open=1` read as `true`; `?open=false` / `?open=0` as `false`. */
  boolean(fallback = false): QueryParam<boolean> {
    return single(
      fallback,
      (raw) => (raw === "" || raw === "true" || raw === "1" ? true : raw === "false" || raw === "0" ? false : undefined),
      (value) => String(value),
    );
  },
  /** One of a fixed set of strings (a sort key, a tab), typed as their union. */
  oneOf<const O extends readonly string[]>(options: O, fallback: O[number] = options[0]!): QueryParam<O[number]> {
    return single<O[number]>(
      fallback,
      (raw) => ((options as readonly string[]).includes(raw) ? (raw as O[number]) : undefined),
      (value) => value,
    );
  },
  /** Every occurrence of a repeated parameter: `?tag=a&tag=b` → `["a", "b"]`. */
  list(): QueryParam<string[]> {
    return { parse: (values) => values, format: (value) => value };
  },
};

/**
 * Reads typed values out of a query string, `URLSearchParams` or `URL`, following `schema`:
 *
 * ```ts
 * const schema = { page: queryParam.number(1), sort: queryParam.oneOf(["name", "date"]), tag: queryParam.list() };
 * const { page, sort, tag } = parseQuery(schema, this.route.current.query); // number, "name" | "date", string[]
 * ```
 */
export function parseQuery<S extends QuerySchema>(
  schema: S,
  search: string | URLSearchParams | URL,
): QueryValues<S> {
  const params =
    search instanceof URLSearchParams ? search : search instanceof URL ? search.searchParams : new URLSearchParams(search);
  const values: Record<string, unknown> = {};
  for (const [name, param] of Object.entries(schema)) values[name] = param.parse(params.getAll(name));
  return values as QueryValues<S>;
}

/**
 * The query string (with its leading `?`, or `""` when empty) for `values`. Values equal to their parameter's
 * default are left out, so `/users?page=1` and `/users` aren't two URLs for the same page:
 *
 * ```ts
 * navigate(`/users${formatQuery(schema, { ...query, page: query.page + 1 })}`);
 * ```
 */
export function formatQuery<S extends QuerySchema>(schema: S, values: Partial<QueryValues<S>>): string {
  const params = new URLSearchParams();
  for (const [name, param] of Object.entries(schema)) {
    if (!(name in values)) continue;
    for (const raw of param.format((values as Record<string, unknown>)[name])) params.append(name, raw);
  }
  const query = params.toString();
  return query === "" ? "" : `?${query}`;
}
