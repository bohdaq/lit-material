import { defineConfig } from "vite";
import { litMaterial } from "@lit-material/vite";

export default defineConfig({
  // Every page is rendered on the server (in dev too). `prerender` also writes these pages to static HTML
  // on `npm run build`; drop it if you only run the Node server.
  plugins: [litMaterial({ prerender: ["/", "/about", "/posts/hello", "/404"] })],
});
