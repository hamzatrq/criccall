"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { markets, formatPKR, formatCALL, currentBrandProfile } from "@/data/mock";
import {
  Store,
  Plus,
  BarChart3,
  Tag,
  Users,
  Eye,
  TrendingUp,
  CheckCircle,
  Clock,
  Image as ImageIcon,
  Coins,
  Gift,
  Target,
  Upload,
  Globe,
  FileText,
  BadgeCheck,
  Save,
  Camera,
} from "lucide-react";

export default function SponsorPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "campaigns" | "deals" | "create">("profile");
  const [brandName, setBrandName] = useState(currentBrandProfile.brandName);
  const [brandUrl, setBrandUrl] = useState(currentBrandProfile.brandUrl || "");
  const [brandDesc, setBrandDesc] = useState(currentBrandProfile.description);
  const [brandCategory, setBrandCategory] = useState(currentBrandProfile.category);
  const [profileSaved, setProfileSaved] = useState(false);

  const handleSaveProfile = () => {
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const tabs = [
    { id: "profile" as const, label: "Brand Profile", icon: Store },
    { id: "campaigns" as const, label: "My Campaigns", icon: BarChart3 },
    { id: "deals" as const, label: "My Deals", icon: Tag },
    { id: "create" as const, label: "Create", icon: Plus },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page header */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Store className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Sponsor Dashboard</h1>
              <p className="text-slate-500 text-sm">
                Manage campaigns, deals, and track analytics.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Stats overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Active Campaigns", value: "3", color: "text-blue-600", bg: "bg-blue-50", icon: Target },
            { label: "Total Deposited", value: "Rs. 12.5 Lac", color: "text-amber-600", bg: "bg-amber-50", icon: Coins },
            { label: "Users Reached", value: "8,421", color: "text-emerald-600", bg: "bg-emerald-50", icon: Users },
            { label: "Deal Redemptions", value: "3,216", color: "text-purple-600", bg: "bg-purple-50", icon: Gift },
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
                  layoutId="sponsorTab"
                  className="absolute inset-0 bg-blue-600 rounded-full shadow-sm"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <tab.icon className="w-4 h-4 relative z-10" />
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ===== Brand Profile ===== */}
          {activeTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid md:grid-cols-3 gap-6"
            >
              {/* Left: Logo & Banner */}
              <div className="space-y-6">
                {/* Logo Upload */}
                <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-6">
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Brand Logo</h3>
                  <div className="flex flex-col items-center">
                    <div className="relative group mb-3">
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-2xl font-black text-white border-4 border-white shadow-md">
                        {currentBrandProfile.brandLogo}
                      </div>
                      <button className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-6 h-6 text-white" />
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400">400x400px · Max 100KB</p>
                    <p className="text-[10px] text-slate-400">PNG, WebP, or SVG</p>
                    <button className="mt-3 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                      <Upload className="w-3 h-3" /> Upload New Logo
                    </button>
                  </div>
                </div>

                {/* Banner Upload */}
                <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-6">
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Brand Banner</h3>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer group aspect-[3/1] flex flex-col items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-slate-300 group-hover:text-blue-400 transition-colors mb-2" />
                    <p className="text-xs text-slate-400 group-hover:text-blue-500">Click to upload banner</p>
                    <p className="text-[10px] text-slate-300 mt-1">1200x400px · Max 300KB</p>
                  </div>
                </div>

                {/* Verification Status */}
                <div className={`rounded-xl p-4 border ${currentBrandProfile.verified ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
                  <div className="flex items-center gap-2">
                    <BadgeCheck className={`w-5 h-5 ${currentBrandProfile.verified ? "text-emerald-600" : "text-amber-600"}`} />
                    <div>
                      <p className={`text-sm font-bold ${currentBrandProfile.verified ? "text-emerald-700" : "text-amber-700"}`}>
                        {currentBrandProfile.verified ? "Verified Brand" : "Pending Verification"}
                      </p>
                      <p className={`text-[10px] ${currentBrandProfile.verified ? "text-emerald-600" : "text-amber-600"}`}>
                        {currentBrandProfile.verified ? "Your brand is verified and visible to users." : "Admin review in progress. Deals will be visible after approval."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Brand Info Form */}
              <div className="md:col-span-2 space-y-6">
                <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-6">
                  <h3 className="font-black text-lg text-slate-900 mb-6 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Brand Information
                  </h3>

                  <div className="space-y-5">
                    {/* Brand Name */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Brand Name</label>
                      <input
                        type="text"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        placeholder="Your brand name"
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors font-medium"
                      />
                    </div>

                    {/* Website URL */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Website URL</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="url"
                          value={brandUrl}
                          onChange={(e) => setBrandUrl(e.target.value)}
                          placeholder="https://yourbrand.com"
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Category</label>
                      <select
                        value={brandCategory}
                        onChange={(e) => setBrandCategory(e.target.value as typeof brandCategory)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                      >
                        <option value="food">Food & Delivery</option>
                        <option value="telecom">Telecom</option>
                        <option value="ecommerce">E-Commerce</option>
                        <option value="entertainment">Entertainment</option>
                        <option value="sports">Sports</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Description</label>
                      <textarea
                        value={brandDesc}
                        onChange={(e) => setBrandDesc(e.target.value)}
                        rows={4}
                        maxLength={300}
                        placeholder="Tell users about your brand..."
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors resize-none"
                      />
                      <p className="text-[10px] text-slate-400 mt-1 text-right">{brandDesc.length}/300</p>
                    </div>

                    {/* Save Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSaveProfile}
                      className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center gap-2 shadow-sm hover:bg-blue-700 transition-colors"
                    >
                      {profileSaved ? (
                        <><CheckCircle className="w-4 h-4" /> Profile Saved!</>
                      ) : (
                        <><Save className="w-4 h-4" /> Save Brand Profile</>
                      )}
                    </motion.button>
                  </div>
                </div>

                {/* Preview Card */}
                <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-6">
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Preview — How Users See Your Brand</h3>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-sm font-black text-white">
                        {currentBrandProfile.brandLogo}
                      </div>
                      <div>
                        <p className="font-black text-slate-900">{brandName || "Brand Name"}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase tracking-widest font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">{brandCategory}</span>
                          {currentBrandProfile.verified && (
                            <span className="text-[10px] text-emerald-600 flex items-center gap-0.5">
                              <BadgeCheck className="w-3 h-3" /> Verified
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2">{brandDesc || "Brand description will appear here..."}</p>
                    {brandUrl && (
                      <p className="text-xs text-blue-500 mt-2 flex items-center gap-1">
                        <Globe className="w-3 h-3" /> {brandUrl}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ===== My Campaigns ===== */}
          {activeTab === "campaigns" && (
            <motion.div
              key="campaigns"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {[
                {
                  market: "PAK vs IND — Will Pakistan score 180+?",
                  deposited: 1050000,
                  tier: "title",
                  winners: 1200,
                  claimed: 840000,
                  impressions: 15000,
                  status: "active",
                },
                {
                  market: "AUS vs ENG — Will Australia win?",
                  deposited: 100000,
                  tier: "gold",
                  winners: 0,
                  claimed: 0,
                  impressions: 3200,
                  status: "active",
                },
                {
                  market: "SA vs NZ — Will South Africa win?",
                  deposited: 75000,
                  tier: "gold",
                  winners: 450,
                  claimed: 62000,
                  impressions: 8900,
                  status: "resolved",
                },
              ].map((campaign, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl bg-white border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <p className="font-black text-slate-900">{campaign.market}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className="text-[10px] uppercase tracking-widest font-black px-3 py-1 rounded-full"
                          style={{
                            color: campaign.tier === "title" ? "#d97706" : "#2563eb",
                            backgroundColor: campaign.tier === "title" ? "#fffbeb" : "#eff6ff",
                            border: `1px solid ${campaign.tier === "title" ? "#fde68a" : "#bfdbfe"}`,
                          }}
                        >
                          {campaign.tier} sponsor
                        </span>
                        <span
                          className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                            campaign.status === "active"
                              ? "text-emerald-600 bg-emerald-50 border border-emerald-100"
                              : "text-slate-500 bg-slate-50 border border-slate-200"
                          }`}
                        >
                          {campaign.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Deposited</p>
                      <p className="font-mono font-black text-xl text-amber-600">
                        {formatPKR(campaign.deposited)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { icon: Users, label: "Winners", value: campaign.winners.toLocaleString(), color: "text-blue-600", bg: "bg-blue-50" },
                      { icon: CheckCircle, label: "Claimed", value: formatPKR(campaign.claimed), color: "text-emerald-600", bg: "bg-emerald-50" },
                      { icon: Eye, label: "Impressions", value: campaign.impressions.toLocaleString(), color: "text-purple-600", bg: "bg-purple-50" },
                      {
                        icon: TrendingUp,
                        label: "ROI",
                        value: campaign.impressions > 0
                          ? `${(campaign.impressions / (campaign.deposited / 1000)).toFixed(1)}x`
                          : "---",
                        color: "text-emerald-600",
                        bg: "bg-emerald-50",
                      },
                    ].map((stat) => (
                      <div key={stat.label} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1.5">
                          <stat.icon className="w-3 h-3 text-slate-400" />
                          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{stat.label}</span>
                        </div>
                        <p className={`font-mono font-black text-sm ${stat.color}`}>{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* ===== My Deals ===== */}
          {activeTab === "deals" && (
            <motion.div
              key="deals"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {[
                { title: "20% off any order", minCall: 100, redeemed: 2340, maxRedemptions: 5000, status: "active", expires: "12d" },
                { title: "Free Zinger with meal", minCall: 500, redeemed: 876, maxRedemptions: 2000, status: "active", expires: "8d" },
              ].map((deal, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl bg-white border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-black text-lg text-slate-900">{deal.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Min {formatCALL(deal.minCall)} CALL · Expires in {deal.expires}
                      </p>
                    </div>
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-widest">
                      {deal.status}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Redemptions</span>
                      <span className="text-xs font-mono font-bold text-slate-700">
                        {deal.redeemed.toLocaleString()} / {deal.maxRedemptions.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${(deal.redeemed / deal.maxRedemptions) * 100}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Today", value: "74", color: "text-blue-600" },
                      { label: "Peak Hour", value: "7 PM", color: "text-amber-600" },
                      { label: "Avg CALL", value: "1,247", color: "text-emerald-600" },
                    ].map((stat) => (
                      <div key={stat.label} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">{stat.label}</p>
                        <p className={`font-mono font-black ${stat.color}`}>{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* ===== Create ===== */}
          {activeTab === "create" && (
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid md:grid-cols-2 gap-6"
            >
              {/* Sponsor a Market */}
              <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Coins className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-slate-900">Sponsor a Market</h3>
                    <p className="text-sm text-slate-500">
                      Deposit PKR into an active market as prize money.
                    </p>
                  </div>
                </div>
                <div className="space-y-4 mt-5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Select Market</label>
                    <select className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors">
                      {markets.filter((m) => m.state === "open").map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.match.teamA.shortName} vs {m.match.teamB.shortName} — {m.question}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">PKR Amount</label>
                    <input
                      type="number"
                      placeholder="100000"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Banner Image</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-emerald-300 hover:bg-emerald-50/30 transition-all cursor-pointer group">
                      <ImageIcon className="w-8 h-8 mx-auto mb-2 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                      <p className="text-sm text-slate-500 group-hover:text-emerald-600 transition-colors">Click to upload (1200x400, max 300KB)</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-black shadow-sm hover:bg-blue-700 transition-colors"
                  >
                    Deposit PKR & Sponsor
                  </motion.button>
                </div>
              </div>

              {/* Create a Deal */}
              <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Tag className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-slate-900">Create a Brand Deal</h3>
                    <p className="text-sm text-slate-500">
                      Offer exclusive perks to users based on CALL balance.
                    </p>
                  </div>
                </div>
                <div className="space-y-4 mt-5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Deal Title</label>
                    <input
                      type="text"
                      placeholder="20% off any order"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Description</label>
                    <textarea
                      placeholder="Valid on orders above Rs. 500..."
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 resize-none focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Min CALL Required</label>
                      <input
                        type="number"
                        placeholder="500"
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Max Redemptions</label>
                      <input
                        type="number"
                        placeholder="5000"
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Coupon Code</label>
                    <input
                      type="text"
                      placeholder="CRICCALL20"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center gap-2 shadow-sm hover:bg-blue-700 transition-colors"
                  >
                    <Tag className="w-4 h-4" />
                    Create Deal
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
