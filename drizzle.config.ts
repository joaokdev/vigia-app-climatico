import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// O drizzle-kit (CLI) só carrega `.env` automaticamente — não `.env.local`.
// O projeto segue a convenção do Next.js e guarda os valores reais em
// `.env.local` (ver .env.example), então sem isto aqui `DATABASE_URL`
// fica undefined ao rodar `drizzle-kit push/migrate/generate` e o comando
// cai silenciosamente no fallback abaixo (só serve para dev local "de
// fábrica" com a senha padrão — nunca a senha real de ninguém).
config({ path: ".env.local" });
config(); // .env, se existir, sem sobrescrever o que .env.local já definiu

export default defineConfig({
  schema: "./src/server/db/schema.ts",
  out: "./src/server/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgresql://vigia:vigia_dev_local@127.0.0.1:5432/vigia",
  },
});
