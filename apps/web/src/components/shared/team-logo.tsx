"use client";

import Image from "next/image";
import { getTeamFlag, getTeamLogo, hasTeamLogo } from "@/lib/utils";

interface TeamLogoProps {
  shortName: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: { container: "w-8 h-8", img: 32 },
  md: { container: "w-12 h-12", img: 48 },
  lg: { container: "w-16 h-16", img: 64 },
  xl: { container: "w-20 h-20", img: 80 },
};

export function TeamLogo({ shortName, size = "md", className = "" }: TeamLogoProps) {
  const s = sizeMap[size];
  const logo = getTeamLogo(shortName);
  const flag = getTeamFlag(shortName);

  if (logo) {
    return (
      <div className={`${s.container} rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden ${className}`}>
        <Image
          src={logo}
          alt={shortName}
          width={s.img}
          height={s.img}
          className="object-contain p-1"
        />
      </div>
    );
  }

  if (flag) {
    return (
      <div className={`${s.container} rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center ${className}`}>
        <span className={size === "xl" ? "text-4xl" : size === "lg" ? "text-3xl" : size === "md" ? "text-2xl" : "text-lg"}>
          {flag}
        </span>
      </div>
    );
  }

  // Fallback: text abbreviation
  return (
    <div className={`${s.container} rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center ${className}`}>
      <span className="text-xs font-black text-emerald-700">{shortName?.slice(0, 3)}</span>
    </div>
  );
}
