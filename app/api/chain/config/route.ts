import { NextResponse } from "next/server";

import {
  PAYMENT_TOKEN_ADDRESS,
  PAYMENT_TOKEN_DECIMALS,
  PAYMENT_TOKEN_SYMBOL,
  STARKNET_NETWORK,
  STARKNET_RPC_URL,
  ZICKET_CONTRACT_ADDRESS,
  isChainConfigured,
} from "@/lib/starknet/config";

/**
 * Public chain configuration, so the client can render the correct network and
 * fail loudly when the contracts have not been deployed yet.
 */
export async function GET() {
  return NextResponse.json({
    configured: isChainConfigured(),
    network: STARKNET_NETWORK,
    rpcUrl: STARKNET_RPC_URL,
    contracts: {
      zicket: ZICKET_CONTRACT_ADDRESS || null,
      paymentToken: PAYMENT_TOKEN_ADDRESS || null,
    },
    token: {
      symbol: PAYMENT_TOKEN_SYMBOL,
      decimals: PAYMENT_TOKEN_DECIMALS,
    },
  });
}
