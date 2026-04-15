// Mock data for CricCall frontend development
// Realistic cricket data that looks like production

export interface Team {
  id: string;
  name: string;
  shortName: string;
  flag: string; // emoji flag
  color: string;
}

export interface Match {
  id: string;
  teamA: Team;
  teamB: Team;
  matchType: "T20" | "ODI" | "Test";
  tournament: string;
  venue: string;
  startTime: string;
  status: "upcoming" | "live" | "completed";
  score?: {
    teamA?: string;
    teamB?: string;
    batting?: "teamA" | "teamB";
    overs?: string;
  };
}

export interface Sponsor {
  name: string;
  logo: string;
  logoImage?: string; // path to actual brand logo image
  tier: "title" | "gold" | "sponsor";
  prizeAmount: number;
  bannerColor: string;
}

export interface Market {
  id: number;
  matchId: string;
  match: Match;
  question: string;
  yesPool: number;
  noPool: number;
  totalPredictors: number;
  state: "open" | "locked" | "resolved" | "canceled";
  lockTime: string;
  resolvedOutcome?: "yes" | "no";
  sponsors: Sponsor[];
  totalPrize: number;
}

export interface LeaderboardEntry {
  rank: number;
  address: string;
  displayName: string;
  callBalance: number;
  tier: "new_fan" | "casual" | "dedicated" | "expert" | "superforecaster";
  avatar?: string;
  winRate: number;
  location?: string; // city, country code e.g. "LAHORE, PK"
}

export interface Deal {
  id: string;
  brandName: string;
  brandLogo: string;
  brandColor: string;
  brandImage?: string; // actual brand/deal image URL
  title: string;
  description: string;
  minCall: number;
  maxRedemptions?: number;
  category: "food" | "telecom" | "ecommerce" | "entertainment";
  totalRedeemed: number;
  expiresAt: string;
}

export interface Notification {
  id: string;
  type: "winnings" | "loss" | "reward" | "tier_up" | "deal_unlocked" | "sponsor";
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

// --- Teams ---

export const teams: Record<string, Team> = {
  PAK: { id: "PAK", name: "Pakistan", shortName: "PAK", flag: "\u{1F1F5}\u{1F1F0}", color: "#01411C" },
  IND: { id: "IND", name: "India", shortName: "IND", flag: "\u{1F1EE}\u{1F1F3}", color: "#0066B3" },
  AUS: { id: "AUS", name: "Australia", shortName: "AUS", flag: "\u{1F1E6}\u{1F1FA}", color: "#FFCD00" },
  ENG: { id: "ENG", name: "England", shortName: "ENG", flag: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}", color: "#CF171F" },
  SA: { id: "SA", name: "South Africa", shortName: "SA", flag: "\u{1F1FF}\u{1F1E6}", color: "#007749" },
  NZ: { id: "NZ", name: "New Zealand", shortName: "NZ", flag: "\u{1F1F3}\u{1F1FF}", color: "#000000" },
  SL: { id: "SL", name: "Sri Lanka", shortName: "SL", flag: "\u{1F1F1}\u{1F1F0}", color: "#0A2351" },
  BAN: { id: "BAN", name: "Bangladesh", shortName: "BAN", flag: "\u{1F1E7}\u{1F1E9}", color: "#006A4E" },
};

// --- Matches ---

export const matches: Match[] = [
  {
    id: "PAK-IND-2026-04-20",
    teamA: teams.PAK,
    teamB: teams.IND,
    matchType: "T20",
    tournament: "PSL 2026",
    venue: "Gaddafi Stadium, Lahore",
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago (live)
    status: "live",
    score: {
      teamA: "168/4",
      teamB: undefined,
      batting: "teamA",
      overs: "17.3",
    },
  },
  {
    id: "AUS-ENG-2026-04-20",
    teamA: teams.AUS,
    teamB: teams.ENG,
    matchType: "T20",
    tournament: "PSL 2026",
    venue: "National Stadium, Karachi",
    startTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours from now
    status: "upcoming",
  },
  {
    id: "PAK-AUS-2026-04-21",
    teamA: teams.PAK,
    teamB: teams.AUS,
    matchType: "T20",
    tournament: "PSL 2026",
    venue: "Rawalpindi Cricket Stadium",
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    status: "upcoming",
  },
  {
    id: "SA-NZ-2026-04-19",
    teamA: teams.SA,
    teamB: teams.NZ,
    matchType: "ODI",
    tournament: "ICC Champions Trophy",
    venue: "Newlands, Cape Town",
    startTime: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    status: "completed",
    score: {
      teamA: "287/8",
      teamB: "243/10",
    },
  },
];

// --- Sponsors ---

const sponsorPTCL: Sponsor = {
  name: "PTCL",
  logo: "PTCL",
  logoImage: "/brand-images/ptcl-logo.jpeg",
  tier: "title",
  prizeAmount: 1050000,
  bannerColor: "#00A651",
};

const sponsorFoodpanda: Sponsor = {
  name: "Foodpanda",
  logo: "FP",
  logoImage: "/brand-images/foodpanda-logo.jpeg",
  tier: "gold",
  prizeAmount: 100000,
  bannerColor: "#D70F64",
};

const sponsorPlatform: Sponsor = {
  name: "CricCall",
  logo: "CC",
  logoImage: "/icon.png",
  tier: "sponsor",
  prizeAmount: 5000,
  bannerColor: "#16A34A",
};

const sponsorKFC: Sponsor = {
  name: "KFC",
  logo: "KFC",
  logoImage: "/brand-images/kfc-logo.png",
  tier: "gold",
  prizeAmount: 75000,
  bannerColor: "#E4002B",
};

const sponsorJazz: Sponsor = {
  name: "Jazz",
  logo: "JZ",
  logoImage: "/brand-images/jazz.jpeg",
  tier: "sponsor",
  prizeAmount: 50000,
  bannerColor: "#ED1C24",
};

// --- Brand Logos (for landing page and deals) ---

export const brandLogos = [
  { name: "PTCL", image: "/brand-images/ptcl-logo.jpeg" },
  { name: "Foodpanda", image: "/brand-images/foodpanda-logo.jpeg" },
  { name: "KFC", image: "/brand-images/kfc-logo.png" },
  { name: "Jazz", image: "/brand-images/jazz.jpeg" },
  { name: "Daraz", image: "/brand-images/daraz-logo.jpeg" },
  { name: "PSL", image: "/brand-images/psl-logo.jpeg" },
];

// --- Markets ---

export const markets: Market[] = [
  {
    id: 0,
    matchId: "PAK-IND-2026-04-20",
    match: matches[0],
    question: "Will Pakistan score 180+?",
    yesPool: 47500,
    noPool: 22800,
    totalPredictors: 2847,
    state: "open",
    lockTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    sponsors: [sponsorPTCL, sponsorFoodpanda, sponsorPlatform],
    totalPrize: 1155000,
  },
  {
    id: 1,
    matchId: "PAK-IND-2026-04-20",
    match: matches[0],
    question: "Will Pakistan win?",
    yesPool: 62000,
    noPool: 38000,
    totalPredictors: 3421,
    state: "open",
    lockTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    sponsors: [sponsorPTCL, sponsorKFC, sponsorPlatform],
    totalPrize: 1130000,
  },
  {
    id: 2,
    matchId: "AUS-ENG-2026-04-20",
    match: matches[1],
    question: "Will Australia win?",
    yesPool: 15200,
    noPool: 18900,
    totalPredictors: 892,
    state: "open",
    lockTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    sponsors: [sponsorFoodpanda, sponsorJazz, sponsorPlatform],
    totalPrize: 155000,
  },
  {
    id: 3,
    matchId: "PAK-AUS-2026-04-21",
    match: matches[2],
    question: "Will Pakistan win?",
    yesPool: 8400,
    noPool: 4200,
    totalPredictors: 423,
    state: "open",
    lockTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    sponsors: [sponsorPlatform],
    totalPrize: 5000,
  },
  {
    id: 4,
    matchId: "SA-NZ-2026-04-19",
    match: matches[3],
    question: "Will South Africa win?",
    yesPool: 31000,
    noPool: 19000,
    totalPredictors: 1560,
    state: "resolved",
    lockTime: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    resolvedOutcome: "yes",
    sponsors: [sponsorKFC, sponsorPlatform],
    totalPrize: 80000,
  },
];

// --- Leaderboard ---

export const leaderboard: LeaderboardEntry[] = [
  { rank: 1, address: "0x1a2b...3c4d", displayName: "Ahmed Ali", callBalance: 12450, tier: "superforecaster", winRate: 88.4, location: "LAHORE, PK" },
  { rank: 2, address: "0x5e6f...7g8h", displayName: "Sara Khan", callBalance: 11200, tier: "superforecaster", winRate: 82.1, location: "KARACHI, PK" },
  { rank: 3, address: "0x9i0j...1k2l", displayName: "Zain Ul Abideen", callBalance: 9870, tier: "expert", winRate: 79.5, location: "ISLAMABAD, PK" },
  { rank: 4, address: "0x3m4n...5o6p", displayName: "Usman Ghani", callBalance: 8540, tier: "expert", winRate: 75.0, location: "RAWALPINDI, PK" },
  { rank: 5, address: "0x7q8r...9s0t", displayName: "Fatima Noor", callBalance: 7210, tier: "expert", winRate: 72.3, location: "FAISALABAD, PK" },
  { rank: 6, address: "0xa1b2...c3d4", displayName: "SixerMachine", callBalance: 5876, tier: "superforecaster", winRate: 69.4, location: "MULTAN, PK" },
  { rank: 7, address: "0xe5f6...g7h8", displayName: "BowlerBoss", callBalance: 4654, tier: "expert", winRate: 67.2, location: "PESHAWAR, PK" },
  { rank: 8, address: "0xi9j0...k1l2", displayName: "MatchDay_Pro", callBalance: 3432, tier: "expert", winRate: 64.8, location: "QUETTA, PK" },
  { rank: 9, address: "0xm3n4...o5p6", displayName: "WicketWizard", callBalance: 2810, tier: "dedicated", winRate: 62.1, location: "SIALKOT, PK" },
  { rank: 10, address: "0xq7r8...s9t0", displayName: "CenturyMaker", callBalance: 2187, tier: "dedicated", winRate: 60.5, location: "HYDERABAD, PK" },
];

// --- Deals ---

export const deals: Deal[] = [
  {
    id: "d1",
    brandName: "Foodpanda",
    brandLogo: "FP",
    brandColor: "#D70F64",
    title: "20% Off on All Orders",
    description: "Get 20% off on your next food order. Valid on orders above Rs. 500.",
    minCall: 50,
    maxRedemptions: 5000,
    category: "food",
    totalRedeemed: 1200,
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "d2",
    brandName: "KFC",
    brandLogo: "KFC",
    brandColor: "#E4002B",
    title: "Free Zinger Burger",
    description: "Enjoy a free Zinger with any purchase. Match day special.",
    minCall: 100,
    maxRedemptions: 2000,
    category: "food",
    totalRedeemed: 876,
    expiresAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "d3",
    brandName: "Jazz",
    brandLogo: "JZ",
    brandColor: "#ED1C24",
    title: "3 Monthly Data Bundle",
    description: "Get 2GB free data pack activated automatically on PSL match days.",
    minCall: 200,
    maxRedemptions: 10000,
    category: "telecom",
    totalRedeemed: 4521,
    expiresAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "d4",
    brandName: "Daraz",
    brandLogo: "DZ",
    brandColor: "#F85606",
    title: "Rs. 500 Off Cricket Jerseys",
    description: "Get Rs. 500 off official PSL team jerseys on Daraz.",
    minCall: 1000,
    maxRedemptions: 500,
    category: "ecommerce",
    totalRedeemed: 234,
    expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "d5",
    brandName: "PTCL",
    brandLogo: "PTCL",
    brandColor: "#00A651",
    title: "3 Months Smart TV Subscription",
    description: "Half price on PTCL Smart TV subscription for 3 months.",
    minCall: 1000,
    maxRedemptions: 1000,
    category: "entertainment",
    totalRedeemed: 156,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "d6",
    brandName: "Foodpanda",
    brandLogo: "FP",
    brandColor: "#D70F64",
    title: "Free meal every PSL match",
    description: "One free meal (up to Rs. 800) during every PSL match. Superforecaster exclusive.",
    minCall: 5000,
    category: "food",
    totalRedeemed: 42,
    expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// --- Brand Profile (mock for sponsor role) ---

export interface BrandProfile {
  id: string;
  userId: string;
  brandName: string;
  brandLogo: string;       // logo URL (MinIO)
  brandBanner?: string;    // banner URL (MinIO)
  brandUrl?: string;       // website
  description: string;
  category: "food" | "telecom" | "ecommerce" | "entertainment" | "sports" | "other";
  verified: boolean;
  createdAt: string;
}

export const currentBrandProfile: BrandProfile = {
  id: "bp1",
  userId: "0xdead...beef",
  brandName: "Foodpanda",
  brandLogo: "FP",
  brandBanner: undefined,
  brandUrl: "https://foodpanda.pk",
  description: "Pakistan's leading food delivery platform. Order from 30,000+ restaurants nationwide.",
  category: "food",
  verified: true,
  createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
};

// --- Current User (mock) ---

export const currentUser = {
  address: "0xdead...beef",
  displayName: "YoungGunner",
  callBalance: 647,
  tier: "dedicated" as const,
  totalPredictions: 84,
  correctPredictions: 52,
  winRate: 61.9,
  lastClaimedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(), // 20 hours ago (can claim again)
  connected: true,
};

// --- Notifications ---

export const notifications: Notification[] = [
  {
    id: "n1",
    type: "winnings",
    title: "You won 85 CALL!",
    body: "PAK vs SA resolved. Your prediction was correct.",
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: "n2",
    type: "reward",
    title: "Rs. 500 PKR available!",
    body: "Foodpanda challenge reward. Claim now.",
    read: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: "n3",
    type: "tier_up",
    title: "You reached Dedicated Fan!",
    body: "New brand deals unlocked. Check the Deals tab.",
    read: false,
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: "n4",
    type: "loss",
    title: "AUS vs ENG resolved",
    body: "Better luck next time. Claim your daily CALL and try again!",
    read: true,
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
];

// --- Helpers ---

export function formatPKR(amount: number | string): string {
  const n = Number(amount) || 0;
  if (n >= 100000) {
    return `Rs. ${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)} Lac`;
  }
  return `Rs. ${n.toLocaleString("en-PK")}`;
}

export function formatCALL(amount: number | string): string {
  const n = Number(amount) || 0;
  return n.toLocaleString("en-PK");
}

export function getYesPercentage(market: Market): number {
  const yes = Number(market.yesPool) || 0;
  const no = Number(market.noPool) || 0;
  const total = yes + no;
  if (total === 0) return 50;
  return Math.round((yes / total) * 100);
}

export function getTierLabel(tier: string): string {
  const labels: Record<string, string> = {
    new_fan: "New Fan",
    casual: "Casual Fan",
    dedicated: "Dedicated Fan",
    expert: "Expert",
    superforecaster: "Superforecaster",
  };
  return labels[tier] || tier;
}

export function getTierColor(tier: string): string {
  const colors: Record<string, string> = {
    new_fan: "#6B7280",
    casual: "#16A34A",
    dedicated: "#2563EB",
    expert: "#9333EA",
    superforecaster: "#D97706",
  };
  return colors[tier] || "#6B7280";
}

export function timeUntil(dateStr: string): string {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return "Now";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 24) return `${Math.floor(hours / 24)}d`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
