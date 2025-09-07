import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      // Generated/bundled code
      "app/generated/**",
      "app/generated/prisma/**",
      "app/generated/**/*.js",
      // Prisma build artifacts
      "prisma/migrations/**",
      "prisma/generated/**",
    ],
  },
  // Relax rules for test files
  {
    files: ["**/__tests__/**/*.{ts,tsx,js,jsx}", "**/*.test.{ts,tsx,js,jsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
    },
  },
  // Allow any in small internal util wrappers where typing is intentionally loose
  {
    files: ["src/app/api/_utils/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  // API routes with intentional any usage (request handlers/tests)
  {
    files: [
      "src/app/api/media/confirm/route.ts",
      "src/app/api/media/delete-many/route.ts",
      "src/app/api/media/sign/route.ts",
      "src/app/api/orders/route.ts",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  // Auth lib where JWT decode returns unknown shape
  {
    files: ["src/lib/auth.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  // Per-file overrides where needed
  {
    files: ["src/app/api/cart/route.ts"],
    rules: {
      "prefer-const": "off",
    },
  },
];

export default eslintConfig;
