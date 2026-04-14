/**
 * Seed real PSL 2026 matches and markets.
 * Data sourced from CricAPI.
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// PSL franchise teams
const pslTeams = [
  { name: 'Peshawar Zalmi', shortName: 'PSZ', type: 'franchise', country: 'Pakistan' },
  { name: 'Quetta Gladiators', shortName: 'QTG', type: 'franchise', country: 'Pakistan' },
  { name: 'Karachi Kings', shortName: 'KRK', type: 'franchise', country: 'Pakistan' },
  { name: 'Islamabad United', shortName: 'ISU', type: 'franchise', country: 'Pakistan' },
  { name: 'Lahore Qalandars', shortName: 'LHQ', type: 'franchise', country: 'Pakistan' },
  { name: 'Multan Sultans', shortName: 'MS', type: 'franchise', country: 'Pakistan' },
  { name: 'Hyderabad Kingsmen', shortName: 'HK', type: 'franchise', country: 'Pakistan' },
  { name: 'Rawalpindiz', shortName: 'RPZ', type: 'franchise', country: 'Pakistan' },
];

// Real upcoming PSL 2026 matches (from CricAPI, April 15-26)
const pslMatches = [
  { matchId: 'psl-23-apr15', teamA: 'Peshawar Zalmi', teamB: 'Quetta Gladiators', date: '2026-04-15T14:00:00Z', venue: 'National Stadium, Karachi', name: '23rd Match' },
  { matchId: 'psl-25-apr16', teamA: 'Karachi Kings', teamB: 'Islamabad United', date: '2026-04-16T14:00:00Z', venue: 'National Stadium, Karachi', name: '25th Match' },
  { matchId: 'psl-24-apr16', teamA: 'Hyderabad Kingsmen', teamB: 'Rawalpindiz', date: '2026-04-16T09:30:00Z', venue: 'National Stadium, Karachi', name: '24th Match' },
  { matchId: 'psl-26-apr17', teamA: 'Lahore Qalandars', teamB: 'Quetta Gladiators', date: '2026-04-17T14:00:00Z', venue: 'National Stadium, Karachi', name: '26th Match' },
  { matchId: 'psl-27-apr18', teamA: 'Lahore Qalandars', teamB: 'Rawalpindiz', date: '2026-04-18T14:00:00Z', venue: 'National Stadium, Karachi', name: '27th Match' },
  { matchId: 'psl-29-apr19', teamA: 'Peshawar Zalmi', teamB: 'Quetta Gladiators', date: '2026-04-19T14:00:00Z', venue: 'National Stadium, Karachi', name: '29th Match' },
  { matchId: 'psl-28-apr19', teamA: 'Karachi Kings', teamB: 'Multan Sultans', date: '2026-04-19T09:30:00Z', venue: 'Gaddafi Stadium, Lahore', name: '28th Match' },
  { matchId: 'psl-30-apr21', teamA: 'Lahore Qalandars', teamB: 'Quetta Gladiators', date: '2026-04-21T09:30:00Z', venue: 'Gaddafi Stadium, Lahore', name: '30th Match' },
  { matchId: 'psl-31-apr21', teamA: 'Rawalpindiz', teamB: 'Multan Sultans', date: '2026-04-21T14:00:00Z', venue: 'National Stadium, Karachi', name: '31st Match' },
  { matchId: 'psl-33-apr22', teamA: 'Hyderabad Kingsmen', teamB: 'Multan Sultans', date: '2026-04-22T14:00:00Z', venue: 'National Stadium, Karachi', name: '33rd Match' },
  { matchId: 'psl-32-apr22', teamA: 'Karachi Kings', teamB: 'Peshawar Zalmi', date: '2026-04-22T09:30:00Z', venue: 'Gaddafi Stadium, Lahore', name: '32nd Match' },
  { matchId: 'psl-35-apr23', teamA: 'Lahore Qalandars', teamB: 'Karachi Kings', date: '2026-04-23T14:00:00Z', venue: 'Gaddafi Stadium, Lahore', name: '35th Match' },
  { matchId: 'psl-34-apr23', teamA: 'Rawalpindiz', teamB: 'Islamabad United', date: '2026-04-23T09:30:00Z', venue: 'National Stadium, Karachi', name: '34th Match' },
  { matchId: 'psl-36-apr24', teamA: 'Hyderabad Kingsmen', teamB: 'Islamabad United', date: '2026-04-24T14:00:00Z', venue: 'National Stadium, Karachi', name: '36th Match' },
  { matchId: 'psl-37-apr25', teamA: 'Quetta Gladiators', teamB: 'Karachi Kings', date: '2026-04-25T09:30:00Z', venue: 'Gaddafi Stadium, Lahore', name: '37th Match' },
  { matchId: 'psl-38-apr25', teamA: 'Lahore Qalandars', teamB: 'Peshawar Zalmi', date: '2026-04-25T14:00:00Z', venue: 'Gaddafi Stadium, Lahore', name: '38th Match' },
  { matchId: 'psl-40-apr26', teamA: 'Islamabad United', teamB: 'Multan Sultans', date: '2026-04-26T14:00:00Z', venue: 'National Stadium, Karachi', name: '40th Match' },
  { matchId: 'psl-39-apr26', teamA: 'Hyderabad Kingsmen', teamB: 'Rawalpindiz', date: '2026-04-26T09:30:00Z', venue: 'National Stadium, Karachi', name: '39th Match' },
];

async function main() {
  console.log('Seeding real PSL 2026 data...\n');

  // 1. Upsert PSL franchise teams
  const teamMap: Record<string, string> = {};
  for (const t of pslTeams) {
    const team = await prisma.team.upsert({
      where: { name: t.name },
      update: { shortName: t.shortName },
      create: t,
    });
    teamMap[t.name] = team.id;
  }
  console.log(`✓ ${pslTeams.length} PSL franchise teams ready`);

  // 2. Create matches and markets
  let marketId = 0;
  for (const m of pslMatches) {
    const teamAId = teamMap[m.teamA];
    const teamBId = teamMap[m.teamB];
    if (!teamAId || !teamBId) {
      console.log(`  ⚠ Skipping ${m.matchId}: team not found`);
      continue;
    }

    const matchDate = new Date(m.date);
    const isUpcoming = matchDate > new Date();
    const status = isUpcoming ? 'upcoming' : 'live';

    // Create match
    await prisma.match.upsert({
      where: { matchId: m.matchId },
      update: { status },
      create: {
        matchId: m.matchId,
        teamAId,
        teamBId,
        matchType: 'T20',
        tournament: 'PSL 2026',
        venue: m.venue,
        startTime: matchDate,
        status,
      },
    });

    // Create market: "Will [TeamA] win?"
    await prisma.market.upsert({
      where: { onChainId: marketId },
      update: {},
      create: {
        onChainId: marketId,
        matchId: m.matchId,
        question: `Will ${m.teamA} win?`,
        lockTime: matchDate,
        yesOutcome: 1,
        state: 'open',
        totalPrize: '10000', // Rs. 10,000 default platform prize
      },
    });

    console.log(`  ✓ ${m.name}: ${m.teamA} vs ${m.teamB} (Market #${marketId})`);
    marketId++;
  }
  console.log(`\n✓ ${pslMatches.length} PSL matches + markets created`);

  // 3. Create deals (real brands, realistic offers)
  const admin = await prisma.user.findFirst({ where: { role: 'super_admin' } });
  if (admin) {
    const bp = await prisma.brandProfile.upsert({
      where: { userId: admin.id },
      update: {},
      create: {
        userId: admin.id,
        brandName: 'CricCall',
        brandLogo: 'CC',
        description: 'Official CricCall platform deals for PSL 2026.',
        category: 'sports',
        verified: true,
      },
    });

    const deals = [
      { title: 'Free Foodpanda Delivery', description: 'Free delivery on your next 3 orders during PSL matches. No minimum order.', minCall: 50, couponCode: 'PSLDELIVERY', maxRedemptions: 10000 },
      { title: 'KFC Match Day Combo', description: 'Buy 1 Get 1 Free on Zinger Burgers during any PSL 2026 match.', minCall: 200, couponCode: 'PSLZINGER', maxRedemptions: 5000 },
      { title: 'Jazz 5GB PSL Data Pack', description: 'Free 5GB data bundle valid for 7 days. Stream PSL matches on the go.', minCall: 500, couponCode: 'PSLDATA5', maxRedemptions: 8000 },
      { title: 'Daraz PSL Jersey Rs. 500 Off', description: 'Get Rs. 500 off on official PSL 2026 team jerseys on Daraz.pk.', minCall: 1000, couponCode: 'PSLJERSEY', maxRedemptions: 2000 },
      { title: 'PTCL Smart TV 3 Months Free', description: '3 months free PTCL Smart TV subscription. Watch every PSL match live.', minCall: 2000, couponCode: 'PSLTV3', maxRedemptions: 500 },
      { title: 'VIP Match Tickets', description: 'Win VIP enclosure tickets to PSL 2026 playoff matches. Superforecaster exclusive.', minCall: 5000, couponCode: 'PSLVIP', maxRedemptions: 50 },
    ];

    for (const d of deals) {
      const existing = await prisma.deal.findFirst({ where: { title: d.title } });
      if (!existing) {
        await prisma.deal.create({
          data: {
            brandId: bp.id,
            title: d.title,
            description: d.description,
            minCall: d.minCall,
            dealType: 'coupon_code',
            couponCode: d.couponCode,
            maxRedemptions: d.maxRedemptions,
            startsAt: new Date(),
            expiresAt: new Date('2026-05-15'),
            active: true,
          },
        });
      }
    }
    console.log(`✓ ${deals.length} PSL deals created`);
  }

  console.log('\n🏏 PSL 2026 seed complete!');
}

main()
  .catch((e) => { console.error('Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
