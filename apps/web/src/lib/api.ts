const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem("criccall_token", token);
    } else {
      localStorage.removeItem("criccall_token");
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("criccall_token");
    }
    return this.token;
  }

  private async fetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(error.message || `API Error: ${res.status}`);
    }

    return res.json();
  }

  // Auth
  async getNonce() {
    return this.fetch<{ nonce: string }>("/auth/nonce");
  }

  async verify(message: string, signature: string) {
    return this.fetch<{
      accessToken: string;
      user: { id: string; walletAddress: string; role: string };
    }>("/auth/verify", {
      method: "POST",
      body: JSON.stringify({ message, signature }),
    });
  }

  async getMe() {
    return this.fetch<any>("/auth/me");
  }

  // Users
  async getProfile() {
    return this.fetch<any>("/users/me");
  }

  async updateProfile(data: { displayName?: string; favoriteTeam?: string }) {
    return this.fetch<any>("/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async syncBalance() {
    return this.fetch<any>("/users/me/sync-balance", { method: "POST" });
  }

  async getMyPredictions(page = 1, limit = 20) {
    return this.fetch<any>(`/users/me/predictions?page=${page}&limit=${limit}`);
  }

  async getMyStats() {
    return this.fetch<any>("/users/me/stats");
  }

  async getMyRewards() {
    return this.fetch<any>("/users/me/rewards");
  }

  async getLeaderboard(page = 1, limit = 20) {
    return this.fetch<any>(`/users/leaderboard?page=${page}&limit=${limit}`);
  }

  async getPublicProfile(address: string) {
    return this.fetch<any>(`/users/${address}`);
  }

  // Markets
  async getMarkets(params?: {
    status?: string;
    tournament?: string;
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.tournament) query.set("tournament", params.tournament);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    return this.fetch<any>(`/markets?${query}`);
  }

  async getMarket(id: string) {
    return this.fetch<any>(`/markets/${id}`);
  }

  async getLiveMarkets() {
    return this.fetch<any>("/markets/live");
  }

  async getResolvedMarkets() {
    return this.fetch<any>("/markets/resolved");
  }

  async getMarketSponsors(id: string) {
    return this.fetch<any>(`/markets/${id}/sponsors`);
  }

  async getMyPositions(id: string) {
    return this.fetch<any>(`/markets/${id}/positions`);
  }

  // Predictions
  async getMarketSummary(marketId: number) {
    return this.fetch<any>(`/predictions/market/${marketId}/summary`);
  }

  // Rewards
  async getMyRewardsAll() {
    return this.fetch<any>("/rewards/me");
  }

  async getUnclaimedRewards() {
    return this.fetch<any>("/rewards/me/unclaimed");
  }

  async getMerkleProof(campaignId: string) {
    return this.fetch<any>(`/rewards/${campaignId}/proof`);
  }

  // Deals
  async getDeals(params?: { category?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.category) query.set("category", params.category);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    return this.fetch<any>(`/deals?${query}`);
  }

  async getDeal(id: string) {
    return this.fetch<any>(`/deals/${id}`);
  }

  async redeemDeal(id: string) {
    return this.fetch<any>(`/deals/${id}/redeem`, { method: "POST" });
  }

  // Notifications
  async getNotifications(page = 1, limit = 20) {
    return this.fetch<any>(`/notifications?page=${page}&limit=${limit}`);
  }

  async getUnreadCount() {
    return this.fetch<{ count: number }>("/notifications/unread-count");
  }

  async markAsRead(id: string) {
    return this.fetch<any>(`/notifications/${id}/read`, { method: "PATCH" });
  }

  async markAllAsRead() {
    return this.fetch<any>("/notifications/read-all", { method: "PATCH" });
  }

  // Admin
  async setUserRole(walletAddress: string, role: string) {
    return this.fetch<any>(`/admin/users/${walletAddress}/role`, {
      method: "POST",
      body: JSON.stringify({ role }),
    });
  }

  async createMarket(data: any) {
    return this.fetch<any>("/admin/markets", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async resolveMatch(matchId: string, outcome: number) {
    return this.fetch<any>("/admin/oracle/resolve", {
      method: "POST",
      body: JSON.stringify({ matchId, outcome }),
    });
  }

  // Sponsor
  async getMyCampaigns() {
    return this.fetch<any>("/sponsor/campaigns");
  }

  async getCampaignStats(id: string) {
    return this.fetch<any>(`/sponsor/campaigns/${id}/stats`);
  }

  async getBrandProfile() {
    return this.fetch<any>("/sponsor/profile");
  }

  async createBrandProfile(data: any) {
    return this.fetch<any>("/sponsor/profile", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateBrandProfile(data: any) {
    return this.fetch<any>("/sponsor/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async sponsorMarket(marketId: string, data: { amount: number; bannerUrl?: string }) {
    return this.fetch<any>(`/sponsor/campaigns`, {
      method: "POST",
      body: JSON.stringify({ marketId, ...data }),
    });
  }

  async createDeal(data: {
    title: string;
    description?: string;
    minCall: number;
    dealType: string;
    couponCode?: string;
    dealUrl?: string;
    maxRedemptions?: number;
    startsAt: string;
    expiresAt: string;
  }) {
    return this.fetch<any>("/deals", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async recordPrediction(marketId: number, position: string, amount: string, txHash: string) {
    return this.fetch<any>("/predictions/record", {
      method: "POST",
      body: JSON.stringify({ marketId, position, amount, txHash }),
    });
  }
}

export const api = new ApiClient();
