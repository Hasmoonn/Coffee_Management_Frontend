// app/gallery/page.tsx
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { X, ZoomIn, ArrowLeft, ArrowRight, Play } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const CATEGORIES = ["All", "Brews", "Roastery", "Ambiance", "People", "Seasons"] as const;
type Category = (typeof CATEGORIES)[number];

const GALLERY_ITEMS = [
  // Brews
  {
    id: 1,
    category: "Brews" as Category,
    title: "Honey Lavender Latte",
    subtitle: "Seasonal Collection",
    image: "https://images.unsplash.com/photo-1485808191679-5f86510bd9d3?w=900&h=1200&fit=crop",
    size: "tall",
    featured: true,
  },
  {
    id: 2,
    category: "Brews" as Category,
    title: "Velvet Espresso",
    subtitle: "Signature Series",
    image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=900&h=600&fit=crop",
    size: "wide",
    featured: false,
  },
  {
    id: 3,
    category: "Roastery" as Category,
    title: "The Morning Roast",
    subtitle: "Behind the Scenes",
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b3f4?w=900&h=900&fit=crop",
    size: "square",
    featured: false,
  },
  {
    id: 4,
    category: "Ambiance" as Category,
    title: "Golden Hour",
    subtitle: "Our Space",
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=900&h=1200&fit=crop",
    size: "tall",
    featured: true,
  },
  {
    id: 5,
    category: "Brews" as Category,
    title: "Cold Brew Ritual",
    subtitle: "18-Hour Steep",
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=900&h=600&fit=crop",
    size: "wide",
    featured: false,
  },
  {
    id: 6,
    category: "People" as Category,
    title: "The Roastmaster",
    subtitle: "Portraits",
    image: "https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=900&h=900&fit=crop",
    size: "square",
    featured: false,
  },
  {
    id: 7,
    category: "Roastery" as Category,
    title: "Green Bean Selection",
    subtitle: "Origin Series",
    image: "https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=900&h=600&fit=crop",
    size: "wide",
    featured: false,
  },
  {
    id: 8,
    category: "Seasons" as Category,
    title: "Winter Warmth",
    subtitle: "Seasonal Menu",
    image: "https://images.unsplash.com/photo-1512568400610-62da28bc8a13?w=900&h=1200&fit=crop",
    size: "tall",
    featured: false,
  },
  {
    id: 9,
    category: "Ambiance" as Category,
    title: "The Corner Table",
    subtitle: "Our Space",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=900&h=900&fit=crop",
    size: "square",
    featured: false,
  },
  {
    id: 10,
    category: "Brews" as Category,
    title: "Pour Over Reserve",
    subtitle: "Craft Series",
    image: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=900&h=1200&fit=crop",
    size: "tall",
    featured: true,
  },
  {
    id: 11,
    category: "People" as Category,
    title: "Latte Art Session",
    subtitle: "Craft & Skill",
    image: "https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=900&h=600&fit=crop",
    size: "wide",
    featured: false,
  },
  {
    id: 12,
    category: "Seasons" as Category,
    title: "Autumn Spice Blend",
    subtitle: "Fall Collection",
    image: "https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=900&h=900&fit=crop",
    size: "square",
    featured: false,
  },
  {
    id: 13,
    category: "Roastery" as Category,
    title: "The Drum Roaster",
    subtitle: "Equipment Series",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&h=600&fit=crop",
    size: "wide",
    featured: false,
  },
  {
    id: 14,
    category: "Ambiance" as Category,
    title: "Morning Light",
    subtitle: "Daily Ritual",
    image: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=900&h=1200&fit=crop",
    size: "tall",
    featured: false,
  },
  {
    id: 15,
    category: "People" as Category,
    title: "Community Gathering",
    subtitle: "Events",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&h=900&fit=crop",
    size: "square",
    featured: false,
  },
];

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const filtered =
    activeCategory === "All"
      ? GALLERY_ITEMS
      : GALLERY_ITEMS.filter((item) => item.category === activeCategory);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const prevImage = useCallback(() =>
    setLightboxIndex((prev) =>
      prev !== null ? (prev === 0 ? filtered.length - 1 : prev - 1) : null
    ), [filtered.length]);
  const nextImage = useCallback(() =>
    setLightboxIndex((prev) =>
      prev !== null ? (prev === filtered.length - 1 ? 0 : prev + 1) : null
    ), [filtered.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxIndex, prevImage, nextImage]);

  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-on-background)]">
      <Navigation />

      {/* ── Cinematic Hero ── */}
      <section
        ref={heroRef}
        className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden"
      >
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1920&h=1080&fit=crop"
            alt="Gallery Hero"
            fill
            className="object-cover scale-110"
            priority
            sizes="100vw"
          />
        </motion.div>

        {/* Cinematic overlays */}
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-black/30 to-black/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />

        {/* Decorative vertical lines */}
        {[20, 40, 60, 80].map((pos) => (
          <div
            key={pos}
            className="absolute top-0 bottom-0 w-px bg-white/5"
            style={{ left: `${pos}%` }}
          />
        ))}

        {/* Gold top line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-secondary)]/60 to-transparent" />

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 text-center px-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="flex items-center justify-center gap-4 mb-6 mt-20"
          >
            <div className="h-px w-16 bg-[var(--color-secondary)]" />
            <span className="font-label text-[var(--color-secondary)] tracking-[0.3em] uppercase text-[10px]">
              Visual Diary
            </span>
            <div className="h-px w-16 bg-[var(--color-secondary)]" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="font-heading text-5xl sm:text-7xl md:text-8xl font-medium italic text-white leading-[0.9] tracking-tight mb-6"
          >
            Our
            <br />
            <span className="text-[var(--color-secondary)]">Gallery</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.45 }}
            className="font-body text-white/60 text-lg max-w-md mx-auto leading-relaxed"
          >
            Every frame a story, every pour a moment worth capturing.
          </motion.p>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="font-label text-white/30 text-[9px] tracking-[0.3em] uppercase">
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-px h-8 bg-gradient-to-b from-[var(--color-secondary)]/60 to-transparent"
          />
        </motion.div>
      </section>

      {/* ── Filter Bar ── */}
      <section className="top-20 z-40 py-5 px-6 md:px-12 bg-[var(--color-background)]/80 backdrop-blur-xl border-b border-[var(--color-outline-variant)]/40">
        <div className="max-w-[1300px] mx-auto flex items-center justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <motion.button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`relative px-5 py-2.5 rounded-full font-label text-[10px] tracking-[0.22em] uppercase transition-all duration-300 ${
                  activeCategory === cat
                    ? "bg-[var(--color-secondary)] text-[#1a120b] shadow-[0_6px_20px_rgba(196,168,130,0.3)]"
                    : "border border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] hover:border-[var(--color-secondary)]/40 hover:text-[var(--color-secondary)]"
                }`}
              >
                {cat}
                {activeCategory === cat && (
                  <motion.span
                    layoutId="filterPill"
                    className="absolute inset-0 rounded-full bg-[var(--color-secondary)] -z-10"
                  />
                )}
              </motion.button>
            ))}
          </div>

          <p className="font-label text-[var(--color-on-surface-variant)] text-[10px] tracking-[0.2em] uppercase">
            {filtered.length} Images
          </p>
        </div>
      </section>

      {/* ── Masonry Grid ── */}
      <section className="py-16 px-6 md:px-12 max-w-[1300px] mx-auto">
        <motion.div
          layout
          className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((item, index) => (
              <GalleryCard
                key={item.id}
                item={item}
                index={index}
                onClick={() => openLightbox(index)}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-16 h-16 rounded-full border border-[var(--color-outline-variant)] flex items-center justify-center">
              <Play size={24} className="text-[var(--color-secondary)]" />
            </div>
            <p className="font-heading italic text-2xl text-[var(--color-on-surface-variant)]">
              No images in this category
            </p>
          </div>
        )}
      </section>

      {/* ── Film Strip Feature ── */}
      <FilmStripSection />

      {/* ── CTA Section ── */}
      <CtaSection />

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            item={filtered[lightboxIndex]}
            index={lightboxIndex}
            total={filtered.length}
            onClose={closeLightbox}
            onPrev={prevImage}
            onNext={nextImage}
          />
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}

/* ─── Gallery Card ─────────────────────────────────────────────────── */
function GalleryCard({
  item,
  index,
  onClick,
}: {
  item: (typeof GALLERY_ITEMS)[0];
  index: number;
  onClick: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.5, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      className="break-inside-avoid mb-4 group relative overflow-hidden rounded-2xl border border-[var(--color-outline-variant)] cursor-pointer"
      onClick={onClick}
    >
      <div
        className="relative overflow-hidden"
        style={{
          aspectRatio:
            item.size === "tall"
              ? "3/4"
              : item.size === "wide"
              ? "16/9"
              : "1/1",
        }}
      >
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          loading="lazy"
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Top gold line — always visible */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-secondary)]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Featured badge */}
        {item.featured && (
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-secondary)]/20 border border-[var(--color-secondary)]/40 backdrop-blur-sm text-[var(--color-secondary)] font-label text-[9px] tracking-[0.2em] uppercase">
              <span className="w-1 h-1 rounded-full bg-[var(--color-secondary)]" />
              Featured
            </span>
          </div>
        )}

        {/* Zoom icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          whileHover={{ opacity: 1, scale: 1 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 border border-white/20 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300"
        >
          <ZoomIn size={20} />
        </motion.div>

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400">
          <p className="font-label text-[var(--color-secondary)] text-[9px] tracking-[0.25em] uppercase mb-1">
            {item.category} · {item.subtitle}
          </p>
          <h3 className="font-heading italic text-xl text-white">
            {item.title}
          </h3>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Film Strip Section ────────────────────────────────────────────── */
function FilmStripSection() {
  const STRIP_IMAGES = [
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=200&fit=crop",
    "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=300&h=200&fit=crop",
    "https://images.unsplash.com/photo-1498804103079-a6351b050096?w=300&h=200&fit=crop",
    "https://images.unsplash.com/photo-1507133750040-4a8f57021571?w=300&h=200&fit=crop",
    "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300&h=200&fit=crop",
    "https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=300&h=200&fit=crop",
    "https://images.unsplash.com/photo-1512568400610-62da28bc8a13?w=300&h=200&fit=crop",
    "https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=300&h=200&fit=crop",
  ];

  return (
    <section className="py-20 overflow-hidden bg-[var(--color-surface-container-lowest)] border-y border-[var(--color-outline-variant)]">
      <div className="mb-5 flex items-center gap-6 px-6 md:px-12 max-w-[1300px] mx-auto">
        <div className="h-px flex-1 bg-gradient-to-r from-[var(--color-secondary)]/30 to-transparent" />
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[var(--color-secondary)]" />
          <span className="font-label text-[var(--color-secondary)] text-[9px] tracking-[0.3em] uppercase">
            Film Roll
          </span>
          <span className="w-2 h-2 rounded-full bg-[var(--color-secondary)]" />
        </div>
        <div className="h-px flex-1 bg-gradient-to-l from-[var(--color-secondary)]/30 to-transparent" />
      </div>

      {/* Scrolling strip — row 1 */}
      <div className="relative flex gap-4 overflow-hidden mb-4">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, ease: "linear", repeat: Infinity }}
          className="flex gap-4 flex-shrink-0"
        >
          {[...STRIP_IMAGES, ...STRIP_IMAGES].map((src, i) => (
            <div
              key={i}
              className="relative flex-shrink-0 w-48 h-32 rounded-xl overflow-hidden border border-[var(--color-outline-variant)] group"
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-cover opacity-60 group-hover:opacity-90 transition-opacity duration-500 group-hover:scale-110 transition-transform"
                sizes="192px"
              />
              {/* Film perforation dots */}
              <div className="absolute top-2 left-2 right-2 flex justify-between pointer-events-none">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="w-2 h-2 rounded-sm bg-black/60 border border-white/20" />
                ))}
              </div>
              <div className="absolute bottom-2 left-2 right-2 flex justify-between pointer-events-none">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="w-2 h-2 rounded-sm bg-black/60 border border-white/20" />
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Row 2 — reverse */}
      <div className="relative flex gap-4 overflow-hidden">
        <motion.div
          animate={{ x: ["-50%", "0%"] }}
          transition={{ duration: 25, ease: "linear", repeat: Infinity }}
          className="flex gap-4 flex-shrink-0"
        >
          {[...STRIP_IMAGES.slice().reverse(), ...STRIP_IMAGES.slice().reverse()].map((src, i) => (
            <div
              key={i}
              className="relative flex-shrink-0 w-48 h-32 rounded-xl overflow-hidden border border-[var(--color-outline-variant)] group"
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-cover opacity-50 group-hover:opacity-85 transition-opacity duration-500 group-hover:scale-110 transition-transform"
                sizes="192px"
              />
              <div className="absolute top-2 left-2 right-2 flex justify-between pointer-events-none">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="w-2 h-2 rounded-sm bg-black/60 border border-white/20" />
                ))}
              </div>
              <div className="absolute bottom-2 left-2 right-2 flex justify-between pointer-events-none">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="w-2 h-2 rounded-sm bg-black/60 border border-white/20" />
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ─── CTA Section ───────────────────────────────────────────────────── */
function CtaSection() {
  return (
    <section className="relative py-36 px-6 md:px-12 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1920&h=800&fit=crop"
          alt=""
          fill
          className="object-cover opacity-20"
          sizes="100vw"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-[var(--color-background)]/80 to-[var(--color-background)]" />

      {/* Ambient glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-[var(--color-secondary)]/8 blur-[100px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-[700px] mx-auto text-center"
      >
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="h-px w-12 bg-[var(--color-secondary)]" />
          <span className="font-label text-[var(--color-secondary)] tracking-[0.3em] uppercase text-[10px]">
            Be Part of the Story
          </span>
          <div className="h-px w-12 bg-[var(--color-secondary)]" />
        </div>

        <h2 className="font-heading text-4xl sm:text-5xl md:text-7xl italic font-medium text-[var(--color-on-background)] leading-[0.95] tracking-tight mb-6">
          Visit Us &
          <br />
          <span className="text-[var(--color-secondary)]">Make Memories</span>
        </h2>

        <p className="font-body text-[var(--color-on-surface-variant)] text-base leading-relaxed mb-10 max-w-md mx-auto">
          Every photograph in our gallery was taken right here. Come experience
          the warmth, the craft, and the community — in person.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/reservations"
              className="inline-flex items-center gap-3 px-9 py-4 rounded-full bg-[var(--color-secondary)] text-[#1a120b] font-label font-bold uppercase tracking-[0.2em] text-xs shadow-[0_10px_30px_rgba(196,168,130,0.3)] hover:brightness-105 transition-all"
            >
              Reserve a Table
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="#menu"
              className="inline-flex items-center gap-3 px-9 py-4 rounded-full border border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] font-label uppercase tracking-[0.2em] text-xs hover:border-[var(--color-secondary)] hover:text-[var(--color-secondary)] transition-all"
            >
              View Menu
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

/* ─── Lightbox ──────────────────────────────────────────────────────── */
function Lightbox({
  item,
  index,
  total,
  onClose,
  onPrev,
  onNext,
}: {
  item: (typeof GALLERY_ITEMS)[0];
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/92 backdrop-blur-xl"
      onClick={onClose}
    >
      {/* Gold top line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-secondary)]/60 to-transparent" />

      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-11 h-11 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all z-10"
      >
        <X size={20} />
      </button>

      {/* Counter */}
      <div className="absolute top-6 left-6 flex items-center gap-3 z-10">
        <div className="h-px w-8 bg-[var(--color-secondary)]" />
        <span className="font-label text-[var(--color-secondary)] text-[10px] tracking-[0.25em] uppercase">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>

      {/* Image */}
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative max-w-5xl max-h-[80vh] w-full mx-16 rounded-2xl overflow-hidden border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.7)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-[75vh]">
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-contain"
            sizes="100vw"
          />
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-8">
          <p className="font-label text-[var(--color-secondary)] text-[10px] tracking-[0.25em] uppercase mb-2">
            {item.category} · {item.subtitle}
          </p>
          <h3 className="font-heading italic text-3xl text-white">
            {item.title}
          </h3>
        </div>
      </motion.div>

      {/* Prev / Next */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        className="absolute left-4 md:left-8 w-12 h-12 rounded-full border border-white/10 bg-black/50 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/70 transition-all backdrop-blur-md"
      >
        <ArrowLeft size={20} />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        className="absolute right-4 md:right-8 w-12 h-12 rounded-full border border-white/10 bg-black/50 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/70 transition-all backdrop-blur-md"
      >
        <ArrowRight size={20} />
      </button>

      {/* Bottom strip thumbnails */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              width: i === index ? 24 : 6,
              opacity: i === index ? 1 : 0.3,
            }}
            className="h-1.5 rounded-full bg-[var(--color-secondary)]"
          />
        ))}
      </div>
    </motion.div>
  );
}