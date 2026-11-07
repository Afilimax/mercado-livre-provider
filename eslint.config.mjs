import prettierRecommended from "eslint-plugin-prettier/recommended"
import unusedImports from "eslint-plugin-unused-imports"
import tseslint from "typescript-eslint"

export default tseslint.config(
    { ignores: ["dist/**", "coverage/**", "node_modules/**"] },
    {
        files: ["**/*.ts"],
        languageOptions: { parser: tseslint.parser },
        plugins: { "unused-imports": unusedImports },
        rules: {
            "no-unused-vars": "off",
            "unused-imports/no-unused-imports": "error",
            "unused-imports/no-unused-vars": [
                "warn",
                { vars: "all", varsIgnorePattern: "^_", args: "after-used", argsIgnorePattern: "^_" },
            ],
        },
    },
    prettierRecommended,
)
