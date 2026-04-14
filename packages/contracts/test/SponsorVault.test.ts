import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

describe("SponsorVault", function () {
  async function deployFixture() {
    const [owner, sponsor1, sponsor2, winner1, winner2, winner3, unauthorized] =
      await ethers.getSigners();

    // Deploy a mock ERC-20 for sponsor deposits
    const MockToken = await ethers.getContractFactory("MockERC20");
    const token = await MockToken.deploy("Mock USDT", "mUSDT");
    await token.waitForDeployment();

    // Mint tokens to sponsors
    await token.mint(sponsor1.address, ethers.parseEther("100000"));
    await token.mint(sponsor2.address, ethers.parseEther("100000"));

    // Deploy SponsorVault
    const VaultFactory = await ethers.getContractFactory("SponsorVault");
    const vault = await VaultFactory.deploy();
    await vault.waitForDeployment();

    // Whitelist sponsor1
    await vault.connect(owner).addSponsor(sponsor1.address);

    return {
      vault,
      token,
      owner,
      sponsor1,
      sponsor2,
      winner1,
      winner2,
      winner3,
      unauthorized,
    };
  }

  describe("Deployment", function () {
    it("should set deployer as owner", async function () {
      const { vault, owner } = await loadFixture(deployFixture);
      expect(await vault.owner()).to.equal(owner.address);
    });
  });

  describe("Sponsor Management", function () {
    it("should allow owner to whitelist a sponsor", async function () {
      const { vault, owner, sponsor2 } = await loadFixture(deployFixture);
      await vault.connect(owner).addSponsor(sponsor2.address);
      expect(await vault.whitelistedSponsors(sponsor2.address)).to.be.true;
    });

    it("should emit SponsorAdded event", async function () {
      const { vault, owner, sponsor2 } = await loadFixture(deployFixture);
      await expect(vault.connect(owner).addSponsor(sponsor2.address))
        .to.emit(vault, "SponsorAdded")
        .withArgs(sponsor2.address);
    });

    it("should allow owner to remove a sponsor", async function () {
      const { vault, owner, sponsor1 } = await loadFixture(deployFixture);
      await vault.connect(owner).removeSponsor(sponsor1.address);
      expect(await vault.whitelistedSponsors(sponsor1.address)).to.be.false;
    });

    it("should reject non-owner managing sponsors", async function () {
      const { vault, unauthorized, sponsor2 } = await loadFixture(
        deployFixture
      );
      await expect(
        vault.connect(unauthorized).addSponsor(sponsor2.address)
      ).to.be.revertedWithCustomError(vault, "OwnableUnauthorizedAccount");
    });
  });

  describe("Campaign Creation & Deposits", function () {
    it("should allow whitelisted sponsor to create campaign with ERC-20", async function () {
      const { vault, token, sponsor1 } = await loadFixture(deployFixture);

      const amount = ethers.parseEther("10000");
      const expiry = (await time.latest()) + 30 * 24 * 3600; // 30 days

      await token
        .connect(sponsor1)
        .approve(await vault.getAddress(), amount);

      await expect(
        vault
          .connect(sponsor1)
          .createCampaign(
            "PSL-CHALLENGE-1",
            await token.getAddress(),
            amount,
            expiry
          )
      )
        .to.emit(vault, "CampaignCreated")
        .withArgs(
          "PSL-CHALLENGE-1",
          sponsor1.address,
          await token.getAddress(),
          amount,
          expiry
        );
    });

    it("should allow whitelisted sponsor to create campaign with native WIRE", async function () {
      const { vault, sponsor1 } = await loadFixture(deployFixture);

      const amount = ethers.parseEther("100");
      const expiry = (await time.latest()) + 30 * 24 * 3600;

      await expect(
        vault
          .connect(sponsor1)
          .createCampaign("PSL-NATIVE-1", ethers.ZeroAddress, amount, expiry, {
            value: amount,
          })
      )
        .to.emit(vault, "CampaignCreated")
        .withArgs(
          "PSL-NATIVE-1",
          sponsor1.address,
          ethers.ZeroAddress,
          amount,
          expiry
        );
    });

    it("should reject deposit from non-whitelisted address", async function () {
      const { vault, token, unauthorized } = await loadFixture(deployFixture);

      const amount = ethers.parseEther("1000");
      const expiry = (await time.latest()) + 30 * 24 * 3600;

      await expect(
        vault
          .connect(unauthorized)
          .createCampaign(
            "HACK",
            await token.getAddress(),
            amount,
            expiry
          )
      ).to.be.revertedWithCustomError(vault, "NotWhitelistedSponsor");
    });

    it("should reject duplicate campaign ID", async function () {
      const { vault, token, sponsor1 } = await loadFixture(deployFixture);

      const amount = ethers.parseEther("1000");
      const expiry = (await time.latest()) + 30 * 24 * 3600;

      await token
        .connect(sponsor1)
        .approve(await vault.getAddress(), amount * 2n);

      await vault
        .connect(sponsor1)
        .createCampaign(
          "DUP",
          await token.getAddress(),
          amount,
          expiry
        );

      await expect(
        vault
          .connect(sponsor1)
          .createCampaign(
            "DUP",
            await token.getAddress(),
            amount,
            expiry
          )
      ).to.be.revertedWithCustomError(vault, "CampaignExists");
    });

    it("should reject zero amount", async function () {
      const { vault, token, sponsor1 } = await loadFixture(deployFixture);
      const expiry = (await time.latest()) + 30 * 24 * 3600;

      await expect(
        vault
          .connect(sponsor1)
          .createCampaign(
            "ZERO",
            await token.getAddress(),
            0,
            expiry
          )
      ).to.be.revertedWithCustomError(vault, "ZeroAmount");
    });

    it("should reject expiry in the past", async function () {
      const { vault, token, sponsor1 } = await loadFixture(deployFixture);

      await expect(
        vault
          .connect(sponsor1)
          .createCampaign(
            "PAST",
            await token.getAddress(),
            ethers.parseEther("100"),
            (await time.latest()) - 1
          )
      ).to.be.revertedWithCustomError(vault, "ExpiryInPast");
    });

    it("should reject native campaign with mismatched value", async function () {
      const { vault, sponsor1 } = await loadFixture(deployFixture);
      const expiry = (await time.latest()) + 30 * 24 * 3600;

      await expect(
        vault
          .connect(sponsor1)
          .createCampaign(
            "MISMATCH",
            ethers.ZeroAddress,
            ethers.parseEther("100"),
            expiry,
            { value: ethers.parseEther("50") }
          )
      ).to.be.revertedWithCustomError(vault, "ValueMismatch");
    });
  });

  describe("Merkle Root Posting", function () {
    async function campaignFixture() {
      const base = await deployFixture();
      const { vault, token, sponsor1 } = base;

      const amount = ethers.parseEther("10000");
      const expiry = (await time.latest()) + 30 * 24 * 3600;

      await token
        .connect(sponsor1)
        .approve(await vault.getAddress(), amount);
      await vault
        .connect(sponsor1)
        .createCampaign(
          "PSL-1",
          await token.getAddress(),
          amount,
          expiry
        );

      return { ...base, campaignId: "PSL-1", amount, expiry };
    }

    it("should allow owner to post Merkle root", async function () {
      const { vault, owner, winner1, winner2 } = await loadFixture(
        campaignFixture
      );

      const values = [
        [winner1.address, ethers.parseEther("6000").toString()],
        [winner2.address, ethers.parseEther("4000").toString()],
      ];
      const tree = StandardMerkleTree.of(values, ["address", "uint256"]);

      await expect(
        vault.connect(owner).postWinnerRoot("PSL-1", tree.root, ethers.parseEther("10000"))
      )
        .to.emit(vault, "WinnerRootPosted")
        .withArgs("PSL-1", tree.root);
    });

    it("should reject Merkle root from non-owner", async function () {
      const { vault, unauthorized } = await loadFixture(campaignFixture);

      await expect(
        vault
          .connect(unauthorized)
          .postWinnerRoot("PSL-1", ethers.randomBytes(32), ethers.parseEther("10000"))
      ).to.be.revertedWithCustomError(vault, "OwnableUnauthorizedAccount");
    });

    it("should reject allocation exceeding deposit", async function () {
      const { vault, owner, winner1 } = await loadFixture(campaignFixture);

      const values = [
        [winner1.address, ethers.parseEther("20000").toString()],
      ];
      const tree = StandardMerkleTree.of(values, ["address", "uint256"]);

      await expect(
        vault.connect(owner).postWinnerRoot("PSL-1", tree.root, ethers.parseEther("20000"))
      ).to.be.revertedWithCustomError(vault, "AllocationExceedsDeposit");
    });
  });

  describe("Merkle Claims", function () {
    async function claimableFixture() {
      const base = await deployFixture();
      const { vault, token, sponsor1, owner, winner1, winner2, winner3 } =
        base;

      const amount = ethers.parseEther("10000");
      const expiry = (await time.latest()) + 30 * 24 * 3600;

      await token
        .connect(sponsor1)
        .approve(await vault.getAddress(), amount);
      await vault
        .connect(sponsor1)
        .createCampaign(
          "PSL-1",
          await token.getAddress(),
          amount,
          expiry
        );

      // Build Merkle tree
      const w1Amount = ethers.parseEther("5000");
      const w2Amount = ethers.parseEther("3000");
      const w3Amount = ethers.parseEther("2000");

      const values: [string, string][] = [
        [winner1.address, w1Amount.toString()],
        [winner2.address, w2Amount.toString()],
        [winner3.address, w3Amount.toString()],
      ];
      const tree = StandardMerkleTree.of(values, ["address", "uint256"]);

      await vault.connect(owner).postWinnerRoot("PSL-1", tree.root, amount);

      return {
        ...base,
        tree,
        values,
        w1Amount,
        w2Amount,
        w3Amount,
      };
    }

    it("should allow winner to claim with valid Merkle proof", async function () {
      const { vault, token, winner1, tree, values, w1Amount } =
        await loadFixture(claimableFixture);

      const proof = tree.getProof(values.indexOf(values.find(v => v[0] === winner1.address)!));

      const balBefore = await token.balanceOf(winner1.address);
      await vault
        .connect(winner1)
        .claim("PSL-1", w1Amount, proof);
      const balAfter = await token.balanceOf(winner1.address);

      expect(balAfter - balBefore).to.equal(w1Amount);
    });

    it("should emit RewardClaimed event", async function () {
      const { vault, winner1, tree, values, w1Amount } = await loadFixture(
        claimableFixture
      );

      const proof = tree.getProof(values.indexOf(values.find(v => v[0] === winner1.address)!));

      await expect(vault.connect(winner1).claim("PSL-1", w1Amount, proof))
        .to.emit(vault, "RewardClaimed")
        .withArgs("PSL-1", winner1.address, w1Amount);
    });

    it("should reject double claim", async function () {
      const { vault, winner1, tree, values, w1Amount } = await loadFixture(
        claimableFixture
      );

      const proof = tree.getProof(values.indexOf(values.find(v => v[0] === winner1.address)!));

      await vault.connect(winner1).claim("PSL-1", w1Amount, proof);

      await expect(
        vault.connect(winner1).claim("PSL-1", w1Amount, proof)
      ).to.be.revertedWithCustomError(vault, "AlreadyClaimed");
    });

    it("should reject claim with invalid proof", async function () {
      const { vault, unauthorized, tree, values, w1Amount } =
        await loadFixture(claimableFixture);

      const proof = tree.getProof(0);

      await expect(
        vault.connect(unauthorized).claim("PSL-1", w1Amount, proof)
      ).to.be.revertedWithCustomError(vault, "InvalidProof");
    });

    it("should reject claim with wrong amount", async function () {
      const { vault, winner1, tree, values } = await loadFixture(
        claimableFixture
      );

      const proof = tree.getProof(values.indexOf(values.find(v => v[0] === winner1.address)!));

      await expect(
        vault
          .connect(winner1)
          .claim("PSL-1", ethers.parseEther("9999"), proof)
      ).to.be.revertedWithCustomError(vault, "InvalidProof");
    });

    it("should allow all three winners to claim", async function () {
      const {
        vault,
        token,
        winner1,
        winner2,
        winner3,
        tree,
        values,
        w1Amount,
        w2Amount,
        w3Amount,
      } = await loadFixture(claimableFixture);

      for (const [winner, amount] of [
        [winner1, w1Amount],
        [winner2, w2Amount],
        [winner3, w3Amount],
      ] as const) {
        const idx = values.indexOf(values.find(v => v[0] === winner.address)!);
        const proof = tree.getProof(idx);

        const balBefore = await token.balanceOf(winner.address);
        await vault.connect(winner).claim("PSL-1", amount, proof);
        const balAfter = await token.balanceOf(winner.address);
        expect(balAfter - balBefore).to.equal(amount);
      }
    });

    it("should allow native WIRE claims", async function () {
      const { vault, owner, sponsor1, winner1 } = await loadFixture(
        deployFixture
      );

      const amount = ethers.parseEther("10");
      const expiry = (await time.latest()) + 30 * 24 * 3600;

      await vault
        .connect(sponsor1)
        .createCampaign("NATIVE-1", ethers.ZeroAddress, amount, expiry, {
          value: amount,
        });

      const values: [string, string][] = [
        [winner1.address, amount.toString()],
      ];
      const tree = StandardMerkleTree.of(values, ["address", "uint256"]);

      await vault.connect(owner).postWinnerRoot("NATIVE-1", tree.root, amount);

      const proof = tree.getProof(0);
      const balBefore = await ethers.provider.getBalance(winner1.address);
      const tx = await vault.connect(winner1).claim("NATIVE-1", amount, proof);
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
      const balAfter = await ethers.provider.getBalance(winner1.address);

      expect(balAfter - balBefore + gasUsed).to.equal(amount);
    });
  });

  describe("Expiry Clawback", function () {
    it("should allow sponsor to reclaim unclaimed funds after expiry", async function () {
      const { vault, token, sponsor1, owner, winner1 } = await loadFixture(
        deployFixture
      );

      const amount = ethers.parseEther("10000");
      const expiry = (await time.latest()) + 3600; // 1 hour

      await token
        .connect(sponsor1)
        .approve(await vault.getAddress(), amount);
      await vault
        .connect(sponsor1)
        .createCampaign(
          "EXPIRE-1",
          await token.getAddress(),
          amount,
          expiry
        );

      // Post winners but only partial allocation
      const w1Amount = ethers.parseEther("3000");
      const values: [string, string][] = [
        [winner1.address, w1Amount.toString()],
      ];
      const tree = StandardMerkleTree.of(values, ["address", "uint256"]);
      await vault.connect(owner).postWinnerRoot("EXPIRE-1", tree.root, w1Amount);

      // Winner claims
      const proof = tree.getProof(0);
      await vault.connect(winner1).claim("EXPIRE-1", w1Amount, proof);

      // Fast forward past expiry
      await time.increaseTo(expiry + 1);

      const sponsorBalBefore = await token.balanceOf(sponsor1.address);
      await vault.connect(sponsor1).clawback("EXPIRE-1");
      const sponsorBalAfter = await token.balanceOf(sponsor1.address);

      // Should get back 10000 - 3000 = 7000
      expect(sponsorBalAfter - sponsorBalBefore).to.equal(
        ethers.parseEther("7000")
      );
    });

    it("should reject clawback before expiry", async function () {
      const { vault, token, sponsor1 } = await loadFixture(deployFixture);

      const amount = ethers.parseEther("1000");
      const expiry = (await time.latest()) + 3600;

      await token
        .connect(sponsor1)
        .approve(await vault.getAddress(), amount);
      await vault
        .connect(sponsor1)
        .createCampaign(
          "EARLY",
          await token.getAddress(),
          amount,
          expiry
        );

      await expect(
        vault.connect(sponsor1).clawback("EARLY")
      ).to.be.revertedWithCustomError(vault, "NotExpired");
    });

    it("should reject clawback from non-sponsor", async function () {
      const { vault, token, sponsor1, unauthorized } = await loadFixture(
        deployFixture
      );

      const amount = ethers.parseEther("1000");
      const expiry = (await time.latest()) + 3600;

      await token
        .connect(sponsor1)
        .approve(await vault.getAddress(), amount);
      await vault
        .connect(sponsor1)
        .createCampaign(
          "NOTMINE",
          await token.getAddress(),
          amount,
          expiry
        );

      await time.increaseTo(expiry + 1);

      await expect(
        vault.connect(unauthorized).clawback("NOTMINE")
      ).to.be.revertedWithCustomError(vault, "NotCampaignSponsor");
    });
  });

  describe("Audit State", function () {
    it("should track totalCommitted, totalRedeemed correctly", async function () {
      const { vault, token, sponsor1, owner, winner1 } = await loadFixture(
        deployFixture
      );

      const amount = ethers.parseEther("5000");
      const expiry = (await time.latest()) + 30 * 24 * 3600;

      await token
        .connect(sponsor1)
        .approve(await vault.getAddress(), amount);
      await vault
        .connect(sponsor1)
        .createCampaign(
          "AUDIT-1",
          await token.getAddress(),
          amount,
          expiry
        );

      const campaign = await vault.campaigns("AUDIT-1");
      expect(campaign.totalCommitted).to.equal(amount);
      expect(campaign.totalRedeemed).to.equal(0);

      // Post winners and claim
      const values: [string, string][] = [
        [winner1.address, ethers.parseEther("2000").toString()],
      ];
      const tree = StandardMerkleTree.of(values, ["address", "uint256"]);
      await vault.connect(owner).postWinnerRoot("AUDIT-1", tree.root, ethers.parseEther("2000"));

      const proof = tree.getProof(0);
      await vault
        .connect(winner1)
        .claim("AUDIT-1", ethers.parseEther("2000"), proof);

      const campaignAfter = await vault.campaigns("AUDIT-1");
      expect(campaignAfter.totalRedeemed).to.equal(ethers.parseEther("2000"));
      expect(campaignAfter.totalAllocated).to.equal(ethers.parseEther("2000"));
    });
  });
});
