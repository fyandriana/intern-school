// eslint.config.js
import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  {
    // replaces .eslintignore
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",

      "dist",
      "build",
      "coverage",
      "*.min.js",

      "client/node_modules",
      "client/dist",
      "client/build",

      "server/node_modules",
      "server/dist",
      "server/build",
    ],
  },

  // Client (React - JS/JSX)
  {
    files: ["client/src/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true }, // ✅ put ecmaFeatures here
      },
      globals: { ...globals.browser, ...globals.es2021 },
    },
    plugins: { react, "react-hooks": reactHooks, "jsx-a11y": jsxA11y },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
  },

  // Server (Node - JS)
  {
    files: ["server/src/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true }, // ✅ put ecmaFeatures here
      },
      globals: { ...globals.node, ...globals.es2021 },
    },
    rules: { ...js.configs.recommended.rules },
  },

  // Turn off rules that conflict with Prettier
  eslintConfigPrettier,
];
