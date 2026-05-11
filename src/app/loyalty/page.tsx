// app/loyalty/page.tsx
"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  Crown, Coffee, Gift, Zap, Heart, Award, ChevronRight, Check,
  Sparkles, TrendingUp, Users, Clock, Gem, Shield, PartyPopper,
  Loader2, AlertCircle, CheckCircle2, Lock,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { isLoggedIn } from "@/lib/auth";
import {
  useAvailableRewards,
  useMyPoints,
  useRedeemReward,
} from "@/hooks/useLoyalty";
import type { BackendReward } from "@/types/loyalty";

/* ─── Types ─────────────────────────────────────────────────────────── */
interface Tier {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  minPoints: number;
  maxPoints: number | null;
  perks: string[];
  multiplier: string;
  badge: string;
}

interface HowItWorksStep {
  step: number;
  title: string;
  desc: string;
  icon: React.ElementType;
}

/* UI metadata to enrich backend rewards */
interface RewardUIMeta {
  category: string;
  image: string;
  popular?: boolean;
  limited?: boolean;
}

const REWARD_UI_META: Record<string, RewardUIMeta> = {
  "free-coffee": {
    category: "Drinks",
    image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&h=400&fit=crop",
    popular: true,
  },
  "discount-20": {
    category: "Boosts",
    image: "https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=400&h=400&fit=crop",
  },
  "discount-50": {
    category: "Boosts",
    image: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400&h=400&fit=crop",
    popular: true,
  },
  "free-meal": {
    category: "Food",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop",
    limited: true,
  },
};

const DEFAULT_REWARD_META: RewardUIMeta = {
  category: "Rewards",
  image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop",
};

/* ─── Static data (tiers, how-it-works, stats) ─────────────────────── */
const TIERS: Tier[] = [
  { id: "seed", name: "Seed", icon: Coffee, color: "#8B7355", minPoints: 0, maxPoints: 249,
    perks: ["1 point per Rs. 100 spent", "Birthday free drink", "Member-only newsletter", "Early access to seasonal menus"],
    multiplier: "1x", badge: "🌱" },
  { id: "bloom", name: "Bloom", icon: Heart, color: "#C4A882", minPoints: 250, maxPoints: 749,
    perks: ["1.5x points on every order", "Free size upgrade on any drink", "Monthly surprise reward", "Priority seating reservations", "All Seed perks included"],
    multiplier: "1.5x", badge: "🌸" },
  { id: "roast", name: "Roast", icon: Zap, color: "#D4A574", minPoints: 750, maxPoints: 1499,
    perks: ["2x points on every order", "Free pastry with every 3rd drink", "Exclusive roastery tour access", "Personalized drink recommendations", "Free birthday meal for two", "All Bloom perks included"],
    multiplier: "2x", badge: "🔥" },
  { id: "master", name: "Master", icon: Crown, color: "#FFD700", minPoints: 1500, maxPoints: null,
    perks: ["3x points on every order", "Unlimited free size upgrades", "Private tasting events invitation", "Custom blend creation session", "Complimentary drink every week", "Dedicated concierge barista", "Annual gift box shipped to you", "All Roast perks included"],
    multiplier: "3x", badge: "👑" },
];

const HOW_IT_WORKS: HowItWorksStep[] = [
  { step: 1, title: "Join for Free", desc: "Sign up in 30 seconds. No credit card. Start earning from your very first sip.", icon: Users },
  { step: 2, title: "Earn Points", desc: "Every rupee you spend earns points. Higher tiers unlock bonus multipliers.", icon: TrendingUp },
  { step: 3, title: "Unlock Rewards", desc: "Redeem your points for free drinks, exclusive experiences, and curated merchandise.", icon: Gift },
  { step: 4, title: "Rise Through Tiers", desc: "The more you brew with us, the more exclusive your benefits become.", icon: Crown },
];

const STATS = [
  { value: "12K+", label: "Active Members" },
  { value: "2.4M", label: "Points Redeemed" },
  { value: "98%", label: "Member Satisfaction" },
  { value: "47", label: "Exclusive Rewards" },
];

/* ─── Helpers ───────────────────────────────────────────────────────── */
function getCurrentTier(points: number): Tier {
  return (
    TIERS.find(
      (t) =>
        points >= t.minPoints &&
        (t.maxPoints === null || points <= t.maxPoints)
    ) ?? TIERS[0]
  );
}

/* ─── Page Component ────────────────────────────────────────────────── */
export default function LoyaltyPage() {
  const router = useRouter();

  const [activeTier, setActiveTier] = useState<string>("seed");
  const [activeRewardCategory, setActiveRewardCategory] = useState<string>("All");
  const [showAllRewards, setShowAllRewards] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  /* Auth */
  useEffect(() => {
    setLoggedIn(isLoggedIn());
    setAuthChecked(true);
  }, []);

  /* Backend hooks */
  const { rewards: backendRewards, loading: rewardsLoading, error: rewardsError } =
    useAvailableRewards();
  const { data: pointsData, loading: pointsLoading, refetch: refetchPoints } =
    useMyPoints(loggedIn);
  const { redeem, loading: redeeming } = useRedeemReward();

  /* Auto-select user's current tier when points load */
  useEffect(() => {
    if (pointsData) {
      setActiveTier(getCurrentTier(pointsData.points).id);
    }
  }, [pointsData]);

  /* Auto-dismiss toast */
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  /* Build categories from backend rewards */
  const REWARD_CATEGORIES = useMemo(() => {
    const cats = new Set<string>(["All"]);
    backendRewards.forEach((r) => {
      const meta = REWARD_UI_META[r.id] ?? DEFAULT_REWARD_META;
      cats.add(meta.category);
    });
    return Array.from(cats);
  }, [backendRewards]);

  /* Filter rewards */
  const filteredRewards = useMemo(() => {
    if (activeRewardCategory === "All") return backendRewards;
    return backendRewards.filter((r) => {
      const meta = REWARD_UI_META[r.id] ?? DEFAULT_REWARD_META;
      return meta.category === activeRewardCategory;
    });
  }, [backendRewards, activeRewardCategory]);

  const displayedRewards = showAllRewards ? filteredRewards : filteredRewards.slice(0, 6);

  /* Redeem handler */
  const handleRedeem = async (reward: BackendReward) => {
    if (!loggedIn) {
      router.push("/auth/login?redirect=/loyalty");
      return;
    }

    if (pointsData && pointsData.points < reward.pointsRequired) {
      setToast({
        type: "error",
        msg: `You need ${reward.pointsRequired - pointsData.points} more points for ${reward.name}.`,
      });
      return;
    }

    try {
      const result = await redeem(reward.id);
      setToast({
        type: "success",
        msg: `${result.reward.name} redeemed! ${result.remainingPoints} points remaining.`,
      });
      refetchPoints();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Redemption failed";
      setToast({ type: "error", msg });
    }
  };

  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-on-background)]">
      <Navigation />

      {/* ── Hero ── */}
      <section
        ref={heroRef}
        className="relative h-[70vh] min-h-[520px] flex items-center justify-center overflow-hidden"
      >
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1920&h=1080&fit=crop"
            alt="Loyalty Program"
            className="w-full h-full object-cover scale-110"
          />
        </motion.div>

        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-black/25 to-black/45" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />

        {[20, 40, 60, 80].map((pos) => (
          <div key={pos} className="absolute top-0 bottom-0 w-px bg-white/5" style={{ left: `${pos}%` }} />
        ))}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-secondary)]/60 to-transparent" />

        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[var(--color-secondary)]/40"
            style={{ left: `${15 + i * 14}%`, top: `${20 + (i % 3) * 25}%` }}
            animate={{ y: [0, -20, 0], opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
          />
        ))}

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="flex items-center justify-center gap-4 mb-6 mt-26"
          >
            <div className="h-px w-16 bg-[var(--color-secondary)]" />
            <span className="font-label text-[var(--color-secondary)] tracking-[0.3em] uppercase text-[10px]">
              Rewards Program
            </span>
            <div className="h-px w-16 bg-[var(--color-secondary)]" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="font-heading text-4xl xs:text-5xl sm:text-6xl md:text-7xl font-medium italic text-white leading-[0.95] md:leading-[0.9] tracking-tight mb-6"
          >
            Every Sip
            <br />
            <span className="text-[var(--color-secondary)]">Rewarded</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.45 }}
            className="font-body text-white/55 text-lg max-w-lg mx-auto leading-relaxed mb-10"
          >
            Join our loyalty family and turn your daily ritual into extraordinary
            rewards. Free to join, endlessly rewarding.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            {!loggedIn ? (
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-3 px-9 py-4 rounded-full bg-[var(--color-secondary)] text-[#1a120b] font-label font-bold uppercase tracking-[0.2em] text-xs shadow-[0_10px_30px_rgba(196,168,130,0.35)] hover:brightness-105 transition-all"
                >
                  <Crown size={14} />
                  Join for Free
                </Link>
              </motion.div>
            ) : (
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="#rewards"
                  className="inline-flex items-center gap-3 px-9 py-4 rounded-full bg-[var(--color-secondary)] text-[#1a120b] font-label font-bold uppercase tracking-[0.2em] text-xs shadow-[0_10px_30px_rgba(196,168,130,0.35)] hover:brightness-105 transition-all"
                >
                  <Gift size={14} />
                  Browse Rewards
                </Link>
              </motion.div>
            )}

            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="#how-it-works"
                className="inline-flex items-center gap-3 px-9 py-4 rounded-full border border-white/15 bg-white/5 text-white font-label uppercase tracking-[0.2em] text-xs hover:bg-white/10 hover:border-white/25 transition-all backdrop-blur-sm"
              >
                Learn More
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="font-label text-white/30 text-[9px] tracking-[0.3em] uppercase">Discover</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-px h-8 bg-gradient-to-b from-[var(--color-secondary)]/60 to-transparent"
          />
        </motion.div>
      </section>

      {/* ── Member status banner (logged-in users) ── */}
      {authChecked && loggedIn && pointsData && (
        <MemberStatusBanner points={pointsData.points} stamps={pointsData.stamps} stampGoal={pointsData.stampGoal} loading={pointsLoading} />
      )}

      {/* ── Stats ── */}
      <section className="py-10 md:py-16 px-6 md:px-12 border-b border-[var(--color-outline-variant)]">
        <div className="max-w-[1300px] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="text-center"
            >
              <p className="font-heading text-4xl md:text-5xl font-medium text-[var(--color-secondary)] mb-1">
                {stat.value}
              </p>
              <p className="font-label text-[var(--color-on-surface-variant)] text-[10px] tracking-[0.25em] uppercase">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <HowItWorksSection />

      <TierSection
        activeTier={activeTier}
        setActiveTier={setActiveTier}
        userPoints={pointsData?.points ?? null}
      />

      <RewardsCatalog
        categories={REWARD_CATEGORIES}
        activeCategory={activeRewardCategory}
        setActiveCategory={setActiveRewardCategory}
        rewards={displayedRewards}
        totalCount={filteredRewards.length}
        showAll={showAllRewards}
        setShowAll={setShowAllRewards}
        loading={rewardsLoading}
        error={rewardsError}
        onRedeem={handleRedeem}
        userPoints={pointsData?.points ?? null}
        loggedIn={loggedIn}
        redeeming={redeeming}
      />

      <BenefitsSection />

      <CtaSection loggedIn={loggedIn} />

      <Footer />

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            className={`fixed bottom-8 left-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-full shadow-2xl backdrop-blur-md border ${
              toast.type === "success"
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                : "bg-red-500/15 border-red-500/40 text-red-300"
            }`}
          >
            {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="font-body text-sm">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MEMBER STATUS BANNER
═══════════════════════════════════════════════════════════════════════ */
function MemberStatusBanner({
  points,
  stamps,
  stampGoal,
  loading,
}: {
  points: number;
  stamps: number;
  stampGoal: number;
  loading: boolean;
}) {
  const tier = getCurrentTier(points);
  const nextTier = TIERS[TIERS.indexOf(tier) + 1] ?? null;
  const pointsToNext = nextTier ? nextTier.minPoints - points : 0;
  const progress = nextTier
    ? Math.min(
        100,
        ((points - tier.minPoints) / (nextTier.minPoints - tier.minPoints)) * 100
      )
    : 100;

  return (
    <section className="py-10 px-6 md:px-12 border-b border-[var(--color-outline-variant)] bg-gradient-to-b from-[var(--color-secondary)]/5 to-transparent">
      <div className="max-w-[1300px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-[var(--color-secondary)]/30 bg-[var(--color-surface-container-low)] p-5 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* Tier */}
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center border"
              style={{
                backgroundColor: `${tier.color}20`,
                borderColor: `${tier.color}40`,
              }}
            >
              <span className="text-2xl">{tier.badge}</span>
            </div>
            <div>
              <p className="font-label text-[var(--color-on-surface-variant)] text-[9px] tracking-[0.2em] uppercase mb-1">
                Your Tier
              </p>
              <p className="font-heading italic text-2xl text-[var(--color-on-surface)]">
                {tier.name}
              </p>
            </div>
          </div>

          {/* Points */}
          <div className="flex flex-col justify-center">
            <p className="font-label text-[var(--color-on-surface-variant)] text-[9px] tracking-[0.2em] uppercase mb-1">
              Points Balance
            </p>
            {loading ? (
              <Loader2 size={20} className="animate-spin text-[var(--color-secondary)]" />
            ) : (
              <p className="font-heading text-4xl font-medium text-[var(--color-secondary)]">
                {points.toLocaleString()}
              </p>
            )}
            {nextTier && (
              <p className="font-label text-[var(--color-on-surface-variant)] text-[10px] mt-1">
                {pointsToNext} pts to <span style={{ color: nextTier.color }}>{nextTier.name}</span>
              </p>
            )}
          </div>

          {/* Stamp card */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="font-label text-[var(--color-on-surface-variant)] text-[9px] tracking-[0.2em] uppercase">
                Stamp Card
              </p>
              <p className="font-label text-[var(--color-secondary)] text-[10px] font-bold tracking-wider">
                {stamps}/{stampGoal}
              </p>
            </div>
            <div className="grid grid-cols-5 xs:grid-cols-9 gap-1 mb-3">
              {[...Array(stampGoal)].map((_, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-full border ${
                    i < stamps
                      ? "bg-[var(--color-secondary)] border-[var(--color-secondary)]"
                      : "border-[var(--color-outline-variant)]"
                  } flex items-center justify-center`}
                >
                  {i < stamps && <Coffee size={8} className="text-[#1a120b]" />}
                </div>
              ))}
            </div>
            {/* Tier progress */}
            {nextTier && (
              <div className="h-1 rounded-full bg-[var(--color-outline-variant)] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full bg-[var(--color-secondary)]"
                />
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── How It Works (unchanged) ─────────────────────────────────────── */
function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 md:py-36 px-4 md:px-12">
      <div className="max-w-[1300px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-3 mb-5">
            <div className="h-px w-10 bg-[var(--color-secondary)]" />
            <span className="font-label text-[var(--color-secondary)] tracking-[0.3em] uppercase text-[10px]">
              Simple & Rewarding
            </span>
            <div className="h-px w-10 bg-[var(--color-secondary)]" />
          </div>
          <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl italic font-medium text-[var(--color-on-background)] leading-[0.95] tracking-tight">
            How It<br /><span className="text-[var(--color-secondary)]">Works</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {HOW_IT_WORKS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.12 }}
                className="group relative"
              >
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[calc(50%+36px)] w-[calc(100%-72px)] h-px">
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.3 + i * 0.15 }}
                      className="h-full bg-gradient-to-r from-[var(--color-secondary)]/40 to-[var(--color-secondary)]/10 origin-left"
                    />
                  </div>
                )}
                <div className="relative p-7 rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] hover:border-[var(--color-secondary)]/30 transition-all duration-500 overflow-hidden text-center">
                  <div className="absolute -top-4 -right-2 font-heading text-[100px] font-bold text-[var(--color-secondary)]/5 select-none leading-none">
                    {String(step.step).padStart(2, "0")}
                  </div>
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--color-secondary)]/10 border border-[var(--color-secondary)]/20 flex items-center justify-center mx-auto mb-5 group-hover:bg-[var(--color-secondary)]/20 transition-colors duration-500">
                      <Icon size={24} className="text-[var(--color-secondary)]" />
                    </div>
                    <h3 className="font-heading italic text-lg sm:text-xl text-[var(--color-on-surface)] mb-2 sm:mb-3">{step.title}</h3>
                    <p className="font-body text-[var(--color-on-surface-variant)] text-xs sm:text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Tier Section ──────────────────────────────────────────────────── */
function TierSection({
  activeTier,
  setActiveTier,
  userPoints,
}: {
  activeTier: string;
  setActiveTier: (id: string) => void;
  userPoints: number | null;
}) {
  const currentTier = TIERS.find((t) => t.id === activeTier) ?? TIERS[0];
  const usersTier = userPoints !== null ? getCurrentTier(userPoints) : null;

  return (
    <section className="py-20 md:py-36 px-4 md:px-12 bg-[var(--color-surface-container-lowest)] border-y border-[var(--color-outline-variant)]">
      <div className="max-w-[1300px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16"
        >
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-10 bg-[var(--color-secondary)]" />
              <span className="font-label text-[var(--color-secondary)] tracking-[0.25em] uppercase text-[10px]">
                Tier System
              </span>
            </div>
            <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl italic font-medium text-[var(--color-on-background)] leading-[0.95] tracking-tight">
              Rise Through<br /><span className="text-[var(--color-secondary)]">the Ranks</span>
            </h2>
          </div>
          <p className="font-body text-[var(--color-on-surface-variant)] max-w-sm leading-relaxed">
            Every purchase moves you closer to the next tier. Higher tiers unlock exclusive perks that transform your coffee experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {TIERS.map((tier, i) => {
            const isActive = activeTier === tier.id;
            const isUserTier = usersTier?.id === tier.id;
            return (
              <motion.button
                key={tier.id}
                onClick={() => setActiveTier(tier.id)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`relative p-5 rounded-2xl border text-center transition-all duration-500 overflow-hidden ${
                  isActive
                    ? "border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 shadow-[0_8px_30px_rgba(196,168,130,0.2)]"
                    : "border-[var(--color-outline-variant)] bg-[var(--color-surface-container)] hover:border-[var(--color-secondary)]/30"
                }`}
              >
                {isUserTier && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-label text-[8px] tracking-wider uppercase">
                    You
                  </span>
                )}
                <div className="relative z-10">
                  <span className="text-3xl mb-2 block">{tier.badge}</span>
                  <h4 className="font-heading italic text-lg text-[var(--color-on-surface)] mb-1">{tier.name}</h4>
                  <p className="font-label text-[10px] tracking-[0.2em] uppercase" style={{ color: tier.color }}>
                    {tier.multiplier} Points
                  </p>
                  <p className="font-label text-[var(--color-on-surface-variant)] text-[9px] tracking-wider uppercase mt-1">
                    {tier.minPoints}{tier.maxPoints ? ` – ${tier.maxPoints}` : "+"} pts
                  </p>
                </div>
                {isActive && (
                  <motion.div
                    layoutId="tierHighlight"
                    className="absolute inset-0 rounded-2xl border-2 border-[var(--color-secondary)] -z-0"
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentTier.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.45 }}
            className="rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container)] overflow-hidden"
          >
            <div
              className="relative p-8 md:p-10 overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${currentTier.color}15, transparent)` }}
            >
              <div className="absolute top-4 right-6 font-heading text-[80px] font-bold select-none leading-none opacity-[0.06]">
                {currentTier.badge}
              </div>
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center border"
                    style={{ backgroundColor: `${currentTier.color}20`, borderColor: `${currentTier.color}40` }}
                  >
                    <span className="text-3xl">{currentTier.badge}</span>
                  </div>
                  <div>
                    <h3 className="font-heading text-3xl italic font-medium text-[var(--color-on-surface)]">{currentTier.name} Tier</h3>
                    <p className="font-label text-[10px] tracking-[0.2em] uppercase mt-1" style={{ color: currentTier.color }}>
                      {currentTier.multiplier} Points Multiplier · {currentTier.minPoints}
                      {currentTier.maxPoints ? ` – ${currentTier.maxPoints}` : "+"} Points
                    </p>
                  </div>
                </div>
                <div
                  className="px-5 py-2.5 rounded-full border font-label text-xs tracking-[0.2em] uppercase font-bold"
                  style={{
                    borderColor: `${currentTier.color}40`,
                    color: currentTier.color,
                    backgroundColor: `${currentTier.color}10`,
                  }}
                >
                  {currentTier.multiplier} Earning Rate
                </div>
              </div>
            </div>

            <div className="p-8 md:p-10">
              <h4 className="font-label text-[var(--color-on-surface-variant)] text-[10px] tracking-[0.25em] uppercase mb-6">
                Included Perks
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentTier.perks.map((perk, i) => (
                  <motion.div
                    key={perk}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="flex items-start gap-3 p-4 rounded-xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-low)]"
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: `${currentTier.color}20` }}
                    >
                      <Check size={12} style={{ color: currentTier.color }} />
                    </div>
                    <p className="font-body text-[var(--color-on-surface)] text-sm">{perk}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ─── Rewards Catalog ───────────────────────────────────────────────── */
function RewardsCatalog({
  categories,
  activeCategory,
  setActiveCategory,
  rewards,
  totalCount,
  showAll,
  setShowAll,
  loading,
  error,
  onRedeem,
  userPoints,
  loggedIn,
  redeeming,
}: {
  categories: string[];
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  rewards: BackendReward[];
  totalCount: number;
  showAll: boolean;
  setShowAll: (v: boolean) => void;
  loading: boolean;
  error: string | null;
  onRedeem: (r: BackendReward) => void;
  userPoints: number | null;
  loggedIn: boolean;
  redeeming: boolean;
}) {
  return (
    <section id="rewards" className="py-28 md:py-36 px-6 md:px-12">
      <div className="max-w-[1300px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-3 mb-5">
            <div className="h-px w-10 bg-[var(--color-secondary)]" />
            <span className="font-label text-[var(--color-secondary)] tracking-[0.3em] uppercase text-[10px]">
              Spend Your Points
            </span>
            <div className="h-px w-10 bg-[var(--color-secondary)]" />
          </div>
          <h2 className="font-heading text-5xl md:text-6xl italic font-medium text-[var(--color-on-background)] leading-[0.95] tracking-tight">
            Rewards<br /><span className="text-[var(--color-secondary)]">Catalog</span>
          </h2>
        </motion.div>

        {/* Filters */}
        {!loading && !error && categories.length > 1 && (
          <div className="flex items-center gap-2 flex-wrap justify-center mb-12">
            {categories.map((cat) => (
              <motion.button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`px-5 py-2.5 rounded-full font-label text-[10px] tracking-[0.2em] uppercase transition-all duration-300 ${
                  activeCategory === cat
                    ? "bg-[var(--color-secondary)] text-[#1a120b] shadow-[0_6px_20px_rgba(196,168,130,0.3)]"
                    : "border border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] hover:border-[var(--color-secondary)]/40 hover:text-[var(--color-secondary)]"
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 size={32} className="animate-spin text-[var(--color-secondary)]" />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="max-w-md mx-auto p-6 rounded-2xl border border-red-500/30 bg-red-500/5 flex items-start gap-3">
            <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-body text-[var(--color-on-surface)] text-sm font-medium">Couldn&apos;t load rewards</p>
              <p className="font-label text-[var(--color-on-surface-variant)] text-[10px] tracking-wider mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && rewards.length === 0 && (
          <div className="text-center py-20">
            <p className="font-heading italic text-2xl text-[var(--color-on-surface-variant)]">
              No rewards available
            </p>
          </div>
        )}

        {/* Cards */}
        {!loading && !error && rewards.length > 0 && (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {rewards.map((reward, i) => (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  index={i}
                  onRedeem={onRedeem}
                  userPoints={userPoints}
                  loggedIn={loggedIn}
                  redeeming={redeeming}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {totalCount > 6 && !showAll && (
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-center mt-12">
            <motion.button
              onClick={() => setShowAll(true)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] font-label text-xs tracking-[0.2em] uppercase hover:border-[var(--color-secondary)] hover:text-[var(--color-secondary)] transition-all"
            >
              View All Rewards
              <ChevronRight size={14} />
            </motion.button>
          </motion.div>
        )}
      </div>
    </section>
  );
}

function RewardCard({
  reward,
  index,
  onRedeem,
  userPoints,
  loggedIn,
  redeeming,
}: {
  reward: BackendReward;
  index: number;
  onRedeem: (r: BackendReward) => void;
  userPoints: number | null;
  loggedIn: boolean;
  redeeming: boolean;
}) {
  const meta = REWARD_UI_META[reward.id] ?? DEFAULT_REWARD_META;
  const canAfford = userPoints !== null && userPoints >= reward.pointsRequired;
  const isLocked = loggedIn && !canAfford;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className="group relative rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] overflow-hidden hover:border-[var(--color-secondary)]/30 hover:shadow-[0_20px_60px_rgba(0,0,0,0.25)] transition-all duration-500"
    >
      <div className="relative h-48 overflow-hidden">
        <motion.img
          src={meta.image}
          alt={reward.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface-container-low)] via-black/10 to-transparent" />

        <div className="absolute top-3 left-3 flex gap-2">
          {meta.popular && (
            <span className="px-2.5 py-1 rounded-full bg-[var(--color-secondary)]/20 border border-[var(--color-secondary)]/30 text-[var(--color-secondary)] font-label text-[8px] tracking-[0.2em] uppercase backdrop-blur-md flex items-center gap-1">
              <Sparkles size={8} className="fill-current" />
              Popular
            </span>
          )}
          {meta.limited && (
            <span className="px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/25 text-red-400 font-label text-[8px] tracking-[0.2em] uppercase backdrop-blur-sm flex items-center gap-1">
              <Clock size={8} />
              Limited
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3">
          <div className="px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
            <Sparkles size={10} className="text-[var(--color-secondary)]" />
            <span className="font-label text-white text-[10px] font-bold tracking-wider">
              {reward.pointsRequired.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 xs:p-5">
        <p className="font-label text-[var(--color-secondary)] text-[8px] xs:text-[9px] tracking-[0.25em] uppercase mb-1.5">
          {meta.category}
        </p>
        <h3 className="font-heading italic text-base xs:text-lg text-[var(--color-on-surface)] leading-tight mb-2">
          {reward.name}
        </h3>
        <p className="font-body text-[var(--color-on-surface-variant)] text-xs xs:text-sm leading-relaxed mb-4 xs:mb-5">
          {reward.description}
        </p>

        <motion.button
          onClick={() => onRedeem(reward)}
          disabled={redeeming}
          whileHover={!redeeming ? { scale: 1.03 } : {}}
          whileTap={!redeeming ? { scale: 0.97 } : {}}
          className={`w-full py-3 rounded-full font-label font-bold uppercase tracking-[0.15em] text-[10px] transition-all flex items-center justify-center gap-2 ${
            redeeming
              ? "bg-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] cursor-wait"
              : isLocked
              ? "bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] hover:border-[var(--color-secondary)]/30"
              : "bg-[var(--color-secondary)] text-[#1a120b] hover:brightness-105"
          }`}
        >
          {redeeming ? (
            <>
              <Loader2 size={12} className="animate-spin" /> Processing
            </>
          ) : !loggedIn ? (
            <>
              <Lock size={12} /> Sign In to Redeem
            </>
          ) : isLocked ? (
            <>
              <Lock size={12} /> Need {(reward.pointsRequired - (userPoints ?? 0)).toLocaleString()} more
            </>
          ) : (
            <>
              <Gift size={12} /> Redeem · {reward.pointsRequired.toLocaleString()} pts
            </>
          )}
        </motion.button>
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-secondary)]/0 to-[var(--color-secondary)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-2xl" />
    </motion.div>
  );
}

/* ─── Benefits (unchanged) ──────────────────────────────────────────── */
function BenefitsSection() {
  const BENEFITS = [
    { icon: Shield, title: "Points Never Expire", desc: "Your points are yours forever. No deadlines, no pressure — redeem whenever you're ready." },
    { icon: Gem, title: "Exclusive Access", desc: "Members get first dibs on seasonal drinks, limited merchandise, and private events." },
    { icon: Gift, title: "Birthday Celebration", desc: "A complimentary drink and personalized treat waiting for you on your special day." },
    { icon: PartyPopper, title: "Member Events", desc: "Quarterly cupping sessions, latte art workshops, and roastery tours — just for members." },
    { icon: Heart, title: "Surprise Rewards", desc: "Random acts of coffee kindness. We love surprising our members with unexpected perks." },
    { icon: Award, title: "Referral Bonuses", desc: "Invite a friend and both of you earn 100 bonus points. Spread the love." },
  ];

  return (
    <section className="py-28 md:py-36 px-6 md:px-12 bg-[var(--color-surface-container-lowest)] border-y border-[var(--color-outline-variant)]">
      <div className="max-w-[1300px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-3 mb-5">
            <div className="h-px w-10 bg-[var(--color-secondary)]" />
            <span className="font-label text-[var(--color-secondary)] tracking-[0.3em] uppercase text-[10px]">
              Why Members Love Us
            </span>
            <div className="h-px w-10 bg-[var(--color-secondary)]" />
          </div>
          <h2 className="font-heading text-5xl md:text-6xl italic font-medium text-[var(--color-on-background)] leading-[0.95] tracking-tight">
            Member<br /><span className="text-[var(--color-secondary)]">Benefits</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {BENEFITS.map((benefit, i) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className="group relative p-7 rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container)] hover:border-[var(--color-secondary)]/30 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute -top-4 -right-4 font-heading text-[80px] font-bold text-[var(--color-secondary)]/5 select-none leading-none">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-secondary)]/10 border border-[var(--color-secondary)]/20 flex items-center justify-center mb-5 group-hover:bg-[var(--color-secondary)]/20 transition-colors duration-500">
                    <Icon size={22} className="text-[var(--color-secondary)]" />
                  </div>
                  <h3 className="font-heading italic text-xl text-[var(--color-on-surface)] mb-3">{benefit.title}</h3>
                  <p className="font-body text-[var(--color-on-surface-variant)] text-sm leading-relaxed">{benefit.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA ───────────────────────────────────────────────────────────── */
function CtaSection({ loggedIn }: { loggedIn: boolean }) {
  return (
    <section className="relative py-36 px-6 md:px-12 overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=1920&h=800&fit=crop"
          alt=""
          className="w-full h-full object-cover opacity-15"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-[var(--color-background)]/85 to-[var(--color-background)]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-[var(--color-secondary)]/8 blur-[100px] rounded-full" />

      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: `${20 + i * 20}%`, top: `${30 + (i % 2) * 30}%` }}
          animate={{ y: [0, -15, 0], opacity: [0.15, 0.4, 0.15] }}
          transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.6 }}
        >
          <Sparkles size={16} className="text-[var(--color-secondary)]" />
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="relative z-10 max-w-[700px] mx-auto text-center"
      >
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="h-px w-12 bg-[var(--color-secondary)]" />
          <span className="font-label text-[var(--color-secondary)] tracking-[0.3em] uppercase text-[10px]">
            {loggedIn ? "Keep Earning" : "Start Earning Today"}
          </span>
          <div className="h-px w-12 bg-[var(--color-secondary)]" />
        </div>

        <h2 className="font-heading text-4xl xs:text-5xl md:text-7xl italic font-medium text-[var(--color-on-background)] leading-[0.95] tracking-tight mb-6">
          {loggedIn ? (
            <>Order More.<br /><span className="text-[var(--color-secondary)]">Earn More.</span></>
          ) : (
            <>Your First<br /><span className="text-[var(--color-secondary)]">50 Points</span><br />Are on Us</>
          )}
        </h2>

        <p className="font-body text-[var(--color-on-surface-variant)] text-base leading-relaxed mb-10 max-w-md mx-auto">
          {loggedIn
            ? "Every order earns more points. Keep brewing with us to unlock our most exclusive rewards."
            : "Sign up today and receive 50 welcome points instantly — that's halfway to a free pastry. No strings attached."}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              href={loggedIn ? "/menu" : "/auth/register"}
              className="inline-flex items-center gap-3 px-9 py-4 rounded-full bg-[var(--color-secondary)] text-[#1a120b] font-label font-bold uppercase tracking-[0.2em] text-xs shadow-[0_10px_30px_rgba(196,168,130,0.3)] hover:brightness-105 transition-all"
            >
              {loggedIn ? <Coffee size={14} /> : <Crown size={14} />}
              {loggedIn ? "Order Now" : "Join Now — It's Free"}
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/menu"
              className="inline-flex items-center gap-3 px-9 py-4 rounded-full border border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] font-label uppercase tracking-[0.2em] text-xs hover:border-[var(--color-secondary)] hover:text-[var(--color-secondary)] transition-all"
            >
              Explore Menu
            </Link>
          </motion.div>
        </div>

        <div className="flex items-center justify-center gap-6 mt-12">
          {[
            { icon: Shield, label: "No Credit Card" },
            { icon: Clock, label: "30-Sec Signup" },
            { icon: Gift, label: "50 Free Points" },
          ].map((badge) => {
            const Icon = badge.icon;
            return (
              <div key={badge.label} className="flex items-center gap-2">
                <Icon size={13} className="text-[var(--color-secondary)]" />
                <span className="font-label text-[var(--color-on-surface-variant)] text-[9px] tracking-wider uppercase">
                  {badge.label}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}