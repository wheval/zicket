"use client";

/**
 * Wallet connection for Starknet, built directly on starknet.js `WalletAccount`
 * and SNIP-1193 discovery (`window.starknet_*`). Deliberately dependency-free:
 * the wallet-connector ecosystem lags starknet.js releases, and this app only
 * needs connect / disconnect / execute.
 *
 * On devnet there is no browser extension, so a predeployed "burner" account is
 * offered instead. That path is hard-gated to the devnet network so it can
 * never be reached from a production build.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { Account, RpcProvider, WalletAccount, type AccountInterface } from "starknet";

import { STARKNET_NETWORK, STARKNET_RPC_URL } from "@/lib/starknet/config";

/** Devnet account #1 (`starknet-devnet --seed 0`). Local development only. */
const DEVNET_BURNER = {
  address: "0x78662e7352d062084b0010068b99288486c2d8b914f6e2a55ce945f8792c8b1",
  privateKey: "0xe1406455b7d66b1690803be066cbe5e",
};

const LAST_WALLET_KEY = "zicket:last-wallet";

export interface DiscoveredWallet {
  id: string;
  name: string;
  icon?: string;
}

type Status = "disconnected" | "connecting" | "connected";

interface WalletContextValue {
  status: Status;
  address: string | null;
  account: AccountInterface | null;
  wallets: DiscoveredWallet[];
  /** True when the burner shortcut is available (devnet only). */
  burnerAvailable: boolean;
  error: string | null;
  connect: (walletId: string) => Promise<void>;
  connectBurner: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

interface InjectedWallet {
  id?: string;
  name?: string;
  icon?: string | { light?: string; dark?: string };
  request?: (args: { type: string; params?: unknown }) => Promise<unknown>;
}

function discover(): Array<{ key: string; wallet: InjectedWallet }> {
  if (typeof window === "undefined") return [];

  const found: Array<{ key: string; wallet: InjectedWallet }> = [];
  for (const key of Object.keys(window)) {
    if (!key.startsWith("starknet")) continue;
    const candidate = (window as unknown as Record<string, InjectedWallet>)[key];
    // SNIP-1193 wallets expose `request`; skip the legacy aggregate object.
    if (candidate && typeof candidate.request === "function") {
      found.push({ key, wallet: candidate });
    }
  }
  return found;
}

function iconOf(wallet: InjectedWallet): string | undefined {
  if (typeof wallet.icon === "string") return wallet.icon;
  return wallet.icon?.light ?? wallet.icon?.dark;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("disconnected");
  const [address, setAddress] = useState<string | null>(null);
  const [account, setAccount] = useState<AccountInterface | null>(null);
  const [wallets, setWallets] = useState<DiscoveredWallet[]>([]);
  const [error, setError] = useState<string | null>(null);

  const burnerAvailable = STARKNET_NETWORK === "devnet";

  useEffect(() => {
    // Extensions inject asynchronously; re-scan briefly after mount.
    const scan = () =>
      setWallets(
        discover().map(({ key, wallet }) => ({
          id: key,
          name: wallet.name ?? key.replace(/^starknet_?/, "") ?? key,
          icon: iconOf(wallet),
        })),
      );

    scan();
    const timers = [250, 750, 1500].map((delay) => window.setTimeout(scan, delay));
    return () => timers.forEach(window.clearTimeout);
  }, []);

  const connect = useCallback(async (walletId: string) => {
    setError(null);
    setStatus("connecting");
    try {
      const entry = discover().find(({ key }) => key === walletId);
      if (!entry) throw new Error("That wallet is no longer available.");

      const walletAccount = await WalletAccount.connect(
        { nodeUrl: STARKNET_RPC_URL },
        entry.wallet as never,
      );

      setAccount(walletAccount);
      setAddress(walletAccount.address);
      setStatus("connected");
      window.localStorage.setItem(LAST_WALLET_KEY, walletId);
    } catch (cause) {
      setStatus("disconnected");
      setError((cause as Error).message || "Could not connect to that wallet.");
    }
  }, []);

  const connectBurner = useCallback(async () => {
    if (!burnerAvailable) return;
    setError(null);
    setStatus("connecting");
    try {
      const provider = new RpcProvider({ nodeUrl: STARKNET_RPC_URL });
      const burner = new Account({
        provider,
        address: DEVNET_BURNER.address,
        signer: DEVNET_BURNER.privateKey,
      });
      // Fail now rather than at signing time if the node isn't up.
      await provider.getChainId();

      setAccount(burner);
      setAddress(burner.address);
      setStatus("connected");
    } catch (cause) {
      setStatus("disconnected");
      setError(
        `Local devnet is unreachable at ${STARKNET_RPC_URL}. ` +
          `Start it with \`pnpm chain:devnet\`. (${(cause as Error).message})`,
      );
    }
  }, [burnerAvailable]);

  const disconnect = useCallback(() => {
    setAccount(null);
    setAddress(null);
    setStatus("disconnected");
    setError(null);
    window.localStorage.removeItem(LAST_WALLET_KEY);
  }, []);

  const value = useMemo<WalletContextValue>(
    () => ({
      status,
      address,
      account,
      wallets,
      burnerAvailable,
      error,
      connect,
      connectBurner,
      disconnect,
    }),
    [status, address, account, wallets, burnerAvailable, error, connect, connectBurner, disconnect],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletContextValue {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used inside <WalletProvider>.");
  }
  return context;
}

export function shortenAddress(value: string, size = 4): string {
  const normalized = value.startsWith("0x") ? value : `0x${value}`;
  if (normalized.length <= size * 2 + 2) return normalized;
  return `${normalized.slice(0, size + 2)}…${normalized.slice(-size)}`;
}
