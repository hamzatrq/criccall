import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { encodeAbiParameters, keccak256, toHex } from 'viem';
import { PrismaService } from '../prisma/prisma.service';
import { WireFluidService } from '../wirefluid/wirefluid.service';

@Injectable()
export class OracleService {
  private readonly logger = new Logger(OracleService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly wirefluid: WireFluidService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Commit-reveal resolution flow:
   * 1. Generate secret & commit hash
   * 2. commitResult on-chain
   * 3. Wait ~5s
   * 4. revealResult on-chain
   * 5. Clear secret from DB
   */
  async resolveMatch(
    matchId: string,
    outcome: number,
    source: 'api' | 'admin',
  ) {
    this.logger.log(
      `Resolving match ${matchId} with outcome ${outcome} (source: ${source})`,
    );

    // 1. Generate random 32-byte secret
    const secretBytes = crypto.randomBytes(32);
    const secret = toHex(secretBytes) as `0x${string}`;

    // 2. Compute commitHash = keccak256(abi.encode(matchId, outcome, secret))
    // Must match CricketOracle.sol: keccak256(abi.encode(matchId, outcome, secret))
    const commitHash = keccak256(
      encodeAbiParameters(
        [
          { name: 'matchId', type: 'string' },
          { name: 'outcome', type: 'uint8' },
          { name: 'secret', type: 'bytes32' },
        ],
        [matchId, outcome, secret],
      ),
    );

    // 3. Create OracleResolution record in DB
    const resolution = await this.prisma.oracleResolution.create({
      data: {
        matchId,
        outcome,
        secret,
        source,
      },
    });

    // 4. Get oracle wallet client and contract address
    const oracleWallet = this.wirefluid.getOracleWalletClient();
    const publicClient = this.wirefluid.getPublicClient();
    const oracleAddress = this.config.getOrThrow<`0x${string}`>(
      'CRICKET_ORACLE_ADDRESS',
    );

    try {
      // 5. Call commitResult on-chain (retry with exponential backoff)
      this.logger.log(`Committing result for match ${matchId}...`);
      const commitTxHash = await this.retry(
        () =>
          oracleWallet.writeContract({
            chain: oracleWallet.chain!,
            account: oracleWallet.account!,
            address: oracleAddress,
            abi: [
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
            ] as const,
            functionName: 'commitResult',
            args: [matchId, commitHash],
          }),
        3,
        [0, 2000, 5000],
      );

      this.logger.log(`Commit tx sent: ${commitTxHash}`);

      // Store commitTxHash
      await this.prisma.oracleResolution.update({
        where: { id: resolution.id },
        data: { commitTxHash },
      });

      // Wait for commit tx confirmation
      await publicClient.waitForTransactionReceipt({ hash: commitTxHash });

      // 6. Wait ~5 seconds for block finality
      await this.sleep(5000);

      // 7. Call revealResult on-chain (retry with immediate retries)
      this.logger.log(`Revealing result for match ${matchId}...`);
      const revealTxHash = await this.retry(
        () =>
          oracleWallet.writeContract({
            chain: oracleWallet.chain!,
            account: oracleWallet.account!,
            address: oracleAddress,
            abi: [
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
            ] as const,
            functionName: 'revealResult',
            args: [matchId, outcome, secret],
          }),
        3,
        [0, 0, 0],
      );

      this.logger.log(`Reveal tx sent: ${revealTxHash}`);

      // Wait for reveal tx confirmation
      await publicClient.waitForTransactionReceipt({ hash: revealTxHash });

      // 8. Clear secret from DB and update resolution record
      const updatedResolution = await this.prisma.oracleResolution.update({
        where: { id: resolution.id },
        data: {
          revealTxHash,
          secret: null,
          resolvedAt: new Date(),
        },
      });

      this.logger.log(`Match ${matchId} resolved successfully`);

      return updatedResolution;
    } catch (error) {
      this.logger.error(
        `Failed to resolve match ${matchId}: ${error.message}`,
        error.stack,
      );

      // Update resolution record with failure status info
      await this.prisma.oracleResolution.update({
        where: { id: resolution.id },
        data: {
          secret: null,
        },
      });

      throw error;
    }
  }

  private async retry<T>(
    fn: () => Promise<T>,
    attempts: number,
    delays: number[],
  ): Promise<T> {
    for (let i = 0; i < attempts; i++) {
      try {
        return await fn();
      } catch (e) {
        this.logger.warn(
          `Retry attempt ${i + 1}/${attempts} failed: ${e.message}`,
        );
        if (i === attempts - 1) throw e;
        if (delays[i]) await new Promise((r) => setTimeout(r, delays[i]));
      }
    }
    throw new Error('Retry exhausted');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
