/**
 * Copies the ABIs produced by `scarb build` into `lib/starknet/abis` so the web
 * app never has to read from the Cairo build directory at runtime.
 *
 * Usage: pnpm contracts:abi
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");
const TARGET_DIR = join(ROOT, "contracts", "target", "dev");
const OUT_DIR = join(ROOT, "lib", "starknet", "abis");

const CONTRACTS = [
  { artifact: "zicket_ZicketEvents.contract_class.json", out: "zicket-events.json" },
  { artifact: "zicket_MockERC20.contract_class.json", out: "mock-erc20.json" },
] as const;

function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  for (const { artifact, out } of CONTRACTS) {
    const source = join(TARGET_DIR, artifact);
    let raw: string;
    try {
      raw = readFileSync(source, "utf8");
    } catch {
      throw new Error(
        `Missing ${source}. Run \`pnpm contracts:build\` (scarb build) first.`,
      );
    }

    const { abi } = JSON.parse(raw) as { abi: unknown[] };
    if (!Array.isArray(abi)) throw new Error(`No ABI array in ${artifact}`);

    writeFileSync(join(OUT_DIR, out), `${JSON.stringify(abi, null, 2)}\n`);
    console.log(`✓ ${out} (${abi.length} entries)`);
  }
}

main();
