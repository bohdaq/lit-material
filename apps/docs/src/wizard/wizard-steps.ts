import { html } from "lit";

export interface WizardStepConfig {
  id: string;
  title: string;
  /** `?step=` value passed to the embedded app-shell-demo iframe (see apps/app-shell-demo/src/wizard-step.ts). */
  demoStep: 1 | 2 | 3 | 4 | 5;
  content: () => unknown;
}

const installCode =
  "npm install @lit-material/router @lit-material/store @lit-material/core @lit-material/task @lit-material/form @lit/context lit";

const storeCode = [
  "// store.ts — one module-level store instance, shared across the app.",
  'import { createStore } from "@lit-material/store";',
  "",
  "export interface CounterState {",
  "  count: number;",
  "}",
  "",
  'type CounterAction = { type: "increment" } | { type: "decrement" } | { type: "reset" };',
  "",
  "function reducer(state: CounterState, action: CounterAction): CounterState {",
  "  switch (action.type) {",
  '    case "increment":',
  "      return { count: state.count + 1 };",
  '    case "decrement":',
  "      return { count: state.count - 1 };",
  '    case "reset":',
  "      return { count: 0 };",
  "  }",
  "}",
  "",
  "export const counterStore = createStore(reducer, { count: 0 });",
].join("\n");

const appShellCode = [
  "// app-shell.ts — provides the theme context and owns the route outlet.",
  'import "@lit-material/router";',
  'import type { RouteConfig } from "@lit-material/router";',
  'import { themeContext, type ThemeState } from "@lit-material/core";',
  'import { ContextProvider } from "@lit/context";',
  'import { LitElement, html } from "lit";',
  'import "./home-page.js";',
  'import "./counter-page.js";',
  'import "./about-page.js";',
  "",
  "const routes: RouteConfig<unknown>[] = [",
  '  { path: "/", render: () => html`<home-page></home-page>` },',
  '  { path: "/counter", render: () => html`<counter-page></counter-page>` },',
  '  { path: "/about", render: () => html`<about-page></about-page>` },',
  "];",
  "",
  "class AppShell extends LitElement {",
  "  private readonly theme = new ContextProvider(this, {",
  "    context: themeContext,",
  '    initialValue: { colorScheme: "auto" } satisfies ThemeState,',
  "  });",
  "",
  "  override render() {",
  "    return html`<lit-material-router-outlet .routes=${routes}></lit-material-router-outlet>`;",
  "  }",
  "}",
  'customElements.define("app-shell", AppShell);',
].join("\n");

const counterPageCode = [
  "// counter-page.ts — reads both the store (for app state) and the theme",
  "// context (for cross-cutting UI state), the same two mechanisms a React app",
  "// would reach for useSelector/dispatch and useContext.",
  'import "@lit-material/button";',
  'import { StoreController } from "@lit-material/store";',
  'import { themeContext } from "@lit-material/core";',
  'import { ContextConsumer } from "@lit/context";',
  'import { LitElement, html } from "lit";',
  'import { counterStore } from "./store.js";',
  "",
  "class CounterPage extends LitElement {",
  "  private readonly count = new StoreController(this, counterStore, (state) => state.count);",
  '  private readonly theme = new ContextConsumer(this, { context: themeContext, subscribe: true });',
  "",
  "  override render() {",
  "    return html`",
  "      <p>Color scheme: ${this.theme.value?.colorScheme}</p>",
  "      <p>Count: ${this.count.value}</p>",
  '      <lit-material-button @click=${() => counterStore.dispatch({ type: "increment" })}>',
  "        +",
  "      </lit-material-button>",
  "    `;",
  "  }",
  "}",
  'customElements.define("counter-page", CounterPage);',
].join("\n");

const taskCode = [
  "// data-page.ts — a new route, keyed by its own local state.",
  'import { TaskController } from "@lit-material/task";',
  'import { LitElement, html } from "lit";',
  'import { state } from "lit/decorators.js";',
  "",
  "class DataPage extends LitElement {",
  "  @state() private userId = 1;",
  "",
  "  private readonly userTask = new TaskController(this, {",
  "    task: ([id], signal) => fetch(`/api/users/${id}`, { signal }).then((r) => r.json()),",
  "    args: () => [this.userId] as const,",
  "  });",
  "",
  "  override render() {",
  "    return this.userTask.render({",
  "      pending: () => html`Loading…`,",
  "      complete: (user) => html`<p>${user.bio}</p>`,",
  "      error: () => html`Couldn't load that user.`,",
  "    });",
  "  }",
  "}",
].join("\n");

const formCode = [
  "// settings-page.ts",
  'import { FormController } from "@lit-material/form";',
  'import { LitElement, html } from "lit";',
  'import { query, state } from "lit/decorators.js";',
  'import "@lit-material/text-field";',
  'import "@lit-material/button";',
  "",
  "class SettingsPage extends LitElement {",
  '  @query("form") private readonly formEl?: HTMLFormElement;',
  "  private readonly form = new FormController(this, () => this.formEl);",
  "",
  "  @state() private saved = false;",
  "",
  "  override render() {",
  "    return html`",
  "      <form @submit=${this.handleSubmit}>",
  "        <lit-material-text-field",
  '          name="email"',
  '          label="Email"',
  '          required',
  '          type="email"',
  '          @input=${() => (this.saved = false)}',
  "        ></lit-material-text-field>",
  '        <lit-material-button type="submit" ?disabled=${!this.form.valid}>Save</lit-material-button>',
  "        ${this.saved ? html`<p>Saved.</p>` : null}",
  "      </form>",
  "    `;",
  "  }",
  "",
  "  private handleSubmit(event: SubmitEvent): void {",
  "    event.preventDefault();",
  "    if (this.form.reportValidity()) this.saved = true;",
  "  }",
  "}",
].join("\n");

const i18nCode = [
  "// app-shell.ts, extended",
  'import { localeContext, type LocaleState } from "@lit-material/core";',
  'import { configureLocalization } from "@lit/localize";',
  'import { sourceLocale, targetLocales } from "./generated/locale-codes.js"; // from `lit-localize` CLI output',
  "",
  "const { setLocale } = configureLocalization({",
  "  sourceLocale,",
  "  targetLocales,",
  "  loadLocale: (locale) => import(`./generated/locales/${locale}.js`),",
  "});",
  "",
  "class AppShell extends LitElement {",
  "  // ...theme provider from the \"Wiring it together\" step, unchanged...",
  "  private readonly locale = new ContextProvider(this, {",
  "    context: localeContext,",
  '    initialValue: { locale: sourceLocale } satisfies LocaleState,',
  "  });",
  "",
  "  private async switchLocale(locale: string): Promise<void> {",
  "    await setLocale(locale);",
  "    this.locale.setValue({ locale });",
  "  }",
  "}",
].join("\n");

export const wizardSteps: WizardStepConfig[] = [
  {
    id: "install",
    title: "Install",
    demoStep: 1,
    content: () => html`
      <pre><code>${installCode}</code></pre>
      <p>Add <code>@lit/localize</code> too if you're using the i18n step below.</p>
      <p>
        The demo on the right starts from nothing — just a <code>home-page</code>, no router destinations yet.
        Each step from here adds one more piece.
      </p>
    `,
  },
  {
    id: "wiring",
    title: "Wire it together",
    demoStep: 2,
    content: () => html`
      <pre><code>${storeCode}</code></pre>
      <pre><code>${appShellCode}</code></pre>
      <pre><code>${counterPageCode}</code></pre>
      <p>
        Any same-origin <code>&lt;a href="/counter"&gt;</code> navigates via the outlet automatically; use
        <code>navigate("/counter")</code> from <code>@lit-material/router</code> for programmatic navigation
        (e.g. after <code>counterStore.dispatch({ type: "increment" })</code>).
      </p>
      <p>
        The demo just gained a router, a store, and theme context — click through to <strong>Counter</strong>
        and <strong>About</strong> on the right and back; the count survives the round trip.
      </p>
    `,
  },
  {
    id: "data",
    title: "Data fetching",
    demoStep: 3,
    content: () => html`
      <pre><code>${taskCode}</code></pre>
      <p>
        <code>TaskController</code> re-runs <code>task</code> automatically whenever <code>args()</code>
        returns a shallowly different value (checked before every render), aborting a superseded run via the
        <code>AbortSignal</code> it passes in — no stale-response race if <code>userId</code> changes again
        before the first fetch resolves. (The demo's own version of this page tracks <code>userId</code> via
        a "Next user" button instead of a route param, but the re-run/abort mechanics are identical.)
      </p>
      <p>
        The demo's new <strong>Data</strong> page uses a simulated fetch (there's no real backend here) to
        show the same pending/complete/abort behavior — click "Next user" a couple of times quickly and watch
        it never show a stale result.
      </p>
    `,
  },
  {
    id: "form",
    title: "Form validation",
    demoStep: 4,
    content: () => html`
      <pre><code>${formCode}</code></pre>
      <p>
        <code>form.checkValidity()</code>/<code>reportValidity()</code> already aggregate across native
        inputs and any form-associated <code>lit-material</code> component (Text Field, Checkbox, Radio,
        Switch, Slider) via the same <code>ElementInternals</code> APIs — <code>FormController</code> just
        makes that aggregate result <em>reactive</em>, so the Save button above disables itself as the user
        types instead of only failing on submit.
      </p>
      <p>The demo's new <strong>Settings</strong> page is this exact code, wired up and running.</p>
    `,
  },
  {
    id: "i18n",
    title: "Internationalization (i18n)",
    demoStep: 5,
    content: () => html`
      <p>
        None of <code>lit-material</code>'s own components have hardcoded, translatable strings baked into
        their templates — every visible label is either slotted content or a consumer-supplied property
        (<code>aria-label</code>, <code>label</code>, etc.), so translating an app built with
        <code>lit-material</code> is purely about your own app's strings. <code>localeContext</code> is just
        the connective tissue for threading the active locale down the tree, the same shape
        <code>themeContext</code> uses for color scheme; combine it with
        <a href="https://www.npmjs.com/package/@lit/localize" target="_blank">@lit/localize</a> (the Lit
        team's own message-extraction/translation tool) for the actual translated strings:
      </p>
      <pre><code>${i18nCode}</code></pre>
      <p>
        Any component under the app shell reads <code>msg("Hello")</code>-wrapped strings (translated per
        <code>@lit/localize</code>'s own mechanism, independent of context) and, if it needs the
        <em>current locale value itself</em> (e.g. to format a date, or render a <code>dir</code>-aware
        layout), consumes <code>localeContext</code> the same way <code>counter-page.ts</code> above consumes
        <code>themeContext</code>.
      </p>
      <p>
        RTL (<code>dir="rtl"</code>): every component uses logical CSS properties
        (<code>margin-inline-start</code>, <code>padding-inline</code>, etc.), which flip automatically with
        <code>dir</code> — confirmed via a repo-wide fix pass (Switch's thumb, Navigation Rail's badge corner,
        Slider's filled track, and Linear Progress's fill/keyframes were all converted from physical
        <code>left</code>/<code>right</code>, each backed by a real-DOM test asserting the geometry actually
        mirrors under <code>dir="rtl"</code>) plus a read-through of Tabs' JS-computed indicator confirming it
        was already correct.
      </p>
      <p>
        The live demo on the right exercises <code>localeContext</code> with a small hand-written dictionary
        for simplicity — click the <strong>AR</strong> button and watch the layout mirror. Swap in
        <code>@lit/localize</code>'s <code>configureLocalization()</code>/<code>msg()</code> for real message
        extraction and XLIFF translation files in production.
      </p>
    `,
  },
  {
    id: "wrap-up",
    title: "What this doesn't cover",
    demoStep: 5,
    content: () => html`
      <p>
        <code>@lit/localize</code>'s own message extraction workflow (its CLI, not something
        <code>lit-material</code> wraps), and anything listed as a scope cut in an individual component's own
        README, are still out of scope.
      </p>
      <p>
        That's the whole stack: router, store, theme/locale context, data fetching, and form validation,
        wired together and running in the panel on the right — the same demo the whole way through, one
        feature richer per step.
      </p>
    `,
  },
];
