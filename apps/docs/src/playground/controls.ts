export type PlaygroundControl =
  | { kind: "select"; key: string; label: string; options: string[]; default: string }
  | { kind: "boolean"; key: string; label: string; default: boolean }
  | { kind: "text"; key: string; label: string; default: string };

export type PlaygroundState = Record<string, string | boolean>;

export function defaultState(controls: PlaygroundControl[]): PlaygroundState {
  const state: PlaygroundState = {};
  for (const control of controls) {
    state[control.key] = control.default;
  }
  return state;
}
