import "@lit-material/button";
import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { pageStyles } from "../styles/page-styles.js";
import { guidePageStyles } from "../styles/guide-page-styles.js";
import { withBase } from "../with-base.js";
import { wizardSteps } from "../wizard/wizard-steps.js";
import "../wizard/docs-stepper.js";

const IFRAME_LOAD_TIMEOUT_MS = 4000;

@customElement("docs-building-apps-page")
export class DocsBuildingAppsPage extends LitElement {
  static override styles = [
    pageStyles,
    guidePageStyles,
    css`
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

      .demo {
        position: relative;
        margin: 0 0 2rem;
        border: 1px solid var(--md-sys-color-outline-variant);
        border-radius: 14px;
        overflow: hidden;
        background: var(--md-sys-color-surface-container-lowest);
      }
      .demo-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.6rem 1rem;
        background: var(--md-sys-color-surface-container-low);
        border-bottom: 1px solid var(--md-sys-color-outline-variant);
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--md-sys-color-on-surface-variant);
      }
      iframe.demo-frame {
        display: block;
        width: 100%;
        height: 420px;
        border: none;
        background: var(--md-sys-color-surface);
      }
      .demo-fallback {
        position: absolute;
        inset: 0;
        top: 2.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
        text-align: center;
        background: var(--md-sys-color-surface-container-lowest);
      }
      .demo-fallback p {
        margin: 0;
      }
      .demo-hint {
        font-size: 0.8rem;
        margin: -1.25rem 0 2rem;
      }

      .nav-buttons {
        display: flex;
        justify-content: space-between;
        margin-top: 1.5rem;
      }
    `,
  ];

  @state() private currentIndex = 0;
  @state() private furthest = 0;
  @state() private iframeFailed = false;

  private iframeLoadTimer?: ReturnType<typeof setTimeout>;

  override connectedCallback(): void {
    super.connectedCallback();
    this.armIframeLoadTimer();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    clearTimeout(this.iframeLoadTimer);
  }

  private readonly iframeSrc = withBase("/app-shell-demo/");

  override render() {
    // wizardSteps is a fixed, non-empty literal array and currentIndex is always kept in [0, length)
    // by handleNext/handleBack/handleStepSelect, so this index access is safe.
    const step = wizardSteps[this.currentIndex]!;
    const isLast = this.currentIndex === wizardSteps.length - 1;

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

      <div class="demo">
        <div class="demo-header">The finished app, running live</div>
        <iframe
          class="demo-frame"
          title="lit-material app-shell demo"
          src=${this.iframeSrc}
          @load=${this.handleIframeLoad}
        ></iframe>
        ${this.iframeFailed
          ? html`
              <div class="demo-fallback">
                <p>
                  Couldn't load the live demo. If you're running the docs site locally, build the demo first
                  (<code>pnpm --filter @lit-material/app-shell-demo dev</code>) or view the
                  <a href="https://bohdaq.github.io/lit-material/guide/building-apps" target="_blank"
                    >deployed site</a
                  >.
                </p>
              </div>
            `
          : null}
      </div>
      <p class="demo-hint">
        Running the docs site locally? <code>pnpm --filter @lit-material/app-shell-demo dev</code> to preview
        this demo in isolation.
      </p>

      <docs-stepper
        .steps=${wizardSteps.map((s) => ({ title: s.title }))}
        .current=${this.currentIndex}
        .furthest=${this.furthest}
        @step-select=${this.handleStepSelect}
      ></docs-stepper>

      <section class="doc-section">
        <h2>${step.title}</h2>
        ${step.content()}
      </section>

      <div class="nav-buttons">
        <lit-material-button variant="outlined" ?disabled=${this.currentIndex === 0} @click=${this.handleBack}>
          Back
        </lit-material-button>
        <lit-material-button variant="filled" @click=${this.handleNext} ?disabled=${isLast}>
          ${isLast ? "Done" : "Next"}
        </lit-material-button>
      </div>
    `;
  }

  private armIframeLoadTimer(): void {
    this.iframeFailed = false;
    clearTimeout(this.iframeLoadTimer);
    this.iframeLoadTimer = setTimeout(() => {
      this.iframeFailed = true;
    }, IFRAME_LOAD_TIMEOUT_MS);
  }

  private readonly handleIframeLoad = (event: Event): void => {
    // The iframe's `load` event fires even when the navigation itself failed (e.g. an aborted request
    // or a DNS/connection error) — the browser's own error page still "loads". Confirm the frame actually
    // landed on app-shell-demo, not an error page, before treating this as success.
    const iframe = event.target as HTMLIFrameElement;
    let reachedDemo = false;
    try {
      reachedDemo = !!iframe.contentWindow?.location.href.includes("/app-shell-demo/");
    } catch {
      reachedDemo = false;
    }

    if (reachedDemo) {
      clearTimeout(this.iframeLoadTimer);
      this.iframeFailed = false;
    } else {
      this.iframeFailed = true;
    }
  };

  private readonly handleNext = (): void => {
    if (this.currentIndex >= wizardSteps.length - 1) return;
    this.currentIndex += 1;
    this.furthest = Math.max(this.furthest, this.currentIndex);
  };

  private readonly handleBack = (): void => {
    if (this.currentIndex === 0) return;
    this.currentIndex -= 1;
  };

  private readonly handleStepSelect = (event: CustomEvent<{ index: number }>): void => {
    if (event.detail.index > this.furthest) return;
    this.currentIndex = event.detail.index;
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-building-apps-page": DocsBuildingAppsPage;
  }
}
