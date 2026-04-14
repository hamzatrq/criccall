import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

/**
 * End-to-end integration tests for the full CricCall contract system.
 *
 * Flow: claim CALL → create market → predict → oracle resolves →
 *       claim CALL winnings → sponsor deposits PKR → winners claim PKR via Merkle
 */
describe("Integration: Full CricCall Flow", function () {
  const Outcome = { Unresolved: 0, TeamA: 1, TeamB: 2, Draw: 3, NoResult: 4 };
  const Position = { Yes: 0, No: 1 };
  const State = { Open: 0, Locked: 1, Resolved: 2, Canceled: 3 };

  async function fullSystemFixture() {
    const [owner, oracleAddr, sponsor, user1, user2, user3] =
      await ethers.getSigners();

    // 1. Deploy CALLToken
    const call = await (
      await ethers.getContractFactory("CALLToken")
    ).deploy();

    // 2. Deploy CricketOracle
    const oracle = await (
      await ethers.getContractFactory("CricketOracle")
    ).deploy();
    await oracle.addOracle(oracleAddr.address);

    // 3. Deploy PredictionMarket
    const market = await (
      await ethers.getContractFactory("PredictionMarket")
    ).deploy(await call.getAddress(), await oracle.getAddress());

    // 4. Deploy PKRToken
    const pkr = await (
      await ethers.getContractFactory("PKRToken")
    ).deploy();

    // 5. Deploy SponsorVault
    const vault = await (
      await ethers.getContractFactory("SponsorVault")
    ).deploy();

    // --- Wire everything up ---
    await call.setPredictionMarket(await market.getAddress());
    await oracle.setConsumer(await market.getAddress());
    await vault.addSponsor(sponsor.address);

    // Fund sponsor with PKR
    await pkr.mint(sponsor.address, ethers.parseEther("100000"));

    // Users claim daily CALL
    await call.connect(user1).claimDaily();
    await call.connect(user2).claimDaily();
    await call.connect(user3).claimDaily();

    return {
      call,
      oracle,
      market,
      pkr,
      vault,
      owner,
      oracleAddr,
      sponsor,
      user1,
      user2,
      user3,
    };
  }

  describe("Complete Match Lifecycle", function () {
    it("should handle a full match from market creation to PKR prize distribution", async function () {
      const {
        call,
        oracle,
        market,
        pkr,
        vault,
        owner,
        oracleAddr,
        sponsor,
        user1,
        user2,
        user3,
      } = await loadFixture(fullSystemFixture);

      // --- Step 1: Create prediction market ---
      const lockTime = (await time.latest()) + 3600;
      await market.createMarket(
        "PAK-IND-2026",
        "Will Pakistan win?",
        lockTime,
        Outcome.TeamA
      );

      // --- Step 2: Users place predictions ---
      await market
        .connect(user1)
        .predict(0, Position.Yes, ethers.parseEther("50"));
      await market
        .connect(user2)
        .predict(0, Position.No, ethers.parseEther("30"));
      await market
        .connect(user3)
        .predict(0, Position.Yes, ethers.parseEther("20"));

      // Verify CALL was spent
      expect(await call.balanceOf(user1.address)).to.equal(ethers.parseEther("50"));
      expect(await call.balanceOf(user2.address)).to.equal(ethers.parseEther("70"));
      expect(await call.balanceOf(user3.address)).to.equal(ethers.parseEther("80"));

      // --- Step 3: Lock market ---
      await time.increaseTo(lockTime + 1);

      // --- Step 4: Oracle resolves — Pakistan wins ---
      const matchId = "PAK-IND-2026";
      const secret = ethers.encodeBytes32String("oracle-secret");
      const commitHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["string", "uint8", "bytes32"],
          [matchId, Outcome.TeamA, secret]
        )
      );
      await oracle.connect(oracleAddr).commitResult(matchId, commitHash);
      await oracle.connect(oracleAddr).revealResult(matchId, Outcome.TeamA, secret);

      // --- Step 5: Winners claim CALL winnings ---
      const u1Before = await call.balanceOf(user1.address);
      const u3Before = await call.balanceOf(user3.address);

      await market.connect(user1).claimWinnings(0);
      await market.connect(user3).claimWinnings(0);

      const u1Winnings = (await call.balanceOf(user1.address)) - u1Before;
      const u3Winnings = (await call.balanceOf(user3.address)) - u3Before;

      // Total pool: 100 CALL. YES pool: 70. user1: 50/70*100, user3: 20/70*100
      const totalPool = ethers.parseEther("100");
      const yesPool = ethers.parseEther("70");
      expect(u1Winnings).to.equal(
        (ethers.parseEther("50") * totalPool) / yesPool
      );
      expect(u3Winnings).to.equal(
        (ethers.parseEther("20") * totalPool) / yesPool
      );

      // User1 now has more CALL = higher reputation than user2
      expect(await call.balanceOf(user1.address)).to.be.greaterThan(
        await call.balanceOf(user2.address)
      );

      // user2 (loser) gets nothing
      await expect(
        market.connect(user2).claimWinnings(0)
      ).to.be.revertedWithCustomError(market, "NothingToClaim");

      // --- Step 6: Sponsor creates PKR prize campaign ---
      const campaignAmount = ethers.parseEther("5000");
      const expiry = (await time.latest()) + 30 * 24 * 3600;

      await pkr.connect(sponsor).approve(await vault.getAddress(), campaignAmount);
      await vault
        .connect(sponsor)
        .createCampaign(
          "PAK-IND-FOODPANDA",
          await pkr.getAddress(),
          campaignAmount,
          expiry
        );

      // --- Step 7: Post Merkle root of PKR winners ---
      const w1Amount = ethers.parseEther("3000");
      const w3Amount = ethers.parseEther("2000");

      const values: [string, string][] = [
        [user1.address, w1Amount.toString()],
        [user3.address, w3Amount.toString()],
      ];
      const tree = StandardMerkleTree.of(values, ["address", "uint256"]);

      await vault.postWinnerRoot("PAK-IND-FOODPANDA", tree.root, campaignAmount);

      // --- Step 8: Winners claim PKR prizes ---
      const proof1 = tree.getProof(0);
      const proof3 = tree.getProof(1);

      const u1PkrBefore = await pkr.balanceOf(user1.address);
      const u3PkrBefore = await pkr.balanceOf(user3.address);

      await vault.connect(user1).claim("PAK-IND-FOODPANDA", w1Amount, proof1);
      await vault.connect(user3).claim("PAK-IND-FOODPANDA", w3Amount, proof3);

      expect((await pkr.balanceOf(user1.address)) - u1PkrBefore).to.equal(w1Amount);
      expect((await pkr.balanceOf(user3.address)) - u3PkrBefore).to.equal(w3Amount);
    });
  });

  describe("Market Cancellation Flow", function () {
    it("should refund CALL and allow sponsor PKR clawback on NoResult", async function () {
      const { call, oracle, market, pkr, vault, owner, oracleAddr, sponsor, user1, user2 } =
        await loadFixture(fullSystemFixture);

      const lockTime = (await time.latest()) + 3600;
      await market.createMarket("RAIN-MATCH", "Will TeamA win?", lockTime, Outcome.TeamA);

      await market.connect(user1).predict(0, Position.Yes, ethers.parseEther("40"));
      await market.connect(user2).predict(0, Position.No, ethers.parseEther("60"));

      await time.increaseTo(lockTime + 1);

      // Match rained out
      const secret = ethers.encodeBytes32String("rain");
      const commitHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["string", "uint8", "bytes32"],
          ["RAIN-MATCH", Outcome.NoResult, secret]
        )
      );
      await oracle.connect(oracleAddr).commitResult("RAIN-MATCH", commitHash);
      await oracle.connect(oracleAddr).revealResult("RAIN-MATCH", Outcome.NoResult, secret);

      expect((await market.markets(0)).state).to.equal(State.Canceled);

      // Users get CALL refunds
      const u1Before = await call.balanceOf(user1.address);
      const u2Before = await call.balanceOf(user2.address);

      await market.connect(user1).claimRefund(0);
      await market.connect(user2).claimRefund(0);

      expect((await call.balanceOf(user1.address)) - u1Before).to.equal(ethers.parseEther("40"));
      expect((await call.balanceOf(user2.address)) - u2Before).to.equal(ethers.parseEther("60"));

      // Sponsor PKR campaign clawback
      const amount = ethers.parseEther("10000");
      const expiry = (await time.latest()) + 100;

      await pkr.connect(sponsor).approve(await vault.getAddress(), amount);
      await vault.connect(sponsor).createCampaign("RAIN-CAMPAIGN", await pkr.getAddress(), amount, expiry);

      await time.increaseTo(expiry + 1);

      const sponsorBefore = await pkr.balanceOf(sponsor.address);
      await vault.connect(sponsor).clawback("RAIN-CAMPAIGN");
      expect((await pkr.balanceOf(sponsor.address)) - sponsorBefore).to.equal(amount);
    });
  });

  describe("CALL Balance as Reputation", function () {
    it("should show winners accumulating more CALL than losers over multiple markets", async function () {
      const { call, oracle, market, owner, oracleAddr, user1, user2 } =
        await loadFixture(fullSystemFixture);

      // Market 1: user1 wins
      let lockTime = (await time.latest()) + 3600;
      await market.createMarket("M1", "Q1?", lockTime, Outcome.TeamA);
      await market.connect(user1).predict(0, Position.Yes, ethers.parseEther("50"));
      await market.connect(user2).predict(0, Position.No, ethers.parseEther("50"));
      await time.increaseTo(lockTime + 1);

      let secret = ethers.encodeBytes32String("s1");
      let hash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(["string", "uint8", "bytes32"], ["M1", Outcome.TeamA, secret])
      );
      await oracle.connect(oracleAddr).commitResult("M1", hash);
      await oracle.connect(oracleAddr).revealResult("M1", Outcome.TeamA, secret);
      await market.connect(user1).claimWinnings(0);

      // Market 2: user1 wins again
      lockTime = (await time.latest()) + 3600;
      await market.createMarket("M2", "Q2?", lockTime, Outcome.TeamA);
      await market.connect(user1).predict(1, Position.Yes, ethers.parseEther("50"));
      await market.connect(user2).predict(1, Position.No, ethers.parseEther("50"));
      await time.increaseTo(lockTime + 1);

      secret = ethers.encodeBytes32String("s2");
      hash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(["string", "uint8", "bytes32"], ["M2", Outcome.TeamA, secret])
      );
      await oracle.connect(oracleAddr).commitResult("M2", hash);
      await oracle.connect(oracleAddr).revealResult("M2", Outcome.TeamA, secret);
      await market.connect(user1).claimWinnings(1);

      // user1 should have significantly more CALL than user2
      const u1Balance = await call.balanceOf(user1.address);
      const u2Balance = await call.balanceOf(user2.address);

      // user1: started 100, won 100 from market 1, won 100 from market 2 = 200 CALL
      // user2: started 100, lost 50 in market 1, lost 50 in market 2 = 0 CALL
      expect(u1Balance).to.be.greaterThan(u2Balance);
      expect(u2Balance).to.equal(0); // lost everything
    });
  });

  describe("Two-Token Separation", function () {
    it("should never allow CALL to convert to PKR or vice versa", async function () {
      const { call, pkr, vault, sponsor, user1 } = await loadFixture(fullSystemFixture);

      // CALL cannot be transferred
      await expect(
        call.connect(user1).transfer(sponsor.address, ethers.parseEther("1"))
      ).to.be.revertedWithCustomError(call, "TransferDisabled");

      // CALL cannot be approved
      await expect(
        call.connect(user1).approve(await vault.getAddress(), ethers.parseEther("1"))
      ).to.be.revertedWithCustomError(call, "ApprovalDisabled");

      // User cannot deposit into SponsorVault (not whitelisted)
      await expect(
        vault.connect(user1).createCampaign(
          "HACK",
          await pkr.getAddress(),
          ethers.parseEther("100"),
          (await time.latest()) + 3600
        )
      ).to.be.revertedWithCustomError(vault, "NotWhitelistedSponsor");

      // CALL has no payable function — cannot buy with WIRE
      await expect(
        user1.sendTransaction({
          to: await call.getAddress(),
          value: ethers.parseEther("1"),
        })
      ).to.be.reverted;
    });
  });
});
