import { defineConfig } from "vitest/config"

export default defineConfig({
    test: {
        environment: "node",
        include: ["__tests__/**/*.{test,spec}.ts"],
        exclude: ["node_modules/**", "dist/**", "__tests__/**/practical.spec.ts", "__tests__/**/*.integration.spec.ts"],
        coverage: {
            provider: "v8",
            include: ["src/**/*.ts"],
            exclude: ["src/**/*.d.ts"],
            reporter: ["text", "lcov"],
            thresholds: {
                lines: 100,
                functions: 100,
                branches: 100,
                statements: 100,
            },
        },
    },
})
