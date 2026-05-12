"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

// Animated steam path component
function SteamPath({ d, delay }: { d: string; delay: number }) {
  return (
    <motion.path
      d={d}
      stroke="rgba(196,168,130,0.5)"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
      style={{ filter: "blur(1.5px)" }}
      initial={{ pathLength: 0, opacity: 0, y: 0 }}
      animate={{
        pathLength: [0, 1, 1],
        opacity: [0, 0.7, 0],
        y: [0, -20, -50],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    />
  );
}

// Deterministic bean configs
const BEANS = [
  { left: "15%", bottom: "20%", duration: 6.2, delay: 0 },
  { left: "35%", bottom: "35%", duration: 5.4, delay: 1.8 },
  { left: "55%", bottom: "15%", duration: 7.0, delay: 0.9 },
  { left: "75%", bottom: "45%", duration: 5.8, delay: 3.1 },
  { left: "20%", bottom: "60%", duration: 6.6, delay: 2.4 },
  { left: "80%", bottom: "25%", duration: 4.8, delay: 1.2 },
];

function CoffeeBean({ style, duration, delay }: { style: React.CSSProperties; duration: number; delay: number }) {
  return (
    <motion.svg
      width="20"
      height="14"
      viewBox="0 0 20 14"
      fill="none"
      style={style}
      initial={{ opacity: 0, rotate: 0 }}
      animate={{ opacity: [0, 0.3, 0], rotate: 360, y: [-10, -60] }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: "easeOut",
      }}
    >
      <ellipse cx="10" cy="7" rx="9" ry="6" fill="rgba(196,168,130,0.3)" />
      <path d="M10 1 Q14 7 10 13" stroke="rgba(196,168,130,0.5)" strokeWidth="1.5" strokeLinecap="round" />
    </motion.svg>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] bg-[var(--color-background)]">
      {/* === LEFT CINEMATIC PANEL === */}
      <div className="hidden lg:flex relative h-screen sticky top-0 overflow-hidden bg-[#0e0906] flex-col items-center justify-center">
        {/* Deep gradient layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0f08] via-[#0e0906] to-[#000000]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#c4a88220] via-transparent to-transparent" />

        {/* Film grain texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundSize: "128px 128px",
          }}
        />

        {/* Radial glow behind cup */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#c4a882] opacity-[0.07] blur-[80px]" />

        {/* Floating coffee beans */}
        {BEANS.map((b, i) => (
          <CoffeeBean
            key={i}
            style={{ position: "absolute", left: b.left, bottom: b.bottom }}
            duration={b.duration}
            delay={b.delay}
          />
        ))}

        {/* Horizontal scan lines */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.4) 2px, rgba(255,255,255,0.4) 3px)",
            backgroundSize: "100% 4px",
          }}
        />

        {/* Center: Giant cinematic cup */}
        <motion.div
          className="relative z-10 flex flex-col items-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Steam */}
          <svg width="160" height="120" viewBox="0 0 160 120" className="absolute -top-20 left-1/2 -translate-x-1/2">
            <SteamPath d="M 50 120 Q 30 80 50 40 T 50 -10" delay={0} />
            <SteamPath d="M 80 120 Q 100 80 80 40 T 80 -10" delay={1.2} />
            <SteamPath d="M 110 120 Q 130 80 110 40 T 110 -10" delay={0.6} />
          </svg>

          {/* Coffee Cup SVG */}
          <svg width="200" height="240" viewBox="0 0 200 240" fill="none" className="drop-shadow-[0_0_60px_rgba(196,168,130,0.25)]">
            <motion.path
              d="M 35 70 L 165 70 L 148 200 C 148 210 138 215 120 215 L 80 215 C 62 215 52 210 52 200 Z"
              fill="url(#authCupGrad)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
            />
            <motion.path
              d="M 35 70 L 165 70 L 148 200 C 148 210 138 215 120 215 L 80 215 C 62 215 52 210 52 200 Z"
              stroke="rgba(196,168,130,0.7)"
              strokeWidth="2.5"
              strokeLinejoin="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
            <motion.path
              d="M 28 70 L 172 70 L 163 52 C 160 44 154 40 140 40 L 60 40 C 46 40 40 44 37 52 Z"
              fill="rgba(196,168,130,0.15)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            />
            <motion.path
              d="M 28 70 L 172 70 L 163 52 C 160 44 154 40 140 40 L 60 40 C 46 40 40 44 37 52 Z"
              stroke="rgba(196,168,130,0.7)"
              strokeWidth="2.5"
              strokeLinejoin="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
            />
            <motion.path
              d="M 82 40 L 82 28 C 82 20 88 16 96 16 L 104 16 C 112 16 118 20 118 28 L 118 40"
              stroke="rgba(196,168,130,0.7)"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 1.2, ease: "easeInOut" }}
            />
            <motion.path
              d="M 43 100 L 157 100"
              stroke="rgba(196,168,130,0.4)"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 1.8 }}
            />
            <motion.path
              d="M 50 155 L 150 155"
              stroke="rgba(196,168,130,0.4)"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 2 }}
            />
            <motion.text
              x="100"
              y="140"
              textAnchor="middle"
              fill="rgba(196,168,130,0.5)"
              fontSize="13"
              fontFamily="Georgia, serif"
              fontStyle="italic"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.2 }}
            >
              Brew &amp; Co.
            </motion.text>
            <defs>
              <linearGradient id="authCupGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(196,168,130,0.08)" />
                <stop offset="100%" stopColor="rgba(196,168,130,0.22)" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        {/* Bottom Brand Text */}
        <motion.div
          className="absolute bottom-14 left-0 right-0 flex flex-col items-center gap-3 z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.5 }}
        >
          <Link href="/" className="font-heading italic text-4xl text-[#c4a882]" style={{ letterSpacing: "-0.02em" }}>
            Brew &amp; Co.
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-px bg-[#c4a882]/40" />
            <p className="text-[#c4a882]/50 text-xs font-label tracking-[0.25em] uppercase">
              Experience the Perfect Pour
            </p>
            <div className="w-8 h-px bg-[#c4a882]/40" />
          </div>
        </motion.div>

        <div className="absolute top-8 left-8 w-10 h-10 border-t border-l border-[#c4a882]/20" />
        <div className="absolute bottom-8 right-8 w-10 h-10 border-b border-r border-[#c4a882]/20" />
      </div>

      {/* === RIGHT FORM PANEL === */}
      <div className="flex flex-col min-h-screen bg-[var(--color-background)] relative z-20">
        {/* Mobile brand header */}
        <div className="lg:hidden flex-shrink-0 flex items-center justify-between px-6 py-5 border-b border-[var(--color-outline-variant)]">
          <Link href="/" className="font-heading italic text-2xl text-[var(--color-secondary)]">
            Brew &amp; Co.
          </Link>
          <Link href="/" className="text-[var(--color-on-surface-variant)] font-label text-xs tracking-widest uppercase hover:text-[var(--color-secondary)] transition-colors">
            ← Home
          </Link>
        </div>

        {/* Form content */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 md:px-16">
          {children}
        </div>

        {/* Mobile Footer */}
        <div className="flex-shrink-0 px-6 py-8 text-center lg:hidden">
          <p suppressHydrationWarning className="text-[var(--color-on-surface-variant)] font-label text-xs tracking-wider opacity-60">
            &copy; {new Date().getFullYear()} Brew &amp; Co. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
