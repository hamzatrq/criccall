"use client";

import { motion } from "framer-motion";
import { HeroMarket } from "@/components/home/hero-market";
import { HowItWorks } from "@/components/home/how-it-works";
import { LeaderboardPreview } from "@/components/home/leaderboard-preview";
import { WhyCricCall } from "@/components/home/why-criccall";
import { MarketCard } from "@/components/market/market-card";
import { markets } from "@/data/mock";
import { ChevronRight, Wallet, Zap } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const liveMarket = markets.find((m) => m.match.status === "live");
  const otherMarkets = markets.filter(
    (m) => m.state === "open" && m.id !== liveMarket?.id
  );

  return (
    <div className="relative bg-white">
      <div className="relative mx-auto max-w-7xl px-4">
        {/* Hero Section */}
        <section className="pt-8 pb-4">
          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-green-200 bg-green-50 mb-4">
              <Zap className="w-3.5 h-3.5 text-green-600" />
              <span className="text-xs font-medium text-green-600">
                Built on WireFluid · Entangled Hackathon 2026
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-3">
              Predict Cricket.{" "}
              <span className="text-green-600">
                Win Rewards.
              </span>
            </h1>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              Free to play. Shariah compliant. Win real PKR prizes from brand
              sponsors. Your CALL balance is your reputation.
            </p>
          </motion.div>

          {/* Featured Market */}
          {liveMarket && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <HeroMarket market={liveMarket} />
            </motion.div>
          )}
        </section>

        {/* How It Works */}
        <HowItWorks />

        {/* Live Markets Grid */}
        <section className="py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Live Markets</h2>
            <Link
              href="/markets"
              className="flex items-center gap-1 text-sm text-green-600 hover:underline"
            >
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherMarkets.map((market, i) => (
              <motion.div
                key={market.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <MarketCard market={market} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Leaderboard */}
        <LeaderboardPreview />

        {/* Sponsors Bar */}
        <section className="py-12 border-t border-b border-slate-200">
          <p className="text-center text-xs uppercase tracking-[0.2em] text-slate-500 mb-6">
            Trusted by leading brands
          </p>
          <div className="flex items-center justify-center gap-8 md:gap-12 flex-wrap">
            {["PTCL", "Foodpanda", "KFC", "Jazz", "Daraz"].map((brand) => (
              <motion.div
                key={brand}
                whileHover={{ scale: 1.1 }}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
              >
                {brand}
              </motion.div>
            ))}
          </div>
        </section>

        {/* Why CricCall */}
        <WhyCricCall />

        {/* Final CTA */}
        <section className="py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Ready to make your{" "}
              <span className="text-green-600">call</span>?
            </h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              Connect your wallet, claim your free CALL tokens, and start
              predicting. Zero risk. Real rewards.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-green-600 text-white font-bold text-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <Wallet className="w-5 h-5" />
              Connect Wallet & Start Predicting
            </motion.button>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-slate-200 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-md bg-green-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" strokeWidth={3} />
            </div>
            <span className="font-bold text-sm text-slate-900">
              Cric<span className="text-green-600">Call</span>
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Built for Entangled Hackathon · April 2026 · Powered by WireFluid
          </p>
          <p className="text-[10px] text-slate-400 mt-2">
            Predict Cricket. Earn Rewards. Zero Gambling.
          </p>
        </footer>
      </div>
    </div>
  );
}
