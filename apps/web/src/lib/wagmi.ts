import { http, createConfig } from "wagmi";
import { injected } from "wagmi/connectors";
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

export const wagmiConfig = createConfig({
  chains: [wirefluid],
  connectors: [injected({ target: "metaMask" })],
  transports: {
    [wirefluid.id]: http(),
  },
});
