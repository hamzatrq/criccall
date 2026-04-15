import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/" className="text-green-700 text-sm font-medium hover:underline mb-6 inline-block">&larr; Back to Home</Link>
      <h1 className="text-3xl font-extrabold text-slate-900 mb-8">Terms of Service</h1>

      <div className="prose prose-slate max-w-none space-y-6 text-slate-600 text-sm leading-relaxed">
        <p><strong>Effective Date:</strong> April 2026</p>

        <h2 className="text-lg font-bold text-slate-900 mt-8">1. Platform Overview</h2>
        <p>CricCall is a skill-based cricket prediction platform built on the WireFluid blockchain. Users predict match outcomes using free CALL tokens. CricCall is not a gambling platform — no real money is wagered by users at any point.</p>

        <h2 className="text-lg font-bold text-slate-900 mt-8">2. CALL Tokens</h2>
        <p>CALL tokens are free, non-transferable reputation tokens. They cannot be purchased, sold, or transferred between users. CALL tokens have no monetary value. They are earned through daily claims (100 CALL/day) and correct predictions.</p>

        <h2 className="text-lg font-bold text-slate-900 mt-8">3. PKR Rewards</h2>
        <p>PKR prize pools are funded entirely by brand sponsors, not by users. PKR rewards are distributed to winning predictors proportionally based on their CALL stake. Users never deposit money to participate.</p>

        <h2 className="text-lg font-bold text-slate-900 mt-8">4. Wallet Responsibility</h2>
        <p>You are solely responsible for the security of your wallet and private keys. CricCall never has access to your private keys. All transactions are signed locally in your wallet.</p>

        <h2 className="text-lg font-bold text-slate-900 mt-8">5. Market Resolution</h2>
        <p>Markets are resolved via our CricketOracle smart contract using a commit-reveal pattern. In the event of a no-result match, all predictions are refunded in full.</p>

        <h2 className="text-lg font-bold text-slate-900 mt-8">6. Eligibility</h2>
        <p>CricCall is open to anyone with a WireFluid-compatible wallet. By using the platform, you confirm that prediction markets are legal in your jurisdiction.</p>

        <h2 className="text-lg font-bold text-slate-900 mt-8">7. Disclaimer</h2>
        <p>CricCall is a hackathon project built for the Entangled Hackathon (April 2026). The platform is deployed on a testnet and is provided as-is for demonstration purposes.</p>
      </div>
    </div>
  );
}
