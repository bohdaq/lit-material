# @lit-material/sortable

## 0.2.1

### Patch Changes

- b845bdf: Grid layout: dropping past the last item of a row draws the line after that item, on the pointer's row, instead of before the next row's first item.

## 0.2.0

### Minor Changes

- d65e91e: `layout="grid"` sorts items laid out in rows (card grids, wrapping chips, a horizontal row): reading-order drop slots, RTL included, an upright drop line between items, and ↑/↓ moving a row from the keyboard.

## 0.1.1

### Patch Changes

- 571cf0b: A key pressed right after a keyboard move (Space to drop, another arrow) is no longer lost while the list re-renders: focus returns to the handle as soon as the re-render finishes.

## 0.1.0

### Minor Changes

- d3bba34: New package: `lit-material-sortable`: reorder items by pointer, touch or keyboard, within or between lists, with screen reader announcements.
