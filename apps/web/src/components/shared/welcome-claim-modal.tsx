"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Loader2, Check, X, Coins } from "lucide-react";
import { useClaimDaily, useCanClaim, useCallBalance, formatCallBalance } from "@/hooks/use-contracts";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

export function WelcomeClaimModal() {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const { claim, isPending, isConfirming, isSuccess, error } = useClaimDaily();
  const { canClaim } = useCanClaim();
  const { data: onChainBalance, refetch: refetchBalance } = useCallBalance();
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Show modal when authenticated user has 0 balance and can claim
  useEffect(() => {
    if (!isAuthenticated || !user || dismissed) return;

    const cachedBalance = Number(user.cachedCallBalance || 0);
    const chainBalance = onChainBalance ? Number(formatCallBalance(onChainBalance as bigint)) : null;
    const effectiveBalance = chainBalance ?? cachedBalance;

    if (effectiveBalance === 0 && canClaim) {
      // Small delay so it doesn't flash during page load
      const timer = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, canClaim, onChainBalance, dismissed]);

  // After successful claim, sync and close
  useEffect(() => {
    if (isSuccess) {
      api.syncBalance().then(() => refreshUser()).catch(() => {});
      refetchBalance();
      const timer = setTimeout(() => {
        setOpen(false);
        setDismissed(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, refreshUser, refetchBalance]);

  const handleDismiss = () => {
    setOpen(false);
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-100 transition-colors z-10"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>

            {/* Header illustration */}
            <div className="bg-gradient-to-br from-emerald-600 to-green-700 px-6 pt-8 pb-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm"
              >
                <Gift className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="text-xl font-black text-white mb-1">
                Welcome to CricCall!
              </h2>
              <p className="text-emerald-100 text-sm">
                Claim your free daily tokens to start predicting
              </p>
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              <div className="bg-emerald-50 rounded-xl p-4 mb-5 border border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Coins className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-black text-emerald-900">100 CALL Tokens</p>
                    <p className="text-xs text-emerald-600">Free every 24 hours — no cost, ever</p>
                  </div>
                </div>
              </div>

              {isSuccess ? (
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="text-center py-2"
                >
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Check className="w-6 h-6 text-emerald-600" />
                  </div>
                  <p className="font-black text-emerald-700 text-lg">Tokens Claimed!</p>
                  <p className="text-sm text-slate-500 mt-1">You're ready to make your first prediction</p>
                </motion.div>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => claim()}
                    disabled={isPending || isConfirming}
                    className="w-full py-3.5 bg-emerald-600 text-white font-bold rounded-xl text-sm hover:bg-emerald-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {isPending ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Confirm in Wallet...</>
                    ) : isConfirming ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Confirming on Chain...</>
                    ) : (
                      "Claim 100 Free CALL"
                    )}
                  </motion.button>
                  {error && (
                    <p className="text-xs text-red-500 mt-2 text-center">
                      {error.message?.includes("user rejected")
                        ? "Transaction rejected. Try again."
                        : "Claim failed. Try again or claim from your Profile."}
                    </p>
                  )}
                  <button
                    onClick={handleDismiss}
                    className="w-full text-center text-xs text-slate-400 hover:text-slate-600 mt-3 py-1 transition-colors"
                  >
                    Skip for now
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
