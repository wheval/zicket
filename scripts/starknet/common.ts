/**
 * Shared bootstrap for the Starknet CLI scripts: resolves the RPC endpoint and
 * the deployer account, with devnet defaults so `pnpm chain:deploy` works
 * against a freshly started `shardlabs/starknet-devnet-rs` with no config.
 */
import { existsSync } from "node:fs";
import { dirname, join, parse } from "node:path";

import { Account, RpcProvider } from "starknet";

import { loadEnvFile } from "./env";

/**
 * Walks up from the cwd to the repo root. `import.meta.dirname` is unavailable
 * because tsx transpiles these scripts to CJS.
 */
function findRepoRoot(start: string): string {
  let current = start;
  const { root } = parse(current);
  while (true) {
    if (existsSync(join(current, "pnpm-lock.yaml"))) return current;
    if (current === root) throw new Error(`Could not find the repo root from ${start}`);
    current = dirname(current);
  }
}

export const ROOT = findRepoRoot(process.cwd());

loadEnvFile(join(ROOT, ".env.local"));
loadEnvFile(join(ROOT, ".env"));

/** Account #0 of `starknet-devnet --seed 0`. Local-only, never a real key. */
const DEVNET_ACCOUNT = {
  address: "0x64b48806902a367c8598f4f95c305e8c1a1acba5f082d294a43793113115691",
  privateKey: "0x71d7bb07b9a64f6f78ac4c816aff4da9",
};

export const RPC_URL =
  process.env.STARKNET_RPC_URL ??
  process.env.NEXT_PUBLIC_STARKNET_RPC_URL ??
  "http://127.0.0.1:5050";

export const NETWORK = process.env.NEXT_PUBLIC_STARKNET_NETWORK ?? "devnet";

export function getProvider(): RpcProvider {
  return new RpcProvider({ nodeUrl: RPC_URL });
}

export interface DeployerAccount {
  account: Account;
  address: string;
  privateKey: string;
}

export function getDeployer(provider = getProvider()): DeployerAccount {
  const address = process.env.STARKNET_DEPLOYER_ADDRESS ?? DEVNET_ACCOUNT.address;
  const privateKey =
    process.env.STARKNET_DEPLOYER_PRIVATE_KEY ?? DEVNET_ACCOUNT.privateKey;

  if (NETWORK !== "devnet" && !process.env.STARKNET_DEPLOYER_PRIVATE_KEY) {
    throw new Error(
      `Refusing to use the devnet key on "${NETWORK}". ` +
        "Set STARKNET_DEPLOYER_ADDRESS and STARKNET_DEPLOYER_PRIVATE_KEY.",
    );
  }

  return {
    account: new Account({ provider, address, signer: privateKey }),
    address,
    privateKey,
  };
}

/** Fails fast with a useful message when the node isn't reachable. */
export async function assertNodeReachable(provider = getProvider()): Promise<void> {
  try {
    await provider.getChainId();
  } catch (error) {
    throw new Error(
      `Cannot reach a Starknet node at ${RPC_URL}.\n` +
        "Start a local devnet with:\n" +
        "  pnpm chain:devnet\n\n" +
        `Underlying error: ${(error as Error).message}`,
    );
  }
}
