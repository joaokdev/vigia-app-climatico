import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    // Testes de integração de verdade (Postgres/Redis reais), não
    // mocks — cada arquivo cuida de limpar seus próprios dados, mas
    // rodam em série para não colidir num mesmo banco de dev.
    fileParallelism: false,
    setupFiles: ["./src/server/__tests__/setup.ts"],
    include: ["src/server/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
