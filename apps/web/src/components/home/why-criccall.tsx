"use client";

import { motion } from "framer-motion";
import { Shield, Eye, Coins, Smartphone, Zap } from "lucide-react";

const features = [
  {
    icon: Coins,
    title: "Free to play",
    description: "100 CALL tokens free daily. No purchase required.",
  },
  {
    icon: Zap,
    title: "Win real money",
    description: "PKR prizes every match. Funded by brands, not users.",
  },
  {
    icon: Shield,
    title: "Shariah compliant",
    description: "Zero gambling. Two-token architecture — halal by design.",
  },
  {
    icon: Eye,
    title: "Fully transparent",
    description: "Every transaction on-chain. Verifiable on WireScan.",
  },
  {
    icon: Smartphone,
    title: "Built on WireFluid",
    description: "$0.01 gas. 5-second finality. Fiat off-ramp to JazzCash.",
  },
];

export function WhyCricCall() {
  return (
    <section className="py-16">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center text-2xl md:text-3xl font-bold text-slate-900 mb-12"
      >
        Why CricCall
      </motion.h2>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-5xl mx-auto">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -3 }}
            className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow text-center"
          >
            <feature.icon className="w-6 h-6 mx-auto mb-3 text-green-600" />
            <p className="text-sm font-semibold text-slate-900 mb-1">{feature.title}</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
