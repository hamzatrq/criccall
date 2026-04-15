"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Markets
export function useMarkets(params?: { status?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["markets", params],
    queryFn: () => api.getMarkets(params),
  });
}

export function useLiveMarkets() {
  return useQuery({
    queryKey: ["markets", "live"],
    queryFn: () => api.getLiveMarkets(),
    refetchInterval: 10000, // refresh every 10s for live data
  });
}

export function useMarket(id: string) {
  return useQuery({
    queryKey: ["market", id],
    queryFn: () => api.getMarket(id),
    enabled: !!id,
  });
}

export function useMarketSponsors(id: string) {
  return useQuery({
    queryKey: ["market", id, "sponsors"],
    queryFn: () => api.getMarketSponsors(id),
    enabled: !!id,
  });
}

export function useMyPositions(id: string) {
  return useQuery({
    queryKey: ["market", id, "positions"],
    queryFn: () => api.getMyPositions(id),
    enabled: !!id && !!api.getToken(),
  });
}

// Leaderboard
export function useLeaderboard(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["leaderboard", page, limit],
    queryFn: () => api.getLeaderboard(page, limit),
  });
}

// User
export function useMyStats() {
  return useQuery({
    queryKey: ["me", "stats"],
    queryFn: () => api.getMyStats(),
    enabled: !!api.getToken(),
  });
}

export function useMyPredictions(page = 1) {
  return useQuery({
    queryKey: ["me", "predictions", page],
    queryFn: () => api.getMyPredictions(page),
    enabled: !!api.getToken(),
  });
}

// Rewards
export function useMyRewards() {
  return useQuery({
    queryKey: ["me", "rewards"],
    queryFn: () => api.getMyRewardsAll(),
    enabled: !!api.getToken(),
  });
}

export function useUnclaimedRewards() {
  return useQuery({
    queryKey: ["me", "rewards", "unclaimed"],
    queryFn: () => api.getUnclaimedRewards(),
    enabled: !!api.getToken(),
  });
}

// Deals
export function useDeals(params?: { category?: string; page?: number }) {
  return useQuery({
    queryKey: ["deals", params],
    queryFn: () => api.getDeals(params),
  });
}

// Notifications
export function useNotifications(page = 1) {
  return useQuery({
    queryKey: ["notifications", page],
    queryFn: () => api.getNotifications(page),
    enabled: !!api.getToken(),
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: () => api.getUnreadCount(),
    enabled: !!api.getToken(),
    refetchInterval: 30000, // check every 30s
  });
}

// Sponsor
export function useMyCampaigns() {
  return useQuery({
    queryKey: ["sponsor", "campaigns"],
    queryFn: () => api.getMyCampaigns(),
    enabled: !!api.getToken(),
  });
}

export function useBrandProfile() {
  return useQuery({
    queryKey: ["sponsor", "profile"],
    queryFn: () => api.getBrandProfile(),
    enabled: !!api.getToken(),
  });
}
