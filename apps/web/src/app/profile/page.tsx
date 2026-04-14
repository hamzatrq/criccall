"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  currentUser,
  formatCALL,
  getTierLabel,
  getTierColor,
  teams,
} from "@/data/mock";
import {
  Target,
  TrendingUp,
  Flame,
  Trophy,
  Copy,
  Pencil,
  X,
  Camera,
  Check,
} from "lucide-react";

const tierThresholds = [
  { tier: "casual", min: 100, label: "Casual Fan", color: "#00FF6A" },
  { tier: "dedicated", min: 500, label: "Dedicated Fan", color: "#3B82F6" },
  { tier: "expert", min: 2000, label: "Expert", color: "#A855F7" },
  { tier: "superforecaster", min: 5000, label: "Superforecaster", color: "#FFD700" },
];

const mockPredictions = [
  { market: "Will Pakistan score 180+?", position: "yes", amount: 50, result: "won", winnings: 85, date: "2h ago" },
  { market: "Will Australia win?", position: "no", amount: 30, result: "lost", winnings: 0, date: "5h ago" },
  { market: "Will South Africa win?", position: "yes", amount: 40, result: "won", winnings: 65, date: "1d ago" },
  { market: "Will it be a draw?", position: "no", amount: 25, result: "won", winnings: 42, date: "2d ago" },
  { market: "Will England win?", position: "yes", amount: 50, result: "lost", winnings: 0, date: "3d ago" },
];

const teamOptions = Object.values(teams);

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser.displayName);
  const [favoriteTeam, setFavoriteTeam] = useState("PAK");
  const [saved, setSaved] = useState(false);

  const currentTierIdx = tierThresholds.findIndex((t) => t.tier === currentUser.tier);
  const nextTier = tierThresholds[currentTierIdx + 1];
  const progress = nextTier
    ? ((currentUser.callBalance - tierThresholds[currentTierIdx].min) /
        (nextTier.min - tierThresholds[currentTierIdx].min)) * 100
    : 100;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setEditing(false);
      setSaved(false);
    }, 1000);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 mb-6"
      >
        <div className="flex items-center gap-4 mb-6">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#A855F7] flex items-center justify-center text-xl font-bold text-white">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            <button
              onClick={() => setEditing(true)}
              className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Camera className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{displayName}</h1>
              <button
                onClick={() => setEditing(true)}
                className="text-slate-500 hover:text-slate-900 transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="text-xs uppercase tracking-wider font-bold px-2 py-0.5 rounded-full"
                style={{
                  color: getTierColor(currentUser.tier),
                  backgroundColor: getTierColor(currentUser.tier) + "15",
                }}
              >
                {getTierLabel(currentUser.tier)}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {currentUser.address}
              </span>
              <button className="text-slate-500 hover:text-slate-900">
                <Copy className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* CALL Balance */}
        <div className="text-center p-6 rounded-xl bg-slate-50 border border-slate-200 mb-6">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">CALL Balance</p>
          <motion.p
            className="text-5xl font-bold font-mono text-green-600 tabular-nums"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            {formatCALL(currentUser.callBalance)}
          </motion.p>
          <p className="text-sm text-slate-500 mt-1">CALL</p>
        </div>

        {/* Tier Progress */}
        {nextTier && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold" style={{ color: getTierColor(currentUser.tier) }}>
                {getTierLabel(currentUser.tier)}
              </span>
              <span className="text-xs text-slate-500">
                {formatCALL(nextTier.min - currentUser.callBalance)} CALL to{" "}
                <span style={{ color: nextTier.color }}>{nextTier.label}</span>
              </span>
            </div>
            <div className="h-3 rounded-full overflow-hidden bg-slate-50">
              <motion.div
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${getTierColor(currentUser.tier)}, ${nextTier.color})` }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Target, label: "Predictions", value: currentUser.totalPredictions, color: "#3B82F6" },
            { icon: TrendingUp, label: "Win Rate", value: `${currentUser.winRate}%`, color: "#00FF6A" },
            { icon: Flame, label: "Correct", value: currentUser.correctPredictions, color: "#FF3B5C" },
            { icon: Trophy, label: "Rank", value: "#42", color: "#FFD700" },
          ].map((stat) => (
            <div key={stat.label} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <stat.icon className="w-4 h-4 mx-auto mb-1" style={{ color: stat.color }} />
              <p className="text-lg font-bold font-mono text-slate-900">{stat.value}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

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
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#A855F7] flex items-center justify-center text-2xl font-bold text-white">
                    {displayName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6" />
                  </div>
                </div>
              </div>
              <p className="text-center text-xs text-slate-500 mb-6">
                Click to upload avatar (max 2MB)
              </p>

              {/* Display Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1.5 text-slate-900">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={20}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-200 transition-all"
                  placeholder="Enter display name"
                />
                <p className="text-[10px] text-slate-500 mt-1">{displayName.length}/20 characters</p>
              </div>

              {/* Favorite Team */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1.5 text-slate-900">Favorite Team</label>
                <div className="grid grid-cols-4 gap-2">
                  {teamOptions.map((team) => (
                    <button
                      key={team.id}
                      onClick={() => setFavoriteTeam(team.id)}
                      className={`p-2 rounded-lg text-center transition-all ${
                        favoriteTeam === team.id
                          ? "bg-green-50 border-2 border-green-400"
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
                <label className="block text-sm font-medium mb-1.5 text-slate-900">Wallet Address</label>
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-sm font-mono text-slate-500 flex-1">{currentUser.address}</span>
                  <button className="text-slate-500 hover:text-slate-900">
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
                disabled={saved}
                className="w-full py-3 rounded-xl bg-green-600 text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saved ? (
                  <>
                    <Check className="w-4 h-4" />
                    Saved!
                  </>
                ) : (
                  "Save Changes"
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daily Claim */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-green-200 bg-green-50 p-6 mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg mb-1 text-slate-900">Daily CALL Claim</h3>
            <p className="text-sm text-slate-500">100 free CALL tokens every 24 hours</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 rounded-xl bg-green-600 text-white font-bold shadow-md hover:shadow-lg transition-shadow"
          >
            Claim 100 CALL
          </motion.button>
        </div>
      </motion.div>

      {/* Prediction History */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6"
      >
        <h3 className="font-bold text-lg mb-4 text-slate-900">Prediction History</h3>
        <div className="space-y-3">
          {mockPredictions.map((pred, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200"
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold ${
                  pred.result === "won" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                }`}
              >
                {pred.result === "won" ? "W" : "L"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-slate-900">{pred.market}</p>
                <p className="text-xs text-slate-500">
                  {pred.amount} CALL on {pred.position.toUpperCase()} · {pred.date}
                </p>
              </div>
              <div className="text-right shrink-0">
                {pred.result === "won" ? (
                  <p className="text-sm font-mono font-bold text-green-600">+{pred.winnings} CALL</p>
                ) : (
                  <p className="text-sm font-mono font-bold text-red-600">-{pred.amount} CALL</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
