/** @type {import("lint-staged").Configuration} */
const config = {
  "*.{js,mjs,cjs,ts,mts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,css,yml,yaml}": "prettier --write",
};

export default config;
