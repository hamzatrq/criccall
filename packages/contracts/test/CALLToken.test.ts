import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";

describe("CALLToken", function () {
  const DAILY_AMOUNT = ethers.parseEther("100");
  const ONE_DAY = 24 * 60 * 60;

  async function deployFixture() {
    const [owner, user1, user2, market] = await ethers.getSigners();

    const CALLToken = await ethers.getContractFactory("CALLToken");
    const call = await CALLToken.deploy();
    await call.waitForDeployment();

    return { call, owner, user1, user2, market };
  }

  describe("Deployment", function () {
    it("should set the correct name and symbol", async function () {
      const { call } = await loadFixture(deployFixture);
      expect(await call.name()).to.equal("CricCall");
      expect(await call.symbol()).to.equal("CALL");
    });

    it("should set deployer as owner", async function () {
      const { call, owner } = await loadFixture(deployFixture);
      expect(await call.owner()).to.equal(owner.address);
    });

    it("should start with zero total supply", async function () {
      const { call } = await loadFixture(deployFixture);
      expect(await call.totalSupply()).to.equal(0);
    });

    it("should have 18 decimals", async function () {
      const { call } = await loadFixture(deployFixture);
      expect(await call.decimals()).to.equal(18);
    });
  });

  describe("Daily Claim", function () {
    it("should allow a user to claim 100 CALL", async function () {
      const { call, user1 } = await loadFixture(deployFixture);
      await call.connect(user1).claimDaily();
      expect(await call.balanceOf(user1.address)).to.equal(DAILY_AMOUNT);
    });

    it("should emit CreditsClaimed event on claim", async function () {
      const { call, user1 } = await loadFixture(deployFixture);
      await expect(call.connect(user1).claimDaily())
        .to.emit(call, "CreditsClaimed")
        .withArgs(user1.address, DAILY_AMOUNT);
    });

    it("should reject second claim within 24 hours", async function () {
      const { call, user1 } = await loadFixture(deployFixture);
      await call.connect(user1).claimDaily();
      await expect(
        call.connect(user1).claimDaily()
      ).to.be.revertedWithCustomError(call, "AlreadyClaimedToday");
    });

    it("should allow claim after 24 hours have passed", async function () {
      const { call, user1 } = await loadFixture(deployFixture);
      await call.connect(user1).claimDaily();
      await time.increase(ONE_DAY);
      await call.connect(user1).claimDaily();
      expect(await call.balanceOf(user1.address)).to.equal(DAILY_AMOUNT * 2n);
    });

    it("should track lastClaimed timestamp correctly", async function () {
      const { call, user1 } = await loadFixture(deployFixture);
      await call.connect(user1).claimDaily();
      const lastClaimed = await call.lastClaimed(user1.address);
      expect(lastClaimed).to.be.greaterThan(0);
    });

    it("should allow multiple users to claim independently", async function () {
      const { call, user1, user2 } = await loadFixture(deployFixture);
      await call.connect(user1).claimDaily();
      await call.connect(user2).claimDaily();
      expect(await call.balanceOf(user1.address)).to.equal(DAILY_AMOUNT);
      expect(await call.balanceOf(user2.address)).to.equal(DAILY_AMOUNT);
    });

    it("should allow claim just after 24 hours boundary", async function () {
      const { call, user1 } = await loadFixture(deployFixture);
      await call.connect(user1).claimDaily();
      await time.increase(ONE_DAY - 60);
      await expect(
        call.connect(user1).claimDaily()
      ).to.be.revertedWithCustomError(call, "AlreadyClaimedToday");
      await time.increase(60);
      await call.connect(user1).claimDaily();
    });
  });

  describe("Non-Transferable", function () {
    it("should revert on transfer", async function () {
      const { call, user1, user2 } = await loadFixture(deployFixture);
      await call.connect(user1).claimDaily();
      await expect(
        call.connect(user1).transfer(user2.address, DAILY_AMOUNT)
      ).to.be.revertedWithCustomError(call, "TransferDisabled");
    });

    it("should revert on transferFrom", async function () {
      const { call, user1, user2, owner } = await loadFixture(deployFixture);
      await call.connect(user1).claimDaily();
      await expect(
        call.connect(owner).transferFrom(user1.address, user2.address, DAILY_AMOUNT)
      ).to.be.revertedWithCustomError(call, "TransferDisabled");
    });

    it("should revert on approve", async function () {
      const { call, user1, user2 } = await loadFixture(deployFixture);
      await expect(
        call.connect(user1).approve(user2.address, DAILY_AMOUNT)
      ).to.be.revertedWithCustomError(call, "ApprovalDisabled");
    });
  });

  describe("Non-Purchasable", function () {
    it("should reject ETH sent to contract", async function () {
      const { call, user1 } = await loadFixture(deployFixture);
      await expect(
        user1.sendTransaction({
          to: await call.getAddress(),
          value: ethers.parseEther("1"),
        })
      ).to.be.reverted;
    });
  });

  describe("Prediction Market Integration", function () {
    it("should allow owner to set prediction market address", async function () {
      const { call, owner, market } = await loadFixture(deployFixture);
      await call.connect(owner).setPredictionMarket(market.address);
      expect(await call.predictionMarket()).to.equal(market.address);
    });

    it("should reject non-owner setting prediction market", async function () {
      const { call, user1, market } = await loadFixture(deployFixture);
      await expect(
        call.connect(user1).setPredictionMarket(market.address)
      ).to.be.revertedWithCustomError(call, "OwnableUnauthorizedAccount");
    });

    it("should reject setting prediction market to zero address", async function () {
      const { call, owner } = await loadFixture(deployFixture);
      await expect(
        call.connect(owner).setPredictionMarket(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(call, "ZeroAddress");
    });

    it("should allow prediction market to spend user CALL", async function () {
      const { call, owner, user1, market } = await loadFixture(deployFixture);
      await call.connect(owner).setPredictionMarket(market.address);
      await call.connect(user1).claimDaily();
      const spendAmount = ethers.parseEther("20");
      await call.connect(market).spend(user1.address, spendAmount);
      expect(await call.balanceOf(user1.address)).to.equal(DAILY_AMOUNT - spendAmount);
    });

    it("should reject spend from non-market address", async function () {
      const { call, owner, user1, market } = await loadFixture(deployFixture);
      await call.connect(owner).setPredictionMarket(market.address);
      await call.connect(user1).claimDaily();
      await expect(
        call.connect(user1).spend(user1.address, ethers.parseEther("20"))
      ).to.be.revertedWithCustomError(call, "OnlyPredictionMarket");
    });

    it("should reject spend exceeding balance", async function () {
      const { call, owner, user1, market } = await loadFixture(deployFixture);
      await call.connect(owner).setPredictionMarket(market.address);
      await call.connect(user1).claimDaily();
      await expect(
        call.connect(market).spend(user1.address, ethers.parseEther("200"))
      ).to.be.revertedWithCustomError(call, "ERC20InsufficientBalance");
    });

    it("should allow prediction market to mint winnings to user", async function () {
      const { call, owner, user1, market } = await loadFixture(deployFixture);
      await call.connect(owner).setPredictionMarket(market.address);
      const winnings = ethers.parseEther("50");
      await call.connect(market).reward(user1.address, winnings);
      expect(await call.balanceOf(user1.address)).to.equal(winnings);
    });

    it("should reject reward from non-market address", async function () {
      const { call, owner, user1, market } = await loadFixture(deployFixture);
      await call.connect(owner).setPredictionMarket(market.address);
      await expect(
        call.connect(user1).reward(user1.address, ethers.parseEther("50"))
      ).to.be.revertedWithCustomError(call, "OnlyPredictionMarket");
    });
  });

  describe("Edge Cases", function () {
    it("should handle claiming with zero balance correctly", async function () {
      const { call, owner, user1, market } = await loadFixture(deployFixture);
      await call.connect(owner).setPredictionMarket(market.address);
      await call.connect(user1).claimDaily();
      await call.connect(market).spend(user1.address, DAILY_AMOUNT);
      expect(await call.balanceOf(user1.address)).to.equal(0);
      await expect(
        call.connect(user1).claimDaily()
      ).to.be.revertedWithCustomError(call, "AlreadyClaimedToday");
    });

    it("should handle spend of zero amount", async function () {
      const { call, owner, user1, market } = await loadFixture(deployFixture);
      await call.connect(owner).setPredictionMarket(market.address);
      await call.connect(user1).claimDaily();
      await call.connect(market).spend(user1.address, 0);
      expect(await call.balanceOf(user1.address)).to.equal(DAILY_AMOUNT);
    });
  });
});
