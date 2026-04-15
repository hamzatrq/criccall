import { ethers } from "hardhat";

// PSL 2026 matches — must match the DB seed exactly
const markets = [
  { matchId: "psl-23-apr15", question: "Will Peshawar Zalmi win?", lockTime: "2026-04-15T14:00:00Z", yesOutcome: 1 },
  { matchId: "psl-25-apr16", question: "Will Karachi Kings win?", lockTime: "2026-04-16T14:00:00Z", yesOutcome: 1 },
  { matchId: "psl-24-apr16", question: "Will Hyderabad Kingsmen win?", lockTime: "2026-04-16T09:30:00Z", yesOutcome: 1 },
  { matchId: "psl-26-apr17", question: "Will Lahore Qalandars win?", lockTime: "2026-04-17T14:00:00Z", yesOutcome: 1 },
  { matchId: "psl-27-apr18", question: "Will Lahore Qalandars win?", lockTime: "2026-04-18T14:00:00Z", yesOutcome: 1 },
  { matchId: "psl-29-apr19", question: "Will Peshawar Zalmi win?", lockTime: "2026-04-19T14:00:00Z", yesOutcome: 1 },
  { matchId: "psl-28-apr19", question: "Will Karachi Kings win?", lockTime: "2026-04-19T09:30:00Z", yesOutcome: 1 },
  { matchId: "psl-30-apr21", question: "Will Lahore Qalandars win?", lockTime: "2026-04-21T09:30:00Z", yesOutcome: 1 },
  { matchId: "psl-31-apr21", question: "Will Rawalpindiz win?", lockTime: "2026-04-21T14:00:00Z", yesOutcome: 1 },
  { matchId: "psl-33-apr22", question: "Will Hyderabad Kingsmen win?", lockTime: "2026-04-22T14:00:00Z", yesOutcome: 1 },
  { matchId: "psl-32-apr22", question: "Will Karachi Kings win?", lockTime: "2026-04-22T09:30:00Z", yesOutcome: 1 },
  { matchId: "psl-35-apr23", question: "Will Lahore Qalandars win?", lockTime: "2026-04-23T14:00:00Z", yesOutcome: 1 },
  { matchId: "psl-34-apr23", question: "Will Rawalpindiz win?", lockTime: "2026-04-23T09:30:00Z", yesOutcome: 1 },
  { matchId: "psl-36-apr24", question: "Will Hyderabad Kingsmen win?", lockTime: "2026-04-24T14:00:00Z", yesOutcome: 1 },
  { matchId: "psl-37-apr25", question: "Will Quetta Gladiators win?", lockTime: "2026-04-25T09:30:00Z", yesOutcome: 1 },
  { matchId: "psl-38-apr25", question: "Will Lahore Qalandars win?", lockTime: "2026-04-25T14:00:00Z", yesOutcome: 1 },
  { matchId: "psl-40-apr26", question: "Will Islamabad United win?", lockTime: "2026-04-26T14:00:00Z", yesOutcome: 1 },
  { matchId: "psl-39-apr26", question: "Will Hyderabad Kingsmen win?", lockTime: "2026-04-26T09:30:00Z", yesOutcome: 1 },
];

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Creating markets with:", deployer.address);

  const predictionMarket = await ethers.getContractAt(
    "PredictionMarket",
    process.env.PREDICTION_MARKET_ADDRESS || "0xB115b03E1C24a4183815804Ca148C786E9a41410"
  );

  const currentCount = await predictionMarket.marketCount();
  console.log(`Current on-chain market count: ${currentCount}`);

  if (Number(currentCount) > 0) {
    console.log("Markets already exist on-chain. Skipping.");
    return;
  }

  for (let i = 0; i < markets.length; i++) {
    const m = markets[i];
    const lockTimestamp = Math.floor(new Date(m.lockTime).getTime() / 1000);

    console.log(`\n[${i}] Creating: ${m.question}`);
    console.log(`    Match: ${m.matchId} | Lock: ${m.lockTime} | YesOutcome: ${m.yesOutcome}`);

    const tx = await predictionMarket.createMarket(
      m.matchId,
      m.question,
      lockTimestamp,
      m.yesOutcome
    );
    const receipt = await tx.wait();
    console.log(`    ✓ Tx: ${tx.hash} (gas: ${receipt?.gasUsed})`);
  }

  const finalCount = await predictionMarket.marketCount();
  console.log(`\n✅ Done! ${finalCount} markets on-chain.`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Failed:", error);
    process.exit(1);
  });
