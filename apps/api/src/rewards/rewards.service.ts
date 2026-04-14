import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PredictionsService } from '../predictions/predictions.service';
import { WireFluidService } from '../wirefluid/wirefluid.service';
import { ConfigService } from '@nestjs/config';
import { StandardMerkleTree } from '@openzeppelin/merkle-tree';

@Injectable()
export class RewardsService {
  private readonly logger = new Logger(RewardsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly predictions: PredictionsService,
    private readonly wirefluid: WireFluidService,
    private readonly config: ConfigService,
  ) {}

  // ── Admin: Distribute rewards for a market ──────────────────────────────

  async distributeRewards(marketId: string) {
    // Find the market to get the on-chain ID
    const market = await this.prisma.market.findUnique({
      where: { id: marketId },
      select: { id: true, onChainId: true, state: true },
    });

    if (!market) {
      throw new NotFoundException(`Market ${marketId} not found`);
    }

    if (market.state !== 'resolved') {
      throw new BadRequestException(
        `Market ${marketId} is not resolved (state: ${market.state})`,
      );
    }

    // Find all campaigns for this market
    const campaigns = await this.prisma.marketCampaign.findMany({
      where: { marketId },
    });

    if (campaigns.length === 0) {
      throw new NotFoundException(
        `No campaigns found for market ${marketId}`,
      );
    }

    // Get winner ranking from predictions
    const ranking = await this.predictions.getWinnerRanking(market.onChainId);

    if (!ranking.resolved || ranking.winners.length === 0) {
      throw new BadRequestException(
        'Market has no winners or is not yet resolved',
      );
    }

    const results: Array<{
      campaignId: string;
      distributionId: string;
      merkleRoot: string;
      winnerCount: number;
      totalAllocated: string;
      postTxHash: string | null;
    }> = [];

    for (const campaign of campaigns) {
      // Check if distribution already exists
      const existing = await this.prisma.rewardDistribution.findFirst({
        where: { campaignId: campaign.campaignId },
      });

      if (existing) {
        this.logger.warn(
          `Distribution already exists for campaign ${campaign.campaignId}, skipping`,
        );
        results.push({
          campaignId: campaign.campaignId,
          distributionId: existing.id,
          merkleRoot: existing.merkleRoot,
          winnerCount: existing.winnerCount,
          totalAllocated: existing.totalAllocated,
          postTxHash: existing.postTxHash,
        });
        continue;
      }

      const prizeAmount = BigInt(campaign.prizeAmount);
      const totalWinningPool = BigInt(ranking.totalWinningPool);

      // Compute each winner's PKR share
      const winnersWithPkr = ranking.winners.map((w) => {
        const userCall = BigInt(w.amount);
        // pkr = (userCall / totalWinningPool) * prizeAmount
        const pkr = (userCall * prizeAmount) / totalWinningPool;
        return {
          userId: w.userId,
          walletAddress: w.walletAddress,
          callAmount: w.amount,
          pkrAmount: pkr.toString(),
          pkrAmountBigInt: pkr,
        };
      });

      // Filter out zero-amount winners
      const validWinners = winnersWithPkr.filter(
        (w) => w.pkrAmountBigInt > 0n,
      );

      if (validWinners.length === 0) {
        this.logger.warn(
          `No valid winners for campaign ${campaign.campaignId}`,
        );
        continue;
      }

      // Build Merkle tree
      const values: [string, bigint][] = validWinners.map((w) => [
        w.walletAddress,
        w.pkrAmountBigInt,
      ]);

      const tree = StandardMerkleTree.of(values, ['address', 'uint256']);
      const merkleRoot = tree.root;
      const treeData = tree.dump();

      const totalAllocated = validWinners
        .reduce((sum, w) => sum + w.pkrAmountBigInt, 0n)
        .toString();

      // Store distribution in DB
      const distribution = await this.prisma.rewardDistribution.create({
        data: {
          marketId,
          campaignId: campaign.campaignId,
          merkleRoot,
          totalAllocated,
          winnerCount: validWinners.length,
          treeData: treeData as any,
        },
      });

      // Store winner records
      await this.prisma.rewardWinner.createMany({
        data: validWinners.map((w) => ({
          distributionId: distribution.id,
          userId: w.userId,
          walletAddress: w.walletAddress,
          pkrAmount: w.pkrAmount,
          callAmount: w.callAmount,
        })),
      });

      // Post Merkle root on-chain via owner wallet
      let postTxHash: string | null = null;
      try {
        postTxHash = await this.postWinnerRootOnChain(
          campaign.campaignId,
          merkleRoot as `0x${string}`,
          BigInt(totalAllocated),
        );

        await this.prisma.rewardDistribution.update({
          where: { id: distribution.id },
          data: { postTxHash },
        });

        // Update campaign with merkle root
        await this.prisma.marketCampaign.update({
          where: { id: campaign.id },
          data: { merkleRoot, status: 'resolved' },
        });
      } catch (error) {
        this.logger.error(
          `Failed to post winner root on-chain for campaign ${campaign.campaignId}: ${error.message}`,
        );
      }

      results.push({
        campaignId: campaign.campaignId,
        distributionId: distribution.id,
        merkleRoot,
        winnerCount: validWinners.length,
        totalAllocated,
        postTxHash,
      });
    }

    return { marketId, distributions: results };
  }

  // ── Post winner root on-chain with retry ────────────────────────────────

  private async postWinnerRootOnChain(
    campaignId: string,
    root: `0x${string}`,
    totalAllocated: bigint,
  ): Promise<string> {
    const vaultAddress = this.config.getOrThrow<`0x${string}`>(
      'SPONSOR_VAULT_ADDRESS',
    );
    const ownerWallet = this.wirefluid.getOwnerWalletClient();
    const publicClient = this.wirefluid.getPublicClient();

    const retryDelays = [0, 5000, 15000];

    for (let attempt = 0; attempt < retryDelays.length; attempt++) {
      try {
        if (retryDelays[attempt] > 0) {
          await new Promise((r) => setTimeout(r, retryDelays[attempt]));
        }

        const txHash = await ownerWallet.writeContract({
          chain: ownerWallet.chain!,
          account: ownerWallet.account!,
          address: vaultAddress,
          abi: [
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
          ] as const,
          functionName: 'postWinnerRoot',
          args: [campaignId, root, totalAllocated],
        });

        // Wait for confirmation
        await publicClient.waitForTransactionReceipt({ hash: txHash });

        this.logger.log(
          `Posted winner root for campaign ${campaignId}: ${txHash}`,
        );
        return txHash;
      } catch (error) {
        this.logger.warn(
          `Attempt ${attempt + 1}/3 failed for postWinnerRoot (${campaignId}): ${error.message}`,
        );

        if (attempt === retryDelays.length - 1) {
          throw error;
        }
      }
    }

    throw new Error('postWinnerRoot failed after all retries');
  }

  // ── User: Get all my rewards ────────────────────────────────────────────

  async getMyRewards(userId: string) {
    const winners = await this.prisma.rewardWinner.findMany({
      where: { userId },
      include: {
        distribution: {
          include: {
            campaign: {
              select: {
                campaignId: true,
                sponsorName: true,
                sponsorLogo: true,
                sponsorBanner: true,
                sponsorUrl: true,
                prizeAmount: true,
                tier: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return winners.map((w) => ({
      id: w.id,
      campaignId: w.distribution.campaign.campaignId,
      sponsor: w.distribution.campaign.sponsorName,
      sponsorLogo: w.distribution.campaign.sponsorLogo,
      sponsorUrl: w.distribution.campaign.sponsorUrl,
      tier: w.distribution.campaign.tier,
      pkrAmount: w.pkrAmount,
      callAmount: w.callAmount,
      claimed: w.claimed,
      claimTxHash: w.claimTxHash,
      distributedAt: w.createdAt,
    }));
  }

  // ── User: Get unclaimed rewards ─────────────────────────────────────────

  async getUnclaimedRewards(userId: string) {
    const winners = await this.prisma.rewardWinner.findMany({
      where: { userId, claimed: false },
      include: {
        distribution: {
          include: {
            campaign: {
              select: {
                campaignId: true,
                sponsorName: true,
                sponsorLogo: true,
                sponsorBanner: true,
                sponsorUrl: true,
                prizeAmount: true,
                tier: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return winners.map((w) => ({
      id: w.id,
      campaignId: w.distribution.campaign.campaignId,
      sponsor: w.distribution.campaign.sponsorName,
      sponsorLogo: w.distribution.campaign.sponsorLogo,
      sponsorUrl: w.distribution.campaign.sponsorUrl,
      tier: w.distribution.campaign.tier,
      pkrAmount: w.pkrAmount,
      callAmount: w.callAmount,
      distributedAt: w.createdAt,
    }));
  }

  // ── User: Get Merkle proof for claiming ─────────────────────────────────

  async getMerkleProof(campaignId: string, userId: string) {
    // Get user's wallet address
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { walletAddress: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Load distribution for this campaign
    const distribution = await this.prisma.rewardDistribution.findFirst({
      where: { campaignId },
    });

    if (!distribution) {
      throw new NotFoundException(
        `No distribution found for campaign ${campaignId}`,
      );
    }

    // Check the user is a winner in this distribution
    const winner = await this.prisma.rewardWinner.findFirst({
      where: { distributionId: distribution.id, userId },
    });

    if (!winner) {
      throw new NotFoundException(
        'You are not a winner in this campaign',
      );
    }

    // Reconstruct the Merkle tree from stored data
    const tree = StandardMerkleTree.load(
      distribution.treeData as any,
    );

    // Find the user's leaf and generate proof
    for (const [i, v] of tree.entries()) {
      if ((v[0] as string).toLowerCase() === user.walletAddress.toLowerCase()) {
        const proof = tree.getProof(i);
        return {
          campaignId,
          walletAddress: user.walletAddress,
          amount: winner.pkrAmount,
          proof,
        };
      }
    }

    throw new NotFoundException(
      'Could not find your leaf in the Merkle tree',
    );
  }

  // ── Admin: Get distribution status ──────────────────────────────────────

  async getDistributionStatus(marketId: string) {
    const distributions = await this.prisma.rewardDistribution.findMany({
      where: { marketId },
      include: {
        campaign: {
          select: {
            campaignId: true,
            sponsorName: true,
            prizeAmount: true,
            tier: true,
            status: true,
          },
        },
        winners: {
          select: {
            claimed: true,
            pkrAmount: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return distributions.map((d) => {
      const totalClaimed = d.winners
        .filter((w) => w.claimed)
        .reduce((sum, w) => sum + BigInt(w.pkrAmount), 0n)
        .toString();

      const totalUnclaimed = d.winners
        .filter((w) => !w.claimed)
        .reduce((sum, w) => sum + BigInt(w.pkrAmount), 0n)
        .toString();

      return {
        distributionId: d.id,
        campaignId: d.campaign.campaignId,
        sponsorName: d.campaign.sponsorName,
        tier: d.campaign.tier,
        campaignStatus: d.campaign.status,
        merkleRoot: d.merkleRoot,
        totalAllocated: d.totalAllocated,
        winnerCount: d.winnerCount,
        claimedCount: d.winners.filter((w) => w.claimed).length,
        totalClaimed,
        totalUnclaimed,
        postTxHash: d.postTxHash,
        createdAt: d.createdAt,
      };
    });
  }
}
