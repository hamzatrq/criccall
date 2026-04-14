import { ethers } from "hardhat";
import * as fs from "fs";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());
  console.log("Network:", (await ethers.provider.getNetwork()).chainId.toString());
  console.log("---");

  const deployment: any = {
    network: "WireFluid Testnet",
    chainId: 92533,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    contracts: {},
    wiring: {},
  };

  // Oracle wallet address (for addOracle) — reads from .env
  const oraclePrivateKey = process.env.ORACLE_PRIVATE_KEY;
  if (!oraclePrivateKey) throw new Error("ORACLE_PRIVATE_KEY not set in .env");
  const oracleWallet = new ethers.Wallet(oraclePrivateKey);
  console.log("Oracle wallet address:", oracleWallet.address);

  // ============================================
  // 1. Deploy CALLToken
  // ============================================
  console.log("\n1. Deploying CALLToken...");
  const CALLToken = await ethers.getContractFactory("CALLToken");
  const callToken = await CALLToken.deploy();
  await callToken.waitForDeployment();
  const callTokenAddress = await callToken.getAddress();
  const callTokenTx = callToken.deploymentTransaction();
  console.log("   CALLToken deployed to:", callTokenAddress);
  console.log("   Tx hash:", callTokenTx?.hash);

  deployment.contracts.CALLToken = {
    address: callTokenAddress,
    txHash: callTokenTx?.hash,
  };

  // ============================================
  // 2. Deploy CricketOracle
  // ============================================
  console.log("\n2. Deploying CricketOracle...");
  const CricketOracle = await ethers.getContractFactory("CricketOracle");
  const cricketOracle = await CricketOracle.deploy();
  await cricketOracle.waitForDeployment();
  const cricketOracleAddress = await cricketOracle.getAddress();
  const cricketOracleTx = cricketOracle.deploymentTransaction();
  console.log("   CricketOracle deployed to:", cricketOracleAddress);
  console.log("   Tx hash:", cricketOracleTx?.hash);

  deployment.contracts.CricketOracle = {
    address: cricketOracleAddress,
    txHash: cricketOracleTx?.hash,
  };

  // ============================================
  // 3. Deploy PredictionMarket(callTokenAddress, oracleAddress)
  // ============================================
  console.log("\n3. Deploying PredictionMarket...");
  const PredictionMarket = await ethers.getContractFactory("PredictionMarket");
  const predictionMarket = await PredictionMarket.deploy(callTokenAddress, cricketOracleAddress);
  await predictionMarket.waitForDeployment();
  const predictionMarketAddress = await predictionMarket.getAddress();
  const predictionMarketTx = predictionMarket.deploymentTransaction();
  console.log("   PredictionMarket deployed to:", predictionMarketAddress);
  console.log("   Tx hash:", predictionMarketTx?.hash);

  deployment.contracts.PredictionMarket = {
    address: predictionMarketAddress,
    txHash: predictionMarketTx?.hash,
  };

  // ============================================
  // 4. Deploy PKRToken
  // ============================================
  console.log("\n4. Deploying PKRToken...");
  const PKRToken = await ethers.getContractFactory("PKRToken");
  const pkrToken = await PKRToken.deploy();
  await pkrToken.waitForDeployment();
  const pkrTokenAddress = await pkrToken.getAddress();
  const pkrTokenTx = pkrToken.deploymentTransaction();
  console.log("   PKRToken deployed to:", pkrTokenAddress);
  console.log("   Tx hash:", pkrTokenTx?.hash);

  deployment.contracts.PKRToken = {
    address: pkrTokenAddress,
    txHash: pkrTokenTx?.hash,
  };

  // ============================================
  // 5. Deploy SponsorVault
  // ============================================
  console.log("\n5. Deploying SponsorVault...");
  const SponsorVault = await ethers.getContractFactory("SponsorVault");
  const sponsorVault = await SponsorVault.deploy();
  await sponsorVault.waitForDeployment();
  const sponsorVaultAddress = await sponsorVault.getAddress();
  const sponsorVaultTx = sponsorVault.deploymentTransaction();
  console.log("   SponsorVault deployed to:", sponsorVaultAddress);
  console.log("   Tx hash:", sponsorVaultTx?.hash);

  deployment.contracts.SponsorVault = {
    address: sponsorVaultAddress,
    txHash: sponsorVaultTx?.hash,
  };

  // ============================================
  // WIRING
  // ============================================
  console.log("\n--- WIRING CONTRACTS ---\n");

  // 6. callToken.setPredictionMarket(marketAddress)
  console.log("6. Setting PredictionMarket on CALLToken...");
  const tx6 = await callToken.setPredictionMarket(predictionMarketAddress);
  await tx6.wait();
  console.log("   Tx hash:", tx6.hash);
  deployment.wiring["callToken.setPredictionMarket"] = { txHash: tx6.hash };

  // 7. oracle.setConsumer(marketAddress)
  console.log("7. Setting consumer (PredictionMarket) on CricketOracle...");
  const tx7 = await cricketOracle.setConsumer(predictionMarketAddress);
  await tx7.wait();
  console.log("   Tx hash:", tx7.hash);
  deployment.wiring["oracle.setConsumer"] = { txHash: tx7.hash };

  // 8. oracle.addOracle(oracleWalletAddress)
  console.log("8. Adding oracle wallet to CricketOracle...");
  const tx8 = await cricketOracle.addOracle(oracleWallet.address);
  await tx8.wait();
  console.log("   Oracle address:", oracleWallet.address);
  console.log("   Tx hash:", tx8.hash);
  deployment.wiring["oracle.addOracle"] = { oracleAddress: oracleWallet.address, txHash: tx8.hash };

  // 9. vault.addSponsor(deployerAddress) — deployer as initial sponsor
  console.log("9. Adding deployer as sponsor on SponsorVault...");
  const tx9 = await sponsorVault.addSponsor(deployer.address);
  await tx9.wait();
  console.log("   Tx hash:", tx9.hash);
  deployment.wiring["vault.addSponsor(deployer)"] = { txHash: tx9.hash };

  // 10. Mint initial PKR to deployer (platform treasury)
  console.log("10. Minting 10,000,000 PKR to platform treasury...");
  const mintAmount = ethers.parseEther("10000000"); // 10M PKR
  const tx10 = await pkrToken.mint(deployer.address, mintAmount);
  await tx10.wait();
  console.log("    Amount:", "10,000,000 PKR");
  console.log("    Tx hash:", tx10.hash);
  deployment.wiring["pkr.mint(treasury)"] = { amount: "10000000", txHash: tx10.hash };

  // ============================================
  // SUMMARY
  // ============================================
  console.log("\n========================================");
  console.log("DEPLOYMENT COMPLETE");
  console.log("========================================\n");

  console.log("Contract Addresses:");
  console.log(`  CALLToken:        ${callTokenAddress}`);
  console.log(`  CricketOracle:    ${cricketOracleAddress}`);
  console.log(`  PredictionMarket: ${predictionMarketAddress}`);
  console.log(`  PKRToken:         ${pkrTokenAddress}`);
  console.log(`  SponsorVault:     ${sponsorVaultAddress}`);
  console.log(`\nDeployer:   ${deployer.address}`);
  console.log(`Oracle:     ${oracleWallet.address}`);
  console.log(`\nNetwork:    WireFluid Testnet (Chain ID: 92533)`);
  console.log(`Explorer:   https://wirefluidscan.com`);

  // Save deployment info to file
  const outputPath = "deployment.json";
  fs.writeFileSync(outputPath, JSON.stringify(deployment, null, 2));
  console.log(`\nDeployment info saved to ${outputPath}`);

  // Also save a .env snippet
  const envSnippet = `
# Contract Addresses (deployed ${new Date().toISOString()})
CALL_TOKEN_ADDRESS=${callTokenAddress}
PREDICTION_MARKET_ADDRESS=${predictionMarketAddress}
CRICKET_ORACLE_ADDRESS=${cricketOracleAddress}
SPONSOR_VAULT_ADDRESS=${sponsorVaultAddress}
PKR_TOKEN_ADDRESS=${pkrTokenAddress}
`;
  fs.writeFileSync("deployment.env", envSnippet.trim());
  console.log("Env snippet saved to deployment.env");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
