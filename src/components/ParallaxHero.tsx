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
  // Cache the 2D context so we never call getContext() inside scroll/RAF
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const preloadCalledRef = useRef(false);
  const allFramesLoadedRef = useRef(false); // true once every frame is ready
  const rafPendingRef = useRef(false);       // RAF de-dupe flag
  const lastFrameIndexRef = useRef(-1);      // avoid re-drawing the same frame

  const { theme } = useTheme();
  const variant = variants[currentIndex];

  // ── Cache canvas context once on mount ──────────────────────────────────
  useEffect(() => {
    if (canvasRef.current) {
      ctxRef.current = canvasRef.current.getContext("2d");
    }
  }, []);

  // ── Draw a specific frame index ──────────────────────────────────────────
  const drawFrame = useCallback((index: number) => {
    const img = imagesRef.current[index];
    if (!img || !ctxRef.current || !canvasRef.current) return;
    ctxRef.current.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
    lastFrameIndexRef.current = index;
  }, []);

  // ── Image preloading ─────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setProgress(0);
    preloadCalledRef.current = false;
    allFramesLoadedRef.current = false;
    lastFrameIndexRef.current = -1;

    // Pre-allocate so the scroll handler can index by position immediately
    const images: (HTMLImageElement | null)[] = new Array(variant.frameCount).fill(null);
    imagesRef.current = images;
    let loadedCount = 0;

    document.documentElement.style.setProperty("--current-theme-color", variant.themeColor);

    // Tiny 4×3 fallback — no per-frame canvas generation overhead
    let fallbackSrc: string | null = null;
    const getFallbackSrc = (): string => {
      if (fallbackSrc) return fallbackSrc;
      const fc = document.createElement("canvas");
      fc.width = 4; fc.height = 3;
      const fctx = fc.getContext("2d");
      if (fctx) {
        fctx.fillStyle = theme === "dark" ? "#1A120B" : "#FDF6EC";
        fctx.fillRect(0, 0, 4, 3);
      }
      fallbackSrc = fc.toDataURL("image/webp");
      return fallbackSrc;
    };

    const loadSingleImage = (i: number): Promise<void> =>
      new Promise<void>((resolve) => {
        const img = new Image();
        const frameNum = i.toString().padStart(3, "0");
        img.src = `${variant.sequencePath}frame_${frameNum}.webp`;

        const finish = () => {
          if (cancelled) { resolve(); return; }
          images[i] = img;
          loadedCount++;
          setProgress(Math.round((loadedCount / variant.frameCount) * 100));
          resolve();
        };

        img.onload = finish;
        img.onerror = () => {
          // Use tiny fallback — set src directly, no waiting for another onload
          img.src = getFallbackSrc();
          finish();
        };
      });

    const INITIAL_FRAMES = Math.min(50, variant.frameCount);
    const PHASE1_BATCH = 12;

    const loadAllImages = async () => {
      // ── Phase 1: first 50 frames in small parallel batches ───────────────
      // Keep batches small during Phase 1 so the network isn't saturated and
      // frame 0 arrives ASAP to be drawn before the overlay lifts.
      for (let start = 0; start < INITIAL_FRAMES; start += PHASE1_BATCH) {
        if (cancelled) return;
        const end = Math.min(start + PHASE1_BATCH, INITIAL_FRAMES);
        await Promise.all(
          Array.from({ length: end - start }, (_, k) => loadSingleImage(start + k))
        );
      }

      if (cancelled) return;

      // Dismiss overlay and draw frame 0
      if (!preloadCalledRef.current) {
        preloadCalledRef.current = true;
        setIsLoading(false);
        onPreloadComplete();
        drawFrame(0);
      }

      // ── Phase 2: ALL remaining frames fired simultaneously ────────────────
      // HTTP/2 multiplexes them; each resolves as soon as its bytes arrive.
      // The scroll handler picks the nearest already-loaded frame while gaps fill in.
      if (!cancelled) {
        const remaining: Promise<void>[] = [];
        for (let i = INITIAL_FRAMES; i < variant.frameCount; i++) {
          remaining.push(loadSingleImage(i));
        }
        await Promise.all(remaining);
        if (!cancelled) allFramesLoadedRef.current = true;
      }
    };

    loadAllImages();
    return () => { cancelled = true; };
  }, [currentIndex, variant, theme, drawFrame, onPreloadComplete]);

  // ── RAF-throttled scroll handler ─────────────────────────────────────────
  // KEY FIX: never call drawImage outside of a requestAnimationFrame callback.
  // This prevents dozens of 1920×1080 canvas paints per second jamming the main thread.
  useEffect(() => {
    const handleScroll = () => {
      if (isLoading) return;           // overlay still showing — nothing to draw
      if (rafPendingRef.current) return; // a RAF is already queued for this frame

      rafPendingRef.current = true;
      requestAnimationFrame(() => {
        rafPendingRef.current = false;

        const scrollTop = window.scrollY;
        const maxScroll = window.innerHeight * 2;
        const scrollFraction = Math.max(0, Math.min(1, scrollTop / maxScroll));
        const targetIndex = Math.floor(scrollFraction * (variant.frameCount - 1));

        // Skip if we'd draw the same frame as last time
        if (targetIndex === lastFrameIndexRef.current) return;

        // Find nearest already-loaded frame (scan backwards)
        let safeIndex = targetIndex;
        while (safeIndex > 0 && !imagesRef.current[safeIndex]) safeIndex--;

        drawFrame(safeIndex);
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      // Cancel any pending RAF on cleanup
      rafPendingRef.current = false;
    };
  }, [isLoading, variant.frameCount, drawFrame]);

  // ── Manual prev/next ─────────────────────────────────────────────────────
  const handlePrev = () => {
    if (isLoading) return;
    setCurrentIndex((prev) => (prev === 0 ? variants.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (isLoading) return;
    setCurrentIndex((prev) => (prev === variants.length - 1 ? 0 : prev + 1));
  };

  // ── Auto-cycle — only when ALL frames for the current variant are loaded ──
  // This prevents restarting a 240-frame load mid-way through the previous one.
  useEffect(() => {
    if (isLoading) return;

    const interval = setInterval(() => {
      // Don't cycle if background frames are still downloading
      if (!allFramesLoadedRef.current) return;
      setCurrentIndex((prev) => (prev === variants.length - 1 ? 0 : prev + 1));
    }, 3000);

    return () => clearInterval(interval);
  }, [isLoading, variants.length]);

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
