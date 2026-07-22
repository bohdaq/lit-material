import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    /* A container query can't target the same element that establishes the
       containment context — the container has to be an ancestor of what it
       queries. So :host only establishes containment; the actual flex row
       that responds to it lives one level down, on .layout. */
    container-type: inline-size;
  }

  .layout {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    gap: var(--lit-material-sidebar-gap, 24px);
  }

  :host([position="end"]) .layout {
    flex-direction: row-reverse;
  }

  .panel {
    flex: 0 0 var(--lit-material-sidebar-panel-width, 20rem);
    min-width: 0;
  }

  .content {
    flex: 1 1 0;
    min-width: 0;
  }

  @container (max-width: 640px) {
    .layout {
      flex-direction: column;
    }

    :host([position="end"]) .layout {
      flex-direction: column-reverse;
    }

    .panel {
      flex-basis: auto;
    }
  }
`;
