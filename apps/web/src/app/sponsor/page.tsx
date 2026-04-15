"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatPKR, formatCALL } from "@/lib/utils";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useBrandProfile, useMyCampaigns, useMarkets, useDeals } from "@/hooks/use-api";
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
  Loader2,
  AlertCircle,
  Inbox,
  ShieldAlert,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function SponsorPage() {
  const { user, isAuthenticated, isLoading, login } = useAuth();

  // Access gate: not authenticated
  if (!isLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Connect Your Wallet</h1>
          <p className="text-slate-500 text-sm mb-8">
            Connect your wallet to access the sponsor dashboard.
          </p>
          <div className="inline-flex">
            <ConnectButton />
          </div>
        </div>
      </div>
    );
  }

  // Access gate: wrong role
  if (!isLoading && isAuthenticated && user?.role !== "sponsor" && user?.role !== "super_admin") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Sponsor Access Required</h1>
          <p className="text-slate-500 text-sm mb-4">
            You need a sponsor role to access this dashboard. Contact the CricCall team to become a sponsor.
          </p>
          <p className="text-xs font-mono text-slate-400 mb-8 truncate">
            {user?.walletAddress}
          </p>
          <Link
            href="/markets"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl text-sm hover:bg-emerald-700 transition-colors"
          >
            Go to Markets
          </Link>
        </div>
      </div>
    );
  }
  const { data: brandProfile, isLoading: profileLoading } = useBrandProfile();
  const { data: campaignsData, isLoading: campaignsLoading } = useMyCampaigns();
  const { data: openMarketsData, isLoading: marketsLoading } = useMarkets({ status: "open" });
  const { data: dealsData, isLoading: dealsLoading } = useDeals();

  const campaigns = campaignsData?.data ?? campaignsData ?? [];
  const openMarkets = openMarketsData?.data ?? openMarketsData ?? [];
  const deals = dealsData?.data ?? dealsData ?? [];

  const [activeTab, setActiveTab] = useState<"profile" | "campaigns" | "deals" | "create">("profile");

  // Brand profile form state
  const [brandName, setBrandName] = useState("");
  const [brandUrl, setBrandUrl] = useState("");
  const [brandDesc, setBrandDesc] = useState("");
  const [brandCategory, setBrandCategory] = useState("food");
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileExists, setProfileExists] = useState(false);

  // Create form state
  const [selectedMarketId, setSelectedMarketId] = useState("");
  const [sponsorAmount, setSponsorAmount] = useState("");
  const [sponsorSubmitting, setSponsorSubmitting] = useState(false);
  const [sponsorSuccess, setSponsorSuccess] = useState(false);
  const [sponsorError, setSponsorError] = useState<string | null>(null);

  const [dealTitle, setDealTitle] = useState("");
  const [dealDescription, setDealDescription] = useState("");
  const [dealMinCall, setDealMinCall] = useState("");
  const [dealMaxRedemptions, setDealMaxRedemptions] = useState("");
  const [dealCouponCode, setDealCouponCode] = useState("");
  const [dealType, setDealType] = useState("coupon_code");
  const [dealUrl, setDealUrl] = useState("");
  const [dealStartsAt, setDealStartsAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [dealExpiresAt, setDealExpiresAt] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 16);
  });
  const [dealSubmitting, setDealSubmitting] = useState(false);
  const [dealSuccess, setDealSuccess] = useState(false);
  const [dealError, setDealError] = useState<string | null>(null);

  // Image upload state
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 100 * 1024) { alert("Logo too large. Max 100KB."); return; }
    setLogoPreview(URL.createObjectURL(file));
  };
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 300 * 1024) { alert("Banner too large. Max 300KB."); return; }
    setBannerPreview(URL.createObjectURL(file));
  };

  // Populate form from API profile data
  useEffect(() => {
    if (brandProfile) {
      setBrandName(brandProfile.brandName || "");
      setBrandUrl(brandProfile.brandUrl || "");
      setBrandDesc(brandProfile.description || "");
      setBrandCategory(brandProfile.category || "food");
      setProfileExists(true);
    }
  }, [brandProfile]);

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    setProfileError(null);
    try {
      const data = {
        brandName,
        brandUrl,
        description: brandDesc,
        category: brandCategory,
      };
      if (profileExists) {
        await api.updateBrandProfile(data);
      } else {
        await api.createBrandProfile(data);
        setProfileExists(true);
      }
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } catch (err: any) {
      setProfileError(err.message || "Failed to save profile");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSponsorMarket = async () => {
    if (!selectedMarketId || !sponsorAmount) return;
    setSponsorSubmitting(true);
    setSponsorError(null);
    try {
      await api.sponsorMarket(selectedMarketId, {
        amount: Number(sponsorAmount),
      });
      setSponsorSuccess(true);
      setSponsorAmount("");
      setTimeout(() => setSponsorSuccess(false), 3000);
    } catch (err: any) {
      setSponsorError(err.message || "Failed to sponsor market");
    } finally {
      setSponsorSubmitting(false);
    }
  };

  const handleCreateDeal = async () => {
    if (!dealTitle) return;
    setDealSubmitting(true);
    setDealError(null);
    try {
      await api.createDeal({
        title: dealTitle,
        description: dealDescription || undefined,
        minCall: Number(dealMinCall) || 0,
        dealType: dealType,
        couponCode: dealCouponCode || undefined,
        dealUrl: dealUrl || undefined,
        maxRedemptions: Number(dealMaxRedemptions) || undefined,
        startsAt: new Date(dealStartsAt).toISOString(),
        expiresAt: new Date(dealExpiresAt).toISOString(),
      });
      setDealSuccess(true);
      setDealTitle("");
      setDealDescription("");
      setDealMinCall("");
      setDealMaxRedemptions("");
      setDealCouponCode("");
      setDealUrl("");
      setTimeout(() => setDealSuccess(false), 3000);
    } catch (err: any) {
      setDealError(err.message || "Failed to create deal");
    } finally {
      setDealSubmitting(false);
    }
  };

  // Derive stats from campaigns
  const activeCampaignCount = Array.isArray(campaigns)
    ? campaigns.filter((c: any) => c.status === "active").length
    : 0;
  const totalDeposited = Array.isArray(campaigns)
    ? campaigns.reduce((sum: number, c: any) => sum + (Number(c.depositedAmount ?? c.deposited ?? 0)), 0)
    : 0;

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
            { label: "Active Campaigns", value: campaignsLoading ? "..." : String(activeCampaignCount), color: "text-blue-600", bg: "bg-blue-50", icon: Target },
            { label: "Total Deposited", value: campaignsLoading ? "..." : totalDeposited > 0 ? formatPKR(totalDeposited) : "\u2014", color: "text-amber-600", bg: "bg-amber-50", icon: Coins },
            { label: "Users Reached", value: "\u2014", color: "text-emerald-600", bg: "bg-emerald-50", icon: Users },
            { label: "Deal Redemptions", value: "\u2014", color: "text-purple-600", bg: "bg-purple-50", icon: Gift },
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
              {profileLoading ? (
                <div className="md:col-span-3 flex items-center justify-center py-20">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                  <span className="ml-2 text-slate-500 font-medium">Loading profile...</span>
                </div>
              ) : (
                <>
                  {/* Left: Logo & Banner */}
                  <div className="space-y-6">
                    {/* Logo Upload */}
                    <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-6">
                      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Brand Logo</h3>
                      <div className="flex flex-col items-center">
                        <div className="relative group mb-3" onClick={() => logoInputRef.current?.click()}>
                          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-2xl font-black text-white border-4 border-white shadow-md overflow-hidden">
                            {logoPreview ? (
                              <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                              brandProfile?.brandLogo || brandName?.slice(0, 2)?.toUpperCase() || "BR"
                            )}
                          </div>
                          <button className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="w-6 h-6 text-white" />
                          </button>
                        </div>
                        <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                        <p className="text-[10px] text-slate-400">400x400px · Max 100KB</p>
                        <p className="text-[10px] text-slate-400">PNG, WebP, or SVG</p>
                        <button onClick={() => logoInputRef.current?.click()} className="mt-3 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                          <Upload className="w-3 h-3" /> Upload New Logo
                        </button>
                      </div>
                    </div>

                    {/* Banner Upload */}
                    <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-6">
                      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Brand Banner</h3>
                      <div
                        onClick={() => bannerInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer group aspect-[3/1] flex flex-col items-center justify-center overflow-hidden"
                      >
                        {bannerPreview ? (
                          <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <ImageIcon className="w-8 h-8 text-slate-300 group-hover:text-blue-400 transition-colors mb-2" />
                            <p className="text-xs text-slate-400 group-hover:text-blue-500">Click to upload banner</p>
                            <p className="text-[10px] text-slate-300 mt-1">1200x400px · Max 300KB</p>
                          </>
                        )}
                      </div>
                      <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />
                    </div>

                    {/* Verification Status */}
                    <div className={`rounded-xl p-4 border ${brandProfile?.verified ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
                      <div className="flex items-center gap-2">
                        <BadgeCheck className={`w-5 h-5 ${brandProfile?.verified ? "text-emerald-600" : "text-amber-600"}`} />
                        <div>
                          <p className={`text-sm font-bold ${brandProfile?.verified ? "text-emerald-700" : "text-amber-700"}`}>
                            {brandProfile?.verified ? "Verified Brand" : "Pending Verification"}
                          </p>
                          <p className={`text-[10px] ${brandProfile?.verified ? "text-emerald-600" : "text-amber-600"}`}>
                            {brandProfile?.verified ? "Your brand is verified and visible to users." : "Admin review in progress. Deals will be visible after approval."}
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
                            onChange={(e) => setBrandCategory(e.target.value)}
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

                        {/* Error */}
                        {profileError && (
                          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {profileError}
                          </div>
                        )}

                        {/* Save Button */}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleSaveProfile}
                          disabled={profileSaving}
                          className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center gap-2 shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          {profileSaving ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                          ) : profileSaved ? (
                            <><CheckCircle className="w-4 h-4" /> Profile Saved!</>
                          ) : (
                            <><Save className="w-4 h-4" /> {profileExists ? "Save Brand Profile" : "Create Brand Profile"}</>
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
                            {brandProfile?.brandLogo || brandName?.slice(0, 2)?.toUpperCase() || "BR"}
                          </div>
                          <div>
                            <p className="font-black text-slate-900">{brandName || "Brand Name"}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] uppercase tracking-widest font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">{brandCategory}</span>
                              {brandProfile?.verified && (
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
                </>
              )}
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
              {campaignsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                  <span className="ml-2 text-slate-500 font-medium">Loading campaigns...</span>
                </div>
              ) : !Array.isArray(campaigns) || campaigns.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Inbox className="w-12 h-12 text-slate-300 mb-3" />
                  <p className="font-bold text-slate-700">No campaigns yet</p>
                  <p className="text-sm text-slate-500 mt-1">Sponsor a market from the Create tab to get started.</p>
                </div>
              ) : (
                campaigns.map((campaign: any, i: number) => (
                  <motion.div
                    key={campaign.id ?? i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-xl bg-white border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-5">
                      <div>
                        <p className="font-black text-slate-900">{campaign.marketName ?? campaign.market?.question ?? `Campaign #${campaign.id}`}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className="text-[10px] uppercase tracking-widest font-black px-3 py-1 rounded-full"
                            style={{
                              color: campaign.tier === "title" ? "#d97706" : "#2563eb",
                              backgroundColor: campaign.tier === "title" ? "#fffbeb" : "#eff6ff",
                              border: `1px solid ${campaign.tier === "title" ? "#fde68a" : "#bfdbfe"}`,
                            }}
                          >
                            {campaign.tier ?? "sponsor"} sponsor
                          </span>
                          <span
                            className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                              campaign.status === "active"
                                ? "text-emerald-600 bg-emerald-50 border border-emerald-100"
                                : "text-slate-500 bg-slate-50 border border-slate-200"
                            }`}
                          >
                            {campaign.status ?? "unknown"}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Deposited</p>
                        <p className="font-mono font-black text-xl text-amber-600">
                          {formatPKR(Number(campaign.depositedAmount ?? campaign.deposited ?? 0))}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { icon: Users, label: "Winners", value: campaign.winners != null ? Number(campaign.winners).toLocaleString() : "\u2014", color: "text-blue-600", bg: "bg-blue-50" },
                        { icon: CheckCircle, label: "Claimed", value: campaign.claimed != null ? formatPKR(Number(campaign.claimed)) : "\u2014", color: "text-emerald-600", bg: "bg-emerald-50" },
                        { icon: Eye, label: "Impressions", value: campaign.impressions != null ? Number(campaign.impressions).toLocaleString() : "\u2014", color: "text-purple-600", bg: "bg-purple-50" },
                        {
                          icon: TrendingUp,
                          label: "ROI",
                          value: campaign.impressions != null && Number(campaign.depositedAmount ?? campaign.deposited ?? 0) > 0
                            ? `${(Number(campaign.impressions) / (Number(campaign.depositedAmount ?? campaign.deposited) / 1000)).toFixed(1)}x`
                            : "\u2014",
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
                ))
              )}
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
              {dealsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                  <span className="ml-2 text-slate-500 font-medium">Loading deals...</span>
                </div>
              ) : !Array.isArray(deals) || deals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Inbox className="w-12 h-12 text-slate-300 mb-3" />
                  <p className="font-bold text-slate-700">No deals yet</p>
                  <p className="text-sm text-slate-500 mt-1">Create a brand deal from the Create tab to offer perks to users.</p>
                </div>
              ) : (
                deals.map((deal: any, i: number) => (
                  <motion.div
                    key={deal.id ?? i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-xl bg-white border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-black text-lg text-slate-900">{deal.title}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Min {formatCALL(Number(deal.minCallBalance ?? deal.minCall ?? 0))} CALL
                          {deal.expiresAt ? ` · Expires ${new Date(deal.expiresAt).toLocaleDateString()}` : ""}
                        </p>
                      </div>
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                        deal.status === "active"
                          ? "text-emerald-600 bg-emerald-50 border border-emerald-100"
                          : "text-slate-500 bg-slate-50 border border-slate-200"
                      }`}>
                        {deal.status ?? "active"}
                      </span>
                    </div>

                    {/* Progress bar */}
                    {(deal.maxRedemptions ?? 0) > 0 && (
                      <div className="mb-5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Redemptions</span>
                          <span className="text-xs font-mono font-bold text-slate-700">
                            {Number(deal.redeemed ?? deal.redemptions ?? 0).toLocaleString()} / {Number(deal.maxRedemptions).toLocaleString()}
                          </span>
                        </div>
                        <div className="h-2.5 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (Number(deal.redeemed ?? deal.redemptions ?? 0) / Number(deal.maxRedemptions)) * 100)}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Redeemed", value: deal.redeemed != null || deal.redemptions != null ? Number(deal.redeemed ?? deal.redemptions).toLocaleString() : "\u2014", color: "text-blue-600" },
                        { label: "Coupon", value: deal.couponCode || "\u2014", color: "text-amber-600" },
                        { label: "Min CALL", value: deal.minCallBalance != null || deal.minCall != null ? formatCALL(Number(deal.minCallBalance ?? deal.minCall)) : "\u2014", color: "text-emerald-600" },
                      ].map((stat) => (
                        <div key={stat.label} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">{stat.label}</p>
                          <p className={`font-mono font-black ${stat.color}`}>{stat.value}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))
              )}
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
                    {marketsLoading ? (
                      <div className="flex items-center gap-2 py-3 px-4 text-sm text-slate-500">
                        <Loader2 className="w-4 h-4 animate-spin" /> Loading markets...
                      </div>
                    ) : (
                      <select
                        value={selectedMarketId}
                        onChange={(e) => setSelectedMarketId(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
                      >
                        <option value="">Select a market...</option>
                        {Array.isArray(openMarkets) && openMarkets.map((m: any) => (
                          <option key={m.id} value={m.id}>
                            {m.match?.teamA?.shortName && m.match?.teamB?.shortName
                              ? `${m.match.teamA.shortName} vs ${m.match.teamB.shortName} — ${m.question}`
                              : m.question ?? `Market #${m.id}`}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">PKR Amount</label>
                    <input
                      type="number"
                      value={sponsorAmount}
                      onChange={(e) => setSponsorAmount(e.target.value)}
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

                  {sponsorError && (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {sponsorError}
                    </div>
                  )}
                  {sponsorSuccess && (
                    <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      Market sponsored successfully!
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSponsorMarket}
                    disabled={sponsorSubmitting || !selectedMarketId || !sponsorAmount}
                    className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-black shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {sponsorSubmitting ? (
                      <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</span>
                    ) : (
                      "Deposit PKR & Sponsor"
                    )}
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
                      value={dealTitle}
                      onChange={(e) => setDealTitle(e.target.value)}
                      placeholder="20% off any order"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Description</label>
                    <textarea
                      value={dealDescription}
                      onChange={(e) => setDealDescription(e.target.value)}
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
                        value={dealMinCall}
                        onChange={(e) => setDealMinCall(e.target.value)}
                        placeholder="500"
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Max Redemptions</label>
                      <input
                        type="number"
                        value={dealMaxRedemptions}
                        onChange={(e) => setDealMaxRedemptions(e.target.value)}
                        placeholder="5000"
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Deal Type</label>
                    <select
                      value={dealType}
                      onChange={(e) => setDealType(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                    >
                      <option value="coupon_code">Coupon Code</option>
                      <option value="link">Link</option>
                      <option value="qr_code">QR Code</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Coupon Code</label>
                    <input
                      type="text"
                      value={dealCouponCode}
                      onChange={(e) => setDealCouponCode(e.target.value)}
                      placeholder="CRICCALL20"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Deal URL</label>
                    <input
                      type="url"
                      value={dealUrl}
                      onChange={(e) => setDealUrl(e.target.value)}
                      placeholder="https://yourbrand.com/deal"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Starts At</label>
                      <input
                        type="datetime-local"
                        value={dealStartsAt}
                        onChange={(e) => setDealStartsAt(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Expires At</label>
                      <input
                        type="datetime-local"
                        value={dealExpiresAt}
                        onChange={(e) => setDealExpiresAt(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                      />
                    </div>
                  </div>

                  {dealError && (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {dealError}
                    </div>
                  )}
                  {dealSuccess && (
                    <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      Deal created successfully!
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreateDeal}
                    disabled={dealSubmitting || !dealTitle}
                    className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center gap-2 shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {dealSubmitting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
                    ) : (
                      <><Tag className="w-4 h-4" /> Create Deal</>
                    )}
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
