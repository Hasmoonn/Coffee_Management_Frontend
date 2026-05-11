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

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  // Refs for high-frequency access without re-binding effects
  const currentIndexRef = useRef(0);
  const variantsRef = useRef(variants);
  const globalImageCache = useRef<Record<string, (HTMLImageElement | null)[]>>({});
  const preloadCalledRef = useRef(false);
  const allFramesLoadedRef = useRef<Record<string, boolean>>({});
  const rafPendingRef = useRef(false);
  const lastFrameIndexRef = useRef(-1);

  const { theme } = useTheme();
  const variant = variants[currentIndex];

  // Keep refs in sync with state
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    variantsRef.current = variants;
  }, [variants]);

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

  // ── Unified background preloading for ALL variants ──────────────────────
  useEffect(() => {
    let cancelled = false;

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
          
          // Only update progress for the very first variant to show the loading screen
          if (v.id === variants[0].id) {
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

    const loadAllVariants = async () => {
      // 1. Preload first frame of ALL variants immediately
      await Promise.all(variants.map(v => loadSingleImage(v, 0)));
      if (cancelled) return;

      // 2. Preload first 50 frames of THE FIRST variant to dismiss the overlay
      const INITIAL_FRAMES = 50;
      const PHASE1_BATCH = 15;
      
      for (let start = 1; start < INITIAL_FRAMES; start += PHASE1_BATCH) {
        if (cancelled) return;
        const end = Math.min(start + PHASE1_BATCH, INITIAL_FRAMES);
        await Promise.all(
          Array.from({ length: end - start }, (_, k) => loadSingleImage(variants[0], start + k))
        );
      }

      if (cancelled) return;

      // Dismiss overlay once the first variant's start is ready
      if (!preloadCalledRef.current) {
        preloadCalledRef.current = true;
        setIsLoading(false);
        onPreloadComplete();
        drawFrame(0, variants[0].id);
      }

      // 3. Background load ALL frames for ALL variants in sequence
      for (const v of variants) {
        if (cancelled) break;
        
        // Fire all remaining frames for this variant
        const remaining: Promise<void>[] = [];
        for (let i = 0; i < v.frameCount; i++) {
          if (!globalImageCache.current[v.id][i]) {
            remaining.push(loadSingleImage(v, i));
          }
        }
        await Promise.all(remaining);
        if (!cancelled) allFramesLoadedRef.current[v.id] = true;
      }
    };

    loadAllVariants();
    return () => { cancelled = true; };
  }, [theme, drawFrame, onPreloadComplete, variants]);

  // ── Scroll handler (Bound once, uses Refs) ──────────────────────────────
  // This ensures the listener is NEVER re-added during auto-cycling.
  useEffect(() => {
    const handleScroll = () => {
      if (isLoading || rafPendingRef.current) return;

      rafPendingRef.current = true;
      requestAnimationFrame(() => {
        rafPendingRef.current = false;

        const variant = variantsRef.current[currentIndexRef.current];
        if (!variant) return;

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
  }, [isLoading, drawFrame]);

  // ── Manual prev/next ─────────────────────────────────────────────────────
  const handlePrev = () => {
    if (isLoading) return;
    setCurrentIndex((prev) => (prev === 0 ? variants.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (isLoading) return;
    setCurrentIndex((prev) => (prev === variants.length - 1 ? 0 : prev + 1));
  };

  // ── Continuous Auto-cycle (No scroll dependency) ────────────────────────
  useEffect(() => {
    if (isLoading) return;

    const interval = setInterval(() => {
      // We check if the NEXT variant is ready to be shown (at least has frame 0)
      const nextIndex = (currentIndexRef.current + 1) % variantsRef.current.length;
      const nextVariant = variantsRef.current[nextIndex];
      
      // If next variant's first frame is ready, cycle the text/background
      if (globalImageCache.current[nextVariant.id]?.[0]) {
        setCurrentIndex(nextIndex);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <section className="relative h-[300vh] w-full bg-background" id="hero">
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden">
        {/* Canvas — sized in CSS, logical resolution kept at 1920×1080 */}
        <canvas
          ref={canvasRef}
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover z-0"
        />

        <div className="absolute inset-0 bg-black/30 dark:bg-black/50 z-10" />

        {/* Left Content */}
        <div className="absolute left-0 top-8 h-full w-full lg:w-1/2 flex flex-col justify-center px-6 md:px-16 lg:px-24 z-20 pointer-events-none pt-24 lg:pt-0">
          <div className="pointer-events-auto max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
              <div className="w-8 md:w-12 h-[2px] bg-[var(--color-secondary)]" />
              <h2 className="text-[var(--color-secondary)] font-label uppercase tracking-[0.2em] text-xs md:text-sm font-semibold drop-shadow-md">
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
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-semibold text-white mb-4 leading-tight drop-shadow-lg tracking-tight">
                  {variant.name}
                </h1>
                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl text-[var(--color-secondary)] mb-6 font-heading italic font-medium drop-shadow-md">
                  {variant.subtitle}
                </h3>
                <p className="text-white/80 text-xs sm:text-sm md:text-base lg:text-lg mb-10 leading-relaxed font-body max-w-lg mx-auto lg:mx-0 drop-shadow-md">
                  {variant.description}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 font-label mt-2">
              <Link
                href="/menu"
                className="w-full sm:w-auto group relative flex items-center justify-center px-10 py-4 rounded-full bg-gradient-to-b from-[var(--color-secondary)] to-[#cca176] text-[#1a120b] font-bold uppercase tracking-[0.2em] text-xs shadow-[0_8px_32px_rgba(236,190,142,0.3),inset_0_1px_0_rgba(255,255,255,0.6)] hover:shadow-[0_12px_66px_rgba(236,190,142,0.5),inset_0_1px_0_rgba(255,255,255,0.8)] hover:-translate-y-1 transition-all duration-300"
              >
                Order Now
              </Link>
              <Link
                href="/reservations"
                className="w-full sm:w-auto group relative flex items-center justify-center px-10 py-4 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-white font-semibold uppercase tracking-[0.2em] text-xs shadow-[0_8px_32px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)] hover:bg-white/10 hover:border-white/30 hover:-translate-y-1 transition-all duration-300"
              >
                Reserve a Table
              </Link>
            </div>
          </div>
        </div>

        {/* Right Navigation — Desktop Only */}
        <div className="hidden lg:flex absolute right-0 top-0 h-full w-32 flex-col items-center justify-center z-20">
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
