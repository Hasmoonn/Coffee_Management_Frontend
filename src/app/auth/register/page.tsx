"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, ArrowRight, AlertCircle, CheckCircle2, User, Mail, Phone, Lock } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface FormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface FieldConfig {
  id: keyof FormData;
  label: string;
  type: string;
  placeholder: string;
  icon: React.ElementType;
  autoComplete: string;
  required: boolean;
}

const FIELDS: FieldConfig[] = [
  { id: "name", label: "Full Name", type: "text", placeholder: "Jane Smith", icon: User, autoComplete: "name", required: true },
  { id: "email", label: "Email Address", type: "email", placeholder: "hello@example.com", icon: Mail, autoComplete: "email", required: true },
  { id: "phone", label: "Phone (optional)", type: "tel", placeholder: "+94123456789", icon: Phone, autoComplete: "tel", required: false },
];

// Must match backend regex exactly: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/
const BACKEND_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ chars", ok: password.length >= 8 },
    { label: "Uppercase", ok: /[A-Z]/.test(password) },
    { label: "Number", ok: /[0-9]/.test(password) },
    { label: "Symbol (@$!%*?&)", ok: /[@$!%*?&]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e"];
  const labels = ["Weak", "Fair", "Good", "Strong"];

  if (!password) 
    return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-2"
    >
      <div className="flex gap-1.5 mb-2">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="flex-1 h-1 rounded-full"
            style={{
              backgroundColor: i < score ? colors[score - 1] : "var(--color-outline-variant)",
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: i * 0.05 }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="font-label text-xs" style={{ color: score > 0 ? colors[score - 1] : "var(--color-on-surface-variant)" }}>
          {score > 0 ? labels[score - 1] : ""}
        </span>
        <div className="flex gap-3">
          {checks.map((c) => (
            <span
              key={c.label}
              className={`font-label text-[10px] transition-colors ${c.ok ? "text-[var(--color-secondary)]" : "text-[var(--color-on-surface-variant)]/40"}`}
            >
              {c.ok ? "✓" : "·"} {c.label}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  const updateField = (key: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!BACKEND_PASSWORD_REGEX.test(formData.password)) {
      setError("Password must contain uppercase, lowercase, a number, and a special character (@$!%*?&).");
      return;
    }
    if (!agreed) {
      setError("Please agree to the Terms of Service to continue.");
      return;
    }

    setIsLoading(true);
    try {
      const body: Record<string, string> = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      };
      if (formData.phone) body.phone = formData.phone;

      const data = await apiFetch<any>("/auth/register", {
        method: "POST",
        body,
      });

      if (data.data?.accessToken) {
        localStorage.setItem("accessToken", data.data.accessToken);
      }
      if (data.data?.refreshToken) {
        localStorage.setItem("refreshToken", data.data.refreshToken);
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="w-full max-w-[440px] pt-65 pb-6"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Back to home — desktop */}
      <Link
        href="/"
        className="hidden lg:inline-flex items-center gap-2 text-[var(--color-on-surface-variant)] font-label text-xs tracking-widest uppercase hover:text-[var(--color-secondary)] transition-colors mb-10 mt-24"
      >
        <span className="text-lg leading-none">←</span> Back to Home
      </Link>

      {/* Header */}
      <div className="mb-8">
        <motion.div
          className="flex items-center gap-3 mb-5"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="w-10 h-[2px] bg-[var(--color-secondary)]" />
          <span className="font-label text-xs tracking-[0.25em] uppercase text-[var(--color-secondary)]">
            Join Our Community
          </span>
        </motion.div>

        <motion.h1
          className="font-heading text-4xl md:text-5xl font-medium text-[var(--color-on-background)] mb-3 leading-tight"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          Create Account
        </motion.h1>
        <motion.p
          className="text-[var(--color-on-surface-variant)] font-body text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Earn loyalty points, book tables &amp; order your favourites.
        </motion.p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Text fields */}
        {FIELDS.map((field, i) => (
          <motion.div
            key={field.id}
            className="flex flex-col gap-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 + i * 0.06 }}
          >
            <label
              htmlFor={`reg-${field.id}`}
              className={`font-label text-xs tracking-widest uppercase transition-colors duration-200 ${
                focusedField === field.id
                  ? "text-[var(--color-secondary)]"
                  : "text-[var(--color-on-surface-variant)]"
              }`}
            >
              {field.label}
            </label>
            <div className="relative">
              <field.icon
                size={15}
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                  focusedField === field.id ? "text-[var(--color-secondary)]" : "text-[var(--color-on-surface-variant)]/50"
                }`}
              />
              <input
                id={`reg-${field.id}`}
                type={field.type}
                value={formData[field.id]}
                onChange={(e) => updateField(field.id, e.target.value)}
                onFocus={() => setFocusedField(field.id)}
                onBlur={() => setFocusedField(null)}
                required={field.required}
                autoComplete={field.autoComplete}
                placeholder={field.placeholder}
                className={`w-full bg-[var(--color-surface-container)] border rounded-xl pl-10 pr-4 py-3.5 text-[var(--color-on-surface)] font-body text-sm placeholder:text-[var(--color-on-surface-variant)]/40 outline-none transition-all duration-200 ${
                  focusedField === field.id
                    ? "border-[var(--color-secondary)] shadow-[0_0_0_3px_rgba(196,168,130,0.12)]"
                    : "border-[var(--color-outline-variant)]"
                }`}
              />
            </div>
          </motion.div>
        ))}

        {/* Password */}
        <motion.div
          className="flex flex-col gap-2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
        >
          <label
            htmlFor="reg-password"
            className={`font-label text-xs tracking-widest uppercase transition-colors duration-200 ${
              focusedField === "password" ? "text-[var(--color-secondary)]" : "text-[var(--color-on-surface-variant)]"
            }`}
          >
            Password
          </label>
          <div className="relative">
            <Lock
              size={15}
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                focusedField === "password" ? "text-[var(--color-secondary)]" : "text-[var(--color-on-surface-variant)]/50"
              }`}
            />
            <input
              id="reg-password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => updateField("password", e.target.value)}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              required
              autoComplete="new-password"
              placeholder="••••••••"
              className={`w-full bg-[var(--color-surface-container)] border rounded-xl pl-10 pr-12 py-3.5 text-[var(--color-on-surface)] font-body text-sm placeholder:text-[var(--color-on-surface-variant)]/40 outline-none transition-all duration-200 ${
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
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <AnimatePresence>
            {formData.password && <PasswordStrength password={formData.password} />}
          </AnimatePresence>
          {/* Hint for allowed special characters */}
          <p className="font-label text-[10px] text-[var(--color-on-surface-variant)]/40 tracking-wide">
            Allowed symbols: @ $ ! % * ? &amp;
          </p>
        </motion.div>

        {/* Confirm Password */}
        <motion.div
          className="flex flex-col gap-2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.46 }}
        >
          <label
            htmlFor="reg-confirm-password"
            className={`font-label text-xs tracking-widest uppercase transition-colors duration-200 ${
              focusedField === "confirmPassword" ? "text-[var(--color-secondary)]" : "text-[var(--color-on-surface-variant)]"
            }`}
          >
            Confirm Password
          </label>
          <div className="relative">
            <Lock
              size={15}
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                focusedField === "confirmPassword" ? "text-[var(--color-secondary)]" : "text-[var(--color-on-surface-variant)]/50"
              }`}
            />
            <input
              id="reg-confirm-password"
              type={showConfirm ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => updateField("confirmPassword", e.target.value)}
              onFocus={() => setFocusedField("confirmPassword")}
              onBlur={() => setFocusedField(null)}
              required
              autoComplete="new-password"
              placeholder="••••••••"
              className={`w-full bg-[var(--color-surface-container)] border rounded-xl pl-10 pr-12 py-3.5 text-[var(--color-on-surface)] font-body text-sm placeholder:text-[var(--color-on-surface-variant)]/40 outline-none transition-all duration-200 ${
                formData.confirmPassword && formData.confirmPassword !== formData.password
                  ? "border-red-400/50"
                  : focusedField === "confirmPassword"
                  ? "border-[var(--color-secondary)] shadow-[0_0_0_3px_rgba(196,168,130,0.12)]"
                  : "border-[var(--color-outline-variant)]"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-secondary)] transition-colors p-1"
              aria-label="Toggle confirm password visibility"
            >
              {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {formData.confirmPassword && formData.confirmPassword !== formData.password && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 font-label text-[11px] tracking-wide"
            >
              Passwords do not match
            </motion.p>
          )}
        </motion.div>

        {/* Terms */}
        <motion.label
          htmlFor="reg-terms"
          className="flex items-start gap-3 cursor-pointer mt-1 group"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="relative mt-0.5 flex-shrink-0">
            <input
              id="reg-terms"
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`w-4.5 h-4.5 rounded border transition-all duration-200 flex items-center justify-center ${
                agreed
                  ? "bg-[var(--color-secondary)] border-[var(--color-secondary)]"
                  : "bg-[var(--color-surface-container)] border-[var(--color-outline-variant)] group-hover:border-[var(--color-secondary)]"
              }`}
              style={{ width: 18, height: 18 }}
            >
              {agreed && (
                <motion.svg
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  width="10"
                  height="8"
                  viewBox="0 0 10 8"
                  fill="none"
                >
                  <path d="M1 4L3.5 6.5L9 1" stroke="#1a120b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </motion.svg>
              )}
            </div>
          </div>
          <p className="text-[var(--color-on-surface-variant)] font-body text-xs leading-relaxed">
            I agree to Brew &amp; Co.&apos;s{" "}
            <Link href="#terms" className="text-[var(--color-secondary)] hover:brightness-110">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#privacy" className="text-[var(--color-secondary)] hover:brightness-110">
              Privacy Policy
            </Link>
          </p>
        </motion.label>

        {/* Error / Success */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
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
              <p className="text-emerald-400 font-body text-sm">
                Account created! Welcome to Brew &amp; Co. ☕
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={isLoading || success}
          className="group relative mt-1 w-full flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-gradient-to-b from-[var(--color-secondary)] to-[#b89060] text-[#1a120b] font-label font-bold uppercase tracking-[0.2em] text-xs shadow-[0_8px_32px_rgba(196,168,130,0.25),inset_0_1px_0_rgba(255,255,255,0.5)] hover:shadow-[0_12px_48px_rgba(196,168,130,0.4)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.56 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : success ? (
            <CheckCircle2 size={18} />
          ) : (
            <>
              Create Account
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
            </>
          )}
        </motion.button>

        {/* Divider */}
        <motion.div
          className="flex items-center gap-4 my-0.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex-1 h-px bg-[var(--color-outline-variant)]" />
          <span className="font-label text-xs text-[var(--color-on-surface-variant)]/50 tracking-widest uppercase">or</span>
          <div className="flex-1 h-px bg-[var(--color-outline-variant)]" />
        </motion.div>

        {/* Login link */}
        <motion.p
          className="text-center font-body text-sm text-[var(--color-on-surface-variant)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.63 }}
        >
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-[var(--color-secondary)] font-semibold hover:brightness-110 transition-all underline-offset-2 hover:underline"
          >
            Sign in
          </Link>
        </motion.p>
      </form>

      {/* Decorative quote */}
      <motion.p
        className="mt-10 font-heading italic text-[var(--color-on-surface-variant)]/30 text-sm text-center leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        &ldquo;From the farmer to the cup — every drop matters.&rdquo;
      </motion.p>
    </motion.div>
  );
}
