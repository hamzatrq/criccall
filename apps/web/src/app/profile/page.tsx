"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  formatCALL,
  getTierLabel,
  getTierColor,
  teams,
} from "@/data/mock";
import { useAuth } from "@/lib/auth-context";
import { useMyStats, useMyPredictions } from "@/hooks/use-api";
import { api } from "@/lib/api";
import {
  Copy,
  Pencil,
  X,
  Camera,
  Check,
  CheckCircle,
  XCircle,
  Wallet,
  CalendarSync,
  Loader2,
} from "lucide-react";

const tierThresholds = [
  { tier: "casual", min: 100, label: "Casual Fan", color: "#00FF6A" },
  { tier: "dedicated", min: 500, label: "Dedicated Fan", color: "#3B82F6" },
  { tier: "expert", min: 2000, label: "Expert", color: "#A855F7" },
  { tier: "superforecaster", min: 5000, label: "Superforecaster", color: "#FFD700" },
];

const teamOptions = Object.values(teams);

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();
  const { data: stats, isLoading: statsLoading } = useMyStats();
  const { data: predictionsData, isLoading: predsLoading } = useMyPredictions();

  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [favoriteTeam, setFavoriteTeam] = useState("PAK");
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sync displayName from user when available
  const effectiveDisplayName = displayName || user?.displayName || "User";

  const callBalance = Number(user?.cachedCallBalance || 0);
  const tier = user?.tier || "new_fan";
  const walletAddress = user?.walletAddress || "";

  const currentTierIdx = tierThresholds.findIndex((t) => t.tier === tier);
  const nextTier = tierThresholds[currentTierIdx + 1];
  const currentMin = currentTierIdx >= 0 ? tierThresholds[currentTierIdx].min : 0;
  const progress = nextTier
    ? ((callBalance - currentMin) / (nextTier.min - currentMin)) * 100
    : 100;

  const predictions = predictionsData?.data || predictionsData || [];

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateProfile({
        displayName: effectiveDisplayName,
        favoriteTeam,
      });
      await refreshUser();
      setSaved(true);
      setTimeout(() => {
        setEditing(false);
        setSaved(false);
        setSaving(false);
      }, 1000);
    } catch {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleEditOpen = () => {
    setDisplayName(user?.displayName || "");
    setEditing(true);
  };

  // Auth loading
  if (authLoading) {
    return (
      <div className="max-w-md mx-auto px-4 pt-20 pb-24 flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 pt-20 pb-24 text-center space-y-4">
        <Wallet className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Connect your wallet</h2>
        <p className="text-sm text-slate-500">
          Sign in to view your profile, stats, and prediction history.
        </p>
      </div>
    );
  }

  const shortenedAddress =
    walletAddress.length > 12
      ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
      : walletAddress;

  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-24 space-y-6">
      {/* User Header Section */}
      <motion.section
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-4"
      >
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-white shadow-sm bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-2xl font-bold text-white">
            {effectiveDisplayName.slice(0, 2).toUpperCase()}
          </div>
          <button
            onClick={handleEditOpen}
            className="absolute bottom-0 right-0 bg-emerald-700 text-white p-1 rounded-full border-2 border-white shadow-md hover:opacity-80 duration-150 flex items-center justify-center"
          >
            <Pencil className="w-3 h-3" />
          </button>
        </div>
        <div className="flex-1 pt-1">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {effectiveDisplayName}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {getTierLabel(tier)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-slate-500">
            <Wallet className="w-3.5 h-3.5" />
            <code className="text-xs font-mono">{shortenedAddress}</code>
            <button
              onClick={handleCopy}
              className="hover:text-emerald-700 transition-colors"
            >
              {copied ? (
                <Check className="w-3 h-3 text-emerald-600" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>
      </motion.section>

      {/* Balance Card */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-slate-50 rounded-xl p-6 shadow-sm border border-slate-200 text-center"
      >
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
          Available Balance
        </p>
        <div className="flex items-center justify-center gap-2">
          <motion.span
            className="text-4xl font-mono font-bold text-emerald-700"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            {formatCALL(callBalance)}
          </motion.span>
          <span className="text-sm font-bold text-emerald-800 uppercase tracking-tighter">
            CALL
          </span>
        </div>
        {nextTier && (
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
              <span className="text-blue-600">{getTierLabel(tier)}</span>
              <span className="text-purple-600">{nextTier.label}</span>
            </div>
            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
            </div>
            <p className="text-[10px] text-slate-500 text-right italic">
              {Math.round(progress)}% to next tier
            </p>
          </div>
        )}
      </motion.section>

      {/* Stats Grid */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-3"
      >
        {statsLoading ? (
          <div className="col-span-2 flex justify-center py-6">
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
          </div>
        ) : (
          [
            { label: "Predictions", value: String(stats?.totalPredictions ?? 0), colorClass: "text-slate-900" },
            { label: "Win Rate", value: `${stats?.winRate ?? 0}%`, colorClass: "text-emerald-700" },
            { label: "Correct", value: String(stats?.correctPredictions ?? 0), colorClass: "text-slate-900" },
            { label: "Rank", value: stats?.rank ? `#${stats.rank}` : "--", colorClass: "text-amber-600" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center"
            >
              <span className="text-xs font-medium text-slate-500">{stat.label}</span>
              <span className={`text-lg font-bold ${stat.colorClass}`}>{stat.value}</span>
            </div>
          ))
        )}
      </motion.section>

      {/* Daily Claim */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-emerald-50 border border-green-200 rounded-xl p-4 flex items-center justify-between shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-emerald-700">
            <CalendarSync className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-emerald-900 leading-none">
              Daily CALL Claim
            </h3>
            <p className="text-[11px] text-emerald-700/70 mt-1">
              Ready for collection
            </p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90 duration-150 transition-all active:scale-95"
        >
          Claim 100 CALL
        </motion.button>
      </motion.section>

      {/* Prediction History */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3 pb-8"
      >
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Prediction History
          </h2>
          <button className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
            View All
          </button>
        </div>
        {predsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
          </div>
        ) : predictions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-400">No predictions yet</p>
            <p className="text-xs text-slate-400 mt-1">Make your first prediction to see it here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {predictions.map((pred: any, i: number) => {
              const isWon = pred.result === "won" || pred.outcome === "won" || pred.payout > 0;
              const question = pred.question || pred.market?.question || "Prediction";
              const amount = pred.amount || pred.stake || 0;
              const payout = pred.payout || 0;

              return (
                <motion.div
                  key={pred.id || i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.05 }}
                  className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isWon
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {isWon ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <XCircle className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 line-clamp-1">
                        {question}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                        Predicted: {amount} CALL
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <span
                      className={`text-xs font-bold ${
                        isWon ? "text-emerald-700" : "text-red-600"
                      }`}
                    >
                      {payout > 0 ? "+" : ""}
                      {Number(payout).toFixed(1)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.section>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setEditing(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900">Edit Profile</h2>
                <button onClick={() => setEditing(false)} className="text-slate-500 hover:text-slate-900">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Avatar upload */}
              <div className="flex justify-center mb-6">
                <div className="relative group cursor-pointer">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-2xl font-bold text-white">
                    {(displayName || effectiveDisplayName).slice(0, 2).toUpperCase()}
                  </div>
                  <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              <p className="text-center text-xs text-slate-500 mb-6">
                Click to upload avatar (max 2MB)
              </p>

              {/* Display Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1.5 text-slate-900">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={20}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200 transition-all"
                  placeholder="Enter display name"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  {displayName.length}/20 characters
                </p>
              </div>

              {/* Favorite Team */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1.5 text-slate-900">
                  Favorite Team
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {teamOptions.map((team) => (
                    <button
                      key={team.id}
                      onClick={() => setFavoriteTeam(team.id)}
                      className={`p-2 rounded-lg text-center transition-all ${
                        favoriteTeam === team.id
                          ? "bg-emerald-50 border-2 border-emerald-400"
                          : "bg-slate-50 border-2 border-transparent hover:bg-slate-100"
                      }`}
                    >
                      <span className="text-xl block">{team.flag}</span>
                      <span className="text-[10px] text-slate-500">{team.shortName}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Wallet (read-only) */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1.5 text-slate-900">
                  Wallet Address
                </label>
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-sm font-mono text-slate-500 flex-1">
                    {shortenedAddress}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="text-slate-500 hover:text-slate-900"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Connected via MetaMask</p>
              </div>

              {/* Save */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={saved || saving}
                className="w-full py-3 rounded-xl bg-emerald-700 text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saved ? (
                  <>
                    <Check className="w-4 h-4" />
                    Saved!
                  </>
                ) : saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
