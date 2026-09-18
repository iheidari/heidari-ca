import { defineConfig } from "eslint/config";
import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

export default defineConfig([
  { ignores: [".next/**", "node_modules/**", ".claude/**"] },
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      // Cross-directory imports go through the `@/*` alias; `./x` stays relative.
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../*"],
              message: "Use the `@/*` alias instead of a parent-relative path.",
            },
          ],
        },
      ],
    },
  },
]);
