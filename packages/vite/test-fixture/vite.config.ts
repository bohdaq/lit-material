import { litMaterial } from "../dist/index.js";

export default {
  plugins: [litMaterial({ prerender: ["/", "/users/1", "/old", "/404"] })],
};
