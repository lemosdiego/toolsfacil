import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // HTML cru só pelo JsonLd, que escapa o conteúdo (regra do CLAUDE.md).
    rules: { "react/no-danger": "error" },
  },
  {
    files: ["src/components/seo/json-ld.tsx"],
    rules: { "react/no-danger": "off" },
  },
  // Desliga as regras de estilo que conflitam com o Prettier (deve ser o último).
  prettier,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "next-env.d.ts",
    "test-results/**",
    "playwright-report/**",
    "blob-report/**",
  ]),
]);

export default eslintConfig;
