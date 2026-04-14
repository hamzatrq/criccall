import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { CricketOracle } from "../typechain-types";

describe("CricketOracle", function () {
  // Match outcomes
  const Outcome = {
    Unresolved: 0,
    TeamA: 1,
    TeamB: 2,
    Draw: 3,
    NoResult: 4,
  };

  async function deployFixture() {
    const [owner, oracle, oracle2, unauthorized, consumer] =
      await ethers.getSigners();

    const CricketOracle = await ethers.getContractFactory("CricketOracle");
    const oracleContract = await CricketOracle.deploy();
    await oracleContract.waitForDeployment();

    // Authorize the oracle address
    await oracleContract.connect(owner).addOracle(oracle.address);

    return { oracleContract, owner, oracle, oracle2, unauthorized, consumer };
  }

  describe("Deployment", function () {
    it("should set deployer as owner", async function () {
      const { oracleContract, owner } = await loadFixture(deployFixture);
      expect(await oracleContract.owner()).to.equal(owner.address);
    });
  });

  describe("Oracle Management", function () {
    it("should allow owner to add an oracle", async function () {
      const { oracleContract, owner, oracle2 } = await loadFixture(
        deployFixture
      );
      await oracleContract.connect(owner).addOracle(oracle2.address);
      expect(await oracleContract.authorizedOracles(oracle2.address)).to.be
        .true;
    });

    it("should emit OracleAdded event", async function () {
      const { oracleContract, owner, oracle2 } = await loadFixture(
        deployFixture
      );
      await expect(oracleContract.connect(owner).addOracle(oracle2.address))
        .to.emit(oracleContract, "OracleAdded")
        .withArgs(oracle2.address);
    });

    it("should allow owner to remove an oracle", async function () {
      const { oracleContract, owner, oracle } = await loadFixture(
        deployFixture
      );
      await oracleContract.connect(owner).removeOracle(oracle.address);
      expect(await oracleContract.authorizedOracles(oracle.address)).to.be
        .false;
    });

    it("should emit OracleRemoved event", async function () {
      const { oracleContract, owner, oracle } = await loadFixture(
        deployFixture
      );
      await expect(oracleContract.connect(owner).removeOracle(oracle.address))
        .to.emit(oracleContract, "OracleRemoved")
        .withArgs(oracle.address);
    });

    it("should reject non-owner adding oracle", async function () {
      const { oracleContract, unauthorized, oracle2 } = await loadFixture(
        deployFixture
      );
      await expect(
        oracleContract.connect(unauthorized).addOracle(oracle2.address)
      ).to.be.revertedWithCustomError(
        oracleContract,
        "OwnableUnauthorizedAccount"
      );
    });

    it("should reject adding zero address as oracle", async function () {
      const { oracleContract, owner } = await loadFixture(deployFixture);
      await expect(
        oracleContract.connect(owner).addOracle(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(oracleContract, "ZeroAddress");
    });
  });

  describe("Commit-Reveal: Commit Phase", function () {
    it("should allow authorized oracle to commit a result", async function () {
      const { oracleContract, oracle } = await loadFixture(deployFixture);

      const matchId = "PAK-IND-2026-04-15";
      const outcome = Outcome.TeamA;
      const secret = ethers.encodeBytes32String("secret123");
      const commitHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["string", "uint8", "bytes32"],
          [matchId, outcome, secret]
        )
      );

      await expect(oracleContract.connect(oracle).commitResult(matchId, commitHash))
        .to.emit(oracleContract, "ResultCommitted")
        .withArgs(matchId, oracle.address);
    });

    it("should reject commit from unauthorized address", async function () {
      const { oracleContract, unauthorized } = await loadFixture(
        deployFixture
      );

      const commitHash = ethers.keccak256(ethers.toUtf8Bytes("test"));

      await expect(
        oracleContract
          .connect(unauthorized)
          .commitResult("MATCH-1", commitHash)
      ).to.be.revertedWithCustomError(oracleContract, "NotAuthorizedOracle");
    });

    it("should reject commit for already committed match", async function () {
      const { oracleContract, oracle } = await loadFixture(deployFixture);

      const commitHash = ethers.keccak256(ethers.toUtf8Bytes("test"));
      await oracleContract
        .connect(oracle)
        .commitResult("MATCH-1", commitHash);

      await expect(
        oracleContract.connect(oracle).commitResult("MATCH-1", commitHash)
      ).to.be.revertedWithCustomError(oracleContract, "AlreadyCommitted");
    });
  });

  describe("Commit-Reveal: Reveal Phase", function () {
    const matchId = "PAK-IND-2026-04-15";
    const outcome = Outcome.TeamA;
    const secret = ethers.encodeBytes32String("secret123");

    async function commitFixture() {
      const base = await deployFixture();
      const { oracleContract, oracle } = base;

      const commitHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["string", "uint8", "bytes32"],
          [matchId, outcome, secret]
        )
      );

      await oracleContract
        .connect(oracle)
        .commitResult(matchId, commitHash);

      return { ...base, commitHash };
    }

    it("should allow oracle to reveal a committed result", async function () {
      const { oracleContract, oracle } = await loadFixture(commitFixture);

      await expect(
        oracleContract.connect(oracle).revealResult(matchId, outcome, secret)
      )
        .to.emit(oracleContract, "ResultRevealed")
        .withArgs(matchId, outcome);
    });

    it("should store the match result after reveal", async function () {
      const { oracleContract, oracle } = await loadFixture(commitFixture);

      await oracleContract
        .connect(oracle)
        .revealResult(matchId, outcome, secret);

      const result = await oracleContract.getMatchResult(matchId);
      expect(result.outcome).to.equal(outcome);
      expect(result.resolved).to.be.true;
    });

    it("should reject reveal with wrong secret", async function () {
      const { oracleContract, oracle } = await loadFixture(commitFixture);

      const wrongSecret = ethers.encodeBytes32String("wrong");
      await expect(
        oracleContract
          .connect(oracle)
          .revealResult(matchId, outcome, wrongSecret)
      ).to.be.revertedWithCustomError(oracleContract, "InvalidReveal");
    });

    it("should reject reveal with wrong outcome", async function () {
      const { oracleContract, oracle } = await loadFixture(commitFixture);

      await expect(
        oracleContract
          .connect(oracle)
          .revealResult(matchId, Outcome.TeamB, secret)
      ).to.be.revertedWithCustomError(oracleContract, "InvalidReveal");
    });

    it("should reject reveal from unauthorized address", async function () {
      const { oracleContract, unauthorized } = await loadFixture(
        commitFixture
      );

      await expect(
        oracleContract
          .connect(unauthorized)
          .revealResult(matchId, outcome, secret)
      ).to.be.revertedWithCustomError(oracleContract, "NotAuthorizedOracle");
    });

    it("should reject reveal for uncommitted match", async function () {
      const { oracleContract, oracle } = await loadFixture(deployFixture);

      await expect(
        oracleContract
          .connect(oracle)
          .revealResult("NO-MATCH", outcome, secret)
      ).to.be.revertedWithCustomError(oracleContract, "NotCommitted");
    });

    it("should reject double reveal", async function () {
      const { oracleContract, oracle } = await loadFixture(commitFixture);

      await oracleContract
        .connect(oracle)
        .revealResult(matchId, outcome, secret);

      await expect(
        oracleContract
          .connect(oracle)
          .revealResult(matchId, outcome, secret)
      ).to.be.revertedWithCustomError(oracleContract, "AlreadyResolved");
    });

    it("should reject Unresolved as an outcome", async function () {
      const { oracleContract, oracle } = await loadFixture(deployFixture);

      const unresSecret = ethers.encodeBytes32String("sec");
      const commitHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["string", "uint8", "bytes32"],
          ["MATCH-X", Outcome.Unresolved, unresSecret]
        )
      );

      await oracleContract
        .connect(oracle)
        .commitResult("MATCH-X", commitHash);

      await expect(
        oracleContract
          .connect(oracle)
          .revealResult("MATCH-X", Outcome.Unresolved, unresSecret)
      ).to.be.revertedWithCustomError(oracleContract, "InvalidOutcome");
    });
  });

  describe("Consumer Registration", function () {
    it("should allow owner to set a consumer contract", async function () {
      const { oracleContract, owner, consumer } = await loadFixture(
        deployFixture
      );
      await oracleContract.connect(owner).setConsumer(consumer.address);
      expect(await oracleContract.consumer()).to.equal(consumer.address);
    });

    it("should reject non-owner setting consumer", async function () {
      const { oracleContract, unauthorized, consumer } = await loadFixture(
        deployFixture
      );
      await expect(
        oracleContract.connect(unauthorized).setConsumer(consumer.address)
      ).to.be.revertedWithCustomError(
        oracleContract,
        "OwnableUnauthorizedAccount"
      );
    });
  });

  describe("Query Functions", function () {
    it("should return unresolved for unknown match", async function () {
      const { oracleContract } = await loadFixture(deployFixture);
      const result = await oracleContract.getMatchResult("UNKNOWN");
      expect(result.outcome).to.equal(Outcome.Unresolved);
      expect(result.resolved).to.be.false;
    });

    it("should return correct result for resolved match", async function () {
      const { oracleContract, oracle } = await loadFixture(deployFixture);

      const matchId = "MATCH-QUERY";
      const outcome = Outcome.Draw;
      const secret = ethers.encodeBytes32String("querysecret");
      const commitHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["string", "uint8", "bytes32"],
          [matchId, outcome, secret]
        )
      );

      await oracleContract
        .connect(oracle)
        .commitResult(matchId, commitHash);
      await oracleContract
        .connect(oracle)
        .revealResult(matchId, outcome, secret);

      const result = await oracleContract.getMatchResult(matchId);
      expect(result.outcome).to.equal(Outcome.Draw);
      expect(result.resolved).to.be.true;
      expect(result.timestamp).to.be.greaterThan(0);
    });
  });
});
