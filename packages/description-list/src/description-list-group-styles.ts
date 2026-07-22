import { css } from "lit";

export const styles = css`
  :host {
    /* Not a box of its own: the outer list's grid/block layout needs to see
       this group's own term/description divs directly as its flattened
       children, the same way lit-material-panel's header/footer slots need
       to disappear from the box tree so an absent one draws nothing. */
    display: contents;
  }

  /* Both start with padding-block-start: 0 and the same line-height —
     deliberately, not just incidentally. In horizontal mode, term and
     description land in the same CSS grid row (see
     lit-material-description-list); if either their padding or their
     line-height differed, their text would render at different heights
     within that shared row despite the row itself being correctly aligned
     — a mismatched line-height shifts the glyphs within an otherwise
     equally-positioned line box just as much as mismatched padding does.
     All of the spacing *between* groups lives on .description's bottom
     padding instead, which doesn't create that asymmetry. */
  .term {
    margin: 0;
    padding-block: 0 4px;
    color: var(--md-sys-color-on-surface-variant, #49454f);
    font-family: var(--md-sys-typescale-label-large-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-label-large-size, 0.875rem);
    font-weight: var(--md-sys-typescale-label-large-weight, 500);
    line-height: var(--md-sys-typescale-body-medium-line-height, 1.25rem);
  }

  .description {
    margin: 0;
    padding-block: 0 16px;
    color: var(--md-sys-color-on-surface, #1c1b1f);
    font-family: var(--md-sys-typescale-body-medium-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
    line-height: var(--md-sys-typescale-body-medium-line-height, 1.25rem);
  }

  :host(:last-of-type) .description {
    padding-block-end: 0;
  }
`;
