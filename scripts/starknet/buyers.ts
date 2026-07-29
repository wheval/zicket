/**
 * Provisions the throwaway buyer accounts the e2e harness drives.
 *
 * On devnet these are simply two of the predeployed `--seed 0` accounts. On a
 * public network no such accounts exist, so we derive a deterministic pair of
 * OpenZeppelin accounts, persist their keys in `.env.local`, fund them with
 * STRK out of the deployer, and counterfactually deploy them on first use.
 */
import { join } from "node:path";

import { Account, CallData, cairo, ec, hash, stark, type RpcProvider } from "starknet";

import { getDeployer, NETWORK, ROOT } from "./common";
import { upsertEnvFile } from "./env";

/** A buyer wallet plus its key material, shaped like devnet's RPC response. */
export interface BuyerWallet {
  address: string;
  private_key: string;
}

/** Predeployed accounts #1 and #2 of `starknet-devnet --seed 0`. */
const DEVNET_BUYERS: BuyerWallet[] = [
  {
    address: "0x78662e7352d062084b0010068b99288486c2d8b914f6e2a55ce945f8792c8b1",
    private_key: "0xe1406455b7d66b1690803be066cbe5e",
  },
  {
    address: "0x49dfb8ce986e21d354ac93ea65e6a11f639c1934ea253e5ff14ca62eca0f38e",
    private_key: "0xa20a02f0ac53692d144b20cb371a60d7",
  },
];

/**
 * OpenZeppelin account class (v0.8.1), already declared on Sepolia and mainnet.
 * Its constructor is a single `public_key` felt and it accepts a plain
 * `[r, s]` signature, which is what starknet.js's default signer produces.
 * Overridable so the harness keeps working if the canonical class changes.
 */
const OZ_ACCOUNT_CLASS_HASH =
  process.env.STARKNET_ACCOUNT_CLASS_HASH ??
  "0x061dac032f228abef9c6626f995015233097ae253a7f72d68552db02f2971b8f";

/** Canonical STRK on Sepolia and mainnet — the fee token. */
const STRK_ADDRESS =
  process.env.STARKNET_FEE_TOKEN_ADDRESS ??
  "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

/** Fee budget seeded into each buyer. Sepolia fees are a tiny fraction of this. */
const FEE_FUNDING = BigInt(process.env.ZICKET_E2E_FEE_FUNDING ?? 3n * 10n ** 18n);

const ENV_KEY = "ZICKET_E2E_BUYER_KEYS";

function loadOrCreateKeys(count: number): string[] {
  const existing = (process.env[ENV_KEY] ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  const keys = [...existing];
  while (keys.length < count) keys.push(stark.randomAddress());

  if (keys.length !== existing.length) {
    process.env[ENV_KEY] = keys.join(",");
    upsertEnvFile(join(ROOT, ".env.local"), { [ENV_KEY]: keys.join(",") });
  }
  return keys.slice(0, count);
}

function deriveAddress(privateKey: string): { address: string; publicKey: string } {
  const publicKey = ec.starkCurve.getStarkKey(privateKey);
  const address = hash.calculateContractAddressFromHash(
    publicKey,
    OZ_ACCOUNT_CLASS_HASH,
    CallData.compile({ publicKey }),
    0,
  );
  return { address, publicKey };
}

async function isDeployed(provider: RpcProvider, address: string): Promise<boolean> {
  try {
    await provider.getClassHashAt(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Returns `count` funded, deployed buyer wallets, including their key material.
 *
 * On devnet these are the predeployed `--seed 0` accounts. Elsewhere the keys
 * are generated once, persisted to `.env.local`, and the accounts are funded
 * with STRK and counterfactually deployed on first use.
 */
export async function provisionBuyerWallets(
  provider: RpcProvider,
  count = 2,
): Promise<BuyerWallet[]> {
  if (NETWORK === "devnet") {
    if (count > DEVNET_BUYERS.length) {
      throw new Error(`Only ${DEVNET_BUYERS.length} devnet buyers are configured`);
    }
    return DEVNET_BUYERS.slice(0, count);
  }

  const { account: funder } = getDeployer(provider);
  const keys = loadOrCreateKeys(count);
  const wallets: BuyerWallet[] = [];

  for (const [index, privateKey] of keys.entries()) {
    const { address, publicKey } = deriveAddress(privateKey);

    if (await isDeployed(provider, address)) {
      console.log(`  buyer ${index} ready ${address}`);
    } else {
      console.log(`  buyer ${index} funding ${address}…`);
      const { transaction_hash: fundTx } = await funder.execute({
        contractAddress: STRK_ADDRESS,
        entrypoint: "transfer",
        calldata: CallData.compile({
          recipient: address,
          amount: cairo.uint256(FEE_FUNDING),
        }),
      });
      await funder.waitForTransaction(fundTx);

      console.log(`  buyer ${index} deploying…`);
      const account = new Account({ provider, address, signer: privateKey });
      const { transaction_hash: deployTx } = await account.deployAccount({
        classHash: OZ_ACCOUNT_CLASS_HASH,
        constructorCalldata: CallData.compile({ publicKey }),
        addressSalt: publicKey,
      });
      await account.waitForTransaction(deployTx);
      console.log(`  buyer ${index} deployed ${address}`);
    }

    wallets.push({ address, private_key: privateKey });
  }

  return wallets;
}

/** Returns `count` funded, deployed accounts ready to send transactions. */
export async function provisionBuyers(
  provider: RpcProvider,
  count = 2,
): Promise<Account[]> {
  const wallets = await provisionBuyerWallets(provider, count);
  return wallets.map(
    (w) => new Account({ provider, address: w.address, signer: w.private_key }),
  );
}
