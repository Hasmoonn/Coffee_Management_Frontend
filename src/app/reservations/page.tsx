// app/reservation/page.tsx
"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Check,
  ArrowRight,
  Coffee,
  Star,
  Sparkles,
  X,
  Phone,
  Mail,
  MessageSquare,
  Heart,
  AlertCircle,
  Loader2,
  Lock,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  useTableAvailability,
  useCreateReservation,
} from "@/hooks/useReservation";
import { isLoggedIn } from "@/lib/auth";
import type {
  BackendTable,
  BackendReservation,
} from "@/types/reservation";

/* ─── Local UI types ────────────────────────────────────────────────── */
interface ReservationFormData {
  date: Date | null;
  time: string;
  guests: number;
  seating: string; // local UI preference (window/bar/lounge/private)
  experience: string;
  tableId: string; // chosen real backend table
  name: string;
  email: string;
  phone: string;
  notes: string;
}

/* ─── Constants ─────────────────────────────────────────────────────── */
const STEPS = [
  { id: 1, label: "Date & Time", icon: Calendar },
  { id: 2, label: "Preferences", icon: Coffee },
  { id: 3, label: "Your Details", icon: Users },
  { id: 4, label: "Confirmation", icon: Check },
];

const TIME_SLOTS = [
  { time: "7:00 AM", period: "morning", available: true },
  { time: "7:30 AM", period: "morning", available: true },
  { time: "8:00 AM", period: "morning", available: true },
  { time: "8:30 AM", period: "morning", available: false },
  { time: "9:00 AM", period: "morning", available: true },
  { time: "9:30 AM", period: "morning", available: true },
  { time: "10:00 AM", period: "morning", available: true },
  { time: "10:30 AM", period: "morning", available: true },
  { time: "11:00 AM", period: "midday", available: true },
  { time: "11:30 AM", period: "midday", available: true },
  { time: "12:00 PM", period: "midday", available: false },
  { time: "12:30 PM", period: "midday", available: true },
  { time: "1:00 PM", period: "afternoon", available: true },
  { time: "1:30 PM", period: "afternoon", available: true },
  { time: "2:00 PM", period: "afternoon", available: true },
  { time: "2:30 PM", period: "afternoon", available: true },
  { time: "3:00 PM", period: "afternoon", available: true },
  { time: "3:30 PM", period: "afternoon", available: false },
  { time: "4:00 PM", period: "afternoon", available: true },
  { time: "4:30 PM", period: "afternoon", available: true },
  { time: "5:00 PM", period: "evening", available: true },
  { time: "5:30 PM", period: "evening", available: true },
  { time: "6:00 PM", period: "evening", available: true },
  { time: "6:30 PM", period: "evening", available: true },
];

// app/reservation/page.tsx

/* ── Helper: convert "2:00 PM" → "14:00" ── */
function to24Hour(time12: string): string {
  const match = time12.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return time12; // already 24h or invalid
  let [, hStr, m, period] = match;
  let h = parseInt(hStr, 10);
  if (period.toUpperCase() === "PM" && h !== 12) h += 12;
  if (period.toUpperCase() === "AM" && h === 12) 
    h = 0;
  return `${String(h).padStart(2, "0")}:${m}`;
}

const SEATING_OPTIONS = [
  {
    id: "window",
    name: "Window Seat",
    desc: "Natural light, street views, perfect for reading or people-watching.",
    icon: "🪟",
    image:
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop",
  },
  {
    id: "bar",
    name: "Bar Counter",
    desc: "Watch our baristas craft your drink up close. Best for solo visits.",
    icon: "🍸",
    image:
      "https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=400&h=300&fit=crop",
  },
  {
    id: "lounge",
    name: "Lounge Area",
    desc: "Deep sofas, warm lighting — ideal for long conversations.",
    icon: "🛋️",
    image:
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop",
  },
  {
    id: "private",
    name: "Private Room",
    desc: "Intimate space for meetings or celebrations. Fits 4-8 guests.",
    icon: "🚪",
    image:
      "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=400&h=300&fit=crop",
  },
];

const EXPERIENCES = [
  {
    id: "standard",
    name: "Standard Visit",
    desc: "Your table, your pace. Full menu access.",
    price: "Free",
    icon: Coffee,
    popular: false,
  },
  {
    id: "tasting",
    name: "Coffee Tasting Flight",
    desc: "Five single-origin pour overs with guided tasting notes from our roastmaster.",
    price: "Rs. 2,500/person",
    icon: Sparkles,
    popular: true,
  },
  {
    id: "pairing",
    name: "Coffee & Pastry Pairing",
    desc: "Three curated drink-pastry pairings selected by our chef and barista.",
    price: "Rs. 3,500/person",
    icon: Heart,
    popular: false,
  },
  {
    id: "private-tasting",
    name: "Private Roastery Tour",
    desc: "Behind-the-scenes roastery access, green bean selection, and custom roast.",
    price: "Rs. 6,000/person",
    icon: Star,
    popular: false,
  },
];

const TESTIMONIALS = [
  {
    text: "The tasting flight was extraordinary. Nuwan walked us through each origin — it felt like traveling the world through coffee.",
    name: "Anushka M.",
    role: "Food Blogger",
  },
  {
    text: "We hosted our team meeting in the private room. The ambiance was perfect and the coffee kept everyone energized and inspired.",
    name: "Dilshan K.",
    role: "Creative Director",
  },
  {
    text: "The window seat at golden hour is pure magic. I've made it my Sunday ritual — a book, a pour over, and that light.",
    name: "Sanduni L.",
    role: "Photographer",
  },
];

/* ─── Page Component ────────────────────────────────────────────────── */
export default function ReservationPage() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [reservation, setReservation] = useState<ReservationFormData>({
    date: null,
    time: "",
    guests: 2,
    seating: "",
    experience: "standard",
    tableId: "",
    name: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdReservation, setCreatedReservation] =
    useState<BackendReservation | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // Check auth on mount
  useEffect(() => {
    setLoggedIn(isLoggedIn());
    setAuthChecked(true);
  }, []);

  // Backend hooks
  const { create: createReservation, loading: submitting } =
    useCreateReservation();

  // Fetch tables when we have a date + guest count
  const isoDate = reservation.date ? reservation.date.toISOString() : undefined;
  const {
    tables,
    loading: tablesLoading,
    error: tablesError,
  } = useTableAvailability({
    date: isoDate,
    time: reservation.time ? to24Hour(reservation.time) : undefined,
    guests: reservation.guests,
  });

  /* ── Validation per step ── */
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return reservation.date !== null && reservation.time !== "";
      case 2:
        // Now requires both seating preference AND a real table to be picked
        return reservation.seating !== "" && reservation.tableId !== "";
      case 3:
        return (
          reservation.name.trim() !== "" &&
          reservation.email.trim() !== "" &&
          reservation.phone.trim() !== ""
        );
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < 4 && canProceed()) {
      setSubmitError(null);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setSubmitError(null);
      setCurrentStep((prev) => prev - 1);
    }
  };

  /* ── Submit to backend ── */
  const handleSubmit = async () => {
    if (!loggedIn) {
      router.push("/auth/login?redirect=/reservations");
      return;
    }

    if (!reservation.date || !reservation.tableId) {
      setSubmitError("Please complete all required fields.");
      return;
    }

    // Compose specialRequests payload combining seating + notes
    const seatingMeta = SEATING_OPTIONS.find(
      (s) => s.id === reservation.seating
    );
    const specialRequests = [
      seatingMeta ? `Seating: ${seatingMeta.name}` : null,
      reservation.notes ? `Notes: ${reservation.notes}` : null,
      `Contact: ${reservation.name} | ${reservation.email} | ${reservation.phone}`,
    ]
      .filter(Boolean)
      .join(" \n");

    const expMeta = EXPERIENCES.find((e) => e.id === reservation.experience);

    setSubmitError(null);
    try {
      const result = await createReservation({
        tableId: reservation.tableId,
        date: reservation.date.toISOString(),
        time: to24Hour(reservation.time),
        guests: reservation.guests,
        occasion: expMeta?.name ?? "Standard Visit",
        specialRequests,
      });
      setCreatedReservation(result);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to create reservation";
      setSubmitError(msg);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-on-background)] pt-16 md:pt-0">
      <Navigation />

      {/* ── Hero ── */}
      <section
        ref={heroRef}
        className="relative h-[60vh] min-h-[460px] flex items-center justify-center overflow-hidden"
      >
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1920&h=1080&fit=crop"
            alt="Reservation"
            fill
            className="object-cover scale-110"
            priority
            sizes="100vw"
          />
        </motion.div>

        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-black/20 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />

        {[20, 40, 60, 80].map((pos) => (
          <div
            key={pos}
            className="absolute top-0 bottom-0 w-px bg-white/5"
            style={{ left: `${pos}%` }}
          />
        ))}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-secondary)]/60 to-transparent" />

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 text-center px-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="flex items-center justify-center gap-4 mb-6 mt-16 md:mt-24"
          >
            <div className="h-px w-16 bg-[var(--color-secondary)]" />
            <span className="font-label text-[var(--color-secondary)] tracking-[0.3em] uppercase text-[10px]">
              Your Table Awaits
            </span>
            <div className="h-px w-16 bg-[var(--color-secondary)]" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="font-heading text-4xl xs:text-5xl sm:text-7xl md:text-8xl font-medium italic text-white leading-[0.95] md:leading-[0.9] tracking-tight mb-6"
          >
            Reserve
            <br />
            <span className="text-[var(--color-secondary)]">Your Seat</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.45 }}
            className="font-body text-white/55 text-lg max-w-md mx-auto leading-relaxed"
          >
            Secure your perfect spot — whether it&apos;s a quiet window corner or
            a private tasting experience.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="font-label text-white/30 text-[9px] tracking-[0.3em] uppercase">
            Book Now
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-px h-8 bg-gradient-to-b from-[var(--color-secondary)]/60 to-transparent"
          />
        </motion.div>
      </section>

      {/* ── Booking Section ── */}
      <section className="py-14 md:py-20 px-4 md:px-12">
        <div className="max-w-[1000px] mx-auto">
          {/* Auth banner */}
          {authChecked && !loggedIn && !createdReservation && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10 p-5 rounded-2xl border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/5 flex items-start md:items-center gap-4 flex-col md:flex-row"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-secondary)]/15 flex items-center justify-center flex-shrink-0">
                  <Lock size={16} className="text-[var(--color-secondary)]" />
                </div>
                <div>
                  <p className="font-heading italic text-base text-[var(--color-on-surface)]">
                    Sign in required to confirm
                  </p>
                  <p className="font-label text-[var(--color-on-surface-variant)] text-[10px] tracking-wider uppercase mt-0.5">
                    You can browse availability now — sign in at the final step.
                  </p>
                </div>
              </div>
              <Link
                href="/auth/login?redirect=/reservations"
                className="md:ml-auto px-5 py-2.5 rounded-full bg-[var(--color-secondary)] text-[#1a120b] font-label font-bold text-[10px] tracking-[0.2em] uppercase hover:brightness-105 transition-all"
              >
                Sign In
              </Link>
            </motion.div>
          )}

          {/* Step indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-2 sm:gap-4 mb-16 overflow-x-auto pb-4 no-scrollbar"
          >
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isComplete = currentStep > step.id;
              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center gap-2 relative">
                    <motion.div
                      animate={{
                        scale: isActive ? 1 : 0.9,
                        borderColor:
                          isActive || isComplete
                            ? "var(--color-secondary)"
                            : "var(--color-outline-variant)",
                      }}
                      className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                        isComplete
                          ? "bg-[var(--color-secondary)] text-[#1a120b]"
                          : isActive
                          ? "bg-[var(--color-secondary)]/15 text-[var(--color-secondary)]"
                          : "bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)]"
                      }`}
                    >
                      {isComplete ? <Check size={18} /> : <Icon size={18} />}
                    </motion.div>
                    <span
                      className={`font-label text-[9px] tracking-[0.2em] uppercase hidden md:block ${
                        isActive || isComplete
                          ? "text-[var(--color-secondary)]"
                          : "text-[var(--color-on-surface-variant)]"
                      }`}
                    >
                      {step.label}
                    </span>

                    {isActive && (
                      <motion.div
                        layoutId="activeStep"
                        className="absolute -inset-2 rounded-full border border-[var(--color-secondary)]/20 -z-10"
                      />
                    )}
                  </div>

                  {i < STEPS.length - 1 && (
                    <div className="w-8 sm:w-12 md:w-20 h-px mx-1 sm:mx-2 relative">
                      <div className="absolute inset-0 bg-[var(--color-outline-variant)]" />
                      <motion.div
                        animate={{
                          scaleX: currentStep > step.id ? 1 : 0,
                        }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 bg-[var(--color-secondary)] origin-left"
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </motion.div>

          {/* Step Content */}
          <div className="relative min-h-[500px]">
            <AnimatePresence mode="wait">
              {!createdReservation ? (
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                  {currentStep === 1 && (
                    <StepDateTime
                      reservation={reservation}
                      setReservation={setReservation}
                    />
                  )}
                  {currentStep === 2 && (
                    <StepPreferences
                      reservation={reservation}
                      setReservation={setReservation}
                      tables={tables}
                      tablesLoading={tablesLoading}
                      tablesError={tablesError}
                    />
                  )}
                  {currentStep === 3 && (
                    <StepDetails
                      reservation={reservation}
                      setReservation={setReservation}
                    />
                  )}
                  {currentStep === 4 && (
                    <StepReview
                      reservation={reservation}
                      tables={tables}
                      submitError={submitError}
                    />
                  )}
                </motion.div>
              ) : (
                <SuccessScreen
                  reservation={reservation}
                  backendReservation={createdReservation}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Nav buttons */}
          {!createdReservation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-between mt-10 pt-8 border-t border-[var(--color-outline-variant)]"
            >
              <button
                onClick={handleBack}
                disabled={currentStep === 1 || submitting}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-label text-xs tracking-[0.2em] uppercase transition-all ${
                  currentStep === 1
                    ? "opacity-30 cursor-not-allowed text-[var(--color-on-surface-variant)]"
                    : "border border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] hover:border-[var(--color-secondary)] hover:text-[var(--color-secondary)]"
                }`}
              >
                <ChevronLeft size={14} />
                Back
              </button>

              {currentStep < 4 ? (
                <motion.button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  whileHover={canProceed() ? { scale: 1.03 } : {}}
                  whileTap={canProceed() ? { scale: 0.97 } : {}}
                  className={`flex items-center gap-2 px-8 py-3.5 rounded-full font-label font-bold text-xs tracking-[0.2em] uppercase transition-all ${
                    canProceed()
                      ? "bg-[var(--color-secondary)] text-[#1a120b] shadow-[0_8px_24px_rgba(196,168,130,0.3)] hover:brightness-105"
                      : "bg-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] cursor-not-allowed opacity-50"
                  }`}
                >
                  Continue
                  <ArrowRight size={14} />
                </motion.button>
              ) : (
                <motion.button
                  onClick={handleSubmit}
                  disabled={submitting}
                  whileHover={
                    !submitting
                      ? {
                          scale: 1.03,
                          boxShadow: "0 12px 32px rgba(196,168,130,0.4)",
                        }
                      : {}
                  }
                  whileTap={!submitting ? { scale: 0.97 } : {}}
                  className={`flex items-center gap-2 px-8 py-3.5 rounded-full font-label font-bold text-xs tracking-[0.2em] uppercase transition-all ${
                    submitting
                      ? "bg-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] cursor-wait"
                      : "bg-[var(--color-secondary)] text-[#1a120b] shadow-[0_8px_24px_rgba(196,168,130,0.3)] hover:brightness-105"
                  }`}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      Confirm Reservation
                    </>
                  )}
                </motion.button>
              )}
            </motion.div>
          )}
        </div>
      </section>

      <TestimonialsStrip />
      <LocationInfo />
      <Footer />
    </main>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   STEP 1 — DATE & TIME (unchanged UI)
═══════════════════════════════════════════════════════════════════════ */
function StepDateTime({
  reservation,
  setReservation,
}: {
  reservation: ReservationFormData;
  setReservation: React.Dispatch<React.SetStateAction<ReservationFormData>>;
}) {
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const daysInMonth = new Date(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfWeek = new Date(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth(),
    1
  ).getDay();

  const monthName = calendarMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const isDateSelected = (day: number) => {
    if (!reservation.date) return false;
    return (
      reservation.date.getDate() === day &&
      reservation.date.getMonth() === calendarMonth.getMonth() &&
      reservation.date.getFullYear() === calendarMonth.getFullYear()
    );
  };

  const isDatePast = (day: number) => {
    const d = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
    return d < today;
  };

  const selectDate = (day: number) => {
    if (isDatePast(day)) return;
    // Reset table selection when date changes
    setReservation((prev) => ({
      ...prev,
      date: new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day),
      tableId: "",
    }));
  };

  const [timePeriod, setTimePeriod] = useState("morning");
  const filteredTimes = TIME_SLOTS.filter((s) => s.period === timePeriod);

  return (
    <div>
      <div className="text-center mb-10">
        <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl italic font-medium text-[var(--color-on-background)] leading-tight mb-3">
          Choose Your{" "}
          <span className="text-[var(--color-secondary)]">Date & Time</span>
        </h2>
        <p className="font-body text-[var(--color-on-surface-variant)] max-w-md mx-auto">
          Pick the perfect moment for your visit.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendar */}
        <div className="p-6 md:p-8 rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)]">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() =>
                setCalendarMonth(
                  new Date(
                    calendarMonth.getFullYear(),
                    calendarMonth.getMonth() - 1
                  )
                )
              }
              className="w-9 h-9 rounded-full border border-[var(--color-outline-variant)] flex items-center justify-center text-[var(--color-on-surface-variant)] hover:border-[var(--color-secondary)] hover:text-[var(--color-secondary)] transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <h3 className="font-heading italic text-xl text-[var(--color-on-surface)]">
              {monthName}
            </h3>
            <button
              onClick={() =>
                setCalendarMonth(
                  new Date(
                    calendarMonth.getFullYear(),
                    calendarMonth.getMonth() + 1
                  )
                )
              }
              className="w-9 h-9 rounded-full border border-[var(--color-outline-variant)] flex items-center justify-center text-[var(--color-on-surface-variant)] hover:border-[var(--color-secondary)] hover:text-[var(--color-secondary)] transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div
                key={d}
                className="text-center font-label text-[9px] tracking-widest uppercase text-[var(--color-on-surface-variant)] py-2"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {[...Array(firstDayOfWeek)].map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              const past = isDatePast(day);
              const selected = isDateSelected(day);
              const isToday =
                day === today.getDate() &&
                calendarMonth.getMonth() === today.getMonth() &&
                calendarMonth.getFullYear() === today.getFullYear();

              return (
                <button
                  key={day}
                  onClick={() => selectDate(day)}
                  disabled={past}
                  className={`relative w-full aspect-square rounded-xl flex items-center justify-center font-label text-sm transition-all duration-300 ${
                    selected
                      ? "bg-[var(--color-secondary)] text-[#1a120b] shadow-[0_4px_16px_rgba(196,168,130,0.4)]"
                      : past
                      ? "text-[var(--color-on-surface-variant)]/30 cursor-not-allowed"
                      : "text-[var(--color-on-surface)] hover:bg-[var(--color-secondary)]/10 hover:text-[var(--color-secondary)]"
                  }`}
                >
                  {day}
                  {isToday && !selected && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--color-secondary)]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time slots */}
        <div className="p-6 md:p-8 rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)]">
          <h3 className="font-heading italic text-xl text-[var(--color-on-surface)] mb-5">
            Available Times
          </h3>

          <div className="flex gap-2 mb-6 flex-wrap">
            {[
              { id: "morning", label: "Morning", icon: "☀️" },
              { id: "midday", label: "Midday", icon: "🌤️" },
              { id: "afternoon", label: "Afternoon", icon: "⛅" },
              { id: "evening", label: "Evening", icon: "🌙" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setTimePeriod(p.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-label text-[10px] tracking-[0.18em] uppercase transition-all ${
                  timePeriod === p.id
                    ? "bg-[var(--color-secondary)]/15 text-[var(--color-secondary)] border border-[var(--color-secondary)]/30"
                    : "border border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] hover:border-[var(--color-secondary)]/30"
                }`}
              >
                <span className="text-sm">{p.icon}</span>
                {p.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {filteredTimes.map((slot) => (
              <button
                key={slot.time}
                onClick={() =>
                  slot.available &&
                  setReservation((prev) => ({ ...prev, time: slot.time }))
                }
                disabled={!slot.available}
                className={`relative px-3 py-3 rounded-xl font-label text-sm transition-all duration-300 ${
                  reservation.time === slot.time
                    ? "bg-[var(--color-secondary)] text-[#1a120b] shadow-[0_4px_16px_rgba(196,168,130,0.35)]"
                    : slot.available
                    ? "border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] hover:border-[var(--color-secondary)]/40 hover:text-[var(--color-secondary)]"
                    : "border border-[var(--color-outline-variant)]/50 text-[var(--color-on-surface-variant)]/30 cursor-not-allowed line-through"
                }`}
              >
                {slot.time}
              </button>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-[var(--color-outline-variant)]">
            <h4 className="font-label text-[var(--color-on-surface-variant)] text-[10px] tracking-[0.2em] uppercase mb-4">
              Number of Guests
            </h4>
            <div className="flex items-center gap-4">
              <button
                onClick={() =>
                  setReservation((prev) => ({
                    ...prev,
                    guests: Math.max(1, prev.guests - 1),
                    tableId: "", // reset table when guest count changes
                  }))
                }
                className="w-10 h-10 rounded-full border border-[var(--color-outline-variant)] flex items-center justify-center text-[var(--color-on-surface-variant)] hover:border-[var(--color-secondary)] hover:text-[var(--color-secondary)] transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex items-center gap-2">
                <Users size={18} className="text-[var(--color-secondary)]" />
                <span className="font-heading text-3xl font-medium text-[var(--color-on-surface)] w-8 text-center">
                  {reservation.guests}
                </span>
              </div>
              <button
                onClick={() =>
                  setReservation((prev) => ({
                    ...prev,
                    guests: Math.min(12, prev.guests + 1),
                    tableId: "",
                  }))
                }
                className="w-10 h-10 rounded-full border border-[var(--color-outline-variant)] flex items-center justify-center text-[var(--color-on-surface-variant)] hover:border-[var(--color-secondary)] hover:text-[var(--color-secondary)] transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   STEP 2 — PREFERENCES + REAL TABLE PICKER
═══════════════════════════════════════════════════════════════════════ */
function StepPreferences({
  reservation,
  setReservation,
  tables,
  tablesLoading,
  tablesError,
}: {
  reservation: ReservationFormData;
  setReservation: React.Dispatch<React.SetStateAction<ReservationFormData>>;
  tables: BackendTable[];
  tablesLoading: boolean;
  tablesError: string | null;
}) {
  // Filter tables that fit guest count
  const suitableTables = tables.filter(
    (t) => t.isAvailable && t.capacity >= reservation.guests
  );

  return (
    <div>
      <div className="text-center mb-10">
        <h2 className="font-heading text-3xl md:text-5xl italic font-medium text-[var(--color-on-background)] leading-tight mb-3">
          Craft Your{" "}
          <span className="text-[var(--color-secondary)]">Experience</span>
        </h2>
        <p className="font-body text-[var(--color-on-surface-variant)] max-w-md mx-auto">
          Choose your perfect spot and how you&apos;d like to enjoy it.
        </p>
      </div>

      {/* Seating preference (cosmetic) */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px w-8 bg-[var(--color-secondary)]" />
          <span className="font-label text-[var(--color-secondary)] tracking-[0.25em] uppercase text-[10px]">
            Seating Preference
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SEATING_OPTIONS.map((seat) => {
            const selected = reservation.seating === seat.id;
            return (
              <motion.button
                key={seat.id}
                onClick={() =>
                  setReservation((prev) => ({ ...prev, seating: seat.id }))
                }
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`group relative overflow-hidden rounded-2xl border transition-all duration-500 text-left ${
                  selected
                    ? "border-[var(--color-secondary)] shadow-[0_8px_30px_rgba(196,168,130,0.25)]"
                    : "border-[var(--color-outline-variant)] hover:border-[var(--color-secondary)]/40"
                }`}
              >
                <div className="relative h-36 overflow-hidden">
                  <Image
                    src={seat.image}
                    alt={seat.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface-container-low)] to-transparent" />

                  {selected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-3 right-3 w-7 h-7 rounded-full bg-[var(--color-secondary)] flex items-center justify-center"
                    >
                      <Check size={14} className="text-[#1a120b]" />
                    </motion.div>
                  )}

                  <div className="absolute top-3 left-3 text-2xl">{seat.icon}</div>
                </div>

                <div className="p-5 bg-[var(--color-surface-container-low)]">
                  <h4 className="font-heading italic text-lg text-[var(--color-on-surface)] mb-1">
                    {seat.name}
                  </h4>
                  <p className="font-body text-[var(--color-on-surface-variant)] text-sm leading-relaxed">
                    {seat.desc}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Real Table picker (NEW) ── */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px w-8 bg-[var(--color-secondary)]" />
          <span className="font-label text-[var(--color-secondary)] tracking-[0.25em] uppercase text-[10px]">
            Pick Your Table
          </span>
        </div>

        {tablesLoading ? (
          <div className="flex items-center gap-3 p-6 rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)]">
            <Loader2 size={18} className="animate-spin text-[var(--color-secondary)]" />
            <span className="font-body text-[var(--color-on-surface-variant)] text-sm">
              Checking table availability...
            </span>
          </div>
        ) : tablesError ? (
          <div className="flex items-start gap-3 p-6 rounded-2xl border border-red-500/20 bg-red-500/5">
            <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-body text-[var(--color-on-surface)] text-sm font-medium">
                Couldn&apos;t check availability
              </p>
              <p className="font-label text-[var(--color-on-surface-variant)] text-[10px] tracking-wider mt-1">
                {tablesError}
              </p>
            </div>
          </div>
        ) : tables.length === 0 ? (
          // ← NEW: nothing came back from backend at all
          <div className="p-8 rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] text-center">
            <p className="font-heading italic text-lg text-[var(--color-on-surface-variant)] mb-1">
              No tables found
            </p>
            <p className="font-body text-[var(--color-on-surface-variant)] text-sm">
              Please go back and confirm your date and time selection.
            </p>
          </div>
        ) : suitableTables.length === 0 ? (
          <div className="p-8 rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] text-center">
            <p className="font-heading italic text-lg text-[var(--color-on-surface-variant)] mb-1">
              No tables fit your party size
            </p>
            <p className="font-body text-[var(--color-on-surface-variant)] text-sm">
              Try a different date or reduce your guest count.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {suitableTables.map((table) => {
              const selected = reservation.tableId === table.id;
              return (
                <motion.button
                  key={table.id}
                  onClick={() =>
                    setReservation((prev) => ({ ...prev, tableId: table.id }))
                  }
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className={`relative p-5 rounded-2xl border text-center transition-all duration-300 ${
                    selected
                      ? "border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 shadow-[0_8px_24px_rgba(196,168,130,0.2)]"
                      : "border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] hover:border-[var(--color-secondary)]/40"
                  }`}
                >
                  {selected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--color-secondary)] flex items-center justify-center">
                      <Check size={10} className="text-[#1a120b]" />
                    </div>
                  )}
                  <p className="font-heading text-3xl font-medium text-[var(--color-on-surface)] mb-1">
                    #{table.tableNumber}
                  </p>
                  <p className="font-label text-[var(--color-secondary)] text-[9px] tracking-wider uppercase">
                    Seats {table.capacity}
                  </p>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* Experience type */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px w-8 bg-[var(--color-secondary)]" />
          <span className="font-label text-[var(--color-secondary)] tracking-[0.25em] uppercase text-[10px]">
            Experience Type
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {EXPERIENCES.map((exp) => {
            const Icon = exp.icon;
            const selected = reservation.experience === exp.id;
            return (
              <motion.button
                key={exp.id}
                onClick={() =>
                  setReservation((prev) => ({ ...prev, experience: exp.id }))
                }
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`group relative p-6 rounded-2xl border text-left transition-all duration-500 overflow-hidden ${
                  selected
                    ? "border-[var(--color-secondary)] bg-[var(--color-secondary)]/5 shadow-[0_8px_30px_rgba(196,168,130,0.2)]"
                    : "border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] hover:border-[var(--color-secondary)]/40"
                }`}
              >
                {exp.popular && (
                  <span className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 font-label text-[8px] tracking-[0.2em] uppercase">
                    Popular
                  </span>
                )}

                <div className="flex items-start gap-4">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      selected
                        ? "bg-[var(--color-secondary)]/20 text-[var(--color-secondary)]"
                        : "bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)]"
                    }`}
                  >
                    <Icon size={20} />
                  </div>

                  <div className="flex-1">
                    <h4 className="font-heading italic text-lg text-[var(--color-on-surface)] mb-1">
                      {exp.name}
                    </h4>
                    <p className="font-body text-[var(--color-on-surface-variant)] text-sm leading-relaxed mb-2">
                      {exp.desc}
                    </p>
                    <span className="font-label text-[var(--color-secondary)] text-xs font-medium tracking-wider">
                      {exp.price}
                    </span>
                  </div>
                </div>

                {selected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute bottom-4 right-4 w-6 h-6 rounded-full bg-[var(--color-secondary)] flex items-center justify-center"
                  >
                    <Check size={12} className="text-[#1a120b]" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   STEP 3 — DETAILS (unchanged UI)
═══════════════════════════════════════════════════════════════════════ */
function StepDetails({
  reservation,
  setReservation,
}: {
  reservation: ReservationFormData;
  setReservation: React.Dispatch<React.SetStateAction<ReservationFormData>>;
}) {
  return (
    <div>
      <div className="text-center mb-10">
        <h2 className="font-heading text-4xl md:text-5xl italic font-medium text-[var(--color-on-background)] leading-tight mb-3">
          Almost <span className="text-[var(--color-secondary)]">There</span>
        </h2>
        <p className="font-body text-[var(--color-on-surface-variant)] max-w-md mx-auto">
          Tell us a little about yourself so we can prepare for your arrival.
        </p>
      </div>

      <div className="max-w-lg mx-auto space-y-5">
        <Field
          label="Full Name *"
          icon={Users}
          value={reservation.name}
          onChange={(v) => setReservation((p) => ({ ...p, name: v }))}
          placeholder="Your full name"
        />
        <Field
          label="Email Address *"
          icon={Mail}
          type="email"
          value={reservation.email}
          onChange={(v) => setReservation((p) => ({ ...p, email: v }))}
          placeholder="you@example.com"
        />
        <Field
          label="Phone Number *"
          icon={Phone}
          type="tel"
          value={reservation.phone}
          onChange={(v) => setReservation((p) => ({ ...p, phone: v }))}
          placeholder="+1 (555) 000-0000"
        />

        <div>
          <label className="font-label text-[var(--color-on-surface-variant)] text-[10px] tracking-[0.2em] uppercase mb-2 block">
            Special Requests
          </label>
          <div className="relative">
            <MessageSquare
              size={16}
              className="absolute left-4 top-4 text-[var(--color-on-surface-variant)]"
            />
            <textarea
              value={reservation.notes}
              onChange={(e) =>
                setReservation((p) => ({ ...p, notes: e.target.value }))
              }
              placeholder="Allergies, celebrations, accessibility needs..."
              rows={4}
              className="w-full pl-11 pr-4 py-4 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] font-body placeholder:text-[var(--color-on-surface-variant)]/40 focus:outline-none focus:border-[var(--color-secondary)] transition-colors resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  icon: React.ElementType;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="font-label text-[var(--color-on-surface-variant)] text-[10px] tracking-[0.2em] uppercase mb-2 block">
        {label}
      </label>
      <div className="relative">
        <Icon
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)]"
        />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-11 pr-4 py-4 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] font-body placeholder:text-[var(--color-on-surface-variant)]/40 focus:outline-none focus:border-[var(--color-secondary)] transition-colors"
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   STEP 4 — REVIEW
═══════════════════════════════════════════════════════════════════════ */
function StepReview({
  reservation,
  tables,
  submitError,
}: {
  reservation: ReservationFormData;
  tables: BackendTable[];
  submitError: string | null;
}) {
  const selectedSeating = SEATING_OPTIONS.find(
    (s) => s.id === reservation.seating
  );
  const selectedExperience = EXPERIENCES.find(
    (e) => e.id === reservation.experience
  );
  const selectedTable = tables.find((t) => t.id === reservation.tableId);
  const formattedDate = reservation.date?.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div>
      <div className="text-center mb-10">
        <h2 className="font-heading text-3xl md:text-5xl italic font-medium text-[var(--color-on-background)] leading-tight mb-3">
          Review Your{" "}
          <span className="text-[var(--color-secondary)]">Reservation</span>
        </h2>
        <p className="font-body text-[var(--color-on-surface-variant)] max-w-md mx-auto">
          Double-check everything looks perfect before we confirm.
        </p>
      </div>

      <div className="max-w-lg mx-auto">
        <div className="rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] overflow-hidden">
          <div className="relative h-40 overflow-hidden">
            <Image
              src={selectedSeating?.image ?? SEATING_OPTIONS[0].image}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface-container-low)] via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-5">
              <span className="font-label text-[var(--color-secondary)] text-[10px] tracking-[0.2em] uppercase">
                Reservation Summary
              </span>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <ReviewRow
              icon={Calendar}
              label="Date"
              value={formattedDate ?? "Not selected"}
            />
            <ReviewRow
              icon={Clock}
              label="Time"
              value={reservation.time || "Not selected"}
            />
            <ReviewRow
              icon={Users}
              label="Guests"
              value={`${reservation.guests} ${
                reservation.guests === 1 ? "person" : "people"
              }`}
            />
            <ReviewRow
              icon={MapPin}
              label="Seating"
              value={selectedSeating?.name ?? "Not selected"}
            />
            {selectedTable && (
              <ReviewRow
                icon={MapPin}
                label="Table"
                value={`#${selectedTable.tableNumber} (seats ${selectedTable.capacity})`}
              />
            )}
            <ReviewRow
              icon={Coffee}
              label="Experience"
              value={`${selectedExperience?.name ?? "Standard"} · ${
                selectedExperience?.price ?? "Free"
              }`}
            />

            <div className="border-t border-[var(--color-outline-variant)] pt-5">
              <ReviewRow icon={Users} label="Name" value={reservation.name} />
              <ReviewRow icon={Mail} label="Email" value={reservation.email} />
              <ReviewRow
                icon={Phone}
                label="Phone"
                value={reservation.phone}
              />
              {reservation.notes && (
                <ReviewRow
                  icon={MessageSquare}
                  label="Notes"
                  value={reservation.notes}
                />
              )}
            </div>
          </div>
        </div>

        {submitError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 p-4 rounded-xl border border-red-500/30 bg-red-500/10 flex items-start gap-3"
          >
            <AlertCircle
              size={16}
              className="text-red-400 flex-shrink-0 mt-0.5"
            />
            <div>
              <p className="font-body text-red-400 text-sm font-medium">
                Reservation failed
              </p>
              <p className="font-label text-red-300/70 text-[10px] tracking-wider mt-0.5">
                {submitError}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function ReviewRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 py-1">
      <Icon
        size={15}
        className="text-[var(--color-secondary)] mt-0.5 flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="font-label text-[var(--color-on-surface-variant)] text-[9px] tracking-[0.2em] uppercase mb-0.5">
          {label}
        </p>
        <p className="font-body text-[var(--color-on-surface)] text-sm break-words">
          {value}
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SUCCESS SCREEN — uses real backend reservation ID
═══════════════════════════════════════════════════════════════════════ */
function SuccessScreen({
  reservation,
  backendReservation,
}: {
  reservation: ReservationFormData;
  backendReservation: BackendReservation;
}) {
  const formattedDate = new Date(backendReservation.date).toLocaleDateString(
    "en-US",
    { weekday: "long", month: "long", day: "numeric" }
  );

  // Show first 8 chars of real backend ID
  const displayId = backendReservation.id.slice(0, 8).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="text-center py-12"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 200 }}
        className="w-24 h-24 rounded-full bg-[var(--color-secondary)]/15 border-2 border-[var(--color-secondary)] flex items-center justify-center mx-auto mb-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          <Check size={40} className="text-[var(--color-secondary)]" />
        </motion.div>
      </motion.div>

      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[var(--color-secondary)]/8 blur-[100px] rounded-full" />

      <h2 className="font-heading text-4xl md:text-5xl italic font-medium text-[var(--color-on-background)] mb-4 relative z-10">
        You&apos;re All <span className="text-[var(--color-secondary)]">Set</span>
      </h2>

      <p className="font-body text-[var(--color-on-surface-variant)] max-w-md mx-auto mb-8 leading-relaxed relative z-10">
        We&apos;ve reserved table{" "}
        <span className="text-[var(--color-secondary)] font-medium">
          #{backendReservation.table.tableNumber}
        </span>{" "}
        for{" "}
        <span className="text-[var(--color-secondary)] font-medium">
          {formattedDate}
        </span>{" "}
        at{" "}
        <span className="text-[var(--color-secondary)] font-medium">
          {backendReservation.time}
        </span>
        . A confirmation has been sent to{" "}
        <span className="text-[var(--color-secondary)] font-medium">
          {reservation.email}
        </span>
        .
      </p>

      <div className="inline-flex flex-col items-center gap-3 p-6 rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] mb-10 relative z-10">
        <div className="flex items-center gap-6 text-sm flex-wrap justify-center">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-[var(--color-secondary)]" />
            <span className="font-body text-[var(--color-on-surface)]">
              {formattedDate}
            </span>
          </div>
          <div className="w-px h-4 bg-[var(--color-outline-variant)]" />
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-[var(--color-secondary)]" />
            <span className="font-body text-[var(--color-on-surface)]">
              {backendReservation.time}
            </span>
          </div>
          <div className="w-px h-4 bg-[var(--color-outline-variant)]" />
          <div className="flex items-center gap-2">
            <Users size={14} className="text-[var(--color-secondary)]" />
            <span className="font-body text-[var(--color-on-surface)]">
              {backendReservation.guests}
            </span>
          </div>
        </div>
        <p className="font-label text-[var(--color-on-surface-variant)] text-[9px] tracking-wider uppercase">
          Reservation #{displayId}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
          <Link
            href="/menu"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[var(--color-secondary)] text-[#1a120b] font-label font-bold uppercase tracking-[0.2em] text-xs shadow-[0_10px_30px_rgba(196,168,130,0.3)] hover:brightness-105 transition-all"
          >
            <Coffee size={14} />
            Pre-Order Drinks
          </Link>
        </motion.div>
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
          <Link
            href="/"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full border border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] font-label uppercase tracking-[0.2em] text-xs hover:border-[var(--color-secondary)] hover:text-[var(--color-secondary)] transition-all"
          >
            Back to Home
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   STATIC SECTIONS (unchanged)
═══════════════════════════════════════════════════════════════════════ */
function TestimonialsStrip() {
  return (
    <section className="py-24 px-6 md:px-12 bg-[var(--color-surface-container-lowest)] border-y border-[var(--color-outline-variant)]">
      <div className="max-w-[1300px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-3 mb-5">
            <div className="h-px w-8 bg-[var(--color-secondary)]" />
            <span className="font-label text-[var(--color-secondary)] tracking-[0.3em] uppercase text-[10px]">
              Guest Experiences
            </span>
            <div className="h-px w-8 bg-[var(--color-secondary)]" />
          </div>
          <h2 className="font-heading text-4xl md:text-5xl italic font-medium text-[var(--color-on-background)] leading-tight">
            What They <span className="text-[var(--color-secondary)]">Remember</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.12 }}
              className="group relative p-7 rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container)] hover:border-[var(--color-secondary)]/30 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute top-3 right-5 font-heading text-[80px] leading-none text-[var(--color-secondary)]/8 select-none font-bold">
                &ldquo;
              </div>

              <div className="flex gap-0.5 mb-5">
                {[...Array(5)].map((_, j) => (
                  <Star
                    key={j}
                    size={12}
                    className="fill-[var(--color-secondary)] text-[var(--color-secondary)]"
                  />
                ))}
              </div>

              <p className="font-body text-[var(--color-on-surface)] leading-relaxed italic mb-6 relative z-10">
                &ldquo;{t.text}&rdquo;
              </p>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[var(--color-secondary)]/20 border border-[var(--color-secondary)]/30 flex items-center justify-center flex-shrink-0">
                  <span className="font-label text-[var(--color-secondary)] text-[10px] font-bold">
                    {t.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                </div>
                <div>
                  <p className="font-label text-[var(--color-on-surface)] text-sm font-medium">
                    {t.name}
                  </p>
                  <p className="font-label text-[var(--color-on-surface-variant)] text-[10px] tracking-wider uppercase">
                    {t.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LocationInfo() {
  return (
    <section className="relative py-28 px-6 md:px-12 overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=1920&h=800&fit=crop"
          alt=""
          fill
          className="object-cover opacity-12"
          sizes="100vw"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-[var(--color-background)]/85 to-[var(--color-background)]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[var(--color-secondary)]/6 blur-[100px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-[900px] mx-auto"
      >
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-5">
            <div className="h-px w-8 bg-[var(--color-secondary)]" />
            <span className="font-label text-[var(--color-secondary)] tracking-[0.3em] uppercase text-[10px]">
              Find Us
            </span>
            <div className="h-px w-8 bg-[var(--color-secondary)]" />
          </div>
          <h2 className="font-heading text-4xl md:text-5xl italic font-medium text-[var(--color-on-background)] leading-tight">
            We&apos;re in the{" "}
            <span className="text-[var(--color-secondary)]">Artisan District</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: MapPin,
              title: "Address",
              lines: ["123 Galle Road", "Colombo 03", "Colombo, Sri Lanka"],
            },
            {
              icon: Clock,
              title: "Hours",
              lines: [
                "Mon – Fri: 7AM – 7PM",
                "Sat – Sun: 8AM – 6PM",
                "Holidays: 9AM – 3PM",
              ],
            },
            {
              icon: Phone,
              title: "Contact",
              lines: ["+94 11 234 5678", "hello@brewandco.com", "@brewandco"],
            },
          ].map((info) => {
            const Icon = info.icon;
            return (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center p-6 rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)]"
              >
                <div className="w-11 h-11 rounded-xl bg-[var(--color-secondary)]/10 border border-[var(--color-secondary)]/20 flex items-center justify-center mx-auto mb-4">
                  <Icon size={18} className="text-[var(--color-secondary)]" />
                </div>
                <h4 className="font-heading italic text-lg text-[var(--color-on-surface)] mb-3">
                  {info.title}
                </h4>
                <div className="space-y-1">
                  {info.lines.map((line) => (
                    <p
                      key={line}
                      className="font-body text-[var(--color-on-surface-variant)] text-sm"
                    >
                      {line}
                    </p>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}