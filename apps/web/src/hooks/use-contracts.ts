"use client";

import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from "wagmi";
import { parseEther, formatEther } from "viem";
import { wirefluid } from "@/lib/wagmi";

// Contract addresses from env
const CALL_TOKEN = process.env.NEXT_PUBLIC_CALL_TOKEN_ADDRESS as `0x${string}`;
const PREDICTION_MARKET = process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS as `0x${string}`;
const SPONSOR_VAULT = process.env.NEXT_PUBLIC_SPONSOR_VAULT_ADDRESS as `0x${string}`;

// ============================================
// ABIs (minimal — only functions we call)
// ============================================

const callTokenAbi = [
  {
    name: "claimDaily",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "lastClaimed",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

const predictionMarketAbi = [
  {
    name: "predict",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "marketId", type: "uint256" },
      { name: "position", type: "uint8" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "claimWinnings",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "marketId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "claimRefund",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "marketId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "getUserPosition",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "marketId", type: "uint256" },
      { name: "user", type: "address" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "yesAmount", type: "uint256" },
          { name: "noAmount", type: "uint256" },
          { name: "claimed", type: "bool" },
        ],
      },
    ],
  },
] as const;

const sponsorVaultAbi = [
  {
    name: "claim",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "campaignId", type: "string" },
      { name: "amount", type: "uint256" },
      { name: "proof", type: "bytes32[]" },
    ],
    outputs: [],
  },
] as const;

// ============================================
// Hooks
// ============================================

/** Read CALL token balance for connected user */
export function useCallBalance() {
  const { address } = useAccount();
  return useReadContract({
    address: CALL_TOKEN,
    abi: callTokenAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 10000 },
  });
}

/** Read last claimed timestamp */
export function useLastClaimed() {
  const { address } = useAccount();
  return useReadContract({
    address: CALL_TOKEN,
    abi: callTokenAbi,
    functionName: "lastClaimed",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

/** Claim daily CALL tokens */
export function useClaimDaily() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const claim = () => {
    writeContract({
      address: CALL_TOKEN,
      abi: callTokenAbi,
      functionName: "claimDaily",
    });
  };

  return { claim, isPending, isConfirming, isSuccess, error, hash };
}

/** Place a prediction on a market */
export function usePredict() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const predict = (marketId: number, position: "yes" | "no", amount: number) => {
    writeContract({
      address: PREDICTION_MARKET,
      abi: predictionMarketAbi,
      functionName: "predict",
      args: [
        BigInt(marketId),
        position === "yes" ? 0 : 1, // 0 = Yes, 1 = No
        parseEther(String(amount)),
      ],
    });
  };

  return { predict, isPending, isConfirming, isSuccess, error, hash };
}

/** Claim winnings from a resolved market */
export function useClaimWinnings() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const claimWinnings = (marketId: number) => {
    writeContract({
      address: PREDICTION_MARKET,
      abi: predictionMarketAbi,
      functionName: "claimWinnings",
      args: [BigInt(marketId)],
    });
  };

  return { claimWinnings, isPending, isConfirming, isSuccess, error, hash };
}

/** Claim refund from a canceled market */
export function useClaimRefund() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const claimRefund = (marketId: number) => {
    writeContract({
      address: PREDICTION_MARKET,
      abi: predictionMarketAbi,
      functionName: "claimRefund",
      args: [BigInt(marketId)],
    });
  };

  return { claimRefund, isPending, isConfirming, isSuccess, error, hash };
}

/** Claim PKR reward from SponsorVault using Merkle proof */
export function useClaimPKR() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const claimPKR = (campaignId: string, amount: bigint, proof: `0x${string}`[]) => {
    writeContract({
      address: SPONSOR_VAULT,
      abi: sponsorVaultAbi,
      functionName: "claim",
      args: [campaignId, amount, proof],
    });
  };

  return { claimPKR, isPending, isConfirming, isSuccess, error, hash };
}

/** Helper to format CALL balance from wei to human readable */
export function formatCallBalance(wei: bigint | undefined): string {
  if (!wei) return "0";
  return formatEther(wei);
}
