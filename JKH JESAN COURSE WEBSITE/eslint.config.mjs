import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "**/project_backups/**",
    "**/backups/**",
    "**/NETLIFY_UPLOAD/**",
    "**/uddoktapay-installer/**",
    "**/scratch/**",
    "**/scripts/**",
    "**/prisma/**",
    "*.config.mjs",
    "*.config.js",
    "*.config.ts"
  ]),
  {
    linterOptions: {
      reportUnusedDisableDirectives: "off"
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-require-imports": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
      "react-compiler/react-compiler": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "off",
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "off",
      "@next/next/no-location-assign-relative-destination": "off",
      "prefer-const": "off"
    }
  }
]);

export default eslintConfig;
