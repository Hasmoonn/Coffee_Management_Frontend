// components/Sections.tsx
"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Star,
  MapPin,
  Clock,
  Coffee,
  Heart,
  Users,
  ArrowRight,
  Flame,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useFeaturedItems } from "@/hooks/useMenu";
import { useCart } from "@/hooks/useCart";
import { useUser } from "@/hooks/useUser";
import { getImageUrl } from "@/lib/api";
import { BackendMenuItem } from "@/types/menu";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] as any },
  }),
};

const FEATURES = [
  {
    icon: Coffee,
    title: "Fresh Roasted Daily",
    desc: "Small-batch roasting every morning guarantees the most vibrant, alive cup you've ever tasted.",
    stat: "11min",
    statLabel: "Roast Time",
  },
  {
    icon: Heart,
    title: "Soul-Warming Space",
    desc: "Reclaimed wood, warm Edison bulbs, and curated vinyl — designed for lingering, not rushing.",
    stat: "4.9★",
    statLabel: "Atmosphere",
  },
  {
    icon: Users,
    title: "Master Baristas",
    desc: "Each of our baristas completes a 200-hour craft certification before pulling their first shot.",
    stat: "200h",
    statLabel: "Training",
  },
];

const TESTIMONIALS = [
  {
    name: "Shalini L.",
    role: "Architect",
    text: "The Velvet Espresso is transcendent. I've been to cafés across three continents — this one holds its own.",
    rating: 5,
    avatar: "SL",
  },
  {
    name: "Jayantha D.",
    role: "Writer",
    text: "Best pour over in the city, full stop. You taste the care in every sip. My creative ritual starts here.",
    rating: 5,
    avatar: "JD",
  },
  {
    name: "Eshani R.",
    role: "Photographer",
    text: "The atmosphere is as beautiful as the coffee. I've shot three editorial spreads in this space.",
    rating: 5,
    avatar: "ER",
  },
];

export default function Sections() {
  return (
    <div id="sections-wrapper" className="w-full relative z-30">
      <div className="bg-[var(--color-background)] w-full">
        <MenuSection />
        <StorySection />
        <FeaturesSection />
        <TestimonialsSection />
        <LocationSection />
      </div>
    </div>
  );
}

/* ─── Menu Section ─────────────────────────────────────────────────── */
function MenuSection() {
  const { items, loading, error } = useFeaturedItems();

  return (
    <section
      id="menu"
      className="relative py-20 md:py-40 px-6 md:px-12 overflow-hidden"
    >
      {/* Background texture */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-surface-container-lowest)] to-[var(--color-background)] pointer-events-none" />

      <div className="relative z-10 max-w-[1300px] mx-auto">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20"
        >
          <motion.div variants={fadeUp} custom={0}>
            <div className="flex items-center gap-4 mb-5">
              <div className="h-px w-12 bg-[var(--color-secondary)]" />
              <span className="font-label text-[var(--color-secondary)] tracking-[0.25em] uppercase text-[10px]">
                Signature Collection
              </span>
            </div>
            <h2 className="font-heading text-4xl xs:text-5xl sm:text-6xl md:text-7xl font-medium text-[var(--color-on-background)] leading-[0.95] md:leading-[0.9] tracking-tight">
              Featured
              <br />
              <em className="italic text-[var(--color-secondary)]">Signature</em>
              <br />
              Drinks
            </h2>
          </motion.div>

          <motion.div variants={fadeUp} custom={1} className="max-w-xs">
            <p className="font-body text-[var(--color-on-surface-variant)] leading-relaxed mb-6">
              Each drink is a composition — sourced, roasted, and extracted with
              the precision of a musician tuning to perfect pitch.
            </p>
            <Link
              href="/menu"
              className="inline-flex items-center gap-3 text-[var(--color-secondary)] font-label text-xs tracking-[0.2em] uppercase group"
            >
              View Full Menu
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </motion.div>
        </motion.div>

        {/* Drink Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-[580px] rounded-2xl bg-[var(--color-surface-container)] animate-pulse flex items-center justify-center"
              >
                <Loader2 className="animate-spin text-[var(--color-secondary)]/20" size={40} />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 border border-dashed border-[var(--color-outline-variant)] rounded-2xl">
            <p className="text-[var(--color-on-surface-variant)]">Failed to load signature collection.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {items.slice(0, 3).map((item, i) => (
              <DrinkCard key={item.id} item={item} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function DrinkCard({
  item,
  index,
}: {
  item: BackendMenuItem;
  index: number;
}) {
  const { addItem } = useCart();
  const { user } = useUser();
  const router = useRouter();
  
  const getVariantStyles = (idx: number) => {
    const styles = [
      {
        tag: "Best Seller",
        tagColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
        gradient: "from-amber-950/95 via-amber-900/50 to-transparent",
      },
      {
        tag: "Fan Favorite",
        tagColor: "bg-orange-500/20 text-orange-400 border-orange-500/30",
        gradient: "from-orange-950/95 via-orange-900/50 to-transparent",
      },
      {
        tag: "Chef's Pick",
        tagColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        gradient: "from-stone-950/95 via-stone-900/50 to-transparent",
      },
    ];
    return styles[idx % styles.length];
  };

  const style = getVariantStyles(index);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      toast.error("Please login to add items to your order", {
        duration: 4000
      });
      router.push("/auth/login");
      return;
    }

    addItem(item);
    toast.success(`Added ${item.name} to order`, {
      icon: "",
      style: {
        borderRadius: "12px",
        background: "#1A120B",
        color: "#FDF6EC",
        border: "1px solid rgba(196,168,130,0.2)"
      }
    });
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={fadeUp}
      custom={index}
      className="group relative h-[580px] rounded-2xl overflow-hidden border border-[var(--color-outline-variant)] cursor-pointer shadow-xl hover:shadow-[0_40px_80px_rgba(0,0,0,0.4)] transition-shadow duration-700"
    >
      {/* Image */}
      <motion.img
        src={getImageUrl(item.imageUrl)}
        alt={item.name}
        className="absolute inset-0 w-full h-full object-cover"
        initial={{ scale: 1.05 }}
        whileInView={{ scale: 1 }}
        whileHover={{ scale: 1.07 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] as any }}
      />

      {/* Gradient overlays */}
      <div
        className={`absolute inset-0 bg-gradient-to-t ${style.gradient}`}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />

      {/* Top area */}
      <div className="absolute top-6 left-6 right-6 flex items-start justify-between">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-label tracking-[0.15em] uppercase backdrop-blur-sm ${style.tagColor}`}
        >
          <Flame size={9} />
          {item.isFeatured ? "Featured" : style.tag}
        </span>
        <span className="font-heading text-2xl font-medium text-white drop-shadow-lg">
          Rs. {item.price.toFixed(2)}
        </span>
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
        >
          <h3 className="font-heading text-3xl font-medium italic text-white mb-3 leading-tight">
            {item.name}
          </h3>
          <p className="font-body text-white/70 text-sm leading-relaxed mb-6 line-clamp-2">
            {item.description}
          </p>

          <motion.button
            whileHover={{
              scale: 1.04,
              boxShadow: "0 8px 30px rgba(196,168,130,0.4)",
            }}
            whileTap={{ scale: 0.97 }}
            onClick={handleAdd}
            className="w-full py-3.5 rounded-full bg-[var(--color-secondary)] text-[#1a120b] font-label font-bold uppercase tracking-[0.15em] text-xs hover:brightness-105 transition-all"
          >
            Add to Order
          </motion.button>
        </motion.div>
      </div>

      {/* Hover shimmer */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-secondary)]/0 via-[var(--color-secondary)]/5 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-2xl" />
    </motion.div>
  );
}

/* ─── Story Section ─────────────────────────────────────────────────── */
function StorySection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section
      id="story"
      ref={ref}
      className="relative py-20 md:py-40 overflow-hidden bg-[var(--color-surface-container-lowest)]"
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[var(--color-secondary)]/5 blur-[120px]" />

      <div className="relative z-10 max-w-[1300px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Image with Parallax */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as any }}
            className="relative h-[400px] xs:h-[500px] lg:h-[700px] rounded-2xl overflow-hidden border border-[var(--color-outline-variant)] shadow-[0_32px_80px_rgba(0,0,0,0.35)]"
          >
            <motion.div className="absolute inset-0" style={{ y: imgY }}>
              <img
                src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=900&h=1200&fit=crop"
                alt="Barista crafting coffee"
                className="w-full h-full object-cover scale-110"
              />
            </motion.div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="absolute bottom-8 left-8 right-8 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[var(--color-secondary)]/20 border border-[var(--color-secondary)]/40 flex items-center justify-center flex-shrink-0">
                  <Coffee size={20} className="text-[var(--color-secondary)]" />
                </div>
                <div>
                  <p className="font-heading italic text-white text-lg font-medium leading-tight">
                    &quot;Obsession with craft is the only ingredient we never
                    substitute.&quot;
                  </p>
                  <p className="font-label text-white/50 text-xs mt-1 tracking-wider uppercase">
                    — Marcus Chen, Head Roastmaster
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Founded year */}
            <div className="absolute top-8 right-8">
              <span className="font-heading text-white/10 text-8xl font-bold select-none leading-none">
                2018
              </span>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as any, delay: 0.1 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-12 bg-[var(--color-secondary)]" />
              <span className="font-label text-[var(--color-secondary)] tracking-[0.25em] uppercase text-[10px]">
                Our Roots
              </span>
            </div>

            <h2 className="font-heading text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-medium text-[var(--color-on-background)] leading-[0.95] tracking-tight mb-8">
              A Passion for
              <br />
              <em className="italic text-[var(--color-secondary)]">
                the Perfect
              </em>
              <br />
              Pour
            </h2>

            <div className="space-y-5 mb-10">
              <p className="font-body text-[var(--color-on-surface-variant)] leading-relaxed">
                Founded in 2018, Brew & Co. was born from a single, stubborn
                belief: that specialty coffee — the kind grown with care, roasted
                with precision, and brewed with intention — deserves to be
                accessible to everyone.
              </p>
              <p className="font-body text-[var(--color-on-surface-variant)] leading-relaxed">
                We partner directly with six farming families across Ethiopia,
                Colombia, and Guatemala. Every bean has a name, a story, and a
                face behind it. We invite you to taste that difference.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mb-10 py-8 border-y border-[var(--color-outline-variant)]">
              {[
                { val: "6", label: "Farm Partners" },
                { val: "40K+", label: "Cups Poured" },
                { val: "7", label: "Years Crafting" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-heading text-3xl font-medium text-[var(--color-secondary)] mb-1">
                    {stat.val}
                  </p>
                  <p className="font-label text-[var(--color-on-surface-variant)] text-xs tracking-wider uppercase">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <Link
              href="#story"
              className="inline-flex items-center gap-4 group"
            >
              <span className="font-label text-[var(--color-secondary)] text-xs tracking-[0.25em] uppercase">
                Read the Full Story
              </span>
              <motion.div
                className="w-10 h-10 rounded-full border border-[var(--color-secondary)] flex items-center justify-center text-[var(--color-secondary)] group-hover:bg-[var(--color-secondary)] group-hover:text-[#1a120b] transition-colors duration-300"
                whileHover={{ scale: 1.1 }}
              >
                <ArrowRight size={14} />
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─── Features Section ──────────────────────────────────────────────── */
function FeaturesSection() {
  return (
    <section className="relative py-20 md:py-40 px-6 md:px-12 overflow-hidden">
      <div className="max-w-[1300px] mx-auto">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.div variants={fadeUp} custom={0}>
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="h-px w-8 bg-[var(--color-secondary)]" />
              <span className="font-label text-[var(--color-secondary)] tracking-[0.25em] uppercase text-[10px]">
                Why Choose Us
              </span>
              <div className="h-px w-8 bg-[var(--color-secondary)]" />
            </div>
            <h2 className="font-heading text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-medium text-[var(--color-on-background)] leading-[0.95] tracking-tight">
              The Brew & Co.
              <br />
              <em className="italic text-[var(--color-secondary)]">
                Difference
              </em>
            </h2>
          </motion.div>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i}
              className="group relative p-8 md:p-10 rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] hover:border-[var(--color-secondary)]/30 transition-all duration-500 overflow-hidden"
            >
              {/* Background number */}
              <div className="absolute -top-4 -right-4 font-heading text-[120px] font-bold text-[var(--color-secondary)]/5 select-none leading-none">
                {String(i + 1).padStart(2, "0")}
              </div>

              {/* Icon */}
              <div className="relative z-10 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-[var(--color-secondary)]/10 border border-[var(--color-secondary)]/20 flex items-center justify-center group-hover:bg-[var(--color-secondary)]/20 transition-colors duration-500">
                  <feature.icon
                    size={24}
                    className="text-[var(--color-secondary)]"
                  />
                </div>
              </div>

              {/* Stat */}
              <div className="relative z-10 flex items-baseline gap-2 mb-4">
                <span className="font-heading text-4xl font-medium text-[var(--color-secondary)]">
                  {feature.stat}
                </span>
                <span className="font-label text-[var(--color-on-surface-variant)] text-xs tracking-wider uppercase">
                  {feature.statLabel}
                </span>
              </div>

              <h3 className="relative z-10 font-heading text-2xl font-medium text-[var(--color-on-surface)] mb-4">
                {feature.title}
              </h3>
              <p className="relative z-10 font-body text-[var(--color-on-surface-variant)] leading-relaxed text-sm">
                {feature.desc}
              </p>

              {/* Hover glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-secondary)]/0 to-[var(--color-secondary)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-2xl" />

              {/* Bottom accent line */}
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--color-secondary)]/30 to-transparent origin-left"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials Section ──────────────────────────────────────────── */
function TestimonialsSection() {
  return (
    <section className="relative py-20 md:py-40 overflow-hidden bg-[var(--color-surface-container-lowest)]">
      {/* Decorative lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 w-px bg-[var(--color-outline-variant)]/30"
            style={{ left: `${20 + i * 15}%` }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-[1300px] mx-auto px-6 md:px-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20"
        >
          <motion.div variants={fadeUp} custom={0}>
            <div className="flex items-center gap-4 mb-5">
              <div className="h-px w-12 bg-[var(--color-secondary)]" />
              <span className="font-label text-[var(--color-secondary)] tracking-[0.25em] uppercase text-[10px]">
                Community Voices
              </span>
            </div>
            <h2 className="font-heading text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-medium text-[var(--color-on-background)] leading-[0.95] tracking-tight">
              What Our
              <br />
              <em className="italic text-[var(--color-secondary)]">
                Community
              </em>
              <br />
              Says
            </h2>
          </motion.div>

          <motion.div variants={fadeUp} custom={1}>
            <div className="flex items-center gap-2 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  className="fill-[var(--color-secondary)] text-[var(--color-secondary)]"
                />
              ))}
            </div>
            <p className="font-heading text-5xl font-medium text-[var(--color-on-background)]">
              4.9
            </p>
            <p className="font-label text-[var(--color-on-surface-variant)] text-xs tracking-wider uppercase mt-1">
              Average Rating · 2,400+ Reviews
            </p>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((review, i) => (
            <motion.div
              key={review.name}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i}
              className="group relative p-8 rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container)] hover:border-[var(--color-secondary)]/30 transition-all duration-500 overflow-hidden"
            >
              {/* Quote mark */}
              <div className="absolute top-4 right-6 font-heading text-[100px] leading-none text-[var(--color-secondary)]/8 select-none font-bold">
                "
              </div>

              <div className="flex gap-1 mb-6">
                {[...Array(review.rating)].map((_, j) => (
                  <Star
                    key={j}
                    size={14}
                    className="fill-[var(--color-secondary)] text-[var(--color-secondary)]"
                  />
                ))}
              </div>

              <p className="font-body text-[var(--color-on-surface)] leading-relaxed mb-8 text-base italic relative z-10">
                "{review.text}"
              </p>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--color-secondary)]/20 border border-[var(--color-secondary)]/30 flex items-center justify-center flex-shrink-0">
                  <span className="font-label text-[var(--color-secondary)] text-xs font-bold">
                    {review.avatar}
                  </span>
                </div>
                <div>
                  <p className="font-label text-[var(--color-on-surface)] text-sm font-medium tracking-wide">
                    {review.name}
                  </p>
                  <p className="font-label text-[var(--color-on-surface-variant)] text-xs tracking-wider uppercase">
                    {review.role}
                  </p>
                </div>
              </div>

              {/* Bottom line */}
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--color-secondary)]/30 to-transparent origin-left"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Location Section ──────────────────────────────────────────────── */
function LocationSection() {
  return (
    <section
      id="contact"
      className="relative py-20 md:py-40 px-6 md:px-12 overflow-hidden"
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-[var(--color-secondary)]/5 blur-[120px] rounded-full" />

      <div className="relative z-10 max-w-[1300px] mx-auto">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.div variants={fadeUp} custom={0}>
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="h-px w-8 bg-[var(--color-secondary)]" />
              <span className="font-label text-[var(--color-secondary)] tracking-[0.25em] uppercase text-[10px]">
                Find Us
              </span>
              <div className="h-px w-8 bg-[var(--color-secondary)]" />
            </div>
            <h2 className="font-heading text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-medium text-[var(--color-on-background)] leading-[0.95] tracking-tight">
              Come Visit
              <br />
              <em className="italic text-[var(--color-secondary)]">Our Space</em>
            </h2>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Map placeholder — wide */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as any }}
            className="lg:col-span-3 relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden border border-[var(--color-outline-variant)] bg-[var(--color-surface-container)] shadow-2xl"
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[var(--color-surface-container-low)]">
              {/* Faux map grid */}
              <div className="absolute inset-0 opacity-20">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={`h${i}`}
                    className="absolute left-0 right-0 h-px bg-[var(--color-outline-variant)]"
                    style={{ top: `${i * 14}%` }}
                  />
                ))}
                {[...Array(8)].map((_, i) => (
                  <div
                    key={`v${i}`}
                    className="absolute top-0 bottom-0 w-px bg-[var(--color-outline-variant)]"
                    style={{ left: `${i * 14}%` }}
                  />
                ))}
              </div>

              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="w-16 h-16 rounded-full bg-[var(--color-secondary)]/20 border-2 border-[var(--color-secondary)]/50 flex items-center justify-center"
              >
                <MapPin
                  size={28}
                  className="text-[var(--color-secondary)]"
                  fill="currentColor"
                  fillOpacity={0.2}
                />
              </motion.div>
              <p className="font-heading italic text-[var(--color-on-surface)] text-xl">
                Artisan District, Colombo
              </p>
              <p className="font-label text-[var(--color-on-surface-variant)] text-xs tracking-widest uppercase">
                123 Galle Road, Colombo 03
                <br />
                +94 11 234 5678
              </p>
              <Link
                href="#contact"
                className="mt-4 px-6 py-2.5 rounded-full bg-[var(--color-secondary)] text-[#1a120b] font-label text-xs font-bold uppercase tracking-[0.15em] hover:brightness-105 transition-all"
              >
                Get Directions
              </Link>
            </div>
          </motion.div>

          {/* Info cards — stacked */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Hours */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as any }}
              className="flex-1 p-8 rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] relative overflow-hidden group hover:border-[var(--color-secondary)]/30 transition-colors duration-500"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-secondary)]/10 border border-[var(--color-secondary)]/20 flex items-center justify-center">
                  <Clock
                    size={18}
                    className="text-[var(--color-secondary)]"
                  />
                </div>
                <h4 className="font-heading text-xl font-medium text-[var(--color-on-surface)]">
                  Opening Hours
                </h4>
              </div>

              <div className="space-y-3">
                {[
                  { days: "Mon — Fri", hours: "7:00 AM – 7:00 PM" },
                  { days: "Sat — Sun", hours: "8:00 AM – 6:00 PM" },
                ].map((row) => (
                  <div
                    key={row.days}
                    className="flex justify-between items-center py-2 border-b border-[var(--color-outline-variant)]/50 last:border-0"
                  >
                    <span className="font-label text-[var(--color-on-surface-variant)] text-xs tracking-wider uppercase">
                      {row.days}
                    </span>
                    <span className="font-body text-[var(--color-on-surface)] text-sm">
                      {row.hours}
                    </span>
                  </div>
                ))}
              </div>

              <div className="absolute -bottom-4 -right-4 font-heading text-[80px] font-bold text-[var(--color-secondary)]/5 select-none leading-none">
                ☕
              </div>
            </motion.div>

            {/* Reservation CTA */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] as any }}
              className="relative rounded-2xl overflow-hidden border border-[var(--color-secondary)]/20 bg-gradient-to-br from-[var(--color-secondary)]/10 to-[var(--color-secondary)]/5 p-8"
            >
              <p className="font-label text-[var(--color-secondary)] tracking-[0.2em] uppercase text-[10px] mb-3">
                Reserve Your Experience
              </p>
              <h4 className="font-heading text-2xl font-medium italic text-[var(--color-on-background)] mb-4">
                Book a Table
              </h4>
              <p className="font-body text-[var(--color-on-surface-variant)] text-sm leading-relaxed mb-6">
                Reserve your seat for a private tasting or a curated coffee
                flight experience.
              </p>
              <Link
                href="/reservations"
                className="inline-flex items-center gap-3 w-full justify-center py-3.5 rounded-full bg-[var(--color-secondary)] text-[#1a120b] font-label font-bold uppercase tracking-[0.15em] text-xs hover:brightness-105 transition-all shadow-[0_8px_24px_rgba(196,168,130,0.25)]"
              >
                Reserve Now
                <ArrowRight size={13} />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}