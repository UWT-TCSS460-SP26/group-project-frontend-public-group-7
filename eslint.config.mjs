import { FlatCompat } from "@eslint/eslintrc";
import prettier from "eslint-config-prettier";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * `eslint-config-next` is still distributed as a legacy "extends" config, so
 * we bridge it into the ESLint 9 flat-config format with `FlatCompat`. The
 * `eslint-config-prettier` entry at the end disables ESLint rules that
 * conflict with Prettier — Prettier handles formatting, ESLint handles bugs.
 */
const compat = new FlatCompat({ baseDirectory: __dirname });

const config = [
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  prettier,
];

export default config;
