import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/" className="text-green-700 text-sm font-medium hover:underline mb-6 inline-block">&larr; Back to Home</Link>
      <h1 className="text-3xl font-extrabold text-slate-900 mb-8">Privacy Policy</h1>

      <div className="prose prose-slate max-w-none space-y-6 text-slate-600 text-sm leading-relaxed">
        <p><strong>Effective Date:</strong> April 2026</p>

        <h2 className="text-lg font-bold text-slate-900 mt-8">1. Information We Collect</h2>
        <p>CricCall is a wallet-based platform. We do not collect emails, phone numbers, or personal identity information. The only data we store is:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Your public wallet address (used for authentication via SIWE)</li>
          <li>On-chain prediction activity (public blockchain data)</li>
          <li>Display name and avatar (if you choose to set one)</li>
        </ul>

        <h2 className="text-lg font-bold text-slate-900 mt-8">2. How We Use Your Data</h2>
        <p>We use your wallet address to authenticate you, display your prediction history, calculate leaderboard rankings, and distribute rewards. We never sell or share your data with third parties.</p>

        <h2 className="text-lg font-bold text-slate-900 mt-8">3. Blockchain Data</h2>
        <p>All predictions are recorded on the WireFluid blockchain and are publicly visible. This is inherent to blockchain technology and cannot be modified or deleted.</p>

        <h2 className="text-lg font-bold text-slate-900 mt-8">4. Cookies</h2>
        <p>We use a JWT token stored in localStorage for session management. We do not use tracking cookies or third-party analytics.</p>

        <h2 className="text-lg font-bold text-slate-900 mt-8">5. Contact</h2>
        <p>For privacy-related questions, reach out to the CricCall team via the Entangled Hackathon channels.</p>
      </div>
    </div>
  );
}
