# @lit-material/text-field

## 0.2.0

### Minor Changes

- d7e23d1: `lit-material-number-field`: a number with −/+ buttons, arrow-key stepping, min/max/step without float drift, a unit suffix and range errors in words.

### Patch Changes

- dc110c6: `--lit-material-text-field-min-width` (default `210px`) so a grid or flex cell can make a field narrower.

## 0.1.2

### Patch Changes

- a95654f: Outlined text fields take `--lit-material-text-field-notch-color` for the patch behind their floating label; dialogs set it to their surface, so the label no longer shows a white box inside a dialog.

## 0.1.1

### Patch Changes

- f9ec833: Pressing Enter in a text field now submits its form, as with a native input. The input lives in the shadow root, so the browser never did this by itself.

## 0.1.0

### Minor Changes

- Add `lit-material-textarea`, a multi-line sibling to `lit-material-text-field` sharing its floating-label/filled/outlined/error-state/character-counter design and form participation. No leading/trailing icon slots or prefix/suffix — a multi-line body-text field has no natural place for those the way a single-line one does. Adds `rows` and `resize` properties, and a resting label that sits near the top of the box instead of vertically centering.
