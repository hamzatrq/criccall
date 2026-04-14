"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Activity,
  Wallet,
  Lock,
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
    <div className="min-h-screen bg-slate-50">
      {/* Page header */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Panel</h1>
              <p className="text-slate-500 text-sm">
                Manage markets, mint PKR, and control the oracle.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-white"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="adminTab"
                  className="absolute inset-0 bg-red-600 rounded-full shadow-sm"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <tab.icon className="w-4 h-4 relative z-10" />
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ===== Overview ===== */}
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Active Markets", value: markets.filter((m) => m.state === "open").length, color: "text-emerald-600", bg: "bg-emerald-50", icon: Activity },
                  { label: "Total Predictions", value: "12,847", color: "text-blue-600", bg: "bg-blue-50", icon: BarChart3 },
                  { label: "PKR Distributed", value: "Rs. 2.4M", color: "text-amber-600", bg: "bg-amber-50", icon: Coins },
                  { label: "Active Users", value: "3,421", color: "text-purple-600", bg: "bg-purple-50", icon: Users },
                ].map((stat) => (
                  <motion.div
                    key={stat.label}
                    whileHover={{ y: -2 }}
                    className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow text-center"
                  >
                    <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <p className={`text-2xl font-black font-mono ${stat.color}`}>{stat.value}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Recent activity */}
              <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-6">
                <h3 className="font-black text-lg text-slate-900 mb-5">Recent Activity</h3>
                <div className="space-y-3">
                  {[
                    { icon: CheckCircle, text: "Market #4 resolved — SA vs NZ", time: "2h ago", color: "text-emerald-600", bg: "bg-emerald-50" },
                    { icon: Coins, text: "Minted 100,000 PKR to Foodpanda", time: "4h ago", color: "text-amber-600", bg: "bg-amber-50" },
                    { icon: Plus, text: "Created market — PAK vs AUS", time: "1d ago", color: "text-blue-600", bg: "bg-blue-50" },
                    { icon: Users, text: "Added sponsor — PTCL", time: "2d ago", color: "text-purple-600", bg: "bg-purple-50" },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-sm transition-all"
                    >
                      <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center shrink-0`}>
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                      </div>
                      <span className="text-sm font-medium text-slate-800 flex-1">{item.text}</span>
                      <span className="text-xs text-slate-400 font-bold">{item.time}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ===== Create Market ===== */}
          {activeTab === "markets" && (
            <motion.div
              key="markets"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-6">
                <h3 className="font-black text-lg text-slate-900 mb-1">Create New Market</h3>
                <p className="text-sm text-slate-500 mb-6">Deploy a new prediction market on-chain.</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Match ID</label>
                    <input
                      type="text"
                      placeholder="PAK-IND-2026-04-25"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Question</label>
                    <input
                      type="text"
                      placeholder="Will Pakistan win?"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Lock Time</label>
                      <input
                        type="datetime-local"
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">YES Outcome</label>
                      <select className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors">
                        <option value="1">TeamA Wins</option>
                        <option value="2">TeamB Wins</option>
                        <option value="3">Draw</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Default PKR Prize (Platform)</label>
                    <input
                      type="number"
                      placeholder="5000"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-xl bg-red-600 text-white font-black flex items-center justify-center gap-2 shadow-sm hover:bg-red-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create Market & Deploy On-Chain
                  </motion.button>
                </div>
              </div>

              {/* Active markets list */}
              <div className="mt-6 rounded-xl bg-white border border-slate-200 shadow-sm p-6">
                <h3 className="font-black text-lg text-slate-900 mb-4">Active Markets</h3>
                <div className="space-y-3">
                  {markets.filter((m) => m.state === "open").map((m, i) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200 hover:shadow-md transition-shadow"
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-900">{m.question}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {m.match.teamA.flag} {m.match.teamA.shortName} vs {m.match.teamB.shortName} {m.match.teamB.flag} · {formatCALL(m.totalPredictors)} predictions
                        </p>
                      </div>
                      <span className="text-[10px] font-black text-emerald-600 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 uppercase tracking-widest">
                        Open
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ===== Mint PKR ===== */}
          {activeTab === "pkr" && (
            <motion.div
              key="pkr"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Coins className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-slate-900">Mint PKR Tokens</h3>
                    <p className="text-sm text-slate-500">
                      Mint PKR to brand wallets against fiat purchase. Or to platform treasury.
                    </p>
                  </div>
                </div>
                <div className="space-y-4 mt-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Recipient Address</label>
                    <input
                      type="text"
                      value={mintTo}
                      onChange={(e) => setMintTo(e.target.value)}
                      placeholder="0x... (brand or treasury wallet)"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Amount (PKR)</label>
                    <input
                      type="number"
                      value={mintAmount}
                      onChange={(e) => setMintAmount(e.target.value)}
                      placeholder="100000"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                    />
                  </div>
                  {/* Quick amounts */}
                  <div className="flex gap-2">
                    {["10,000", "50,000", "100,000", "500,000"].map((q) => (
                      <button
                        key={q}
                        onClick={() => setMintAmount(q.replace(/,/g, ""))}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                          mintAmount === q.replace(/,/g, "")
                            ? "bg-amber-50 border-amber-300 text-amber-700"
                            : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:border-slate-300"
                        }`}
                      >
                        Rs. {q}
                      </button>
                    ))}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setMinted(true); setTimeout(() => setMinted(false), 2000); }}
                    className="w-full py-3.5 rounded-xl bg-amber-500 text-black font-black flex items-center justify-center gap-2 shadow-sm hover:bg-amber-600 transition-colors"
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
                <h3 className="font-black text-lg text-slate-900 mb-4">Recent Mints</h3>
                <div className="space-y-3">
                  {[
                    { to: "Foodpanda (0x5e6f...)", amount: 100000, time: "4h ago" },
                    { to: "PTCL (0x9i0j...)", amount: 1050000, time: "1d ago" },
                    { to: "Platform Treasury", amount: 50000, time: "2d ago" },
                    { to: "KFC (0x3m4n...)", amount: 75000, time: "3d ago" },
                  ].map((mint, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200 hover:shadow-md transition-shadow"
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-900">{mint.to}</p>
                        <p className="text-xs text-slate-400 font-bold mt-0.5">{mint.time}</p>
                      </div>
                      <p className="font-mono font-black text-amber-600 text-lg">{formatPKR(mint.amount)}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ===== Oracle Control ===== */}
          {activeTab === "oracle" && (
            <motion.div
              key="oracle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                    <Radio className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-slate-900">Manual Oracle Resolution</h3>
                    <p className="text-sm text-slate-500">
                      Manually resolve a match for demo purposes. Triggers commit-reveal on-chain.
                    </p>
                  </div>
                </div>
                <div className="space-y-4 mt-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Match</label>
                    <select
                      value={oracleMatchId}
                      onChange={(e) => setOracleMatchId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors"
                    >
                      <option value="">Select match...</option>
                      {matches.filter((m) => m.status !== "completed").map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.teamA.flag} {m.teamA.shortName} vs {m.teamB.shortName} {m.teamB.flag} — {m.id}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Outcome</label>
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { value: "1", label: "Team A", color: "emerald", hex: "#059669" },
                        { value: "2", label: "Team B", color: "red", hex: "#dc2626" },
                        { value: "3", label: "Draw", color: "blue", hex: "#2563eb" },
                        { value: "4", label: "No Result", color: "slate", hex: "#6B7280" },
                      ].map((o) => (
                        <button
                          key={o.value}
                          onClick={() => setOracleOutcome(o.value)}
                          className={`p-4 rounded-xl text-center text-sm font-bold transition-all border-2 ${
                            oracleOutcome === o.value
                              ? "bg-white shadow-sm"
                              : "border-transparent bg-slate-50 hover:bg-slate-100"
                          }`}
                          style={{
                            borderColor: oracleOutcome === o.value ? o.hex : "transparent",
                            color: oracleOutcome === o.value ? o.hex : "#64748b",
                          }}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-red-700">Irreversible Action</p>
                        <p className="text-xs text-red-600 mt-0.5">
                          This will trigger on-chain resolution via commit-reveal. All markets for this match will resolve and payouts will begin.
                        </p>
                      </div>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setResolved(true); setTimeout(() => setResolved(false), 2000); }}
                    disabled={!oracleMatchId}
                    className="w-full py-3.5 rounded-xl bg-red-600 text-white font-black disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:bg-red-700 transition-colors"
                  >
                    {resolved ? (
                      <><CheckCircle className="w-4 h-4" /> Resolved!</>
                    ) : (
                      <><Zap className="w-4 h-4" /> Resolve Match</>
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Oracle wallet status */}
              <div className="mt-6 rounded-xl bg-white border border-slate-200 shadow-sm p-6">
                <h3 className="font-black text-lg text-slate-900 mb-4">Oracle Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-xl bg-white border border-slate-200 hover:shadow-md transition-shadow text-center">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                      <Wallet className="w-5 h-5 text-emerald-600" />
                    </div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Oracle Wallet</p>
                    <p className="text-sm font-mono font-bold text-slate-900">0x7q8r...9s0t</p>
                    <p className="text-xs font-bold text-emerald-600 mt-1">0.45 WIRE</p>
                  </div>
                  <div className="p-5 rounded-xl bg-white border border-slate-200 hover:shadow-md transition-shadow text-center">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mx-auto mb-3">
                      <Lock className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Owner Wallet</p>
                    <p className="text-sm font-mono font-bold text-slate-900">0xa1b2...c3d4</p>
                    <p className="text-xs font-bold text-emerald-600 mt-1">1.23 WIRE</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
