import { createContext } from "@lit/context";

export type ColorScheme = "light" | "dark" | "auto";

export interface ThemeState {
  colorScheme: ColorScheme;
  seedColor?: string;
}

/**
 * Shared context key for threading MD3 theme state (dark/light mode, an
 * optional Material You seed color) down a component tree without prop
 * drilling — the `lit-material` equivalent of a React theme context.
 *
 * `@lit-material/core` only defines the shared key and value shape here;
 * provide it with `@lit/context`'s own `ContextProvider`/`@provide` and
 * consume it with `ContextConsumer`/`@consume` directly. Re-exporting the
 * whole `@lit/context` API from this package would be exactly the "required
 * adapter layer" lit-material otherwise avoids for no added value — install
 * `@lit/context` alongside this package to use the context yourself.
 */
export const themeContext = createContext<ThemeState>(Symbol("lit-material-theme"));
