import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("PKRToken", function () {
  async function deployFixture() {
    const [owner, brand, user1, user2, unauthorized] = await ethers.getSigners();

    const PKRToken = await ethers.getContractFactory("PKRToken");
    const pkr = await PKRToken.deploy();
    await pkr.waitForDeployment();

    return { pkr, owner, brand, user1, user2, unauthorized };
  }

  describe("Deployment", function () {
    it("should set the correct name and symbol", async function () {
      const { pkr } = await loadFixture(deployFixture);
      expect(await pkr.name()).to.equal("Pakistani Rupee");
      expect(await pkr.symbol()).to.equal("PKR");
    });

    it("should set deployer as owner", async function () {
      const { pkr, owner } = await loadFixture(deployFixture);
      expect(await pkr.owner()).to.equal(owner.address);
    });

    it("should start with zero total supply", async function () {
      const { pkr } = await loadFixture(deployFixture);
      expect(await pkr.totalSupply()).to.equal(0);
    });
  });

  describe("Minting", function () {
    it("should allow owner to mint PKR", async function () {
      const { pkr, owner, brand } = await loadFixture(deployFixture);
      const amount = ethers.parseEther("100000");
      await pkr.connect(owner).mint(brand.address, amount);
      expect(await pkr.balanceOf(brand.address)).to.equal(amount);
    });

    it("should emit Minted event", async function () {
      const { pkr, owner, brand } = await loadFixture(deployFixture);
      const amount = ethers.parseEther("100000");
      await expect(pkr.connect(owner).mint(brand.address, amount))
        .to.emit(pkr, "Minted")
        .withArgs(brand.address, amount);
    });

    it("should reject minting from non-owner", async function () {
      const { pkr, unauthorized, brand } = await loadFixture(deployFixture);
      await expect(
        pkr.connect(unauthorized).mint(brand.address, ethers.parseEther("1000"))
      ).to.be.revertedWithCustomError(pkr, "OwnableUnauthorizedAccount");
    });

    it("should increase total supply on mint", async function () {
      const { pkr, owner, brand } = await loadFixture(deployFixture);
      const amount = ethers.parseEther("50000");
      await pkr.connect(owner).mint(brand.address, amount);
      expect(await pkr.totalSupply()).to.equal(amount);
    });
  });

  describe("Burning", function () {
    it("should allow holder to burn own PKR", async function () {
      const { pkr, owner, brand } = await loadFixture(deployFixture);
      const amount = ethers.parseEther("10000");
      await pkr.connect(owner).mint(brand.address, amount);

      const burnAmount = ethers.parseEther("3000");
      await pkr.connect(brand).burn(burnAmount);
      expect(await pkr.balanceOf(brand.address)).to.equal(amount - burnAmount);
    });

    it("should emit Burned event", async function () {
      const { pkr, owner, brand } = await loadFixture(deployFixture);
      await pkr.connect(owner).mint(brand.address, ethers.parseEther("10000"));

      const burnAmount = ethers.parseEther("5000");
      await expect(pkr.connect(brand).burn(burnAmount))
        .to.emit(pkr, "Burned")
        .withArgs(brand.address, burnAmount);
    });

    it("should reject burning more than balance", async function () {
      const { pkr, owner, brand } = await loadFixture(deployFixture);
      await pkr.connect(owner).mint(brand.address, ethers.parseEther("100"));

      await expect(
        pkr.connect(brand).burn(ethers.parseEther("200"))
      ).to.be.revertedWithCustomError(pkr, "ERC20InsufficientBalance");
    });
  });

  describe("Transfers (Fully Enabled)", function () {
    it("should allow transfer between accounts", async function () {
      const { pkr, owner, brand, user1 } = await loadFixture(deployFixture);
      const amount = ethers.parseEther("10000");
      await pkr.connect(owner).mint(brand.address, amount);

      const transferAmount = ethers.parseEther("5000");
      await pkr.connect(brand).transfer(user1.address, transferAmount);

      expect(await pkr.balanceOf(brand.address)).to.equal(amount - transferAmount);
      expect(await pkr.balanceOf(user1.address)).to.equal(transferAmount);
    });

    it("should allow approve and transferFrom", async function () {
      const { pkr, owner, brand, user1, user2 } = await loadFixture(deployFixture);
      await pkr.connect(owner).mint(brand.address, ethers.parseEther("10000"));

      const approveAmount = ethers.parseEther("3000");
      await pkr.connect(brand).approve(user1.address, approveAmount);
      await pkr.connect(user1).transferFrom(brand.address, user2.address, approveAmount);

      expect(await pkr.balanceOf(user2.address)).to.equal(approveAmount);
    });
  });

  describe("SponsorVault Integration", function () {
    it("should work as deposit token in SponsorVault", async function () {
      const { pkr, owner, brand } = await loadFixture(deployFixture);

      // Deploy SponsorVault
      const VaultFactory = await ethers.getContractFactory("SponsorVault");
      const vault = await VaultFactory.deploy();
      await vault.waitForDeployment();
      await vault.connect(owner).addSponsor(brand.address);

      // Mint PKR to brand
      const amount = ethers.parseEther("50000");
      await pkr.connect(owner).mint(brand.address, amount);

      // Brand deposits PKR into campaign
      await pkr.connect(brand).approve(await vault.getAddress(), amount);

      const expiry = Math.floor(Date.now() / 1000) + 30 * 24 * 3600;
      await vault.connect(brand).createCampaign(
        "PKR-TEST",
        await pkr.getAddress(),
        amount,
        expiry
      );

      const campaign = await vault.campaigns("PKR-TEST");
      expect(campaign.totalCommitted).to.equal(amount);
      expect(await pkr.balanceOf(await vault.getAddress())).to.equal(amount);
    });
  });
});
