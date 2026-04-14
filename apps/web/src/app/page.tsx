"use client";

import { motion } from "framer-motion";
import {
  markets,
  leaderboard,
  formatCALL,
  formatPKR,
  getYesPercentage,
  getTierColor,
  timeUntil,
} from "@/data/mock";
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
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  const liveMarket = markets.find((m) => m.match.status === "live");
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
            className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight"
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
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#4ade80] text-emerald-950 font-black px-8 py-4 rounded-xl shadow-xl shadow-emerald-900/40"
            >
              Start Predicting Now
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
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
      {liveMarket && (
        <section className="max-w-4xl mx-auto px-6 -mt-24 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 80, damping: 15 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
          >
            <div className="p-6 md:p-8">
              {/* Sponsor + LIVE badge */}
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
                <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded-full border border-red-100 animate-pulse">
                  <span className="w-2 h-2 bg-red-600 rounded-full" />
                  <span className="text-xs font-black">LIVE</span>
                </div>
              </div>

              {/* 3-column team layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-8 py-8 border-y border-slate-100">
                {/* Team A */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-12 bg-slate-100 rounded-md mb-3 flex items-center justify-center overflow-hidden border border-slate-200">
                    <span className="text-3xl">
                      {liveMarket.match.teamA.flag}
                    </span>
                  </div>
                  <span className="font-black text-slate-900">
                    {liveMarket.match.teamA.name.toUpperCase()}
                  </span>
                  {liveMarket.match.score?.teamA ? (
                    <span className="text-2xl font-black text-green-600 mt-1">
                      {liveMarket.match.score.teamA}{" "}
                      {liveMarket.match.score.batting === "teamA" && (
                        <span className="text-sm font-normal text-slate-500">
                          ({liveMarket.match.score.overs})
                        </span>
                      )}
                    </span>
                  ) : null}
                </div>

                {/* VS divider */}
                <div className="flex flex-col items-center">
                  <span className="text-slate-400 font-black italic">VS</span>
                  <div className="h-8 w-px bg-slate-200 my-2" />
                  <span className="text-xs font-bold text-slate-500">
                    MATCH DAY 12
                  </span>
                </div>

                {/* Team B */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-12 bg-slate-100 rounded-md mb-3 flex items-center justify-center overflow-hidden border border-slate-200">
                    <span className="text-3xl">
                      {liveMarket.match.teamB.flag}
                    </span>
                  </div>
                  <span className="font-black text-slate-900">
                    {liveMarket.match.teamB.name.toUpperCase()}
                  </span>
                  {liveMarket.match.score?.teamB ? (
                    <span className="text-2xl font-black text-slate-400 mt-1">
                      {liveMarket.match.score.teamB}
                    </span>
                  ) : (
                    <span className="text-2xl font-black text-slate-400 mt-1">
                      YET TO BAT
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
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group flex flex-col items-center justify-center p-6 border-2 border-green-600 rounded-2xl bg-emerald-50 hover:bg-green-600 hover:text-white transition-all"
                  >
                    <span className="text-3xl font-black mb-1">
                      {yesPercent}%
                    </span>
                    <span className="font-bold text-sm">Predict YES</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group flex flex-col items-center justify-center p-6 border-2 border-red-600 rounded-2xl bg-red-50 hover:bg-red-600 hover:text-white transition-all"
                  >
                    <span className="text-3xl font-black mb-1">
                      {noPercent}%
                    </span>
                    <span className="font-bold text-sm">Predict NO</span>
                  </motion.button>
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
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-[9px] font-black text-white"
                        style={{ backgroundColor: s.bannerColor }}
                      >
                        {s.logo}
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
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-black text-slate-900 mb-4"
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
              className="text-4xl font-black text-slate-900 mb-6 leading-tight"
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
              {/* Green gradient placeholder for stadium image */}
              <div className="w-full h-full bg-gradient-to-br from-emerald-800 via-green-700 to-emerald-950 flex items-center justify-center">
                <div className="text-center text-white/30">
                  <Trophy className="w-20 h-20 mx-auto mb-4" />
                  <p className="text-xl font-black">Cricket Stadium</p>
                </div>
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
              PSL 2026 OFFICIAL PARTNER
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
                className="text-3xl font-black text-slate-900"
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
            {leaderboard.slice(0, 5).map((entry, i) => (
              <motion.div
                key={entry.address}
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className={`flex items-center gap-6 p-4 rounded-2xl transition-colors ${
                  entry.rank === 1
                    ? "bg-slate-50 border border-emerald-100"
                    : "border border-slate-100 hover:bg-slate-50"
                }`}
              >
                <span
                  className={`text-2xl font-black w-8 text-center ${
                    entry.rank === 1
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
                  <p className="text-xs font-bold text-slate-500">PAKISTAN</p>
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
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-60 grayscale hover:grayscale-0 transition-all">
            {["PTCL", "Foodpanda", "KFC", "Jazz", "Daraz"].map((brand) => (
              <span
                key={brand}
                className="text-2xl font-black text-slate-400 hover:text-slate-600 transition-colors cursor-default"
              >
                {brand}
              </span>
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
              className="text-4xl font-black mb-6"
            >
              Ready to make your call?
            </motion.h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-green-600 text-white font-black px-8 py-4 rounded-xl flex items-center gap-3 mx-auto md:mx-0"
            >
              Connect Wallet & Start Predicting
              <Wallet className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Right: brand + hackathon text */}
          <div className="text-center md:text-right">
            <div className="flex items-center justify-center md:justify-end gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" strokeWidth={3} />
              </div>
              <span className="text-3xl font-black">CricCall</span>
            </div>
            <p className="text-emerald-300 font-bold max-w-xs">
              Built for Entangled Hackathon · April 2026 · Powered by WireFluid
            </p>
          </div>
        </div>

        {/* Bottom: copyright + links */}
        <div className="max-w-7xl mx-auto px-8 py-10 flex flex-col md:flex-row justify-between items-center text-sm font-normal text-emerald-200">
          <p>© 2026 CricCall. Shariah-Compliant Cricket Predictions.</p>
          <div className="flex gap-8 mt-6 md:mt-0">
            <a
              className="hover:text-white underline transition-all"
              href="#"
            >
              Privacy Policy
            </a>
            <a
              className="hover:text-white underline transition-all"
              href="#"
            >
              Terms of Service
            </a>
            <a
              className="hover:text-white underline transition-all"
              href="#"
            >
              Responsible Play
            </a>
            <a
              className="hover:text-white underline transition-all"
              href="#"
            >
              Contact Us
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
