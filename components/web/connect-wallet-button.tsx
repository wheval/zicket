"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { shortenAddress, useWallet } from "@/components/web/wallet-provider";

export function ConnectWalletButton({ className }: { className?: string }) {
  const { status, address, wallets, burnerAvailable, error, connect, connectBurner, disconnect } =
    useWallet();
  const [open, setOpen] = useState(false);

  if (status === "connected" && address) {
    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger
          className={`h-[44px] cursor-pointer rounded-full border border-[#6917AF] bg-white px-4 text-sm font-semibold text-[#2C0A4A] transition-colors hover:bg-[#F6F0FB] ${className ?? ""}`}
        >
          <span className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-[#0ABA2A]" aria-hidden />
            {shortenAddress(address)}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-white">
          <DropdownMenuLabel className="text-xs font-normal text-[#667185]">
            Connected wallet
          </DropdownMenuLabel>
          <DropdownMenuItem
            onSelect={() => navigator.clipboard?.writeText(address)}
            className="cursor-pointer text-sm"
          >
            Copy address
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={disconnect} className="cursor-pointer text-sm text-[#D42620]">
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" className={className} disabled={status === "connecting"}>
          {status === "connecting" ? "Connecting…" : "Connect Wallet"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-white">
        <DropdownMenuLabel className="text-xs font-normal text-[#667185]">
          Choose a Starknet wallet
        </DropdownMenuLabel>

        {wallets.length === 0 && (
          <p className="px-2 py-2 text-xs text-[#667185]">
            No Starknet wallet detected. Install Argent X or Braavos.
          </p>
        )}

        {wallets.map((wallet) => (
          <DropdownMenuItem
            key={wallet.id}
            onSelect={() => void connect(wallet.id)}
            className="cursor-pointer gap-2 text-sm capitalize"
          >
            {wallet.icon && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={wallet.icon} alt="" className="size-4 rounded" />
            )}
            {wallet.name}
          </DropdownMenuItem>
        ))}

        {burnerAvailable && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs font-normal text-[#667185]">
              Local development
            </DropdownMenuLabel>
            <DropdownMenuItem
              onSelect={() => void connectBurner()}
              className="cursor-pointer text-sm"
            >
              Use devnet burner account
            </DropdownMenuItem>
          </>
        )}

        {error && (
          <p className="px-2 py-2 text-xs text-[#D42620]" role="alert">
            {error}
          </p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
