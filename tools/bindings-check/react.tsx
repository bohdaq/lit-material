// React 18-style wrappers and React 19 JSX typings, used as an app would.
import { Button } from "@lit-material/button/react";
import { Checkbox } from "@lit-material/checkbox/react";
import { RouterOutlet } from "@lit-material/router/react";
import type { LitMaterialCheckbox } from "../../packages/checkbox/dist/checkbox.js";

export const wrappers = (
  <>
    <Button variant="tonal" disabled onClick={() => undefined}>
      Save
    </Button>
    <Checkbox
      checked
      label="Accept"
      onChange={(event) => {
        const checked: boolean = (event.target as LitMaterialCheckbox).checked;
        return checked;
      }}
    />
    <RouterOutlet titleTemplate="%s · App" onLitMaterialRouteError={(event) => event.type} />
    {/* @ts-expect-error not a button variant */}
    <Button variant="huge" />
  </>
);

export const elements = (
  <>
    <lit-material-button variant="outlined" className="save" disabled>
      Save
    </lit-material-button>
    <lit-material-checkbox checked label="Accept" onchange={(event: Event) => event.type} />
    {/* @ts-expect-error not a button variant */}
    <lit-material-button variant="huge"></lit-material-button>
    {/* @ts-expect-error checked is a boolean */}
    <lit-material-checkbox checked="yes"></lit-material-checkbox>
  </>
);
