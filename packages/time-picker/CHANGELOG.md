# @lit-material/time-picker

## 0.0.2

### Patch Changes

- Fix the dial's selection line pointing 180° off from the selected hour/minute. The line's unrotated baseline extended downward from the dial center while the rotation angle (and the selection dot's position) assumed 0° points up, so the line and the dot/field disagreed on every selection except the two that happen to land on that shared axis.
