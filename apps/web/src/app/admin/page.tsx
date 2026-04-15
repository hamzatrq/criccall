"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMarkets } from "@/hooks/use-api";
import { api } from "@/lib/api";
import { formatCALL } from "@/lib/utils";
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
  Loader2,
  Info,
  Inbox,
} from "lucide-react";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "markets" | "pkr" | "oracle" | "users">("overview");

  // Mint PKR state
  const [mintAmount, setMintAmount] = useState("");
  const [mintTo, setMintTo] = useState("");

  // User management state
  const [userSearchAddress, setUserSearchAddress] = useState("");
  const [userSearching, setUserSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<any>(null);
  const [userSearchError, setUserSearchError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [roleUpdating, setRoleUpdating] = useState(false);
  const [roleUpdateSuccess, setRoleUpdateSuccess] = useState(false);
  const [roleUpdateError, setRoleUpdateError] = useState<string | null>(null);

  // Oracle state
  const [oracleMatchId, setOracleMatchId] = useState("");
  const [oracleOutcome, setOracleOutcome] = useState("1");
  const [resolving, setResolving] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);

  // Create Market form state
  const [cmMatchId, setCmMatchId] = useState("");
  const [cmQuestion, setCmQuestion] = useState("");
  const [cmLockTime, setCmLockTime] = useState("");
  const [cmYesOutcome, setCmYesOutcome] = useState("1");
  const [cmPrize, setCmPrize] = useState("");
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Fetch markets from API
  const { data: marketsData, isLoading: marketsLoading, refetch: refetchMarkets } = useMarkets();
  const allMarkets: any[] = marketsData?.data ?? marketsData ?? [];
  const openMarkets = allMarkets.filter((m: any) => m.status === "open" || m.state === "open");
  const unresolvedMarkets = allMarkets.filter((m: any) => m.status !== "resolved" && m.status !== "completed");

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: BarChart3 },
    { id: "markets" as const, label: "Markets", icon: Plus },
    { id: "pkr" as const, label: "Mint PKR", icon: Coins },
    { id: "oracle" as const, label: "Oracle", icon: Radio },
    { id: "users" as const, label: "Users", icon: Users },
  ];

  // Handle user search
  const handleUserSearch = async () => {
    if (!userSearchAddress.trim()) return;
    setUserSearching(true);
    setUserSearchError(null);
    setFoundUser(null);
    setRoleUpdateSuccess(false);
    setRoleUpdateError(null);
    try {
      const profile = await api.getPublicProfile(userSearchAddress.trim());
      setFoundUser(profile);
      setSelectedRole(profile.role || "user");
    } catch (err: any) {
      setUserSearchError(err.message || "User not found");
    } finally {
      setUserSearching(false);
    }
  };

  // Handle role update
  const handleRoleUpdate = async () => {
    if (!foundUser || !selectedRole) return;
    setRoleUpdating(true);
    setRoleUpdateError(null);
    setRoleUpdateSuccess(false);
    try {
      await api.setUserRole(foundUser.walletAddress, selectedRole);
      setRoleUpdateSuccess(true);
      setFoundUser({ ...foundUser, role: selectedRole });
      setTimeout(() => setRoleUpdateSuccess(false), 3000);
    } catch (err: any) {
      setRoleUpdateError(err.message || "Failed to update role");
    } finally {
      setRoleUpdating(false);
    }
  };

  // Handle create market
  const handleCreateMarket = async () => {
    setCreating(true);
    setCreateError(null);
    try {
      await api.createMarket({
        matchId: cmMatchId,
        question: cmQuestion,
        lockTime: cmLockTime ? new Date(cmLockTime).toISOString() : undefined,
        yesOutcome: Number(cmYesOutcome),
        prize: cmPrize ? Number(cmPrize) : undefined,
      });
      setCreated(true);
      setCmMatchId("");
      setCmQuestion("");
      setCmLockTime("");
      setCmYesOutcome("1");
      setCmPrize("");
      refetchMarkets();
      setTimeout(() => setCreated(false), 2000);
    } catch (err: any) {
      setCreateError(err.message || "Failed to create market");
    } finally {
      setCreating(false);
    }
  };

  // Handle resolve match
  const handleResolve = async () => {
    if (!oracleMatchId) return;
    setResolving(true);
    setResolveError(null);
    try {
      await api.resolveMatch(oracleMatchId, Number(oracleOutcome));
      setResolved(true);
      refetchMarkets();
      setTimeout(() => setResolved(false), 2000);
    } catch (err: any) {
      setResolveError(err.message || "Failed to resolve match");
    } finally {
      setResolving(false);
    }
  };

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
                  { label: "Active Markets", value: marketsLoading ? "..." : openMarkets.length, color: "text-emerald-600", bg: "bg-emerald-50", icon: Activity },
                  { label: "Total Predictions", value: "\u2014", color: "text-blue-600", bg: "bg-blue-50", icon: BarChart3, tooltip: "Coming soon" },
                  { label: "PKR Distributed", value: "\u2014", color: "text-amber-600", bg: "bg-amber-50", icon: Coins, tooltip: "Coming soon" },
                  { label: "Active Users", value: "\u2014", color: "text-purple-600", bg: "bg-purple-50", icon: Users, tooltip: "Coming soon" },
                ].map((stat) => (
                  <motion.div
                    key={stat.label}
                    whileHover={{ y: -2 }}
                    className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow text-center"
                    title={"tooltip" in stat ? stat.tooltip : undefined}
                  >
                    <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <p className={`text-2xl font-black font-mono ${stat.color}`}>{stat.value}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Recent activity — empty state */}
              <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-6">
                <h3 className="font-black text-lg text-slate-900 mb-5">Recent Activity</h3>
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <Inbox className="w-10 h-10 mb-3 text-slate-300" />
                  <p className="text-sm font-medium">Activity log will show here</p>
                  <p className="text-xs mt-1">Market creations, resolutions, and mints will appear as they happen.</p>
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
                {createError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 font-medium">
                    {createError}
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Match ID</label>
                    <input
                      type="text"
                      value={cmMatchId}
                      onChange={(e) => setCmMatchId(e.target.value)}
                      placeholder="PAK-IND-2026-04-25"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Question</label>
                    <input
                      type="text"
                      value={cmQuestion}
                      onChange={(e) => setCmQuestion(e.target.value)}
                      placeholder="Will Pakistan win?"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Lock Time</label>
                      <input
                        type="datetime-local"
                        value={cmLockTime}
                        onChange={(e) => setCmLockTime(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">YES Outcome</label>
                      <select
                        value={cmYesOutcome}
                        onChange={(e) => setCmYesOutcome(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
                      >
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
                      value={cmPrize}
                      onChange={(e) => setCmPrize(e.target.value)}
                      placeholder="5000"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreateMarket}
                    disabled={creating || !cmMatchId || !cmQuestion}
                    className="w-full py-3.5 rounded-xl bg-red-600 text-white font-black flex items-center justify-center gap-2 shadow-sm hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {created ? (
                      <><CheckCircle className="w-4 h-4" /> Market Created!</>
                    ) : creating ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
                    ) : (
                      <><Plus className="w-4 h-4" /> Create Market & Deploy On-Chain</>
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Active markets list */}
              <div className="mt-6 rounded-xl bg-white border border-slate-200 shadow-sm p-6">
                <h3 className="font-black text-lg text-slate-900 mb-4">Active Markets</h3>
                <div className="space-y-3">
                  {marketsLoading ? (
                    <div className="flex items-center justify-center py-8 text-slate-400">
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      <span className="text-sm font-medium">Loading markets...</span>
                    </div>
                  ) : openMarkets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                      <Inbox className="w-8 h-8 mb-2 text-slate-300" />
                      <p className="text-sm font-medium">No active markets</p>
                    </div>
                  ) : (
                    openMarkets.map((m: any, i: number) => (
                      <motion.div
                        key={m.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200 hover:shadow-md transition-shadow"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-900">{m.question || m.title || `Market #${m.id}`}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {m.teamAShortName || m.matchId || ""} {m.teamAShortName && m.teamBShortName ? "vs" : ""} {m.teamBShortName || ""} {m.totalPredictors != null ? `· ${formatCALL(m.totalPredictors)} predictions` : ""}
                          </p>
                        </div>
                        <span className="text-[10px] font-black text-emerald-600 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 uppercase tracking-widest">
                          Open
                        </span>
                      </motion.div>
                    ))
                  )}
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
                {/* Notice */}
                <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 font-medium">
                    Requires on-chain transaction from the owner wallet. Minting is executed via the backend deployer key.
                  </p>
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
                    disabled
                    className="w-full py-3.5 rounded-xl bg-amber-500 text-black font-black flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Lock className="w-4 h-4" /> Mint PKR (Owner Wallet Required)
                  </motion.button>
                </div>
              </div>

              {/* Recent mints — empty state */}
              <div className="mt-6 rounded-xl bg-white border border-slate-200 shadow-sm p-6">
                <h3 className="font-black text-lg text-slate-900 mb-4">Recent Mints</h3>
                <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                  <Inbox className="w-8 h-8 mb-2 text-slate-300" />
                  <p className="text-sm font-medium">No recent mints</p>
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
                {resolveError && (
                  <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 font-medium">
                    {resolveError}
                  </div>
                )}
                <div className="space-y-4 mt-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Match</label>
                    <select
                      value={oracleMatchId}
                      onChange={(e) => setOracleMatchId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors"
                    >
                      <option value="">Select match...</option>
                      {unresolvedMarkets.map((m: any) => (
                        <option key={m.id} value={m.matchId || m.id}>
                          {m.teamAShortName || ""} {m.teamAShortName && m.teamBShortName ? "vs" : ""} {m.teamBShortName || ""} {m.matchId ? `\u2014 ${m.matchId}` : `\u2014 #${m.id}`}
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
                    onClick={handleResolve}
                    disabled={!oracleMatchId || resolving}
                    className="w-full py-3.5 rounded-xl bg-red-600 text-white font-black disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:bg-red-700 transition-colors"
                  >
                    {resolved ? (
                      <><CheckCircle className="w-4 h-4" /> Resolved!</>
                    ) : resolving ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Resolving...</>
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
                    <p className="text-sm font-mono font-bold text-slate-900 truncate">
                      {process.env.NEXT_PUBLIC_ORACLE_ADDRESS || "\u2014"}
                    </p>
                  </div>
                  <div className="p-5 rounded-xl bg-white border border-slate-200 hover:shadow-md transition-shadow text-center">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mx-auto mb-3">
                      <Lock className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Owner Wallet</p>
                    <p className="text-sm font-mono font-bold text-slate-900 truncate">
                      {process.env.NEXT_PUBLIC_OWNER_ADDRESS || "\u2014"}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          {/* ===== Manage Users ===== */}
          {activeTab === "users" && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-slate-900">Manage Users</h3>
                    <p className="text-sm text-slate-500">
                      Search users by wallet address and update their role.
                    </p>
                  </div>
                </div>

                {/* Search */}
                <div className="mt-6 flex gap-3">
                  <input
                    type="text"
                    value={userSearchAddress}
                    onChange={(e) => setUserSearchAddress(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleUserSearch()}
                    placeholder="0x... wallet address"
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors font-mono text-sm"
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleUserSearch}
                    disabled={userSearching || !userSearchAddress.trim()}
                    className="px-6 py-3 rounded-xl bg-purple-600 text-white font-bold text-sm flex items-center gap-2 hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {userSearching ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Users className="w-4 h-4" />
                    )}
                    Search
                  </motion.button>
                </div>

                {/* Error */}
                {userSearchError && (
                  <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 font-medium">
                    {userSearchError}
                  </div>
                )}

                {/* Found user */}
                {foundUser && (
                  <div className="mt-6 space-y-5">
                    {/* User info card */}
                    <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Wallet Address</p>
                          <p className="text-sm font-mono font-bold text-slate-900 truncate">{foundUser.walletAddress}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Display Name</p>
                          <p className="text-sm font-bold text-slate-900">{foundUser.displayName || "Not set"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Current Role</p>
                          <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${
                            foundUser.role === "super_admin"
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : foundUser.role === "sponsor"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}>
                            {foundUser.role === "super_admin" ? "Super Admin" : foundUser.role === "sponsor" ? "Sponsor" : "User"}
                          </span>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Tier</p>
                          <p className="text-sm font-bold text-slate-900">{foundUser.tier || "Bronze"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">CALL Balance</p>
                          <p className="text-sm font-bold text-slate-900">{Number(foundUser.cachedCallBalance || 0).toLocaleString()} CALL</p>
                        </div>
                      </div>
                    </div>

                    {/* Role selector */}
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Set Role</p>
                      <div className="flex gap-3">
                        {[
                          { value: "user", label: "User", color: "emerald" },
                          { value: "sponsor", label: "Sponsor", color: "blue" },
                          { value: "super_admin", label: "Super Admin", color: "red" },
                        ].map((r) => (
                          <button
                            key={r.value}
                            onClick={() => setSelectedRole(r.value)}
                            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all border-2 ${
                              selectedRole === r.value
                                ? r.color === "emerald"
                                  ? "bg-emerald-50 border-emerald-400 text-emerald-700"
                                  : r.color === "blue"
                                  ? "bg-blue-50 border-blue-400 text-blue-700"
                                  : "bg-red-50 border-red-400 text-red-700"
                                : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                            }`}
                          >
                            {r.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Role update feedback */}
                    {roleUpdateError && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 font-medium">
                        {roleUpdateError}
                      </div>
                    )}
                    {roleUpdateSuccess && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 font-medium flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Role updated successfully!
                      </div>
                    )}

                    {/* Update button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleRoleUpdate}
                      disabled={roleUpdating || selectedRole === foundUser.role}
                      className="w-full py-3.5 rounded-xl bg-purple-600 text-white font-black flex items-center justify-center gap-2 shadow-sm hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {roleUpdating ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</>
                      ) : (
                        <><Shield className="w-4 h-4" /> Update Role</>
                      )}
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
