import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function ResponsiblePlayPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/" className="text-green-700 text-sm font-medium hover:underline mb-6 inline-block">&larr; Back to Home</Link>
      <h1 className="text-3xl font-extrabold text-slate-900 mb-8">Responsible Play</h1>

      <div className="p-5 bg-green-50 rounded-xl border border-green-200 mb-8 flex gap-3">
        <ShieldCheck className="w-6 h-6 text-green-700 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-green-900 mb-1">Shariah-Compliant by Design</p>
          <p className="text-sm text-green-800/80">CricCall is built from the ground up to ensure no gambling or interest-based mechanics are involved. Our architecture enforces this at the smart contract level.</p>
        </div>
      </div>

      <div className="prose prose-slate max-w-none space-y-6 text-slate-600 text-sm leading-relaxed">
        <h2 className="text-lg font-bold text-slate-900 mt-8">How CricCall Stays Halal</h2>

        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="font-bold text-slate-900 mb-1">No Money In</p>
            <p>Users never deposit or wager real money. CALL tokens are free — you claim 100 every day at no cost. There is zero financial risk to participants.</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="font-bold text-slate-900 mb-1">Non-Transferable Tokens</p>
            <p>CALL tokens cannot be bought, sold, or transferred. They have no monetary value and cannot be traded on any market. This prevents any form of speculative exchange.</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="font-bold text-slate-900 mb-1">Sponsor-Funded Prizes</p>
            <p>All PKR prize money comes from brand sponsors (like PTCL, Foodpanda, KFC), not from user pools. This is equivalent to a brand-sponsored tournament or quiz competition.</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="font-bold text-slate-900 mb-1">Skill-Based Reputation</p>
            <p>Your CALL balance reflects your prediction accuracy over time. Better predictors accumulate more CALL. This is a skill and knowledge-based system, not chance-based.</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="font-bold text-slate-900 mb-1">Transparent & On-Chain</p>
            <p>All market creation, predictions, and resolutions happen on the WireFluid blockchain via verified smart contracts. The rules are enforced by code, not by a central authority.</p>
          </div>
        </div>

        <h2 className="text-lg font-bold text-slate-900 mt-8">Our Commitment</h2>
        <p>CricCall is designed as a tournament participation model — similar to a fantasy league or quiz competition. We are committed to providing an entertaining, fair, and ethical prediction experience for cricket fans.</p>
      </div>
    </div>
  );
}
