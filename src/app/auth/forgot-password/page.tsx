"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Loader2, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSuccess(true);
    setIsLoading(false);
  };

  return (
    <motion.div
      className="w-full max-w-[420px]"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href="/auth/login"
        className="inline-flex items-center gap-2 text-[var(--color-on-surface-variant)] font-label text-xs tracking-widest uppercase hover:text-[var(--color-secondary)] transition-colors mb-12"
      >
        <ArrowLeft size={14} /> Back to Sign In
      </Link>

      <div className="mb-10">
        <h1 className="font-heading text-4xl font-medium text-[var(--color-on-background)] mb-3">
          Reset Password
        </h1>
        <p className="text-[var(--color-on-surface-variant)] font-body text-base">
          Enter your email and we&apos;ll send you instructions to reset your password.
        </p>
      </div>

      {!success ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-label text-xs tracking-widest uppercase text-[var(--color-on-surface-variant)]">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="hello@example.com"
                className="w-full bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] rounded-xl px-4 py-3.5 text-[var(--color-on-surface)] font-body text-sm outline-none focus:border-[var(--color-secondary)] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[var(--color-secondary)] text-[#1a120b] font-label font-bold uppercase tracking-[0.2em] text-xs shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Send Instructions"}
          </button>
        </form>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center"
        >
          <CheckCircle2 size={48} className="mx-auto text-emerald-400 mb-4" />
          <h2 className="font-heading text-2xl text-white mb-2">Check your email</h2>
          <p className="text-emerald-400/80 text-sm mb-6">
            We&apos;ve sent password reset instructions to <strong>{email}</strong>.
          </p>
          <Link
            href="/auth/login"
            className="text-[var(--color-secondary)] font-label text-xs uppercase tracking-widest hover:underline"
          >
            Return to Login
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
}
