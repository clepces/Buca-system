import js from "@eslint/js";
import globals from "globals";

export default [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.browser,
                Header: "readonly",
                Dock: "readonly",
                Footer: "readonly"
            }
        },
        rules: {
            "indent": ["error", 4],
            "quotes": ["error", "single"],
            "semi": ["error", "always"],
            "no-unused-vars": "warn",
            "no-console": "off",
            "no-undef": "warn"
        }
    }
];
