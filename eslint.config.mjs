import typescriptEslint from "@typescript-eslint/eslint-plugin";
import stylistic from "@stylistic/eslint-plugin";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    files: ["**/*.ts"],
  },
  {
    plugins: {
      "@typescript-eslint": typescriptEslint,
      '@stylistic': stylistic,
    },

    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.mocha,
      },

      parser: tsParser,
      ecmaVersion: 5,
      sourceType: "module",

      parserOptions: {
        project: ["tsconfig.json"],
      },
    },

    rules: {
      "@stylistic/member-delimiter-style": [
        "warn",
        {
          multiline: {
            delimiter: "semi",
            requireLast: true,
          },

          singleline: {
            delimiter: "semi",
            requireLast: false,
          },
        },
      ],

      "@typescript-eslint/naming-convention": "warn",
      "@typescript-eslint/no-unused-expressions": "warn",
      "@stylistic/semi": ["warn", "always"],
      curly: "warn",
      eqeqeq: ["warn", "always"],
      "no-redeclare": "warn",
      "no-throw-literal": "warn",
      "no-unused-expressions": "warn",
    },
  },
];
