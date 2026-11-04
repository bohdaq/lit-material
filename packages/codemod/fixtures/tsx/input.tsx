import { useState } from "react";
import "@material/web/chips/chip-set.js";
import "@material/web/chips/filter-chip.js";
import "@material/web/chips/input-chip.js";
import "@material/web/select/outlined-select.js";
import "@material/web/select/select-option.js";
import "@material/web/radio/radio.js";
import "@material/web/button/elevated-button.js";

export function Filters({ tags, onRemove }: { tags: string[]; onRemove: (tag: string) => void }) {
  const [size, setSize] = useState<string>("m");
  return (
    <section>
      <md-chip-set>
        <md-filter-chip label="Vegetarian" selected elevated />
        {tags.map((tag) => (
          <md-input-chip key={tag} label={tag} onremove={() => onRemove(tag)} />
        ))}
      </md-chip-set>
      <md-outlined-select label="Size" value={size} onchange={(e: Event) => setSize((e.target as HTMLSelectElement).value)} quick>
        <md-select-option value="s">
          <div slot="headline">Small</div>
        </md-select-option>
        <md-select-option value="m">
          <div slot="headline">Medium</div>
          <div slot="supporting-text">Most popular</div>
        </md-select-option>
      </md-outlined-select>
      <label>
        <md-radio name="ship" value="fast" checked={size === "s"} /> Fast
      </label>
      <md-elevated-button trailing-icon onClick={() => setSize("l")}>
        Large <md-icon slot="icon">open_in_full</md-icon>
      </md-elevated-button>
    </section>
  );
}
