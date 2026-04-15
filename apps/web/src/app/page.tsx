"use client";

import { motion } from "framer-motion";
import {
  brandLogos,
  formatCALL,
  formatPKR,
  getYesPercentage,
  getTierColor,
  timeUntil,
  type Market,
  type LeaderboardEntry,
} from "@/data/mock";
import { useLiveMarkets, useLeaderboard } from "@/hooks/use-api";
import {
  Wallet,
  Trophy,
  Users,
  Clock,
  Shield,
  Eye,
  Coins,
  ChevronRight,
  Download,
  Target,
  Zap,
  ArrowRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { TeamLogo } from "@/components/shared/team-logo";
import { useAuth } from "@/lib/auth-context";

/**
 * Map an API market object (Prisma shape) to the mock Market type the UI expects.
 * The API may return nested relations with slightly different field names.
 */
function mapApiMarket(raw: any): Market {
  // If the data already matches the mock shape, return as-is
  if (raw.match && raw.match.teamA && typeof raw.match.teamA === "object" && raw.match.teamA.flag) {
    return raw as Market;
  }

  // Otherwise, map from Prisma-style nested shape
  const match = raw.match || {};
  return {
    id: raw.id,
    matchId: raw.matchId || match.id || "",
    match: {
      id: match.id || raw.matchId || "",
      teamA: {
        id: match.teamA?.id || match.teamAId || "",
        name: match.teamA?.name || match.teamAName || "TBA",
        shortName: match.teamA?.shortName || match.teamA?.name?.slice(0, 3).toUpperCase() || "TBA",
        flag: match.teamA?.flag || "",
        color: match.teamA?.color || "#333",
      },
      teamB: {
        id: match.teamB?.id || match.teamBId || "",
        name: match.teamB?.name || match.teamBName || "TBA",
        shortName: match.teamB?.shortName || match.teamB?.name?.slice(0, 3).toUpperCase() || "TBA",
        flag: match.teamB?.flag || "",
        color: match.teamB?.color || "#333",
      },
      matchType: match.matchType || match.format || "T20",
      tournament: match.tournament || "",
      venue: match.venue || "",
      startTime: match.startTime || match.startAt || "",
      status: match.status || "upcoming",
      score: match.score || undefined,
    },
    question: raw.question || "",
    yesPool: raw.yesPool ?? 0,
    noPool: raw.noPool ?? 0,
    totalPredictors: raw.totalPredictors ?? raw._count?.predictions ?? 0,
    state: raw.state || raw.status || "open",
    lockTime: raw.lockTime || raw.lockAt || "",
    resolvedOutcome: raw.resolvedOutcome || undefined,
    sponsors: (raw.sponsors || raw.campaigns || []).map((s: any) => ({
      name: s.name || s.brandName || "",
      logo: s.logo || s.brandLogo || "",
      logoImage: s.logoImage || s.brandLogoUrl || undefined,
      tier: s.tier || "sponsor",
      prizeAmount: s.prizeAmount || s.amount || 0,
      bannerColor: s.bannerColor || s.brandColor || "#16A34A",
    })),
    totalPrize: raw.totalPrize ?? raw.prizePool ?? 0,
  };
}

/**
 * Map an API leaderboard entry to the mock LeaderboardEntry shape.
 */
function mapApiLeaderboardEntry(raw: any, index: number): LeaderboardEntry {
  return {
    rank: raw.rank ?? index + 1,
    address: raw.address || raw.walletAddress || "",
    displayName: raw.displayName || raw.name || `User ${index + 1}`,
    callBalance: raw.callBalance ?? raw.cachedCallBalance ?? 0,
    tier: raw.tier || "new_fan",
    avatar: raw.avatar || raw.avatarUrl || undefined,
    winRate: raw.winRate ?? 0,
    location: raw.location || undefined,
  };
}

export default function Home() {
  const { isAuthenticated, login } = useAuth();
  const { data: liveMarketsRaw, isLoading: marketsLoading } = useLiveMarkets();
  const { data: leaderboardRaw, isLoading: leaderboardLoading } = useLeaderboard(1, 5);

  // Map API data to UI types
  const liveMarkets: Market[] = Array.isArray(liveMarketsRaw)
    ? liveMarketsRaw.map(mapApiMarket)
    : [];
  const leaderboard: LeaderboardEntry[] = Array.isArray(leaderboardRaw)
    ? leaderboardRaw.map(mapApiLeaderboardEntry)
    : Array.isArray((leaderboardRaw as any)?.data)
      ? (leaderboardRaw as any).data.map(mapApiLeaderboardEntry)
      : [];

  const liveMarket = liveMarkets.length > 0 ? liveMarkets[0] : null;
  const yesPercent = liveMarket ? getYesPercentage(liveMarket) : 50;
  const noPercent = 100 - yesPercent;
  const titleSponsor = liveMarket?.sponsors.find((s) => s.tier === "title");

  return (
    <div>
      {/* ===== HERO — bg-[#14532d] dark green ===== */}
      <section className="bg-[#14532d] pt-20 pb-32 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block bg-emerald-800/80 text-emerald-300 text-xs font-bold px-4 py-1.5 rounded-full mb-6 border border-emerald-600/50 uppercase tracking-widest"
          >
            Built on WireFluid · Entangled Hackathon 2026
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl text-white mb-6 leading-tight font-[family-name:var(--font-brand)]"
          >
            Predict Cricket. <br />
            <span className="text-[#4ade80]">Win Rewards.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-emerald-200 max-w-2xl mb-12"
          >
            Free to play. Shariah compliant. Win real PKR prizes from brand
            sponsors. Your cricket knowledge is now your biggest asset.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-4"
          >
            <Link href="/markets">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#4ade80] text-emerald-950 font-black px-8 py-4 rounded-xl shadow-xl shadow-emerald-900/40"
              >
                Start Predicting Now
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white/10 text-white font-bold px-8 py-4 rounded-xl border border-white/20 hover:bg-white/20 transition-all backdrop-blur-sm"
            >
              How it Works
            </motion.button>
          </motion.div>
        </div>
        {/* Decorative dot grid pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </section>

      {/* ===== Featured Market Card — overlapping hero with -mt-24 ===== */}
      {marketsLoading && (
        <section className="max-w-4xl mx-auto px-6 -mt-24 relative z-20">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 p-12 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin mb-3" />
            <p className="text-slate-500 text-sm font-medium">Loading live markets...</p>
          </div>
        </section>
      )}
      {!marketsLoading && !liveMarket && (
        <section className="max-w-4xl mx-auto px-6 -mt-24 relative z-20">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 p-12 text-center">
            <p className="text-slate-500 font-medium">No live markets right now</p>
            <p className="text-slate-400 text-sm mt-1">Check back during the next match!</p>
          </div>
        </section>
      )}
      {!marketsLoading && liveMarket && (
        <section className="max-w-4xl mx-auto px-6 -mt-24 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 80, damping: 15 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
          >
            <div className="p-6 md:p-8">
              {/* Sponsor + Status badge */}
              <div className="flex flex-wrap justify-between items-start mb-6 gap-4">
                <div>
                  {titleSponsor && (
                    <p
                      className="font-black text-sm tracking-widest mb-1"
                      style={{ color: titleSponsor.bannerColor }}
                    >
                      {titleSponsor.name.toUpperCase()} PRESENTS
                    </p>
                  )}
                  <h3 className="font-bold text-lg text-slate-800">
                    {liveMarket.match.tournament} · {liveMarket.match.matchType}{" "}
                    · {liveMarket.match.venue}
                  </h3>
                </div>
                {liveMarket.match.status === "live" ? (
                  <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded-full border border-red-100 animate-pulse">
                    <span className="w-2 h-2 bg-red-600 rounded-full" />
                    <span className="text-xs font-black">LIVE</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
                    <span className="text-xs font-black">UPCOMING</span>
                  </div>
                )}
              </div>

              {/* 3-column team layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-8 py-8 border-y border-slate-100">
                {/* Team A */}
                <div className="flex flex-col items-center text-center">
                  <TeamLogo shortName={liveMarket.match.teamA.shortName || liveMarket.match.teamA.name?.slice(0, 3)?.toUpperCase()} size="lg" />
                  <span className="font-black text-slate-900 mt-3">
                    {liveMarket.match.teamA.name.toUpperCase()}
                  </span>
                  {liveMarket.match.score?.teamA && (
                    <span className="text-2xl font-black text-green-600 mt-1">
                      {liveMarket.match.score.teamA}{" "}
                      {liveMarket.match.score.batting === "teamA" && (
                        <span className="text-sm font-normal text-slate-500">
                          ({liveMarket.match.score.overs})
                        </span>
                      )}
                    </span>
                  )}
                </div>

                {/* VS divider */}
                <div className="flex flex-col items-center">
                  <span className="text-slate-400 font-black italic">VS</span>
                  <div className="h-8 w-px bg-slate-200 my-2" />
                  <span className="text-xs font-bold text-slate-500">
                    {new Date(liveMarket.match.startTime).toLocaleDateString("en-PK", { weekday: "short", month: "short", day: "numeric" })}
                  </span>
                </div>

                {/* Team B */}
                <div className="flex flex-col items-center text-center">
                  <TeamLogo shortName={liveMarket.match.teamB.shortName || liveMarket.match.teamB.name?.slice(0, 3)?.toUpperCase()} size="lg" />
                  <span className="font-black text-slate-900 mt-3">
                    {liveMarket.match.teamB.name.toUpperCase()}
                  </span>
                  {liveMarket.match.score?.teamB && (
                    <span className="text-2xl font-black text-slate-400 mt-1">
                      {liveMarket.match.score.teamB}
                    </span>
                  )}
                </div>
              </div>

              {/* Question */}
              <div className="py-8 text-center">
                <h4 className="text-2xl font-black text-slate-900 mb-8">
                  {liveMarket.question}
                </h4>

                {/* Full-width probability bar */}
                <div className="flex w-full h-4 bg-slate-100 rounded-full overflow-hidden mb-8">
                  <motion.div
                    className="bg-green-600 h-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${yesPercent}%` }}
                    transition={{
                      type: "spring",
                      stiffness: 80,
                      damping: 15,
                      delay: 0.6,
                    }}
                  />
                  <motion.div
                    className="bg-red-600 h-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${noPercent}%` }}
                    transition={{
                      type: "spring",
                      stiffness: 80,
                      damping: 15,
                      delay: 0.6,
                    }}
                  />
                </div>

                {/* Two large prediction button cards */}
                <div className="grid grid-cols-2 gap-4">
                  <Link href={`/markets/${liveMarket.id}`}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="group flex flex-col items-center justify-center p-6 border-2 border-green-600 rounded-2xl bg-emerald-50 hover:bg-green-600 hover:text-white transition-all cursor-pointer"
                    >
                      <span className="text-3xl font-black mb-1">
                        {yesPercent}%
                      </span>
                      <span className="font-bold text-sm">Predict YES</span>
                    </motion.div>
                  </Link>
                  <Link href={`/markets/${liveMarket.id}`}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="group flex flex-col items-center justify-center p-6 border-2 border-red-600 rounded-2xl bg-red-50 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                    >
                      <span className="text-3xl font-black mb-1">
                        {noPercent}%
                      </span>
                      <span className="font-bold text-sm">Predict NO</span>
                    </motion.div>
                  </Link>
                </div>
              </div>

              {/* Stats row + sponsor avatars */}
              <div className="flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-slate-100">
                <div className="flex gap-8">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">
                      Prize Pool
                    </p>
                    <p className="text-xl font-black text-amber-600">
                      {formatPKR(liveMarket.totalPrize)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">
                      Predictors
                    </p>
                    <p className="text-xl font-black text-slate-900">
                      {formatCALL(liveMarket.totalPredictors)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">
                      Locks In
                    </p>
                    <p className="text-xl font-black text-red-600">
                      {timeUntil(liveMarket.lockTime)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-slate-500 uppercase">
                    Sponsored by
                  </span>
                  <div className="flex -space-x-2">
                    {liveMarket.sponsors.map((s) => (
                      <div
                        key={s.name}
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden bg-white"
                      >
                        {s.logoImage ? (
                          <Image src={s.logoImage} alt={s.name} width={32} height={32} className="w-full h-full object-contain" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] font-black text-white" style={{ backgroundColor: s.bannerColor }}>
                            {s.logo}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl text-slate-900 mb-4 font-[family-name:var(--font-brand)]"
            >
              How it Works
            </motion.h2>
            <div className="h-1 w-20 bg-green-600 mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: "CLAIM",
                desc: "Get 100 free CALL tokens every day. No deposits, no risks. Fully Shariah compliant.",
                icon: Download,
                bgColor: "bg-emerald-100",
                textColor: "text-green-600",
              },
              {
                title: "PREDICT",
                desc: "Put your cricket knowledge on the line. Analyze stats and live gameplay to make your call.",
                icon: Target,
                bgColor: "bg-blue-100",
                textColor: "text-blue-600",
              },
              {
                title: "WIN",
                desc: "Top the leaderboard and redeem your winnings for real PKR prizes from our brand partners.",
                icon: Trophy,
                bgColor: "bg-amber-100",
                textColor: "text-amber-600",
              },
            ].map((step) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center group"
              >
                <div
                  className={`w-20 h-20 ${step.bgColor} ${step.textColor} rounded-3xl flex items-center justify-center mb-6 transform group-hover:rotate-6 transition-transform`}
                >
                  <step.icon className="w-9 h-9" />
                </div>
                <h3 className="text-xl font-black mb-3">{step.title}</h3>
                <p className="text-slate-500">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHY CRICCALL — bg-[#f0fdf4] green section ===== */}
      <section className="py-24 px-6 bg-[#f0fdf4]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          {/* Left: heading + description + 2x2 feature cards */}
          <div className="lg:w-1/2">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-4xl text-slate-900 mb-6 leading-tight font-[family-name:var(--font-brand)]"
            >
              Professional Prediction, <br /> Built for the Fan.
            </motion.h2>
            <p className="text-lg text-slate-500 mb-8">
              CricCall isn&apos;t a betting platform. It&apos;s a skill-based
              arena where knowledge is rewarded through a transparent,
              sponsor-backed ecosystem.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                {
                  icon: Coins,
                  title: "Free to play",
                  desc: "Daily token drops mean you never have to reach for your wallet.",
                  color: "text-green-600",
                },
                {
                  icon: Trophy,
                  title: "Win real money",
                  desc: "Rewards are backed by major brands like PTCL and Jazz.",
                  color: "text-amber-600",
                },
                {
                  icon: Shield,
                  title: "Shariah compliant",
                  desc: "No interest, no wagering, just skill-based recognition.",
                  color: "text-emerald-700",
                },
                {
                  icon: Eye,
                  title: "Fully transparent",
                  desc: "Powered by WireFluid for immutable, fair outcomes.",
                  color: "text-blue-500",
                },
              ].map((f) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100"
                >
                  <f.icon className={`w-6 h-6 ${f.color} mb-4`} />
                  <h4 className="font-bold text-slate-900 mb-2">{f.title}</h4>
                  <p className="text-sm text-slate-500">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: stadium image placeholder with floating badge */}
          <div className="lg:w-1/2 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-square"
            >
              <div className="w-full h-full bg-gradient-to-br from-emerald-800 via-green-700 to-emerald-950 flex items-center justify-center p-12">
                <Image src="/logo.png" alt="CricCall" width={500} height={250} className="object-contain opacity-90" />
              </div>
            </motion.div>
            {/* Floating PSL badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="absolute -bottom-6 -right-6 w-32 h-32 bg-green-600 rounded-full flex items-center justify-center text-white font-black text-center text-sm p-4 z-20 shadow-xl"
            >
              LIVE FOR PSL 2026
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== LEADERBOARD ===== */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl text-slate-900 font-[family-name:var(--font-brand)]"
              >
                Weekly Leaderboard
              </motion.h2>
              <p className="text-slate-500">
                Top predictors this week in Pakistan
              </p>
            </div>
            <Link
              href="/leaderboard"
              className="text-green-600 font-bold flex items-center gap-1 hover:underline"
            >
              View All{" "}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {leaderboardLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-green-600 animate-spin mb-3" />
                <p className="text-slate-500 text-sm">Loading leaderboard...</p>
              </div>
            )}
            {!leaderboardLoading && leaderboard.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-500 font-medium">No leaderboard data yet</p>
              </div>
            )}
            {leaderboard.slice(0, 5).map((entry, i) => (
              <motion.div
                key={entry.address}
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className={`flex items-center gap-6 p-4 rounded-2xl transition-colors ${entry.rank === 1
                    ? "bg-slate-50 border border-emerald-100"
                    : "border border-slate-100 hover:bg-slate-50"
                  }`}
              >
                <span
                  className={`text-2xl font-black w-8 text-center ${entry.rank === 1
                      ? "text-amber-600"
                      : entry.rank === 3
                        ? "text-amber-700"
                        : "text-slate-400"
                    }`}
                >
                  {entry.rank}
                </span>
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xs font-black text-white border-2"
                  style={{
                    background: `linear-gradient(135deg, ${getTierColor(entry.tier)}, ${getTierColor(entry.tier)}cc)`,
                    borderColor:
                      entry.rank === 1 ? "#f59e0b" : "transparent",
                  }}
                >
                  {entry.displayName.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-grow">
                  <h4 className="font-black text-slate-900">
                    {entry.displayName}
                  </h4>
                  {entry.location && (
                    <p className="text-xs font-bold text-slate-500">{entry.location}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-mono font-black text-slate-900">
                    {formatCALL(entry.callBalance)} CALL
                  </p>
                  <p className="text-xs font-black text-green-600">
                    {entry.winRate}% Win Rate
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BRAND LOGOS ===== */}
      <section className="py-16 px-6 bg-slate-100">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm font-black text-slate-500 uppercase tracking-widest mb-10">
            Trusted by leading brands
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20">
            {brandLogos.map((brand) => (
              <motion.div
                key={brand.name}
                whileHover={{ scale: 1.08 }}
                className="transition-transform cursor-default"
              >
                <Image
                  src={brand.image}
                  alt={brand.name}
                  width={120}
                  height={60}
                  className="h-14 w-auto object-contain"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FOOTER — bg-[#14532d] dark green ===== */}
      <footer className="bg-[#14532d] text-white pt-24">
        <div className="max-w-7xl mx-auto px-8 pb-20 border-b border-emerald-800 flex flex-col md:flex-row justify-between items-center gap-12">
          {/* Left: CTA */}
          <div className="max-w-md text-center md:text-left">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl mb-6 font-[family-name:var(--font-brand)]"
            >
              Ready to make your call?
            </motion.h2>
            {isAuthenticated ? (
              <Link href="/markets">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-green-600 text-white font-black px-8 py-4 rounded-xl flex items-center gap-3 mx-auto md:mx-0"
                >
                  Start Predicting
                  <Wallet className="w-5 h-5" />
                </motion.button>
              </Link>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => login()}
                className="bg-green-600 text-white font-black px-8 py-4 rounded-xl flex items-center gap-3 mx-auto md:mx-0"
              >
                Connect Wallet & Start Predicting
                <Wallet className="w-5 h-5" />
              </motion.button>
            )}
          </div>

          {/* Right: brand + hackathon text */}
          <div className="text-center md:text-right">
            <div className="flex items-center justify-center md:justify-end gap-3 mb-4">
              <Image src="/icon.png" alt="CricCall" width={44} height={44} className="rounded-xl" />
              <span className="text-3xl font-[family-name:var(--font-brand)]">CRICALL</span>
            </div>
            <p className="text-emerald-300 font-bold max-w-xs">
              Built for Entangled Hackathon · April 2026 · Powered by WireFluid
            </p>
          </div>
        </div>

        {/* Bottom: copyright + links */}
        <div className="max-w-7xl mx-auto px-8 py-10 flex flex-col md:flex-row justify-between items-center text-sm font-normal text-emerald-200">
          <p>© 2026 CricCall. Shariah-Compliant Cricket Predictions.</p>
          <div className="flex gap-8 mt-6 md:mt-0 text-emerald-300/70">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Responsible Play</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
