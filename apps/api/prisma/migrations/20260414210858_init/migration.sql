-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "display_name" TEXT,
    "avatar_url" TEXT,
    "favorite_team" TEXT,
    "cached_call_balance" TEXT NOT NULL DEFAULT '0',
    "tier" TEXT NOT NULL DEFAULT 'new_fan',
    "last_claimed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nonces" (
    "id" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nonces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "short_name" TEXT NOT NULL,
    "logo_url" TEXT,
    "type" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "team_a_id" TEXT NOT NULL,
    "team_b_id" TEXT NOT NULL,
    "match_type" TEXT NOT NULL,
    "tournament" TEXT NOT NULL,
    "venue" TEXT,
    "start_time" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "api_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "markets" (
    "id" TEXT NOT NULL,
    "on_chain_id" INTEGER NOT NULL,
    "match_id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "lock_time" TIMESTAMP(3) NOT NULL,
    "yes_outcome" INTEGER NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'open',
    "resolved_outcome" INTEGER,
    "yes_pool" TEXT NOT NULL DEFAULT '0',
    "no_pool" TEXT NOT NULL DEFAULT '0',
    "total_predictors" INTEGER NOT NULL DEFAULT 0,
    "yes_won" BOOLEAN,
    "total_prize" TEXT NOT NULL DEFAULT '0',
    "created_tx_hash" TEXT,
    "resolved_tx_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "markets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "predictions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "market_id" INTEGER NOT NULL,
    "position" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "tx_hash" TEXT,
    "result" TEXT,
    "winnings" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_campaigns" (
    "id" TEXT NOT NULL,
    "market_id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "sponsor_id" TEXT NOT NULL,
    "sponsor_name" TEXT NOT NULL,
    "sponsor_logo" TEXT,
    "sponsor_banner" TEXT,
    "sponsor_url" TEXT,
    "prize_amount" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "merkle_root" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "market_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward_distributions" (
    "id" TEXT NOT NULL,
    "market_id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "merkle_root" TEXT NOT NULL,
    "total_allocated" TEXT NOT NULL,
    "winner_count" INTEGER NOT NULL,
    "tree_data" JSONB NOT NULL,
    "post_tx_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reward_distributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward_winners" (
    "id" TEXT NOT NULL,
    "distribution_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "pkr_amount" TEXT NOT NULL,
    "call_amount" TEXT NOT NULL,
    "claimed" BOOLEAN NOT NULL DEFAULT false,
    "claim_tx_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reward_winners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward_claims" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "tx_hash" TEXT,
    "claimed_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reward_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brand_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "brand_name" TEXT NOT NULL,
    "brand_logo" TEXT,
    "brand_banner" TEXT,
    "brand_url" TEXT,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brand_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deals" (
    "id" TEXT NOT NULL,
    "brand_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "min_call" INTEGER NOT NULL,
    "deal_type" TEXT NOT NULL DEFAULT 'coupon_code',
    "coupon_code" TEXT,
    "deal_url" TEXT,
    "max_redemptions" INTEGER,
    "total_redeemed" INTEGER NOT NULL DEFAULT 0,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deal_redemptions" (
    "id" TEXT NOT NULL,
    "deal_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "redeemed_at" TIMESTAMP(3) NOT NULL,
    "call_balance" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deal_redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oracle_resolutions" (
    "id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "outcome" INTEGER NOT NULL,
    "secret" TEXT,
    "commit_tx_hash" TEXT,
    "reveal_tx_hash" TEXT,
    "source" TEXT NOT NULL,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oracle_resolutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_wallet_address_key" ON "users"("wallet_address");

-- CreateIndex
CREATE UNIQUE INDEX "nonces_nonce_key" ON "nonces"("nonce");

-- CreateIndex
CREATE UNIQUE INDEX "teams_name_key" ON "teams"("name");

-- CreateIndex
CREATE UNIQUE INDEX "matches_match_id_key" ON "matches"("match_id");

-- CreateIndex
CREATE UNIQUE INDEX "markets_on_chain_id_key" ON "markets"("on_chain_id");

-- CreateIndex
CREATE UNIQUE INDEX "market_campaigns_campaign_id_key" ON "market_campaigns"("campaign_id");

-- CreateIndex
CREATE UNIQUE INDEX "brand_profiles_user_id_key" ON "brand_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "deal_redemptions_deal_id_user_id_key" ON "deal_redemptions"("deal_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "oracle_resolutions_match_id_key" ON "oracle_resolutions"("match_id");

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_team_a_id_fkey" FOREIGN KEY ("team_a_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_team_b_id_fkey" FOREIGN KEY ("team_b_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "markets" ADD CONSTRAINT "markets_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("match_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_market_id_fkey" FOREIGN KEY ("market_id") REFERENCES "markets"("on_chain_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_campaigns" ADD CONSTRAINT "market_campaigns_market_id_fkey" FOREIGN KEY ("market_id") REFERENCES "markets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_campaigns" ADD CONSTRAINT "market_campaigns_sponsor_id_fkey" FOREIGN KEY ("sponsor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_distributions" ADD CONSTRAINT "reward_distributions_market_id_fkey" FOREIGN KEY ("market_id") REFERENCES "markets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_distributions" ADD CONSTRAINT "reward_distributions_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "market_campaigns"("campaign_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_winners" ADD CONSTRAINT "reward_winners_distribution_id_fkey" FOREIGN KEY ("distribution_id") REFERENCES "reward_distributions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_winners" ADD CONSTRAINT "reward_winners_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_claims" ADD CONSTRAINT "reward_claims_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brand_profiles" ADD CONSTRAINT "brand_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brand_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deal_redemptions" ADD CONSTRAINT "deal_redemptions_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "deals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deal_redemptions" ADD CONSTRAINT "deal_redemptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
