import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./db/schema.ts",
  out: "./drizzle/migrations",
  // paths are relative to this file (server/), not the repo root
});
