import type { Config } from "drizzle-kit";

export default {
  schema: "./app/lib/db/schema/*",
  out: "./app/lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
