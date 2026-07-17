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
  content: () => unknown;
}

// Every code block on this page is the *actual* apps/app-shell-demo source, pulled in verbatim via Vite's
// `?raw` import (a plain string at build time) — not a hand-typed approximation. What you read here is
// byte-for-byte what's running in the finished demo at the top of this guide; it cannot drift out of sync
// the way a hand-copied snippet can.
const installCode =
  "npm install @lit-material/router @lit-material/store @lit-material/core @lit-material/task @lit-material/form @lit/context lit";

export const wizardSteps: WizardStepConfig[] = [
  {
    id: "install",
    title: "Install",
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
        <code>setBasePath()</code>. The demo above is served under exactly that kind of nested path, so it
        needs this too:
      </p>
      <pre><code>${bootstrapRouterSource.trim()}</code></pre>
      <p>Skip this file entirely if your app is deployed at a domain root.</p>
      <p>The next steps walk through the rest of that demo's source, one file at a time.</p>
    `,
  },
  {
    id: "store",
    title: "A shared store",
    content: () => html`
      <p>
        Start with state that outlives any single page: a plain module-level <code>@lit-material/store</code>
        instance, the same Redux-shaped reducer pattern regardless of what reads or writes it later.
      </p>
      <pre><code>${storeSource.trim()}</code></pre>
      <p>
        On its own this is just state and a dispatcher — no UI reads it yet. That's deliberate: state and UI
        are separate concerns here, wired together next.
      </p>
    `,
  },
  {
    id: "wiring",
    title: "Router, theme context & the app shell",
    content: () => html`
      <p>
        The app shell owns the route outlet and provides <code>themeContext</code>
        (and, later, <code>localeContext</code> — already in this file, unused until the i18n step). This is
        the complete, current <code>app-shell.ts</code>:
      </p>
      <pre><code>${appShellSource.trim()}</code></pre>
      <p>Two of its pages read the store and the theme context:</p>
      <pre><code>${counterPageSource.trim()}</code></pre>
      <pre><code>${aboutPageSource.trim()}</code></pre>
      <p>
        Any same-origin <code>&lt;a href="/counter"&gt;</code> navigates via the outlet automatically; use
        <code>navigate("/counter")</code> from <code>@lit-material/router</code> for programmatic navigation
        (e.g. after <code>counterStore.dispatch({ type: "increment" })</code>).
      </p>
      <p>
        This is the router, store, and theme context wired together — click through to
        <strong>Counter</strong> and <strong>About</strong> in the demo above and back; the count survives the
        round trip.
      </p>
    `,
  },
  {
    id: "data",
    title: "Data fetching",
    content: () => html`
      <p>A route keyed by its own local state:</p>
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
        Click "Next user" a couple of times quickly on the <strong>Data</strong> page above and watch it never
        show a stale result.
      </p>
    `,
  },
  {
    id: "form",
    title: "Form validation",
    content: () => html`
      <pre><code>${settingsPageSource.trim()}</code></pre>
      <p>
        <code>form.checkValidity()</code>/<code>reportValidity()</code> already aggregate across native
        inputs and any form-associated <code>lit-material</code> component (Text Field, Checkbox, Radio,
        Switch, Slider) via the same <code>ElementInternals</code> APIs — <code>FormController</code> just
        makes that aggregate result <em>reactive</em>, so the Save button disables itself as you type an
        invalid email instead of only failing on submit.
      </p>
      <p>This is the exact, complete <strong>Settings</strong> page in the demo above.</p>
    `,
  },
  {
    id: "i18n",
    title: "Internationalization (i18n)",
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
      <p>And the complete, current <code>home-page.ts</code> — its top line reads that dictionary:</p>
      <pre><code>${homePageSource.trim()}</code></pre>
      <p>
        RTL (<code>dir="rtl"</code>): every component uses logical CSS properties
        (<code>margin-inline-start</code>, <code>padding-inline</code>, etc.), which flip automatically with
        <code>dir</code> — confirmed via a repo-wide fix pass (Switch's thumb, Navigation Rail's badge corner,
        Slider's filled track, and Linear Progress's fill/keyframes were all converted from physical
        <code>left</code>/<code>right</code>, each backed by a real-DOM test asserting the geometry actually
        mirrors under <code>dir="rtl"</code>) plus a read-through of Tabs' JS-computed indicator confirming it
        was already correct. Click the <strong>AR</strong> button in the demo above and watch the layout
        mirror.
      </p>
    `,
  },
  {
    id: "wrap-up",
    title: "What this doesn't cover",
    content: () => html`
      <p>
        <code>@lit/localize</code>'s own message extraction workflow (its CLI, not something
        <code>lit-material</code> wraps), and anything listed as a scope cut in an individual component's own
        README, are still out of scope.
      </p>
      <p>
        That's the whole stack: router, store, theme/locale context, data fetching, and form validation,
        wired together and running in the demo at the top of this guide — every code block above copied
        verbatim from its actual source.
      </p>
    `,
  },
];
