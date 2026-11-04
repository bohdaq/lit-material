import type { Message } from "@lit-material/core/localize.js";
import type { MessageKey } from "./en.js";

/**
 * A complete catalog: every key the components use, so a new component message fails the build of every
 * catalog until it's translated (or the catalog says so with the English text).
 */
export type Catalog = { $code: string; $name: string; $dir: "ltr" | "rtl" } & Record<MessageKey, Message>;
