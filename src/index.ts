import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./db/schema";

type Db = ReturnType<typeof drizzle<typeof schema>>;

let _db: Db | null = null;

/**
 * Points the Neon HTTP driver at a local proxy when NEON_HTTP_ENDPOINT is set,
 * so the app can run against a plain Postgres container in development.
 */
function configureLocalEndpoint() {
  const endpoint = process.env.NEON_HTTP_ENDPOINT;
  if (!endpoint) return;

  const url = new URL(endpoint);
  neonConfig.fetchEndpoint = endpoint;
  neonConfig.useSecureWebSocket = url.protocol === "https:";
  neonConfig.poolQueryViaFetch = true;
}

export function getDb(): Db {
  if (_db) return _db;

  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    throw new Error("Missing DATABASE_URL. Set it in your environment (Neon connection string).");
  }

  configureLocalEndpoint();

  const sql = neon(DATABASE_URL);
  _db = drizzle({ client: sql, schema });
  return _db;
}

