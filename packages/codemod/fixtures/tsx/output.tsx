import { useState } from "react";
import "@material/web/chips/chip-set.js";
import "@lit-material/chip";
import "@lit-material/select";
import "@lit-material/radio";
import "@lit-material/button";

export function Filters({ tags, onRemove }: { tags: string[]; onRemove: (tag: string) => void }) {
  const [size, setSize] = useState<string>("m");
  return (
    <section>
      <md-chip-set>
        <lit-material-chip variant="filter" selected elevated>Vegetarian</lit-material-chip>
        {tags.map((tag) => (
          <lit-material-chip variant="input" removable key={tag} onremove={() => onRemove(tag)}>{tag}</lit-material-chip>
        ))}
      </md-chip-set>
      <lit-material-select variant="outlined" label="Size" value={size} onchange={(e: Event) => setSize((e.target as HTMLSelectElement).value)}>
        <lit-material-select-option value="s">
          <div>Small</div>
        </lit-material-select-option>
        <lit-material-select-option value="m">
          <div>Medium</div>
          <div slot="supporting-text">Most popular</div>
        </lit-material-select-option>
      </lit-material-select>
      <label>
        <lit-material-radio name="ship" value="fast" checked={size === "s"} /> Fast
      </label>
      <lit-material-button variant="elevated" trailing-icon onClick={() => setSize("l")}>
        Large <lit-material-icon slot="icon">open_in_full</lit-material-icon>
      </lit-material-button>
    </section>
  );
}
