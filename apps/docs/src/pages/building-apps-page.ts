import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";
import { pageStyles } from "../styles/page-styles.js";

const installCode =
  "npm install @lit-material/router @lit-material/store @lit-material/core @lit-material/task @lit-material/form @lit/context lit";

const storeCode = [
  "// store.ts — one module-level store instance, shared across the app.",
  'import { createStore } from "@lit-material/store";',
  "",
  "export interface AppState {",
  "  user: { name: string } | null;",
  "}",
  "",
  'type AppAction = { type: "login"; name: string } | { type: "logout" };',
  "",
  "function reducer(state: AppState, action: AppAction): AppState {",
  "  switch (action.type) {",
  '    case "login":',
  "      return { user: { name: action.name } };",
  '    case "logout":',
  "      return { user: null };",
  "  }",
  "}",
  "",
  "export const appStore = createStore(reducer, { user: null });",
].join("\n");

const appShellCode = [
  "// app-shell.ts — provides the theme context and owns the route outlet.",
  'import "@lit-material/router";',
  'import type { RouteConfig } from "@lit-material/router";',
  'import { themeContext, type ThemeState } from "@lit-material/core";',
  'import { ContextProvider } from "@lit/context";',
  'import { LitElement, html } from "lit";',
  'import "./home-page.js";',
  'import "./profile-page.js";',
  "",
  "const routes: RouteConfig<unknown>[] = [",
  '  { path: "/", render: () => html`<home-page></home-page>` },',
  '  { path: "/profile", render: () => html`<profile-page></profile-page>` },',
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

const profilePageCode = [
  "// profile-page.ts — reads both the store (for app state) and the theme",
  "// context (for cross-cutting UI state), the same two mechanisms a React app",
  "// would reach for useSelector/dispatch and useContext.",
  'import { StoreController } from "@lit-material/store";',
  'import { themeContext } from "@lit-material/core";',
  'import { ContextConsumer } from "@lit/context";',
  'import { LitElement, html } from "lit";',
  'import { appStore } from "./store.js";',
  "",
  "class ProfilePage extends LitElement {",
  "  private readonly user = new StoreController(this, appStore, (state) => state.user);",
  '  private readonly theme = new ContextConsumer(this, { context: themeContext, subscribe: true });',
  "",
  "  override render() {",
  "    return html`",
  "      <p>Color scheme: ${this.theme.value?.colorScheme}</p>",
  '      <p>${this.user.value ? `Hi, ${this.user.value.name}` : "Not logged in"}</p>',
  "    `;",
  "  }",
  "}",
  'customElements.define("profile-page", ProfilePage);',
].join("\n");

const taskCode = [
  "// profile-page.ts, extended — fetch the profile itself, keyed by a route param.",
  'import { TaskController } from "@lit-material/task";',
  'import { html } from "lit";',
  "",
  "class ProfilePage extends LitElement {",
  "  // ...theme/store as above...",
  "",
  "  private readonly profileTask = new TaskController(this, {",
  "    task: ([userId], signal) => fetch(`/api/users/${userId}`, { signal }).then((r) => r.json()),",
  "    args: () => [this.user.value?.name] as const,",
  "  });",
  "",
  "  override render() {",
  "    return this.profileTask.render({",
  "      pending: () => html`Loading…`,",
  "      complete: (profile) => html`<p>${profile.bio}</p>`,",
  "      error: () => html`Couldn't load profile.`,",
  "    });",
  "  }",
  "}",
].join("\n");

const formCode = [
  "// settings-page.ts",
  'import { FormController } from "@lit-material/form";',
  'import { html } from "lit";',
  'import { query } from "lit/decorators.js";',
  'import "@lit-material/text-field";',
  'import "@lit-material/button";',
  "",
  "class SettingsPage extends LitElement {",
  '  @query("form") private readonly formEl?: HTMLFormElement;',
  "  private readonly form = new FormController(this, () => this.formEl);",
  "",
  "  override render() {",
  "    return html`",
  "      <form @submit=${this.handleSubmit}>",
  '        <lit-material-text-field name="email" label="Email" required type="email"></lit-material-text-field>',
  '        <lit-material-button type="submit" ?disabled=${!this.form.valid}>Save</lit-material-button>',
  "      </form>",
  "    `;",
  "  }",
  "",
  "  private handleSubmit(event: SubmitEvent): void {",
  "    if (!this.form.reportValidity()) event.preventDefault();",
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
  "  // ...theme provider as above...",
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

@customElement("docs-building-apps-page")
export class DocsBuildingAppsPage extends LitElement {
  static override styles = [
    pageStyles,
    css`
      :host {
        max-width: 760px;
      }

      .eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--md-sys-color-primary);
        margin-bottom: 1rem;
      }
      .eyebrow::before {
        content: "";
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--md-sys-color-primary);
      }

      .lede {
        font-size: 1.1rem;
        max-width: 62ch;
      }

      ul.packages {
        padding: 0;
        margin: 0 0 2rem;
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }
      ul.packages li {
        font-size: 0.9rem;
        color: var(--md-sys-color-on-surface-variant);
      }

      .doc-section {
        display: block;
        padding: 1.75rem;
        margin: 0 0 1.25rem;
      }
      .doc-section h2 {
        text-transform: none;
        font-size: 1.3rem;
        font-weight: 800;
        letter-spacing: -0.01em;
        color: var(--md-sys-color-on-background);
        margin-bottom: 0.75rem;
      }
    `,
  ];

  override render() {
    return html`
      <div class="eyebrow">Guide</div>
      <h1>Building apps with lit-material</h1>
      <p class="lede">
        The component packages (button, dialog, navigation, …) are enough to build individual UI, but a whole
        application typically also needs a router, a place for cross-cutting state, and a way to thread values
        (like the current theme) down a component tree without prop drilling — the trio a React app usually
        reaches for (router, context, Redux). This guide wires up the <code>lit-material</code> equivalents in
        one minimal example, then extends it with data fetching, form validation, and i18n. See each package's
        own README for full API detail:
      </p>
      <ul class="packages">
        <li><code>@lit-material/router</code> — SPA routing.</li>
        <li><code>@lit-material/store</code> — a Redux-shaped state store.</li>
        <li>
          <code>@lit-material/core</code>'s <code>themeContext</code>/<code>localeContext</code> — built on the
          standard <a href="https://www.npmjs.com/package/@lit/context" target="_blank">@lit/context</a>
          protocol.
        </li>
        <li><code>@lit-material/task</code> — a reactive controller for async work (data fetching).</li>
        <li><code>@lit-material/form</code> — a reactive controller tracking a form's aggregate validity.</li>
      </ul>

      <section class="doc-section">
        <h2>Install</h2>
        <pre><code>${installCode}</code></pre>
        <p>Add <code>@lit/localize</code> too if you're using the i18n section below.</p>
      </section>

      <section class="doc-section">
        <h2>Wiring it together</h2>
        <pre><code>${storeCode}</code></pre>
        <pre><code>${appShellCode}</code></pre>
        <pre><code>${profilePageCode}</code></pre>
        <p>
          Any same-origin <code>&lt;a href="/profile"&gt;</code> navigates via the outlet automatically; use
          <code>navigate("/profile")</code> from <code>@lit-material/router</code> for programmatic navigation
          (e.g. after <code>appStore.dispatch({ type: "login", name })</code>).
        </p>
      </section>

      <section class="doc-section">
        <h2>Data fetching</h2>
        <pre><code>${taskCode}</code></pre>
        <p>
          <code>TaskController</code> re-runs <code>task</code> automatically whenever <code>args()</code>
          returns a shallowly different value (checked before every render), aborting a superseded run via the
          <code>AbortSignal</code> it passes in — no stale-response race if <code>userId</code> changes again
          before the first fetch resolves.
        </p>
      </section>

      <section class="doc-section">
        <h2>Form validation</h2>
        <pre><code>${formCode}</code></pre>
        <p>
          <code>form.checkValidity()</code>/<code>reportValidity()</code> already aggregate across native
          inputs and any form-associated <code>lit-material</code> component (Text Field, Checkbox, Radio,
          Switch, Slider) via the same <code>ElementInternals</code> APIs — <code>FormController</code> just
          makes that aggregate result <em>reactive</em>, so the Save button above disables itself as the user
          types instead of only failing on submit.
        </p>
      </section>

      <section class="doc-section">
        <h2>Internationalization (i18n)</h2>
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
          layout), consumes <code>localeContext</code> the same way <code>profile-page.ts</code> above consumes
          <code>themeContext</code>.
        </p>
        <p>
          RTL (<code>dir="rtl"</code>): most components use logical CSS properties (<code>margin-inline-start</code>,
          <code>padding-inline</code>, etc.), which flip automatically with <code>dir</code> — but this hasn't
          been comprehensively audited, and a handful of components position elements with physical
          <code>left</code>/<code>right</code> in ways that won't mirror correctly (Switch's thumb position is
          one confirmed example). Full RTL verification across every component remains open — see
          <a
            href="https://github.com/bohdaq/lit-material/blob/main/spec/PLAN.md"
            target="_blank"
            >spec/PLAN.md</a
          >'s "Unverified quality-bar items."
        </p>
      </section>

      <section class="doc-section">
        <h2>What this doesn't cover</h2>
        <p>
          Pagination/column-resizing/row-virtualization for <code>@lit-material/data-table</code>,
          <code>@lit/localize</code>'s own message extraction workflow (its CLI, not something
          <code>lit-material</code> wraps), and anything listed as a scope cut in an individual component's own
          README are still out of scope — see
          <a
            href="https://github.com/bohdaq/lit-material/blob/main/spec/PLAN.md"
            target="_blank"
            >spec/PLAN.md</a
          >
          for the full current-status picture and open questions.
        </p>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-building-apps-page": DocsBuildingAppsPage;
  }
}
