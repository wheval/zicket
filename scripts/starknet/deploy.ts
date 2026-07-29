/**
 * Declares and deploys the Zicket contracts, then writes the resulting
 * addresses into `deployments/<network>.json` and `.env.local`.
 *
 * Usage:
 *   pnpm chain:devnet     # start a local node (docker)
 *   pnpm chain:deploy
 *
 * On devnet a `MockERC20` is deployed to act as the settlement token. On any
 * other network set `PAYMENT_TOKEN_ADDRESS` to an existing ERC20 (e.g. STRK)
 * and no mock is deployed.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { CallData, type Account, type CompiledSierra } from "starknet";

import { assertNodeReachable, getDeployer, getProvider, NETWORK, ROOT, RPC_URL } from "./common";
import { upsertEnvFile } from "./env";

const TARGET_DIR = join(ROOT, "contracts", "target", "dev");

const PLATFORM_FEE_BPS = Number(process.env.ZICKET_PLATFORM_FEE_BPS ?? 250);
const TOKEN_NAME = process.env.ZICKET_TOKEN_NAME ?? "Zicket USD";
const TOKEN_SYMBOL = process.env.ZICKET_TOKEN_SYMBOL ?? "ZUSD";
const TOKEN_DECIMALS = Number(process.env.ZICKET_TOKEN_DECIMALS ?? 18);
const TOKEN_SUPPLY = BigInt(process.env.ZICKET_TOKEN_SUPPLY ?? 10n ** 27n);

interface Artifact {
  sierra: CompiledSierra;
  casm: unknown;
  abi: unknown[];
}

function loadArtifact(name: string): Artifact {
  const read = (suffix: string) => {
    const path = join(TARGET_DIR, `zicket_${name}.${suffix}.json`);
    try {
      return JSON.parse(readFileSync(path, "utf8"));
    } catch {
      throw new Error(`Missing ${path}. Run \`pnpm contracts:build\` first.`);
    }
  };

  const sierra = read("contract_class") as CompiledSierra & { abi: unknown[] };
  return { sierra, casm: read("compiled_contract_class"), abi: sierra.abi };
}

async function declareAndDeploy(
  account: Account,
  name: string,
  constructorCalldata: string[],
): Promise<{ classHash: string; address: string; txHash: string }> {
  const { sierra, casm } = loadArtifact(name);

  process.stdout.write(`  declaring ${name}… `);
  const declared = await account.declareIfNot({
    contract: sierra,
    casm: casm as never,
  });
  if (declared.transaction_hash) {
    await account.waitForTransaction(declared.transaction_hash);
    console.log(`declared (${declared.class_hash.slice(0, 12)}…)`);
  } else {
    console.log(`already declared (${declared.class_hash.slice(0, 12)}…)`);
  }

  process.stdout.write(`  deploying ${name}… `);
  const deployed = await account.deployContract({
    classHash: declared.class_hash,
    constructorCalldata,
  });
  await account.waitForTransaction(deployed.transaction_hash);
  console.log(`at ${deployed.contract_address}`);

  return {
    classHash: declared.class_hash,
    address: deployed.contract_address,
    txHash: deployed.transaction_hash,
  };
}

async function main() {
  const provider = getProvider();
  await assertNodeReachable(provider);

  const { account, address: deployerAddress } = getDeployer(provider);
  const chainId = await provider.getChainId();

  console.log(`\nZicket deployment`);
  console.log(`  network  ${NETWORK}`);
  console.log(`  rpc      ${RPC_URL}`);
  console.log(`  chain    ${chainId}`);
  console.log(`  deployer ${deployerAddress}\n`);

  // 1. Settlement token ------------------------------------------------------
  let paymentToken = process.env.PAYMENT_TOKEN_ADDRESS ?? "";
  let tokenClassHash: string | null = null;

  if (paymentToken) {
    console.log(`  using existing payment token ${paymentToken}`);
  } else if (NETWORK !== "devnet") {
    throw new Error(
      `PAYMENT_TOKEN_ADDRESS must be set for "${NETWORK}" — ` +
        "the mock token is only deployed on devnet.",
    );
  } else {
    const { abi } = loadArtifact("MockERC20");
    const calldata = new CallData(abi as never).compile("constructor", {
      name: TOKEN_NAME,
      symbol: TOKEN_SYMBOL,
      decimals: TOKEN_DECIMALS,
      initial_supply: TOKEN_SUPPLY,
      recipient: deployerAddress,
    });
    const result = await declareAndDeploy(account, "MockERC20", calldata);
    paymentToken = result.address;
    tokenClassHash = result.classHash;
  }

  // 2. Ticketing contract ----------------------------------------------------
  const feeRecipient = process.env.ZICKET_FEE_RECIPIENT ?? deployerAddress;
  const { abi: zicketAbi } = loadArtifact("ZicketEvents");
  const zicketCalldata = new CallData(zicketAbi as never).compile("constructor", {
    owner: deployerAddress,
    payment_token: paymentToken,
    fee_recipient: feeRecipient,
    platform_fee_bps: PLATFORM_FEE_BPS,
  });
  const zicket = await declareAndDeploy(account, "ZicketEvents", zicketCalldata);

  // 3. Persist ---------------------------------------------------------------
  const deployment = {
    network: NETWORK,
    chainId,
    rpcUrl: RPC_URL,
    deployer: deployerAddress,
    feeRecipient,
    platformFeeBps: PLATFORM_FEE_BPS,
    deployedAt: new Date().toISOString(),
    contracts: {
      ZicketEvents: { address: zicket.address, classHash: zicket.classHash },
      PaymentToken: {
        address: paymentToken,
        classHash: tokenClassHash,
        symbol: tokenClassHash ? TOKEN_SYMBOL : undefined,
        decimals: TOKEN_DECIMALS,
        mock: Boolean(tokenClassHash),
      },
    },
  };

  const deploymentsDir = join(ROOT, "deployments");
  mkdirSync(deploymentsDir, { recursive: true });
  writeFileSync(
    join(deploymentsDir, `${NETWORK}.json`),
    `${JSON.stringify(deployment, null, 2)}\n`,
  );

  upsertEnvFile(join(ROOT, ".env.local"), {
    NEXT_PUBLIC_STARKNET_NETWORK: NETWORK,
    NEXT_PUBLIC_STARKNET_RPC_URL: RPC_URL,
    NEXT_PUBLIC_ZICKET_CONTRACT_ADDRESS: zicket.address,
    NEXT_PUBLIC_PAYMENT_TOKEN_ADDRESS: paymentToken,
    NEXT_PUBLIC_PAYMENT_TOKEN_SYMBOL: tokenClassHash ? TOKEN_SYMBOL : "STRK",
    NEXT_PUBLIC_PAYMENT_TOKEN_DECIMALS: String(TOKEN_DECIMALS),
    STARKNET_RPC_URL: RPC_URL,
    STARKNET_ADMIN_ADDRESS: deployerAddress,
    STARKNET_ADMIN_PRIVATE_KEY: getDeployer(provider).privateKey,
  });

  console.log(`\n✓ deployment written to deployments/${NETWORK}.json`);
  console.log(`✓ .env.local updated\n`);
}

main().catch((error) => {
  console.error(`\n✗ deploy failed: ${(error as Error).message}\n`);
  process.exit(1);
});
