/**
 * Starknet network + deployment configuration.
 *
 * Values are read from the environment so the same code targets devnet,
 * sepolia and mainnet. `pnpm chain:deploy` writes the deployed addresses into
 * `.env.local` and `deployments/<network>.json`.
 *
 * Safe to import from client components — nothing here is secret.
 */

export type StarknetNetwork = "devnet" | "sepolia" | "mainnet";

/** Devnet defaults so a fresh clone works with zero configuration. */
const DEVNET_RPC_URL = "http://127.0.0.1:5050";

export const STARKNET_NETWORK = (process.env.NEXT_PUBLIC_STARKNET_NETWORK ??
  "devnet") as StarknetNetwork;

export const STARKNET_RPC_URL =
  process.env.NEXT_PUBLIC_STARKNET_RPC_URL ?? DEVNET_RPC_URL;

export const ZICKET_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_ZICKET_CONTRACT_ADDRESS ?? "";

export const PAYMENT_TOKEN_ADDRESS =
  process.env.NEXT_PUBLIC_PAYMENT_TOKEN_ADDRESS ?? "";

export const PAYMENT_TOKEN_SYMBOL =
  process.env.NEXT_PUBLIC_PAYMENT_TOKEN_SYMBOL ?? "STRK";

export const PAYMENT_TOKEN_DECIMALS = Number(
  process.env.NEXT_PUBLIC_PAYMENT_TOKEN_DECIMALS ?? 18,
);

/**
 * USD price per unit of the settlement token. The Zicket catalogue prices
 * events in USD, so this converts a listing price into token units. A real
 * deployment should swap this for an oracle (e.g. Pragma) — it is intentionally
 * a single choke point so that swap is a one-line change.
 */
export const TOKEN_USD_PRICE = Number(
  process.env.NEXT_PUBLIC_TOKEN_USD_PRICE ?? 1,
);

/** True once the contracts have been deployed and wired into the environment. */
export const isChainConfigured = (): boolean =>
  ZICKET_CONTRACT_ADDRESS.length > 0 && PAYMENT_TOKEN_ADDRESS.length > 0;

export const EXPLORER_BASE_URL: Record<StarknetNetwork, string | null> = {
  devnet: null,
  sepolia: "https://sepolia.voyager.online",
  mainnet: "https://voyager.online",
};

export function explorerTxUrl(txHash: string): string | null {
  const base = EXPLORER_BASE_URL[STARKNET_NETWORK];
  return base ? `${base}/tx/${txHash}` : null;
}

/** Converts a USD listing price into base units of the settlement token. */
export function usdToTokenUnits(priceInUsd: number): bigint {
  if (!Number.isFinite(priceInUsd) || priceInUsd <= 0) return 0n;
  const tokens = priceInUsd / TOKEN_USD_PRICE;
  // Round-trip through a fixed-point string to avoid float drift on the exponent.
  const scaled = (tokens * 10 ** PAYMENT_TOKEN_DECIMALS).toFixed(0);
  return BigInt(scaled);
}

/** Formats base units back into a human-readable token amount. */
export function formatTokenUnits(amount: bigint, maxFractionDigits = 4): string {
  const divisor = 10n ** BigInt(PAYMENT_TOKEN_DECIMALS);
  const whole = amount / divisor;
  const fraction = amount % divisor;
  if (fraction === 0n) return whole.toString();
  const fractionStr = fraction
    .toString()
    .padStart(PAYMENT_TOKEN_DECIMALS, "0")
    .slice(0, maxFractionDigits)
    .replace(/0+$/, "");
  return fractionStr ? `${whole}.${fractionStr}` : whole.toString();
}
