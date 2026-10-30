# @lit-material/text-field

## 0.1.1

### Patch Changes

- f9ec833: Pressing Enter in a text field now submits its form, as with a native input. The input lives in the shadow root, so the browser never did this by itself.

## 0.1.0

### Minor Changes

- Add `lit-material-textarea`, a multi-line sibling to `lit-material-text-field` sharing its floating-label/filled/outlined/error-state/character-counter design and form participation. No leading/trailing icon slots or prefix/suffix — a multi-line body-text field has no natural place for those the way a single-line one does. Adds `rows` and `resize` properties, and a resting label that sits near the top of the box instead of vertically centering.
