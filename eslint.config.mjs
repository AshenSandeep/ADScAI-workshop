import customRules from "./eslint-rules/require-auth-wrapper.js";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "prisma/migrations/**",
      "next-env.d.ts",
    ],
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: { parser: tsParser },
    plugins: {
      canteen: { rules: { "require-auth-wrapper": customRules } },
    },
    rules: {
      "canteen/require-auth-wrapper": "error",
    },
  },
];
