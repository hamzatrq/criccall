"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { markets, matches, formatPKR, formatCALL } from "@/data/mock";
import {
  Plus,
  Coins,
  Radio,
  Users,
  BarChart3,
  Shield,
  CheckCircle,
  AlertTriangle,
  Zap,
} from "lucide-react";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "markets" | "pkr" | "oracle">("overview");
  const [mintAmount, setMintAmount] = useState("");
  const [mintTo, setMintTo] = useState("");
  const [minted, setMinted] = useState(false);
  const [oracleMatchId, setOracleMatchId] = useState("");
  const [oracleOutcome, setOracleOutcome] = useState("1");
  const [resolved, setResolved] = useState(false);

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: BarChart3 },
    { id: "markets" as const, label: "Markets", icon: Plus },
    { id: "pkr" as const, label: "Mint PKR", icon: Coins },
    { id: "oracle" as const, label: "Oracle", icon: Radio },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center gap-3 mb-2">
        <Shield className="w-6 h-6 text-red-600" />
        <h1 className="text-3xl font-bold">Admin Panel</h1>
      </div>
      <p className="text-slate-500 text-sm mb-8">
        Manage markets, mint PKR, and control the oracle.
      </p>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id ? "text-black" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="adminTab"
                className="absolute inset-0 bg-red-500 rounded-full"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <tab.icon className="w-4 h-4 relative z-10" />
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === "overview" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Active Markets", value: markets.filter((m) => m.state === "open").length, color: "#16a34a" },
              { label: "Total Predictions", value: "12,847", color: "#2563eb" },
              { label: "PKR Distributed", value: "Rs. 2.4M", color: "#d97706" },
              { label: "Active Users", value: "3,421", color: "#9333ea" },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
                <p className="text-2xl font-bold font-mono" style={{ color: stat.color }}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Recent activity */}
          <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {[
                { icon: CheckCircle, text: "Market #4 resolved — SA vs NZ", time: "2h ago", color: "#16a34a" },
                { icon: Coins, text: "Minted 100,000 PKR to Foodpanda", time: "4h ago", color: "#d97706" },
                { icon: Plus, text: "Created market — PAK vs AUS", time: "1d ago", color: "#2563eb" },
                { icon: Users, text: "Added sponsor — PTCL", time: "2d ago", color: "#9333ea" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                  <item.icon className="w-4 h-4 shrink-0" style={{ color: item.color }} />
                  <span className="text-sm flex-1">{item.text}</span>
                  <span className="text-xs text-slate-500">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Create Market */}
      {activeTab === "markets" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-lg mb-6">Create New Market</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Match ID</label>
                <input
                  type="text"
                  placeholder="PAK-IND-2026-04-25"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Question</label>
                <input
                  type="text"
                  placeholder="Will Pakistan win?"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Lock Time</label>
                  <input
                    type="datetime-local"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">YES Outcome</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-300">
                    <option value="1">TeamA Wins</option>
                    <option value="2">TeamB Wins</option>
                    <option value="3">Draw</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Default PKR Prize (Platform)</label>
                <input
                  type="number"
                  placeholder="5000"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-300"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl bg-red-600 text-white font-bold"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Create Market & Deploy On-Chain
              </motion.button>
            </div>
          </div>

          {/* Existing markets */}
          <div className="mt-6 rounded-xl bg-white border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-lg mb-4">Active Markets</h3>
            <div className="space-y-2">
              {markets.filter((m) => m.state === "open").map((m) => (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div>
                    <p className="text-sm font-medium">{m.question}</p>
                    <p className="text-xs text-slate-500">{m.match.teamA.shortName} vs {m.match.teamB.shortName} · {formatCALL(m.totalPredictors)} predictions</p>
                  </div>
                  <span className="text-xs text-green-600 font-medium px-2 py-1 rounded bg-green-50">Open</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Mint PKR */}
      {activeTab === "pkr" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-lg mb-2">Mint PKR Tokens</h3>
            <p className="text-sm text-slate-500 mb-6">
              Mint PKR to brand wallets against fiat purchase. Or to platform treasury.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Recipient Address</label>
                <input
                  type="text"
                  value={mintTo}
                  onChange={(e) => setMintTo(e.target.value)}
                  placeholder="0x... (brand or treasury wallet)"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Amount (PKR)</label>
                <input
                  type="number"
                  value={mintAmount}
                  onChange={(e) => setMintAmount(e.target.value)}
                  placeholder="100000"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-300"
                />
              </div>
              {/* Quick amounts */}
              <div className="flex gap-2">
                {["10,000", "50,000", "100,000", "500,000"].map((q) => (
                  <button
                    key={q}
                    onClick={() => setMintAmount(q.replace(/,/g, ""))}
                    className="flex-1 py-2 rounded-lg bg-slate-50 text-xs font-medium text-slate-500 hover:bg-slate-100 transition-colors"
                  >
                    Rs. {q}
                  </button>
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setMinted(true); setTimeout(() => setMinted(false), 2000); }}
                className="w-full py-3 rounded-xl bg-amber-500 text-black font-bold flex items-center justify-center gap-2"
              >
                {minted ? (
                  <><CheckCircle className="w-4 h-4" /> Minted!</>
                ) : (
                  <><Coins className="w-4 h-4" /> Mint PKR</>
                )}
              </motion.button>
            </div>
          </div>

          {/* Recent mints */}
          <div className="mt-6 rounded-xl bg-white border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-lg mb-4">Recent Mints</h3>
            <div className="space-y-2">
              {[
                { to: "Foodpanda (0x5e6f...)", amount: 100000, time: "4h ago" },
                { to: "PTCL (0x9i0j...)", amount: 1050000, time: "1d ago" },
                { to: "Platform Treasury", amount: 50000, time: "2d ago" },
                { to: "KFC (0x3m4n...)", amount: 75000, time: "3d ago" },
              ].map((mint, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div>
                    <p className="text-sm">{mint.to}</p>
                    <p className="text-xs text-slate-500">{mint.time}</p>
                  </div>
                  <p className="font-mono font-bold text-amber-600">{formatPKR(mint.amount)}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Oracle Control */}
      {activeTab === "oracle" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-2">
              <Radio className="w-5 h-5 text-red-600" />
              <h3 className="font-bold text-lg">Manual Oracle Resolution</h3>
            </div>
            <p className="text-sm text-slate-500 mb-6">
              Manually resolve a match for demo purposes. Triggers commit-reveal on-chain.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Match ID</label>
                <select
                  value={oracleMatchId}
                  onChange={(e) => setOracleMatchId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-300"
                >
                  <option value="">Select match...</option>
                  {matches.filter((m) => m.status !== "completed").map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.teamA.shortName} vs {m.teamB.shortName} — {m.id}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Outcome</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: "1", label: "Team A", color: "#16a34a" },
                    { value: "2", label: "Team B", color: "#dc2626" },
                    { value: "3", label: "Draw", color: "#2563eb" },
                    { value: "4", label: "No Result", color: "#6B7280" },
                  ].map((o) => (
                    <button
                      key={o.value}
                      onClick={() => setOracleOutcome(o.value)}
                      className={`p-3 rounded-xl text-center text-sm font-medium transition-all ${
                        oracleOutcome === o.value
                          ? "border-2 bg-slate-100"
                          : "border-2 border-transparent bg-slate-50 hover:bg-slate-100"
                      }`}
                      style={{
                        borderColor: oracleOutcome === o.value ? o.color : "transparent",
                        color: oracleOutcome === o.value ? o.color : undefined,
                      }}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-xs text-red-600">
                    This will trigger on-chain resolution via commit-reveal. All markets for this match will resolve.
                  </span>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setResolved(true); setTimeout(() => setResolved(false), 2000); }}
                disabled={!oracleMatchId}
                className="w-full py-3 rounded-xl bg-red-600 text-white font-bold disabled:opacity-30 flex items-center justify-center gap-2"
              >
                {resolved ? (
                  <><CheckCircle className="w-4 h-4" /> Resolved!</>
                ) : (
                  <><Zap className="w-4 h-4" /> Resolve Match</>
                )}
              </motion.button>
            </div>
          </div>

          {/* Oracle status */}
          <div className="mt-6 rounded-xl bg-white border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-lg mb-4">Oracle Status</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs text-slate-500 mb-1">Oracle Wallet</p>
                <p className="text-sm font-mono">0x7q8r...9s0t</p>
                <p className="text-xs text-green-600 mt-1">Balance: 0.45 WIRE</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs text-slate-500 mb-1">Owner Wallet</p>
                <p className="text-sm font-mono">0xa1b2...c3d4</p>
                <p className="text-xs text-green-600 mt-1">Balance: 1.23 WIRE</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
