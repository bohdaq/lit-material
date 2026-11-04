// The production server: `npm run build`, then `npm start`. Static files come from dist/, every page is
// rendered on the server by the build's entry (status codes, redirects, titles and loader data included).
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { createRequestHandler, toNodeListener } from "@lit-material/vite/server";

const handler = createRequestHandler({
  template: readFileSync("dist/server/template.html", "utf8"),
  entry: () => import("./dist/server/entry-server.js"),
});

const port = Number(process.env.PORT ?? 3000);
createServer(toNodeListener(handler, { staticDir: "dist" })).listen(port, () => {
  console.log(`{{PROJECT_NAME}} on http://localhost:${port}`);
});
