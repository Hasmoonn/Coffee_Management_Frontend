"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const data = await apiFetch<any>("/auth/login", {
        method: "POST",
        body: { email, password },
      });

      // Store tokens — apiFetch already unwraps json.data, so payload is flat
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
      }
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="w-full max-w-[420px]"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Back to home — desktop */}
      <Link
        href="/"
        className="hidden lg:inline-flex items-center gap-2 text-[var(--color-on-surface-variant)] font-label text-xs tracking-widest uppercase hover:text-[var(--color-secondary)] transition-colors mb-6"
      >
        <span className="text-lg leading-none">←</span> Back to Home
      </Link>

      {/* Header */}
      <div className="mb-10">
        <motion.div
          className="flex items-center gap-3 mb-6"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="w-10 h-[2px] bg-[var(--color-secondary)]" />
          <span className="font-label text-xs tracking-[0.25em] uppercase text-[var(--color-secondary)]">
            Welcome Back
          </span>
        </motion.div>

        <motion.h1
          className="font-heading text-3xl sm:text-4xl md:text-5xl font-medium text-[var(--color-on-background)] mb-3 leading-tight"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          Sign In
        </motion.h1>
        <motion.p
          className="text-[var(--color-on-surface-variant)] font-body text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Access your loyalty rewards, orders &amp; reservations.
        </motion.p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Email */}
        <motion.div
          className="flex flex-col gap-2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <label
            htmlFor="login-email"
            className={`font-label text-xs tracking-widest uppercase transition-colors duration-200 ${
              focusedField === "email"
                ? "text-[var(--color-secondary)]"
                : "text-[var(--color-on-surface-variant)]"
            }`}
          >
            Email Address
          </label>
          <div className="relative">
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              required
              autoComplete="email"
              placeholder="hello@example.com"
              className={`w-full bg-[var(--color-surface-container)] border rounded-xl px-4 py-3.5 text-[var(--color-on-surface)] font-body text-sm placeholder:text-[var(--color-on-surface-variant)]/40 outline-none transition-all duration-200 ${
                focusedField === "email"
                  ? "border-[var(--color-secondary)] shadow-[0_0_0_3px_rgba(196,168,130,0.12)]"
                  : "border-[var(--color-outline-variant)]"
              }`}
            />
          </div>
        </motion.div>

        {/* Password */}
        <motion.div
          className="flex flex-col gap-2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <label
              htmlFor="login-password"
              className={`font-label text-xs tracking-widest uppercase transition-colors duration-200 ${
                focusedField === "password"
                  ? "text-[var(--color-secondary)]"
                  : "text-[var(--color-on-surface-variant)]"
              }`}
            >
              Password
            </label>
            <Link
              href="/auth/forgot-password"
              className="font-label text-xs text-[var(--color-secondary)] hover:brightness-110 transition-all"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className={`w-full bg-[var(--color-surface-container)] border rounded-xl px-4 py-3.5 pr-12 text-[var(--color-on-surface)] font-body text-sm placeholder:text-[var(--color-on-surface-variant)]/40 outline-none transition-all duration-200 ${
                focusedField === "password"
                  ? "border-[var(--color-secondary)] shadow-[0_0_0_3px_rgba(196,168,130,0.12)]"
                  : "border-[var(--color-outline-variant)]"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-secondary)] transition-colors p-1"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </motion.div>

        {/* Error / Success */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
            >
              <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-red-400 font-body text-sm">{error}</p>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3"
            >
              <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
              <p className="text-emerald-400 font-body text-sm">Welcome back! Redirecting...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={isLoading || success}
          className="group relative mt-2 w-full flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-gradient-to-b from-[var(--color-secondary)] to-[#b89060] text-[#1a120b] font-label font-bold uppercase tracking-[0.2em] text-xs shadow-[0_8px_32px_rgba(196,168,130,0.25),inset_0_1px_0_rgba(255,255,255,0.5)] hover:shadow-[0_12px_48px_rgba(196,168,130,0.4)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : success ? (
            <CheckCircle2 size={18} />
          ) : (
            <>
              Sign In
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
            </>
          )}
        </motion.button>

        {/* Divider */}
        <motion.div
          className="flex items-center gap-4 my-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.42 }}
        >
          <div className="flex-1 h-px bg-[var(--color-outline-variant)]" />
          <span className="font-label text-xs text-[var(--color-on-surface-variant)]/50 tracking-widest uppercase">
            or
          </span>
          <div className="flex-1 h-px bg-[var(--color-outline-variant)]" />
        </motion.div>

        {/* Register link */}
        <motion.p
          className="text-center font-body text-sm text-[var(--color-on-surface-variant)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          New to Brew &amp; Co?{" "}
          <Link
            href="/auth/register"
            className="text-[var(--color-secondary)] font-semibold hover:brightness-110 transition-all underline-offset-2 hover:underline"
          >
            Create an account
          </Link>
        </motion.p>
      </form>

      {/* Decorative quote */}
      <motion.p
        className="mt-12 font-heading italic text-[var(--color-on-surface-variant)]/30 text-sm text-center leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        &ldquo;Every cup tells a story.&rdquo;
      </motion.p>
    </motion.div>
  );
}
