/**
 * Seed additional demo data for hackathon presentation.
 * Run: npx tsx scripts/seed-demo.ts (from apps/api directory)
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding demo data...\n');

  // Get team IDs
  const pak = await prisma.team.findUnique({ where: { name: 'Pakistan' } });
  const ind = await prisma.team.findUnique({ where: { name: 'India' } });
  const aus = await prisma.team.findUnique({ where: { name: 'Australia' } });
  const eng = await prisma.team.findUnique({ where: { name: 'England' } });
  const sa = await prisma.team.findUnique({ where: { name: 'South Africa' } });
  const nz = await prisma.team.findUnique({ where: { name: 'New Zealand' } });

  if (!pak || !ind || !aus || !eng || !sa || !nz) {
    throw new Error('Teams not found. Run the main seed first.');
  }

  // Additional matches
  const matchData = [
    { matchId: 'AUS-ENG-2026-04-21', teamAId: aus.id, teamBId: eng.id, matchType: 'T20', tournament: 'PSL 2026', venue: 'National Stadium, Karachi', startTime: new Date('2026-04-21T10:00:00Z'), status: 'upcoming' },
    { matchId: 'PAK-AUS-2026-04-22', teamAId: pak.id, teamBId: aus.id, matchType: 'T20', tournament: 'PSL 2026', venue: 'Rawalpindi Cricket Stadium', startTime: new Date('2026-04-22T14:00:00Z'), status: 'upcoming' },
    { matchId: 'SA-NZ-2026-04-19', teamAId: sa.id, teamBId: nz.id, matchType: 'ODI', tournament: 'ICC Champions Trophy', venue: 'Newlands, Cape Town', startTime: new Date('2026-04-19T09:00:00Z'), status: 'completed' },
  ];

  for (const m of matchData) {
    await prisma.match.upsert({
      where: { matchId: m.matchId },
      update: {},
      create: m,
    });
  }
  console.log(`✓ Created ${matchData.length} additional matches`);

  // Additional markets
  const marketData = [
    { onChainId: 1, matchId: 'PAK-IND-2026-04-20', question: 'Will Pakistan score 180+?', lockTime: new Date('2026-04-20T14:00:00Z'), yesOutcome: 1, state: 'open', totalPrize: '50000' },
    { onChainId: 2, matchId: 'AUS-ENG-2026-04-21', question: 'Will Australia win?', lockTime: new Date('2026-04-21T10:00:00Z'), yesOutcome: 1, state: 'open', totalPrize: '25000' },
    { onChainId: 3, matchId: 'PAK-AUS-2026-04-22', question: 'Will Pakistan win?', lockTime: new Date('2026-04-22T14:00:00Z'), yesOutcome: 1, state: 'open', totalPrize: '15000' },
    { onChainId: 4, matchId: 'SA-NZ-2026-04-19', question: 'Will South Africa win?', lockTime: new Date('2026-04-19T09:00:00Z'), yesOutcome: 1, state: 'resolved', resolvedOutcome: 1, yesPool: '31000', noPool: '19000', totalPredictors: 1560, yesWon: true, totalPrize: '80000' },
  ];

  for (const m of marketData) {
    await prisma.market.upsert({
      where: { onChainId: m.onChainId },
      update: {},
      create: m,
    });
  }
  console.log(`✓ Created ${marketData.length} additional markets`);

  // Get admin user for brand profile
  const admin = await prisma.user.findFirst({ where: { role: 'super_admin' } });
  if (!admin) throw new Error('Admin user not found');

  // Create brand profile for admin (acting as demo sponsor)
  await prisma.brandProfile.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      brandName: 'Foodpanda',
      brandLogo: 'FP',
      description: 'Pakistan\'s leading food delivery platform.',
      category: 'food',
      verified: true,
    },
  });
  console.log('✓ Created brand profile for admin');

  // Create some deals
  const brandProfile = await prisma.brandProfile.findUnique({ where: { userId: admin.id } });
  if (brandProfile) {
    const dealData = [
      { brandId: brandProfile.id, title: '20% Off on All Orders', description: 'Get 20% off your next food order. Valid on orders above Rs. 500.', minCall: 50, dealType: 'coupon_code', couponCode: 'CRICCALL20', maxRedemptions: 5000, startsAt: new Date(), expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), active: true },
      { brandId: brandProfile.id, title: 'Free Zinger Burger', description: 'Enjoy a free Zinger with any purchase. Match day special.', minCall: 100, dealType: 'coupon_code', couponCode: 'ZINGER100', maxRedemptions: 2000, startsAt: new Date(), expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), active: true },
      { brandId: brandProfile.id, title: 'Free Meal Every PSL Match', description: 'One free meal (up to Rs. 800) during every PSL match. Superforecaster exclusive.', minCall: 5000, dealType: 'coupon_code', couponCode: 'SUPERMEAL', maxRedemptions: 100, startsAt: new Date(), expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), active: true },
    ];

    for (const d of dealData) {
      const existing = await prisma.deal.findFirst({ where: { title: d.title, brandId: d.brandId } });
      if (!existing) {
        await prisma.deal.create({ data: d });
      }
    }
    console.log(`✓ Created ${dealData.length} deals`);
  }

  // Create some demo users for the leaderboard
  const demoUsers = [
    { walletAddress: '0x1111111111111111111111111111111111111111', displayName: 'Ahmed Ali', cachedCallBalance: '12450', tier: 'superforecaster' },
    { walletAddress: '0x2222222222222222222222222222222222222222', displayName: 'Sara Khan', cachedCallBalance: '11200', tier: 'superforecaster' },
    { walletAddress: '0x3333333333333333333333333333333333333333', displayName: 'Zain Ul Abideen', cachedCallBalance: '9870', tier: 'expert' },
    { walletAddress: '0x4444444444444444444444444444444444444444', displayName: 'Usman Ghani', cachedCallBalance: '8540', tier: 'expert' },
    { walletAddress: '0x5555555555555555555555555555555555555555', displayName: 'Fatima Noor', cachedCallBalance: '7210', tier: 'expert' },
    { walletAddress: '0x6666666666666666666666666666666666666666', displayName: 'Hassan Raza', cachedCallBalance: '5876', tier: 'superforecaster' },
    { walletAddress: '0x7777777777777777777777777777777777777777', displayName: 'Ayesha Malik', cachedCallBalance: '4654', tier: 'expert' },
    { walletAddress: '0x8888888888888888888888888888888888888888', displayName: 'Bilal Ahmed', cachedCallBalance: '3432', tier: 'expert' },
    { walletAddress: '0x9999999999999999999999999999999999999999', displayName: 'Maryam Bibi', cachedCallBalance: '2810', tier: 'dedicated' },
    { walletAddress: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', displayName: 'Tariq Khan', cachedCallBalance: '2187', tier: 'dedicated' },
  ];

  for (const u of demoUsers) {
    await prisma.user.upsert({
      where: { walletAddress: u.walletAddress },
      update: { displayName: u.displayName, cachedCallBalance: u.cachedCallBalance, tier: u.tier },
      create: u,
    });
  }
  console.log(`✓ Created ${demoUsers.length} demo leaderboard users`);

  console.log('\nDemo seed complete!');
}

main()
  .catch((e) => { console.error('Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
