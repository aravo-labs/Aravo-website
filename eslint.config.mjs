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
  ]),

  // Two API clients live in this app: lib/api talks to the CMS and
  // lib/platform talks to the tracking platform. They export fourteen names in
  // common - ApiRequestError, ApiResponse, ErrorCode and the rest - because
  // both are generated against the same response envelope.
  //
  // That has already cost us once. A dashboard hook imported ApiRequestError
  // from lib/api while catching errors thrown by lib/platform. Two classes,
  // same shape, so TypeScript was satisfied and `instanceof` was false at
  // runtime: every dashboard error collapsed to "Something went wrong" and
  // nothing failed loudly enough to notice. Nothing about the code looked
  // wrong, which is why a rule is worth more here than care.
  {
    files: ["src/lib/platform/**", "src/app/dashboard/**"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [{
        group: ["@/lib/api", "@/lib/api/*", "**/lib/api/*"],
        message:
          "This is platform code; import from @/lib/platform. The CMS client " +
          "exports the same names, so mixing them type checks and then fails " +
          "at runtime.",
      }]}],
    },
  },
  {
    files: ["src/lib/api/**"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [{
        group: ["@/lib/platform", "@/lib/platform/*", "**/lib/platform/*"],
        message:
          "This is CMS client code; import from @/lib/api. See the note above.",
      }]}],
    },
  },
]);

export default eslintConfig;
