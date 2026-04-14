import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding CricCall database...');

  // 1. Seed teams
  const teams = [
    { name: 'Pakistan', shortName: 'PAK', logoUrl: null, type: 'national', country: 'Pakistan' },
    { name: 'India', shortName: 'IND', logoUrl: null, type: 'national', country: 'India' },
    { name: 'Australia', shortName: 'AUS', logoUrl: null, type: 'national', country: 'Australia' },
    { name: 'England', shortName: 'ENG', logoUrl: null, type: 'national', country: 'England' },
    { name: 'South Africa', shortName: 'SA', logoUrl: null, type: 'national', country: 'South Africa' },
    { name: 'New Zealand', shortName: 'NZ', logoUrl: null, type: 'national', country: 'New Zealand' },
    { name: 'Sri Lanka', shortName: 'SL', logoUrl: null, type: 'national', country: 'Sri Lanka' },
    { name: 'Bangladesh', shortName: 'BAN', logoUrl: null, type: 'national', country: 'Bangladesh' },
    { name: 'West Indies', shortName: 'WI', logoUrl: null, type: 'national', country: 'West Indies' },
    { name: 'Afghanistan', shortName: 'AFG', logoUrl: null, type: 'national', country: 'Afghanistan' },
    // PSL franchises
    { name: 'Islamabad United', shortName: 'ISL', logoUrl: null, type: 'franchise', country: 'Pakistan' },
    { name: 'Lahore Qalandars', shortName: 'LQ', logoUrl: null, type: 'franchise', country: 'Pakistan' },
    { name: 'Karachi Kings', shortName: 'KK', logoUrl: null, type: 'franchise', country: 'Pakistan' },
    { name: 'Peshawar Zalmi', shortName: 'PZ', logoUrl: null, type: 'franchise', country: 'Pakistan' },
    { name: 'Quetta Gladiators', shortName: 'QG', logoUrl: null, type: 'franchise', country: 'Pakistan' },
    { name: 'Multan Sultans', shortName: 'MS', logoUrl: null, type: 'franchise', country: 'Pakistan' },
  ];

  for (const team of teams) {
    await prisma.team.upsert({
      where: { name: team.name },
      update: {},
      create: team,
    });
  }
  console.log(`  ✓ Seeded ${teams.length} teams`);

  // 2. Seed admin user (will be assigned super_admin role)
  // This wallet address should match the deployer wallet
  const adminWallet = '0x742d35cc6634c0532925a3b844bc9e7595f5baab';
  const admin = await prisma.user.upsert({
    where: { walletAddress: adminWallet },
    update: { role: 'super_admin', displayName: 'CricCall Admin' },
    create: {
      walletAddress: adminWallet,
      role: 'super_admin',
      displayName: 'CricCall Admin',
      tier: 'superforecaster',
      cachedCallBalance: '10000',
    },
  });
  console.log(`  ✓ Admin user created: ${admin.walletAddress} (${admin.role})`);

  // 3. Seed a demo match
  const pak = await prisma.team.findUnique({ where: { name: 'Pakistan' } });
  const ind = await prisma.team.findUnique({ where: { name: 'India' } });

  if (pak && ind) {
    const match = await prisma.match.upsert({
      where: { matchId: 'PAK-IND-2026-04-20' },
      update: {},
      create: {
        matchId: 'PAK-IND-2026-04-20',
        teamAId: pak.id,
        teamBId: ind.id,
        matchType: 'T20',
        tournament: 'PSL 2026',
        venue: 'Gaddafi Stadium, Lahore',
        startTime: new Date('2026-04-20T14:00:00Z'),
        status: 'upcoming',
      },
    });
    console.log(`  ✓ Demo match created: PAK vs IND (${match.matchId})`);

    // 4. Seed a demo market
    const market = await prisma.market.upsert({
      where: { onChainId: 0 },
      update: {},
      create: {
        onChainId: 0,
        matchId: match.matchId,
        question: 'Will Pakistan win?',
        lockTime: new Date('2026-04-20T14:00:00Z'),
        yesOutcome: 1, // TeamA = Pakistan
        state: 'open',
        totalPrize: '5000',
      },
    });
    console.log(`  ✓ Demo market created: "${market.question}" (onChainId: ${market.onChainId})`);
  }

  console.log('\nSeed complete!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
