import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // The site ports a hand-authored static design system that relies on
      // <img> with CSS aspect-ratio / object-fit. Plain <img> is intentional.
      "@next/next/no-img-element": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // CommonJS tooling config — not part of the app source.
    "jest.config.js",
    "jest.setup.js",
  ]),
]);

export default eslintConfig;
