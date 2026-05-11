"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";

export interface DrinkVariant {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  themeColor: string;
  sequencePath: string;
  frameCount: number;
}

interface ParallaxHeroProps {
  variants: DrinkVariant[];
  shopName: string;
  tagline: string;
  onPreloadComplete: () => void;
}

export default function ParallaxHero({ variants, shopName, tagline, onPreloadComplete }: ParallaxHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  // Global cache to store frames for all variants
  const globalImageCache = useRef<Record<string, (HTMLImageElement | null)[]>>({});
  const preloadCalledRef = useRef(false);
  const allFramesLoadedRef = useRef<Record<string, boolean>>({});
  const rafPendingRef = useRef(false);
  const lastFrameIndexRef = useRef(-1);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { theme } = useTheme();
  const variant = variants[currentIndex];

  // ── Scroll activity detection ──────────────────────────────────────────
  useEffect(() => {
    const handleScrollActivity = () => {
      if (!isScrolling) setIsScrolling(true);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => setIsScrolling(false), 1500);
    };
    window.addEventListener("scroll", handleScrollActivity, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScrollActivity);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [isScrolling]);

  // ── Cache canvas context once on mount ──────────────────────────────────
  useEffect(() => {
    if (canvasRef.current) {
      ctxRef.current = canvasRef.current.getContext("2d", { alpha: false });
    }
  }, []);

  // ── Draw a specific frame index ──────────────────────────────────────────
  const drawFrame = useCallback((index: number, variantId: string) => {
    const frames = globalImageCache.current[variantId];
    if (!frames || !ctxRef.current || !canvasRef.current) return;
    
    const img = frames[index];
    if (!img) return;

    ctxRef.current.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
    lastFrameIndexRef.current = index;
  }, []);

  // ── Image preloading ─────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    
    // If we already have this variant's initial frames, we might not need to show loading
    if (!globalImageCache.current[variant.id]) {
      setIsLoading(true);
      setProgress(0);
    } else {
      setIsLoading(false);
      // Even if already "loaded", draw the first frame of the new variant
      requestAnimationFrame(() => drawFrame(0, variant.id));
    }

    const loadSingleImage = (v: DrinkVariant, i: number): Promise<void> =>
      new Promise<void>((resolve) => {
        if (!globalImageCache.current[v.id]) {
          globalImageCache.current[v.id] = new Array(v.frameCount).fill(null);
        }
        
        if (globalImageCache.current[v.id][i]) {
          resolve();
          return;
        }

        const img = new Image();
        const frameNum = i.toString().padStart(3, "0");
        img.src = `${v.sequencePath}frame_${frameNum}.webp`;

        const finish = () => {
          if (cancelled) { resolve(); return; }
          globalImageCache.current[v.id][i] = img;
          
          if (v.id === variant.id) {
            const loaded = globalImageCache.current[v.id].filter(Boolean).length;
            setProgress(Math.round((loaded / v.frameCount) * 100));
          }
          resolve();
        };

        img.onload = finish;
        img.onerror = () => {
          const fc = document.createElement("canvas");
          fc.width = 4; fc.height = 3;
          const fctx = fc.getContext("2d");
          if (fctx) {
            fctx.fillStyle = theme === "dark" ? "#1A120B" : "#FDF6EC";
            fctx.fillRect(0, 0, 4, 3);
          }
          img.src = fc.toDataURL("image/webp");
          finish();
        };
      });

    const loadAllImages = async () => {
      // 1. Preload first frame of ALL variants immediately for instant switching
      await Promise.all(variants.map(v => loadSingleImage(v, 0)));
      if (cancelled) return;

      // 2. Preload first 50 frames of CURRENT variant
      const INITIAL_FRAMES = Math.min(50, variant.frameCount);
      const PHASE1_BATCH = 15;
      
      for (let start = 1; start < INITIAL_FRAMES; start += PHASE1_BATCH) {
        if (cancelled) return;
        const end = Math.min(start + PHASE1_BATCH, INITIAL_FRAMES);
        await Promise.all(
          Array.from({ length: end - start }, (_, k) => loadSingleImage(variant, start + k))
        );
      }

      if (cancelled) return;

      // Dismiss overlay
      if (!preloadCalledRef.current) {
        preloadCalledRef.current = true;
        setIsLoading(false);
        onPreloadComplete();
        drawFrame(0, variant.id);
      }

      // 3. Load the rest of the current variant
      const remaining: Promise<void>[] = [];
      for (let i = INITIAL_FRAMES; i < variant.frameCount; i++) {
        remaining.push(loadSingleImage(variant, i));
      }
      await Promise.all(remaining);
      if (!cancelled) allFramesLoadedRef.current[variant.id] = true;
    };

    loadAllImages();
    return () => { cancelled = true; };
  }, [currentIndex, variant, theme, drawFrame, onPreloadComplete, variants]);

  // ── RAF-throttled scroll handler ─────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      if (isLoading || rafPendingRef.current) return;

      rafPendingRef.current = true;
      requestAnimationFrame(() => {
        rafPendingRef.current = false;

        const scrollTop = window.scrollY;
        const maxScroll = window.innerHeight * 2;
        const scrollFraction = Math.max(0, Math.min(1, scrollTop / maxScroll));
        const targetIndex = Math.floor(scrollFraction * (variant.frameCount - 1));

        if (targetIndex === lastFrameIndexRef.current) return;

        const frames = globalImageCache.current[variant.id];
        if (!frames) return;

        let safeIndex = targetIndex;
        while (safeIndex > 0 && !frames[safeIndex]) safeIndex--;

        drawFrame(safeIndex, variant.id);
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      rafPendingRef.current = false;
    };
  }, [isLoading, variant.frameCount, variant.id, drawFrame]);

  // ── Manual prev/next ─────────────────────────────────────────────────────
  const handlePrev = () => {
    if (isLoading) return;
    setCurrentIndex((prev) => (prev === 0 ? variants.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (isLoading) return;
    setCurrentIndex((prev) => (prev === variants.length - 1 ? 0 : prev + 1));
  };

  // ── Auto-cycle — only when idle and current variant is loaded ──────────
  useEffect(() => {
    if (isLoading || isScrolling) return;

    const interval = setInterval(() => {
      if (!allFramesLoadedRef.current[variant.id]) return;
      setCurrentIndex((prev) => (prev === variants.length - 1 ? 0 : prev + 1));
    }, 4000);

    return () => clearInterval(interval);
  }, [isLoading, isScrolling, variant.id, variants.length]);

  return (
    <section className="relative h-[300vh] w-full bg-background" id="hero">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Canvas — sized in CSS, logical resolution kept at 1920×1080 */}
        <canvas
          ref={canvasRef}
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover z-0"
        />

        <div className="absolute inset-0 bg-black/30 dark:bg-black/50 z-10" />

        {/* Left Content */}
        <div className="absolute left-0 top-0 h-full w-full md:w-1/2 flex flex-col justify-center px-8 md:px-24 z-20 pointer-events-none">
          <div className="pointer-events-auto max-w-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-[2px] bg-[var(--color-secondary)]" />
              <h2 className="text-[var(--color-secondary)] font-label uppercase tracking-[0.2em] text-sm font-semibold drop-shadow-md">
                {tagline}
              </h2>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as any }}
              >
                <h1 className="text-4xl md:text-6xl font-heading font-semibold text-white mb-4 leading-tight drop-shadow-lg tracking-tight">
                  {variant.name}
                </h1>
                <h3 className="text-xl md:text-2xl text-[var(--color-secondary)] mb-6 font-heading italic font-medium drop-shadow-md">
                  {variant.subtitle}
                </h3>
                <p className="text-white/80 text-base md:text-lg mb-10 leading-relaxed font-body max-w-lg drop-shadow-md">
                  {variant.description}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="flex flex-col sm:flex-row gap-5 font-label mt-2">
              <Link
                href="/menu"
                className="group relative flex items-center justify-center px-10 py-4 rounded-full bg-gradient-to-b from-[var(--color-secondary)] to-[#cca176] text-[#1a120b] font-bold uppercase tracking-[0.2em] text-xs shadow-[0_8px_32px_rgba(236,190,142,0.3),inset_0_1px_0_rgba(255,255,255,0.6)] hover:shadow-[0_12px_66px_rgba(236,190,142,0.5),inset_0_1px_0_rgba(255,255,255,0.8)] hover:-translate-y-1 transition-all duration-300"
              >
                Order Now
              </Link>
              <Link
                href="/reservations"
                className="group relative flex items-center justify-center px-10 py-4 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-white font-semibold uppercase tracking-[0.2em] text-xs shadow-[0_8px_32px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)] hover:bg-white/10 hover:border-white/30 hover:-translate-y-1 transition-all duration-300"
              >
                Reserve a Table
              </Link>
            </div>
          </div>
        </div>

        {/* Right Navigation */}
        <div className="absolute right-0 top-0 h-full w-24 md:w-32 flex flex-col items-center justify-center z-20">
          <div className="flex flex-col items-center gap-8 bg-black/20 backdrop-blur-sm py-12 px-4 rounded-full border border-white/10">
            <button
              onClick={handlePrev}
              disabled={isLoading}
              className="text-white/70 hover:text-white transition-colors disabled:opacity-50"
              aria-label="Previous Drink"
            >
              <ChevronUp size={32} />
            </button>

            <div className="h-16 w-px bg-white/20" />

            <AnimatePresence mode="wait">
              <motion.span
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                className="text-4xl font-heading font-bold text-[var(--color-secondary)] my-2"
              >
                {(currentIndex + 1).toString().padStart(2, "0")}
              </motion.span>
            </AnimatePresence>

            <div className="h-16 w-px bg-white/20" />

            <button
              onClick={handleNext}
              disabled={isLoading}
              className="text-white/70 hover:text-white transition-colors disabled:opacity-50"
              aria-label="Next Drink"
            >
              <ChevronDown size={32} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
