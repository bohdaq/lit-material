import { html } from "lit";
import mainSource from "../../../app-shell-demo/src/main.ts?raw";
import bootstrapRouterSource from "../../../app-shell-demo/src/bootstrap-router.ts?raw";
import storeSource from "../../../app-shell-demo/src/store.ts?raw";
import appShellSource from "../../../app-shell-demo/src/app-shell.ts?raw";
import counterPageSource from "../../../app-shell-demo/src/counter-page.ts?raw";
import aboutPageSource from "../../../app-shell-demo/src/about-page.ts?raw";
import dataPageSource from "../../../app-shell-demo/src/data-page.ts?raw";
import settingsPageSource from "../../../app-shell-demo/src/settings-page.ts?raw";
import i18nSource from "../../../app-shell-demo/src/i18n.ts?raw";
import homePageSource from "../../../app-shell-demo/src/home-page.ts?raw";

export interface WizardStepConfig {
  id: string;
  title: string;
  /** `?step=` value passed to the embedded app-shell-demo iframe (see apps/app-shell-demo/src/wizard-step.ts). */
  demoStep: 1 | 2 | 3 | 4 | 5;
  content: () => unknown;
}

// Every code block on this page is the *actual* apps/app-shell-demo source, pulled in verbatim via Vite's
// `?raw` import (a plain string at build time) — not a hand-typed approximation. What you read here is
// byte-for-byte what's running in the live demo on the right; it cannot drift out of sync the way a
// hand-copied snippet can.
const installCode =
  "npm install @lit-material/router @lit-material/store @lit-material/core @lit-material/task @lit-material/form @lit/context lit";

export const wizardSteps: WizardStepConfig[] = [
  {
    id: "install",
    title: "Install",
    demoStep: 1,
    content: () => html`
      <pre><code>${installCode}</code></pre>
      <p>Add <code>@lit/localize</code> too if you're using the i18n step later on.</p>
      <p>
        The entry point is tiny — <code>main.ts</code> loads the design tokens, then the app shell:
      </p>
      <pre><code>${mainSource.trim()}</code></pre>
      <p>
        Deploying under a sub-path (a GitHub Pages project site, for instance, not a domain root) needs one
        more line before anything reads the current URL — <code>@lit-material/router</code>'s
        <code>setBasePath()</code>. This demo is embedded in an <code>&lt;iframe&gt;</code> under exactly that
        kind of nested path, so it needs this too:
      </p>
      <pre><code>${bootstrapRouterSource.trim()}</code></pre>
      <p>Skip this file entirely if your app is deployed at a domain root.</p>
      <p>
        The demo on the right starts from nothing but a home page — no router destinations yet. Each step
        from here adds one more piece.
      </p>
    `,
  },
  {
    id: "store",
    title: "A shared store",
    demoStep: 1,
    content: () => html`
      <p>
        Start with state that outlives any single page: a plain module-level <code>@lit-material/store</code>
        instance, the same Redux-shaped reducer pattern regardless of what reads or writes it later.
      </p>
      <pre><code>${storeSource.trim()}</code></pre>
      <p>
        Nothing reads this yet — the demo on the right hasn't changed. That's the point: state and UI are
        separate concerns here, wired together next.
      </p>
    `,
  },
  {
    id: "wiring",
    title: "Router, theme context & the app shell",
    demoStep: 2,
    content: () => html`
      <p>
        The app shell owns the route outlet and provides <code>themeContext</code>
        (and, later, <code>localeContext</code> — already in this file, unused until the i18n step). This is
        the complete, current <code>app-shell.ts</code>:
      </p>
      <pre><code>${appShellSource.trim()}</code></pre>
      <p>
        The <code>wizardStep</code>/<code>unlockedAt</code>/<code>demoEntries</code> machinery at the top is
        <em>this tutorial's own</em> progressive-reveal switch, not something your app would have — in a real
        app <code>routes</code> would just be a plain, fixed array from day one. Everything else is real: a
        <code>ContextProvider</code>, a <code>RouteConfig</code> array, one
        <code>&lt;lit-material-router-outlet .routes=$&#123;routes&#125;&gt;</code>.
      </p>
      <p>Two pages now exist behind that outlet, both reading the store and the theme context:</p>
      <pre><code>${counterPageSource.trim()}</code></pre>
      <pre><code>${aboutPageSource.trim()}</code></pre>
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
      <p>A new route, keyed by its own local state:</p>
      <pre><code>${dataPageSource.trim()}</code></pre>
      <p>
        <code>TaskController</code> re-runs <code>task</code> automatically whenever <code>args()</code>
        returns a shallowly different value (checked before every render), aborting a superseded run via the
        <code>AbortSignal</code> it passes in — no stale-response race if you ask for a different user again
        before the first fetch resolves. There's no real backend here, so <code>fetchFakeUser</code> stands in
        for a real <code>fetch()</code> call with an artificial delay — it's the abort/re-run mechanics being
        demonstrated, not the transport.
      </p>
      <p>
        Click "Next user" a couple of times quickly in the <strong>Data</strong> page on the right and watch
        it never show a stale result.
      </p>
    `,
  },
  {
    id: "form",
    title: "Form validation",
    demoStep: 4,
    content: () => html`
      <pre><code>${settingsPageSource.trim()}</code></pre>
      <p>
        <code>form.checkValidity()</code>/<code>reportValidity()</code> already aggregate across native
        inputs and any form-associated <code>lit-material</code> component (Text Field, Checkbox, Radio,
        Switch, Slider) via the same <code>ElementInternals</code> APIs — <code>FormController</code> just
        makes that aggregate result <em>reactive</em>, so the Save button disables itself as you type an
        invalid email instead of only failing on submit.
      </p>
      <p>This is the exact, complete <strong>Settings</strong> page running on the right.</p>
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
        <code>lit-material</code> is purely about your own app's strings. <code>localeContext</code> (already
        provided by <code>app-shell.ts</code> above, alongside <code>themeContext</code>) is just the
        connective tissue for threading the active locale down the tree.
      </p>
      <p>
        This demo pairs it with a small hand-written dictionary, not the real
        <a href="https://www.npmjs.com/package/@lit/localize" target="_blank">@lit/localize</a> toolchain —
        message extraction/XLIFF is real build tooling that would be a distraction from the point being made
        here. Swap in <code>@lit/localize</code>'s <code>configureLocalization()</code>/<code>msg()</code> for
        the production-grade version.
      </p>
      <pre><code>${i18nSource.trim()}</code></pre>
      <p>And the complete, current <code>home-page.ts</code> — the greeting line at the top is what's new:</p>
      <pre><code>${homePageSource.trim()}</code></pre>
      <p>
        Same caveat as <code>app-shell.ts</code>: the <code>wizardStep</code> checks are this tutorial's
        progressive reveal, not your app's code — a real <code>home-page.ts</code> would just have the
        content, unconditionally.
      </p>
      <p>
        RTL (<code>dir="rtl"</code>): every component uses logical CSS properties
        (<code>margin-inline-start</code>, <code>padding-inline</code>, etc.), which flip automatically with
        <code>dir</code> — confirmed via a repo-wide fix pass (Switch's thumb, Navigation Rail's badge corner,
        Slider's filled track, and Linear Progress's fill/keyframes were all converted from physical
        <code>left</code>/<code>right</code>, each backed by a real-DOM test asserting the geometry actually
        mirrors under <code>dir="rtl"</code>) plus a read-through of Tabs' JS-computed indicator confirming it
        was already correct. Click the <strong>AR</strong> button on the right and watch the layout mirror.
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
        feature richer per step, every code block above copied verbatim from its actual source.
      </p>
    `,
  },
];
