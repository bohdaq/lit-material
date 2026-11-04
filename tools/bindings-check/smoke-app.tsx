// Rendered in Chromium by smoke.mjs: a React wrapper and a bare element, both clicked.
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { Checkbox } from "@lit-material/checkbox/react";
import "@lit-material/checkbox";

const log: string[] = [];
(window as unknown as { log: string[] }).log = log;

const root = createRoot(document.getElementById("root")!);
flushSync(() =>
  root.render(
    <>
      <Checkbox id="wrapped" label="Wrapped" onChange={(event) => log.push(`wrapped:${event.type}`)} />
      <lit-material-checkbox id="native" label="Native" onchange={(event: Event) => log.push(`native:${event.type}`)} />
    </>,
  ),
);
(window as unknown as { ready: boolean }).ready = true;
