# @lit-material/form

## 0.0.2

### Patch Changes

- 3732023: Fix `FormController`'s initial validity check racing a form-associated child's own first update. A required-but-empty `Text Field` (or Checkbox/Radio/Switch/Slider) whose `ElementInternals` validity hadn't been set yet at the exact moment the form first attached could make the aggregate `valid` incorrectly report `true` until the next `input`/`change` event — the same class of race `handleChange` already accounted for, now also applied to the initial check.
