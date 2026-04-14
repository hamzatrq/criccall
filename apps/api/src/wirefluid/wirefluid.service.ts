import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createPublicClient,
  createWalletClient,
  http,
  defineChain,
  getContract,
  type PublicClient,
  type WalletClient,
  type GetContractReturnType,
  type Transport,
  type Chain,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

// ── WireFluid Chain Definition ──────────────────────────────────────────────

const wirefluid = defineChain({
  id: 92533,
  name: 'WireFluid',
  nativeCurrency: { name: 'WIRE', symbol: 'WIRE', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc1-testnet.wirefluid.com'] },
  },
  blockExplorers: {
    default: { name: 'WireScan', url: 'https://wirescan-testnet.wirefluid.com' },
  },
  testnet: true,
});

// ── Minimal ABIs ────────────────────────────────────────────────────────────

const callTokenAbi = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'lastClaimed',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'claimDaily',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    name: 'setPredictionMarket',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: '_market', type: 'address' }],
    outputs: [],
  },
] as const;

const predictionMarketAbi = [
  {
    name: 'markets',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'uint256' }],
    outputs: [
      { name: 'matchId', type: 'string' },
      { name: 'question', type: 'string' },
      { name: 'lockTime', type: 'uint256' },
      { name: 'state', type: 'uint8' },
      { name: 'yesOutcome', type: 'uint8' },
      { name: 'resolvedOutcome', type: 'uint8' },
      { name: 'yesPool', type: 'uint256' },
      { name: 'noPool', type: 'uint256' },
    ],
  },
  {
    name: 'marketCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getUserPosition',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'marketId', type: 'uint256' },
      { name: 'user', type: 'address' },
    ],
    outputs: [
      { name: 'yesAmount', type: 'uint256' },
      { name: 'noAmount', type: 'uint256' },
      { name: 'claimed', type: 'bool' },
    ],
  },
  {
    name: 'createMarket',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'matchId', type: 'string' },
      { name: 'question', type: 'string' },
      { name: 'lockTime', type: 'uint256' },
      { name: 'yesOutcome', type: 'uint8' },
    ],
    outputs: [],
  },
  {
    name: 'predict',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'marketId', type: 'uint256' },
      { name: 'position', type: 'uint8' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },
] as const;

const cricketOracleAbi = [
  {
    name: 'getMatchResult',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'matchId', type: 'string' }],
    outputs: [
      { name: 'outcome', type: 'uint8' },
      { name: 'resolved', type: 'bool' },
      { name: 'timestamp', type: 'uint256' },
      { name: 'resolvedBy', type: 'address' },
    ],
  },
  {
    name: 'isResolved',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'matchId', type: 'string' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'commitResult',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'matchId', type: 'string' },
      { name: 'commitHash', type: 'bytes32' },
    ],
    outputs: [],
  },
  {
    name: 'revealResult',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'matchId', type: 'string' },
      { name: 'outcome', type: 'uint8' },
      { name: 'secret', type: 'bytes32' },
    ],
    outputs: [],
  },
] as const;

const sponsorVaultAbi = [
  {
    name: 'campaigns',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'string' }],
    outputs: [
      { name: 'sponsor', type: 'address' },
      { name: 'token', type: 'address' },
      { name: 'totalCommitted', type: 'uint256' },
      { name: 'totalAllocated', type: 'uint256' },
      { name: 'totalRedeemed', type: 'uint256' },
      { name: 'expiry', type: 'uint256' },
      { name: 'winnerRoot', type: 'bytes32' },
      { name: 'clawedBack', type: 'bool' },
    ],
  },
  {
    name: 'claimed',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: '', type: 'string' },
      { name: '', type: 'address' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'postWinnerRoot',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'campaignId', type: 'string' },
      { name: 'root', type: 'bytes32' },
      { name: 'totalAllocated', type: 'uint256' },
    ],
    outputs: [],
  },
] as const;

const pkrTokenAbi = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'mint',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

// ── Service ─────────────────────────────────────────────────────────────────

@Injectable()
export class WireFluidService {
  private readonly publicClient: PublicClient<Transport, Chain>;
  private readonly ownerWalletClient: WalletClient;
  private readonly oracleWalletClient: WalletClient;

  constructor(private readonly config: ConfigService) {
    const rpcUrl =
      this.config.get<string>('WIREFLUID_RPC_URL') ??
      'https://rpc1-testnet.wirefluid.com';

    const transport = http(rpcUrl);

    // Public client (reads)
    this.publicClient = createPublicClient({
      chain: wirefluid,
      transport,
    });

    // Owner wallet (market creation, PKR minting, root posting)
    const ownerKey = this.config.getOrThrow<`0x${string}`>('OWNER_PRIVATE_KEY');
    const ownerAccount = privateKeyToAccount(ownerKey);
    this.ownerWalletClient = createWalletClient({
      account: ownerAccount,
      chain: wirefluid,
      transport,
    });

    // Oracle wallet (commit/reveal)
    const oracleKey =
      this.config.getOrThrow<`0x${string}`>('ORACLE_PRIVATE_KEY');
    const oracleAccount = privateKeyToAccount(oracleKey);
    this.oracleWalletClient = createWalletClient({
      account: oracleAccount,
      chain: wirefluid,
      transport,
    });
  }

  // ── Client Accessors ────────────────────────────────────────────────────

  getPublicClient() {
    return this.publicClient;
  }

  getOwnerWalletClient() {
    return this.ownerWalletClient;
  }

  getOracleWalletClient() {
    return this.oracleWalletClient;
  }

  // ── Contract Accessors ──────────────────────────────────────────────────

  getCallTokenContract() {
    const address = this.config.getOrThrow<`0x${string}`>(
      'CALL_TOKEN_ADDRESS',
    );
    return getContract({
      address,
      abi: callTokenAbi,
      client: this.publicClient,
    });
  }

  getPredictionMarketContract() {
    const address = this.config.getOrThrow<`0x${string}`>(
      'PREDICTION_MARKET_ADDRESS',
    );
    return getContract({
      address,
      abi: predictionMarketAbi,
      client: this.publicClient,
    });
  }

  getCricketOracleContract() {
    const address = this.config.getOrThrow<`0x${string}`>(
      'CRICKET_ORACLE_ADDRESS',
    );
    return getContract({
      address,
      abi: cricketOracleAbi,
      client: this.publicClient,
    });
  }

  getSponsorVaultContract() {
    const address = this.config.getOrThrow<`0x${string}`>(
      'SPONSOR_VAULT_ADDRESS',
    );
    return getContract({
      address,
      abi: sponsorVaultAbi,
      client: this.publicClient,
    });
  }

  getPkrTokenContract() {
    const address = this.config.getOrThrow<`0x${string}`>(
      'PKR_TOKEN_ADDRESS',
    );
    return getContract({
      address,
      abi: pkrTokenAbi,
      client: this.publicClient,
    });
  }
}
