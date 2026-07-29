import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// .env.local mirrors Next.js' own precedence, so drizzle-kit and the app agree.
config({ path: ".env.local", quiet: true });
config({ quiet: true });

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});

