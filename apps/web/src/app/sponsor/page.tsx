"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { markets, formatPKR, formatCALL } from "@/data/mock";
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
} from "lucide-react";

export default function SponsorPage() {
  const [activeTab, setActiveTab] = useState<"campaigns" | "deals" | "create">("campaigns");

  const tabs = [
    { id: "campaigns" as const, label: "My Campaigns", icon: BarChart3 },
    { id: "deals" as const, label: "My Deals", icon: Tag },
    { id: "create" as const, label: "Create", icon: Plus },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center gap-3 mb-2">
        <Store className="w-6 h-6 text-blue-600" />
        <h1 className="text-3xl font-bold">Sponsor Dashboard</h1>
      </div>
      <p className="text-slate-500 text-sm mb-8">
        Manage campaigns, deals, and track analytics.
      </p>

      {/* Stats overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Active Campaigns", value: "3", color: "#2563eb" },
          { label: "Total Deposited", value: "Rs. 12.5 Lac", color: "#d97706" },
          { label: "Users Reached", value: "8,421", color: "#16a34a" },
          { label: "Deal Redemptions", value: "3,216", color: "#9333ea" },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
            <p className="text-2xl font-bold font-mono" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

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
                layoutId="sponsorTab"
                className="absolute inset-0 bg-blue-600 rounded-full"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <tab.icon className="w-4 h-4 relative z-10" />
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* My Campaigns */}
      {activeTab === "campaigns" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
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
              className="rounded-xl bg-white border border-slate-200 shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-bold">{campaign.market}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full"
                      style={{
                        color: campaign.tier === "title" ? "#d97706" : "#2563eb",
                        backgroundColor: (campaign.tier === "title" ? "#d97706" : "#2563eb") + "15",
                      }}
                    >
                      {campaign.tier} sponsor
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        campaign.status === "active"
                          ? "text-green-600 bg-green-50"
                          : "text-slate-500 bg-slate-50"
                      }`}
                    >
                      {campaign.status}
                    </span>
                  </div>
                </div>
                <p className="font-mono font-bold text-xl text-amber-600">
                  {formatPKR(campaign.deposited)}
                </p>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-1 mb-1">
                    <Users className="w-3 h-3 text-slate-500" />
                    <span className="text-[10px] text-slate-500">Winners</span>
                  </div>
                  <p className="font-mono font-bold text-sm">{campaign.winners.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-1 mb-1">
                    <CheckCircle className="w-3 h-3 text-slate-500" />
                    <span className="text-[10px] text-slate-500">Claimed</span>
                  </div>
                  <p className="font-mono font-bold text-sm">{formatPKR(campaign.claimed)}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-1 mb-1">
                    <Eye className="w-3 h-3 text-slate-500" />
                    <span className="text-[10px] text-slate-500">Impressions</span>
                  </div>
                  <p className="font-mono font-bold text-sm">{campaign.impressions.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-1 mb-1">
                    <TrendingUp className="w-3 h-3 text-slate-500" />
                    <span className="text-[10px] text-slate-500">ROI</span>
                  </div>
                  <p className="font-mono font-bold text-sm text-green-600">
                    {campaign.impressions > 0 ? `${(campaign.impressions / (campaign.deposited / 1000)).toFixed(1)}x` : "—"}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* My Deals */}
      {activeTab === "deals" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {[
            { title: "20% off any order", minCall: 100, redeemed: 2340, maxRedemptions: 5000, status: "active", expires: "12d" },
            { title: "Free Zinger with meal", minCall: 500, redeemed: 876, maxRedemptions: 2000, status: "active", expires: "8d" },
          ].map((deal, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl bg-white border border-slate-200 shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg">{deal.title}</h3>
                  <p className="text-xs text-slate-500">
                    Min {formatCALL(deal.minCall)} CALL · Expires {deal.expires}
                  </p>
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {deal.status}
                </span>
              </div>
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">Redemptions</span>
                  <span className="text-xs font-mono">
                    {deal.redeemed.toLocaleString()} / {deal.maxRedemptions.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden bg-slate-50">
                  <motion.div
                    className="h-full rounded-full bg-blue-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${(deal.redeemed / deal.maxRedemptions) * 100}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2 rounded-lg bg-slate-50">
                  <p className="text-xs text-slate-500">Today</p>
                  <p className="font-mono font-bold">74</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-50">
                  <p className="text-xs text-slate-500">Peak Hour</p>
                  <p className="font-mono font-bold">7 PM</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-50">
                  <p className="text-xs text-slate-500">Avg CALL</p>
                  <p className="font-mono font-bold">1,247</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Create */}
      {activeTab === "create" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-2 gap-6">
          {/* Sponsor a Market */}
          <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-lg mb-2">Sponsor a Market</h3>
            <p className="text-sm text-slate-500 mb-6">
              Deposit PKR into an active market as prize money.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Select Market</label>
                <select className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900">
                  <option>PAK vs IND — Will Pakistan score 180+?</option>
                  <option>PAK vs IND — Will Pakistan win?</option>
                  <option>AUS vs ENG — Will Australia win?</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">PKR Amount</label>
                <input
                  type="number"
                  placeholder="100000"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Banner Image</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-slate-300 transition-colors cursor-pointer">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                  <p className="text-sm text-slate-500">Click to upload (1200x400, max 300KB)</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold"
              >
                Deposit PKR & Sponsor
              </motion.button>
            </div>
          </div>

          {/* Create a Deal */}
          <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-lg mb-2">Create a Brand Deal</h3>
            <p className="text-sm text-slate-500 mb-6">
              Offer exclusive perks to users based on CALL balance.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Deal Title</label>
                <input
                  type="text"
                  placeholder="20% off any order"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <textarea
                  placeholder="Valid on orders above Rs. 500..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Min CALL Required</label>
                  <input
                    type="number"
                    placeholder="500"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Max Redemptions</label>
                  <input
                    type="number"
                    placeholder="5000"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Coupon Code</label>
                <input
                  type="text"
                  placeholder="CRICCALL20"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold"
              >
                <Tag className="w-4 h-4 inline mr-2" />
                Create Deal
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
