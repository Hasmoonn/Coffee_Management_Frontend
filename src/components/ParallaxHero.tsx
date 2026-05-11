"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, Loader2 } from "lucide-react";
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
  const preloadCalledRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { setTheme, theme } = useTheme();

  const variant = variants[currentIndex];
  const imagesRef = useRef<HTMLImageElement[]>([]);
  
  // Preload images for current variant
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setProgress(0);
    preloadCalledRef.current = false;

    // Pre-allocate the images array so scroll handler can use partial results
    const images: (HTMLImageElement | null)[] = new Array(variant.frameCount).fill(null);
    imagesRef.current = images as HTMLImageElement[];
    let loadedCount = 0;

    // Set theme color CSS variable globally for CTA buttons
    document.documentElement.style.setProperty('--current-theme-color', variant.themeColor);

    // Lightweight fallback: single solid color, no text (avoids per-frame canvas CPU cost)
    const makeFallbackSrc = (): string => {
      const canvas = document.createElement("canvas");
      canvas.width = 4;
      canvas.height = 3;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = theme === 'dark' ? '#1A120B' : '#FDF6EC';
        ctx.fillRect(0, 0, 4, 3);
      }
      return canvas.toDataURL("image/webp");
    };

    const loadSingleImage = (i: number): Promise<void> => {
      return new Promise<void>((resolve) => {
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
          img.src = makeFallbackSrc();
          // Resolve without waiting for the tiny fallback reload
          finish();
        };
      });
    };

    const INITIAL_FRAMES = Math.min(50, variant.frameCount);
    const PHASE1_BATCH = 12; // parallel batch size while overlay is still showing

    const loadAllImages = async () => {
      // ── Phase 1: load first 50 frames in parallel batches ──────────────
      // These must be ready before the overlay dismisses so early scroll works.
      for (let start = 0; start < INITIAL_FRAMES; start += PHASE1_BATCH) {
        if (cancelled) return;
        const end = Math.min(start + PHASE1_BATCH, INITIAL_FRAMES);
        const batch: Promise<void>[] = [];
        for (let i = start; i < end; i++) {
          batch.push(loadSingleImage(i));
        }
        await Promise.all(batch);
      }

      // Dismiss overlay once first 50 frames are ready
      if (!cancelled && !preloadCalledRef.current) {
        preloadCalledRef.current = true;
        setIsLoading(false);
        onPreloadComplete();
        // Draw frame 0 immediately
        if (canvasRef.current && images[0]) {
          const ctx = canvasRef.current.getContext("2d");
          if (ctx) ctx.drawImage(images[0]!, 0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }

      // ── Phase 2: fire ALL remaining frames simultaneously ──────────────
      // Don't batch-and-wait — kick every request off at once so the browser
      // (HTTP/2 multiplexing) downloads them as fast as the network allows.
      // Frames become available one-by-one as they arrive; the scroll handler
      // already falls back to the nearest loaded frame, so no jank.
      if (!cancelled) {
        const remaining: Promise<void>[] = [];
        for (let i = INITIAL_FRAMES; i < variant.frameCount; i++) {
          remaining.push(loadSingleImage(i));
        }
        await Promise.all(remaining);
      }
    };

    loadAllImages();

    return () => { cancelled = true; };
  }, [currentIndex, variant, theme]); // Added theme to re-render fallback images if theme changes

  // Scroll mapping
  useEffect(() => {
    const handleScroll = () => {
      if (isLoading || imagesRef.current.length === 0) return;
      
      const scrollTop = window.scrollY;
      const maxScroll = window.innerHeight * 2; // Hero scroll length
      const scrollFraction = Math.max(0, Math.min(1, scrollTop / maxScroll));
      
      const frameIndex = Math.floor(scrollFraction * (variant.frameCount - 1));
      
      // Find the nearest loaded frame (scan backwards for the closest ready frame)
      let safeIndex = frameIndex;
      while (safeIndex > 0 && !imagesRef.current[safeIndex]) safeIndex--;

      if (canvasRef.current && imagesRef.current[safeIndex]) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          ctx.drawImage(imagesRef.current[safeIndex], 0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLoading, variant.frameCount]);

  const handlePrev = () => {
    if (isLoading) return;
    setCurrentIndex((prev) => (prev === 0 ? variants.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (isLoading) return;
    setCurrentIndex((prev) => (prev === variants.length - 1 ? 0 : prev + 1));
  };

  // Auto-cycle variants every 2 seconds
  useEffect(() => {
    if (isLoading) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === variants.length - 1 ? 0 : prev + 1));
    }, 3000);

    return () => clearInterval(interval);
  }, [isLoading, variants.length]);

  return (
    <section className="relative h-[300vh] w-full bg-background" id="hero">
      {/* Sticky container for the full screen viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Canvas Background */}
        <canvas
          ref={canvasRef}
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover z-0"
        />

        {/* Overlay to ensure text readability */}
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
            
            <div className="h-16 w-px bg-white/20 relative">
               {isLoading && (
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
               )}
            </div>

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
