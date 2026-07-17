import { themeContext, localeContext } from "@lit-material/core";
import { ContextConsumer } from "@lit/context";
import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";
import { t, type Locale } from "./i18n.js";

@customElement("demo-home-page")
export class DemoHomePage extends LitElement {
  static override styles = css`
    :host {
      display: block;
      max-width: 640px;
    }
    code {
      background: var(--md-sys-color-surface-variant);
      color: var(--md-sys-color-on-surface-variant);
      padding: 0.1em 0.4em;
      border-radius: 4px;
    }
  `;

  private readonly theme = new ContextConsumer(this, { context: themeContext, subscribe: true });
  private readonly locale = new ContextConsumer(this, { context: localeContext, subscribe: true });

  override render() {
    return html`
      <h1>lit-material app-shell demo</h1>
      <p>
        ${t(this.locale.value?.locale as Locale, "greeting")} —
        ${t(this.locale.value?.locale as Locale, "tagline")}
      </p>
      <p>
        This page, <code>/counter</code>, and <code>/about</code> are three separate routes rendered by
        <code>&lt;lit-material-router-outlet&gt;</code> from <code>@lit-material/router</code>. Use the
        links in the top bar, or click below — every navigation is a client-side route change, not a
        full page reload (open devtools' Network tab and watch).
      </p>
      <p>
        The counter on <code>/counter</code> lives in a <code>@lit-material/store</code> instance shared
        by this whole app: navigate away and back and its value is still there. The current color scheme
        (<strong>${this.theme.value?.colorScheme}</strong>) comes from <code>@lit-material/core</code>'s
        <code>themeContext</code>, provided once in the app shell and read here via
        <code>@lit/context</code> — no prop drilling.
      </p>
      <p><a href="/counter">Go to the counter →</a></p>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "demo-home-page": DemoHomePage;
  }
}
