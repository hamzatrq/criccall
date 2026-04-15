import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-green-950 text-white pt-16 pb-6 hidden md:block">
      <div className="max-w-7xl mx-auto px-8 pb-12 border-b border-emerald-800 flex flex-col md:flex-row justify-between items-center gap-12">
        <div className="flex items-center gap-3">
          <Image src="/icon.png" alt="CricCall" width={36} height={36} className="rounded-xl" />
          <span className="text-2xl font-[family-name:var(--font-brand)]">CRICALL</span>
        </div>
        <p className="text-emerald-300 font-medium text-sm">
          Built for Entangled Hackathon · April 2026 · Powered by WireFluid
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 flex flex-col md:flex-row justify-between items-center text-sm text-emerald-200">
        <p>© 2026 CricCall. Shariah-Compliant Cricket Predictions.</p>
        <div className="flex gap-8 mt-4 md:mt-0">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="/responsible-play" className="hover:text-white transition-colors">Responsible Play</Link>
        </div>
      </div>
    </footer>
  );
}
