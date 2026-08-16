import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Skills de agentes instaladas con `npx skills add`: son código de
    // terceros que no forma parte de la app y no tiene por qué cumplir
    // nuestras reglas de lint.
    "agent/**",
    ".agents/**",
    ".claude/**",
  ]),
]);

export default eslintConfig;
