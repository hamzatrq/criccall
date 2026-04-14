"use client";

import { motion } from "framer-motion";
import { Download, Target, Trophy } from "lucide-react";

const steps = [
  {
    icon: Download,
    title: "CLAIM",
    description: "Get 100 free CALL tokens daily",
    color: "#16A34A",
    detail: "Tap once, tokens are yours",
  },
  {
    icon: Target,
    title: "PREDICT",
    description: "Bet your CALL on YES or NO",
    color: "#2563EB",
    detail: "Put your cricket knowledge on the line",
  },
  {
    icon: Trophy,
    title: "WIN",
    description: "Win CALL + real PKR prizes",
    color: "#D97706",
    detail: "Right call? You earn from the losers' pool + sponsor prizes",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center text-2xl md:text-3xl font-bold text-slate-900 mb-12"
      >
        How It Works
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            whileHover={{ y: -5 }}
            className="relative p-6 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow text-center group"
          >
            {/* Step number */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 shadow-sm">
              {i + 1}
            </div>

            {/* Icon */}
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: step.color + "15" }}
            >
              <step.icon
                className="w-8 h-8"
                style={{ color: step.color }}
              />
            </motion.div>

            <h3
              className="text-lg font-bold uppercase tracking-wider mb-2"
              style={{ color: step.color }}
            >
              {step.title}
            </h3>
            <p className="text-sm text-slate-900 font-medium mb-1">
              {step.description}
            </p>
            <p className="text-xs text-slate-500">{step.detail}</p>

            {/* Connector line (desktop) */}
            {i < steps.length - 1 && (
              <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-px bg-slate-200" />
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
