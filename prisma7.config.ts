import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Prisma CLI does not auto-load .env.local (that's a Next.js convention),
// so load it explicitly to keep a single source of truth for local dev.
config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
