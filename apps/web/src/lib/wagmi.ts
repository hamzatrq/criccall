import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { defineChain } from "viem";

export const wirefluid = defineChain({
  id: 92533,
  name: "WireFluid Testnet",
  nativeCurrency: { name: "WIRE", symbol: "WIRE", decimals: 18 },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_WIREFLUID_RPC || "https://evm.wirefluid.com"],
    },
  },
  blockExplorers: {
    default: { name: "WireScan", url: "https://wirefluidscan.com" },
  },
  testnet: true,
});

export const wagmiConfig = getDefaultConfig({
  appName: "CricCall",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID || "PLACEHOLDER",
  chains: [wirefluid],
});
