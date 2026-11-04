// Vue GlobalComponents typings, checked the way Volar reads them: as component props.
import type { GlobalComponents } from "vue";

type PropsOf<Tag extends keyof GlobalComponents> = InstanceType<GlobalComponents[Tag]>["$props"];

export const button: PropsOf<"lit-material-button"> = { variant: "text", disabled: true };
export const checkbox: PropsOf<"lit-material-checkbox"> = { checked: true, onChange: (event: Event) => event.type };

// @ts-expect-error not a button variant
export const wrong: PropsOf<"lit-material-button"> = { variant: "huge" };
