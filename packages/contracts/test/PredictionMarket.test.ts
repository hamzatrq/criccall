import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import {
  PredictionMarket,
  CALLToken,
  CricketOracle,
} from "../typechain-types";

describe("PredictionMarket", function () {
  const DAILY_AMOUNT = ethers.parseEther("100");
  const ONE_DAY = 24 * 60 * 60;

  // Market states
  const State = { Open: 0, Locked: 1, Resolved: 2, Canceled: 3 };
  // Positions
  const Position = { Yes: 0, No: 1 };
  // Oracle outcomes
  const Outcome = { Unresolved: 0, TeamA: 1, TeamB: 2, Draw: 3, NoResult: 4 };

  async function deployFixture() {
    const [owner, oracleAddr, user1, user2, user3] = await ethers.getSigners();

    // Deploy CALLToken
    const CreditFactory = await ethers.getContractFactory("CALLToken");
    const credit = await CreditFactory.deploy();
    await credit.waitForDeployment();

    // Deploy CricketOracle
    const OracleFactory = await ethers.getContractFactory("CricketOracle");
    const oracle = await OracleFactory.deploy();
    await oracle.waitForDeployment();
    await oracle.connect(owner).addOracle(oracleAddr.address);

    // Deploy PredictionMarket
    const MarketFactory = await ethers.getContractFactory("PredictionMarket");
    const market = await MarketFactory.deploy(
      await credit.getAddress(),
      await oracle.getAddress()
    );
    await market.waitForDeployment();

    // Wire up: credit contract allows market to spend/reward
    await credit.connect(owner).setPredictionMarket(await market.getAddress());

    // Wire up: oracle notifies market on resolution
    await oracle.connect(owner).setConsumer(await market.getAddress());

    // Give users credits
    await credit.connect(user1).claimDaily();
    await credit.connect(user2).claimDaily();
    await credit.connect(user3).claimDaily();

    return { market, credit, oracle, owner, oracleAddr, user1, user2, user3 };
  }

  describe("Deployment", function () {
    it("should set the correct credit and oracle addresses", async function () {
      const { market, credit, oracle } = await loadFixture(deployFixture);
      expect(await market.callToken()).to.equal(
        await credit.getAddress()
      );
      expect(await market.cricketOracle()).to.equal(
        await oracle.getAddress()
      );
    });

    it("should set deployer as owner", async function () {
      const { market, owner } = await loadFixture(deployFixture);
      expect(await market.owner()).to.equal(owner.address);
    });
  });

  describe("Market Creation", function () {
    it("should allow owner to create a market", async function () {
      const { market, owner } = await loadFixture(deployFixture);
      const lockTime = (await time.latest()) + 3600;

      await expect(
        market
          .connect(owner)
          .createMarket("MATCH-1", "Will Pakistan win?", lockTime, Outcome.TeamA)
      )
        .to.emit(market, "MarketCreated")
        .withArgs(0, "MATCH-1", "Will Pakistan win?", lockTime);
    });

    it("should reject non-owner creating market", async function () {
      const { market, user1 } = await loadFixture(deployFixture);
      const lockTime = (await time.latest()) + 3600;

      await expect(
        market
          .connect(user1)
          .createMarket("MATCH-1", "Will Pakistan win?", lockTime, Outcome.TeamA)
      ).to.be.revertedWithCustomError(market, "OwnableUnauthorizedAccount");
    });

    it("should reject lock time in the past", async function () {
      const { market, owner } = await loadFixture(deployFixture);
      const pastTime = (await time.latest()) - 100;

      await expect(
        market
          .connect(owner)
          .createMarket("MATCH-1", "Will Pakistan win?", pastTime, Outcome.TeamA)
      ).to.be.revertedWithCustomError(market, "LockTimeInPast");
    });

    it("should increment market ID", async function () {
      const { market, owner } = await loadFixture(deployFixture);
      const lockTime = (await time.latest()) + 3600;

      await market.connect(owner).createMarket("M1", "Q1?", lockTime, Outcome.TeamA);
      await market.connect(owner).createMarket("M2", "Q2?", lockTime, Outcome.TeamB);

      const m0 = await market.markets(0);
      const m1 = await market.markets(1);
      expect(m0.matchId).to.equal("M1");
      expect(m1.matchId).to.equal("M2");
    });

    it("should reject Unresolved as yesOutcome", async function () {
      const { market, owner } = await loadFixture(deployFixture);
      const lockTime = (await time.latest()) + 3600;

      await expect(
        market
          .connect(owner)
          .createMarket("MATCH-1", "Q?", lockTime, Outcome.Unresolved)
      ).to.be.revertedWithCustomError(market, "InvalidOutcome");
    });
  });

  describe("Predictions", function () {
    async function marketFixture() {
      const base = await deployFixture();
      const { market, owner } = base;
      const lockTime = (await time.latest()) + 3600; // 1 hour from now

      await market
        .connect(owner)
        .createMarket("MATCH-1", "Will Pakistan win?", lockTime, Outcome.TeamA);

      return { ...base, lockTime, marketId: 0 };
    }

    it("should allow user to predict YES", async function () {
      const { market, user1, marketId } = await loadFixture(marketFixture);
      const amount = ethers.parseEther("20");

      await expect(market.connect(user1).predict(marketId, Position.Yes, amount))
        .to.emit(market, "PredictionPlaced")
        .withArgs(marketId, user1.address, Position.Yes, amount);
    });

    it("should allow user to predict NO", async function () {
      const { market, user1, marketId } = await loadFixture(marketFixture);
      const amount = ethers.parseEther("20");

      await expect(market.connect(user1).predict(marketId, Position.No, amount))
        .to.emit(market, "PredictionPlaced")
        .withArgs(marketId, user1.address, Position.No, amount);
    });

    it("should deduct credits from user on prediction", async function () {
      const { market, credit, user1, marketId } = await loadFixture(
        marketFixture
      );
      const amount = ethers.parseEther("20");
      await market.connect(user1).predict(marketId, Position.Yes, amount);

      expect(await credit.balanceOf(user1.address)).to.equal(
        DAILY_AMOUNT - amount
      );
    });

    it("should update pool sizes after prediction", async function () {
      const { market, user1, marketId } = await loadFixture(marketFixture);
      const amount = ethers.parseEther("20");

      await market.connect(user1).predict(marketId, Position.Yes, amount);

      const m = await market.markets(marketId);
      expect(m.yesPool).to.equal(amount);
      expect(m.noPool).to.equal(0);
    });

    it("should reject prediction with zero amount", async function () {
      const { market, user1, marketId } = await loadFixture(marketFixture);

      await expect(
        market.connect(user1).predict(marketId, Position.Yes, 0)
      ).to.be.revertedWithCustomError(market, "ZeroAmount");
    });

    it("should reject prediction with insufficient credits", async function () {
      const { market, user1, marketId } = await loadFixture(marketFixture);

      await expect(
        market
          .connect(user1)
          .predict(marketId, Position.Yes, ethers.parseEther("200"))
      ).to.be.revertedWithCustomError(
        market,
        "InsufficientCredits"
      );
    });

    it("should reject prediction after lock time", async function () {
      const { market, user1, marketId, lockTime } = await loadFixture(
        marketFixture
      );

      await time.increaseTo(lockTime + 1);

      await expect(
        market
          .connect(user1)
          .predict(marketId, Position.Yes, ethers.parseEther("20"))
      ).to.be.revertedWithCustomError(market, "MarketNotOpen");
    });

    it("should allow multiple predictions from same user", async function () {
      const { market, credit, user1, marketId } = await loadFixture(
        marketFixture
      );
      const amount = ethers.parseEther("10");

      await market.connect(user1).predict(marketId, Position.Yes, amount);
      await market.connect(user1).predict(marketId, Position.Yes, amount);

      const position = await market.getUserPosition(
        marketId,
        user1.address
      );
      expect(position.yesAmount).to.equal(amount * 2n);
      expect(await credit.balanceOf(user1.address)).to.equal(
        DAILY_AMOUNT - amount * 2n
      );
    });

    it("should allow user to predict on both sides", async function () {
      const { market, user1, marketId } = await loadFixture(marketFixture);
      const amount = ethers.parseEther("10");

      await market.connect(user1).predict(marketId, Position.Yes, amount);
      await market.connect(user1).predict(marketId, Position.No, amount);

      const position = await market.getUserPosition(
        marketId,
        user1.address
      );
      expect(position.yesAmount).to.equal(amount);
      expect(position.noAmount).to.equal(amount);
    });

    it("should reject prediction on non-existent market", async function () {
      const { market, user1 } = await loadFixture(marketFixture);

      await expect(
        market
          .connect(user1)
          .predict(99, Position.Yes, ethers.parseEther("10"))
      ).to.be.revertedWithCustomError(market, "MarketNotFound");
    });
  });

  describe("Market Resolution", function () {
    async function predictedFixture() {
      const base = await deployFixture();
      const { market, oracle, owner, oracleAddr, user1, user2, user3 } = base;
      const lockTime = (await time.latest()) + 3600;

      // Create market: YES = TeamA wins
      await market
        .connect(owner)
        .createMarket("MATCH-1", "Will Pakistan win?", lockTime, Outcome.TeamA);

      const marketId = 0;

      // user1 bets 50 on YES, user2 bets 30 on NO, user3 bets 20 on YES
      await market
        .connect(user1)
        .predict(marketId, Position.Yes, ethers.parseEther("50"));
      await market
        .connect(user2)
        .predict(marketId, Position.No, ethers.parseEther("30"));
      await market
        .connect(user3)
        .predict(marketId, Position.Yes, ethers.parseEther("20"));

      // Total: YES pool = 70, NO pool = 30. Total = 100
      // If YES wins: user1 gets 50/70 * 100 = ~71.43, user3 gets 20/70 * 100 = ~28.57

      // Lock the market
      await time.increaseTo(lockTime + 1);

      const matchId = "MATCH-1";
      const secret = ethers.encodeBytes32String("secret");

      return {
        ...base,
        marketId,
        matchId,
        lockTime,
        secret,
      };
    }

    it("should resolve market when oracle reveals TeamA (YES wins)", async function () {
      const { market, oracle, oracleAddr, matchId, marketId, secret } =
        await loadFixture(predictedFixture);

      const outcome = Outcome.TeamA;
      const commitHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["string", "uint8", "bytes32"],
          [matchId, outcome, secret]
        )
      );

      await oracle.connect(oracleAddr).commitResult(matchId, commitHash);
      await oracle.connect(oracleAddr).revealResult(matchId, outcome, secret);

      const m = await market.markets(marketId);
      expect(m.state).to.equal(State.Resolved);
      expect(m.resolvedOutcome).to.equal(outcome);
    });

    it("should allow YES winners to claim proportional winnings", async function () {
      const { market, credit, oracle, oracleAddr, user1, user3, matchId, marketId, secret } =
        await loadFixture(predictedFixture);

      // Resolve as TeamA (YES wins)
      const outcome = Outcome.TeamA;
      const commitHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["string", "uint8", "bytes32"],
          [matchId, outcome, secret]
        )
      );
      await oracle.connect(oracleAddr).commitResult(matchId, commitHash);
      await oracle.connect(oracleAddr).revealResult(matchId, outcome, secret);

      const user1BalBefore = await credit.balanceOf(user1.address);
      const user3BalBefore = await credit.balanceOf(user3.address);

      await market.connect(user1).claimWinnings(marketId);
      await market.connect(user3).claimWinnings(marketId);

      const user1BalAfter = await credit.balanceOf(user1.address);
      const user3BalAfter = await credit.balanceOf(user3.address);

      const user1Winnings = user1BalAfter - user1BalBefore;
      const user3Winnings = user3BalAfter - user3BalBefore;

      // Total pool = 100. YES pool = 70
      // user1: 50/70 * 100 = 71.428...
      // user3: 20/70 * 100 = 28.571...
      const totalPool = ethers.parseEther("100");
      const expectedUser1 = (ethers.parseEther("50") * totalPool) / ethers.parseEther("70");
      const expectedUser3 = (ethers.parseEther("20") * totalPool) / ethers.parseEther("70");

      expect(user1Winnings).to.equal(expectedUser1);
      expect(user3Winnings).to.equal(expectedUser3);
    });

    it("should allow NO winners to claim when TeamB wins", async function () {
      const { market, credit, oracle, oracleAddr, user2, matchId, marketId, secret } =
        await loadFixture(predictedFixture);

      // Resolve as TeamB (NO wins)
      const outcome = Outcome.TeamB;
      const commitHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["string", "uint8", "bytes32"],
          [matchId, outcome, secret]
        )
      );
      await oracle.connect(oracleAddr).commitResult(matchId, commitHash);
      await oracle.connect(oracleAddr).revealResult(matchId, outcome, secret);

      const balBefore = await credit.balanceOf(user2.address);
      await market.connect(user2).claimWinnings(marketId);
      const balAfter = await credit.balanceOf(user2.address);

      // user2 is the only NO bettor: 30/30 * 100 = 100
      const totalPool = ethers.parseEther("100");
      expect(balAfter - balBefore).to.equal(totalPool);
    });

    it("should reject claim from loser", async function () {
      const { market, oracle, oracleAddr, user2, matchId, marketId, secret } =
        await loadFixture(predictedFixture);

      // Resolve as TeamA (YES wins — user2 bet NO)
      const outcome = Outcome.TeamA;
      const commitHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["string", "uint8", "bytes32"],
          [matchId, outcome, secret]
        )
      );
      await oracle.connect(oracleAddr).commitResult(matchId, commitHash);
      await oracle.connect(oracleAddr).revealResult(matchId, outcome, secret);

      await expect(
        market.connect(user2).claimWinnings(marketId)
      ).to.be.revertedWithCustomError(market, "NothingToClaim");
    });

    it("should reject double claim", async function () {
      const { market, oracle, oracleAddr, user1, matchId, marketId, secret } =
        await loadFixture(predictedFixture);

      const outcome = Outcome.TeamA;
      const commitHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["string", "uint8", "bytes32"],
          [matchId, outcome, secret]
        )
      );
      await oracle.connect(oracleAddr).commitResult(matchId, commitHash);
      await oracle.connect(oracleAddr).revealResult(matchId, outcome, secret);

      await market.connect(user1).claimWinnings(marketId);

      await expect(
        market.connect(user1).claimWinnings(marketId)
      ).to.be.revertedWithCustomError(market, "AlreadyClaimed");
    });

    it("should reject claim on unresolved market", async function () {
      const { market, user1, marketId } = await loadFixture(predictedFixture);

      await expect(
        market.connect(user1).claimWinnings(marketId)
      ).to.be.revertedWithCustomError(market, "MarketNotResolved");
    });

    it("should reject claim from non-participant", async function () {
      const { market, oracle, oracleAddr, owner, matchId, marketId, secret } =
        await loadFixture(predictedFixture);

      const outcome = Outcome.TeamA;
      const commitHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["string", "uint8", "bytes32"],
          [matchId, outcome, secret]
        )
      );
      await oracle.connect(oracleAddr).commitResult(matchId, commitHash);
      await oracle.connect(oracleAddr).revealResult(matchId, outcome, secret);

      await expect(
        market.connect(owner).claimWinnings(marketId)
      ).to.be.revertedWithCustomError(market, "NothingToClaim");
    });
  });

  describe("Market Cancellation", function () {
    it("should refund all users when market is canceled (NoResult)", async function () {
      const { market, credit, oracle, oracleAddr, owner, user1, user2 } =
        await loadFixture(deployFixture);

      const lockTime = (await time.latest()) + 3600;
      await market
        .connect(owner)
        .createMarket("MATCH-C", "Will Pakistan win?", lockTime, Outcome.TeamA);

      await market
        .connect(user1)
        .predict(0, Position.Yes, ethers.parseEther("40"));
      await market
        .connect(user2)
        .predict(0, Position.No, ethers.parseEther("30"));

      await time.increaseTo(lockTime + 1);

      // Oracle resolves as NoResult
      const secret = ethers.encodeBytes32String("sec");
      const commitHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["string", "uint8", "bytes32"],
          ["MATCH-C", Outcome.NoResult, secret]
        )
      );
      await oracle.connect(oracleAddr).commitResult("MATCH-C", commitHash);
      await oracle
        .connect(oracleAddr)
        .revealResult("MATCH-C", Outcome.NoResult, secret);

      const m = await market.markets(0);
      expect(m.state).to.equal(State.Canceled);

      // Both users claim refunds
      const u1Before = await credit.balanceOf(user1.address);
      const u2Before = await credit.balanceOf(user2.address);

      await market.connect(user1).claimRefund(0);
      await market.connect(user2).claimRefund(0);

      expect((await credit.balanceOf(user1.address)) - u1Before).to.equal(
        ethers.parseEther("40")
      );
      expect((await credit.balanceOf(user2.address)) - u2Before).to.equal(
        ethers.parseEther("30")
      );
    });

    it("should reject refund on non-canceled market", async function () {
      const { market, owner, user1 } = await loadFixture(deployFixture);

      const lockTime = (await time.latest()) + 3600;
      await market
        .connect(owner)
        .createMarket("MATCH-R", "Q?", lockTime, Outcome.TeamA);

      await market
        .connect(user1)
        .predict(0, Position.Yes, ethers.parseEther("10"));

      await expect(
        market.connect(user1).claimRefund(0)
      ).to.be.revertedWithCustomError(market, "MarketNotCanceled");
    });
  });

  describe("View Functions", function () {
    it("should return correct market count", async function () {
      const { market, owner } = await loadFixture(deployFixture);
      const lockTime = (await time.latest()) + 3600;

      expect(await market.marketCount()).to.equal(0);
      await market.connect(owner).createMarket("M1", "Q1?", lockTime, Outcome.TeamA);
      expect(await market.marketCount()).to.equal(1);
      await market.connect(owner).createMarket("M2", "Q2?", lockTime, Outcome.TeamB);
      expect(await market.marketCount()).to.equal(2);
    });

    it("should return correct user position", async function () {
      const { market, owner, user1 } = await loadFixture(deployFixture);
      const lockTime = (await time.latest()) + 3600;

      await market.connect(owner).createMarket("M1", "Q1?", lockTime, Outcome.TeamA);
      await market
        .connect(user1)
        .predict(0, Position.Yes, ethers.parseEther("25"));
      await market
        .connect(user1)
        .predict(0, Position.No, ethers.parseEther("10"));

      const pos = await market.getUserPosition(0, user1.address);
      expect(pos.yesAmount).to.equal(ethers.parseEther("25"));
      expect(pos.noAmount).to.equal(ethers.parseEther("10"));
    });
  });

  describe("Edge Cases", function () {
    it("should handle market with only YES bets — winners get back what they put in", async function () {
      const { market, credit, oracle, oracleAddr, owner, user1, user2 } =
        await loadFixture(deployFixture);

      const lockTime = (await time.latest()) + 3600;
      await market
        .connect(owner)
        .createMarket("MATCH-Y", "Q?", lockTime, Outcome.TeamA);

      await market
        .connect(user1)
        .predict(0, Position.Yes, ethers.parseEther("50"));
      await market
        .connect(user2)
        .predict(0, Position.Yes, ethers.parseEther("30"));

      await time.increaseTo(lockTime + 1);

      const secret = ethers.encodeBytes32String("s");
      const commitHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["string", "uint8", "bytes32"],
          ["MATCH-Y", Outcome.TeamA, secret]
        )
      );
      await oracle.connect(oracleAddr).commitResult("MATCH-Y", commitHash);
      await oracle
        .connect(oracleAddr)
        .revealResult("MATCH-Y", Outcome.TeamA, secret);

      const u1Before = await credit.balanceOf(user1.address);
      await market.connect(user1).claimWinnings(0);
      const u1After = await credit.balanceOf(user1.address);

      // Only YES bets, YES wins. Pool = 80, user1 = 50/80 * 80 = 50 (gets back own stake)
      expect(u1After - u1Before).to.equal(ethers.parseEther("50"));
    });

    it("should handle Draw outcome as NO wins", async function () {
      const { market, credit, oracle, oracleAddr, owner, user1, user2 } =
        await loadFixture(deployFixture);

      const lockTime = (await time.latest()) + 3600;
      // YES = TeamA, anything else = NO wins
      await market
        .connect(owner)
        .createMarket("MATCH-D", "Will TeamA win?", lockTime, Outcome.TeamA);

      await market
        .connect(user1)
        .predict(0, Position.Yes, ethers.parseEther("40"));
      await market
        .connect(user2)
        .predict(0, Position.No, ethers.parseEther("40"));

      await time.increaseTo(lockTime + 1);

      const secret = ethers.encodeBytes32String("ds");
      const commitHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["string", "uint8", "bytes32"],
          ["MATCH-D", Outcome.Draw, secret]
        )
      );
      await oracle.connect(oracleAddr).commitResult("MATCH-D", commitHash);
      await oracle
        .connect(oracleAddr)
        .revealResult("MATCH-D", Outcome.Draw, secret);

      // Draw != TeamA, so NO wins. user2 takes full pool of 80
      const u2Before = await credit.balanceOf(user2.address);
      await market.connect(user2).claimWinnings(0);
      expect((await credit.balanceOf(user2.address)) - u2Before).to.equal(
        ethers.parseEther("80")
      );
    });
  });
});
