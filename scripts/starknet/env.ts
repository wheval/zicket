/**
 * Minimal `.env` reader/writer used by the deploy scripts.
 *
 * Avoids a dotenv dependency: Next.js already loads `.env.local` for the app,
 * and these scripts only need it for standalone CLI runs.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";

export function loadEnvFile(path: string): void {
  if (!existsSync(path)) return;

  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    // Real environment variables always win over the file.
    process.env[key] ??= value;
  }
}

/** Inserts or replaces keys in an env file, preserving unrelated lines. */
export function upsertEnvFile(path: string, values: Record<string, string>): void {
  const lines = existsSync(path) ? readFileSync(path, "utf8").split("\n") : [];
  const remaining = new Map(Object.entries(values));

  const next = lines.map((line) => {
    const eq = line.indexOf("=");
    if (eq === -1 || line.trim().startsWith("#")) return line;

    const key = line.slice(0, eq).trim();
    if (!remaining.has(key)) return line;

    const value = remaining.get(key) as string;
    remaining.delete(key);
    return `${key}=${value}`;
  });

  if (remaining.size > 0) {
    if (next.length > 0 && next[next.length - 1].trim() !== "") next.push("");
    next.push("# --- Zicket on-chain deployment (written by pnpm chain:deploy) ---");
    for (const [key, value] of remaining) next.push(`${key}=${value}`);
    next.push("");
  }

  writeFileSync(path, next.join("\n"));
}
