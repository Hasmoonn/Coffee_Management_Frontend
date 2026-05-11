"use client";

import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import ParallaxHero, { DrinkVariant } from "@/components/ParallaxHero";
import ArtisanStories from "@/components/ArtisanStories";
import Sections from "@/components/Sections";
import Footer from "@/components/Footer";
import CursorGlow from "@/components/CursorGlow";
import { motion, AnimatePresence } from "framer-motion";

const CONFIG = {
  shopName: "Brew & Co.",
  tagline: "Experience the Perfect Pour",
  variants: [
    {
      id: "velvet-espresso",
      name: "Velvet Espresso",
      subtitle: "Dark, rich, and intensely smooth.",
      description: "A double shot of our signature dark espresso blend, extracted over 28 seconds to capture the perfect crema, topped with velvety microfoam.",
      themeColor: "#e0c0b4", // Primary
      sequencePath: "/sequence/coffee/",
      frameCount: 240, // 240 frames for the scroll sequence
    },
    {
      id: "caramel-macchiato",
      name: "Caramel Macchiato",
      subtitle: "Sweet, layered perfection.",
      description: "Madagascar vanilla syrup, freshly steamed milk, and our rich espresso poured over, finished with a generous drizzle of buttery caramel.",
      themeColor: "#ecbe8e", // Secondary
      sequencePath: "/sequence/coffee/",
      frameCount: 240,
    },
    {
      id: "pour-over",
      name: "Pour Over Reserve",
      subtitle: "Clean, vibrant, and exact.",
      description: "Single-origin Ethiopian beans, carefully brewed in a V60 to highlight their delicate floral aromas, bright citrus acidity, and a vibrant finish that lingers on the palate.",
      themeColor: "#cbc6bd", // Tertiary
      sequencePath: "/sequence/coffee/",
      frameCount: 240,
    }
  ] as DrinkVariant[]
};

import { useUser } from "@/hooks/useUser";

export default function Home() {
  const [isPreloaded, setIsPreloaded] = useState(false);
  const preloadReadyRef = React.useRef(false);

  // Enforce a minimum display time of 1.2s for the overlay
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (preloadReadyRef.current) 
        setIsPreloaded(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handlePreloadComplete = React.useCallback(() => {
    preloadReadyRef.current = true;
    // If the minimum time has already passed, dismiss immediately
    setTimeout(() => setIsPreloaded(true), 0);
  }, []);
  const { user, loading } = useUser();

  // If user is admin/staff, they shouldn't see the landing page
  React.useEffect(() => {
    if (!loading && user && (user.role === "ADMIN" || user.role === "STAFF")) {
      window.location.href = "/admin";
    }
  }, [user, loading]);

  if (!loading && user && (user.role === "ADMIN" || user.role === "STAFF")) {
    return null;
  }

  return (
    <main className="relative min-h-screen bg-background text-foreground selection:bg-[var(--current-theme-color,#6F4E37)] selection:text-white">
      <CursorGlow />
      {/* Loading Overlay */}
      <AnimatePresence>
        {!isPreloaded && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] bg-[var(--color-surface-container-lowest)] flex flex-col items-center justify-center text-[var(--color-secondary)]"
          >
            <div className="relative flex flex-col items-center justify-center w-64 h-64 mb-4">
              <div className="absolute inset-0 bg-[var(--color-secondary)]/5 blur-[40px] rounded-full animate-pulse" />
              
              {/* Animated Steam */}
              <div className="absolute top-[10px] w-full flex justify-center z-10">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-[var(--color-secondary)] drop-shadow-md opacity-80">
                  {[
                    { d: "M 25 80 Q 15 50 25 20 T 25 -10", delay: 0.5 },
                    { d: "M 40 75 Q 55 45 40 15 T 40 -15", delay: 0 },
                    { d: "M 55 80 Q 65 50 55 20 T 55 -10", delay: 1 }
                  ].map((steam, i) => (
                    <motion.path
                      key={i}
                      d={steam.d}
                      style={{ filter: "blur(1px)" }}
                      initial={{ pathLength: 0, opacity: 0, y: 0 }}
                      animate={{ 
                        pathLength: [0, 1, 1],
                        opacity: [0, 0.9, 0],
                        y: [0, -15, -40]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: steam.delay,
                        ease: "easeInOut"
                      }}
                    />
                  ))}
                </svg>
              </div>

              {/* Coffee Cup with Lid (Line art drawing animation) */}
              <svg width="100" height="120" viewBox="0 0 100 120" fill="none" className="z-20 text-[var(--color-secondary)] drop-shadow-2xl mt-8">
                {/* Cup background faint gradient fill */}
                <motion.path 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
                  d="M 20 40 L 80 40 L 70 100 C 70 105 65 105 60 105 L 40 105 C 35 105 30 105 30 100 Z" 
                  fill="url(#cupGradient)" 
                />
                
                {/* Cup lines */}
                <motion.path 
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: "easeInOut" }}
                  d="M 20 40 L 80 40 L 70 100 C 70 105 65 105 60 105 L 40 105 C 35 105 30 105 30 100 Z" 
                  stroke="currentColor" strokeWidth="3" strokeLinejoin="round" 
                />
                
                {/* Lid Fill */}
                <motion.path 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}
                  d="M 15 40 L 85 40 L 80 30 C 78 26 75 25 70 25 L 30 25 C 25 25 22 26 20 30 Z" 
                  fill="currentColor" opacity="0.15"
                />
                
                {/* Lid lines */}
                <motion.path 
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.5, ease: "easeInOut" }}
                  d="M 15 40 L 85 40 L 80 30 C 78 26 75 25 70 25 L 30 25 C 25 25 22 26 20 30 Z" 
                  stroke="currentColor" strokeWidth="3" strokeLinejoin="round" 
                />
                
                {/* Sipper lines */}
                <motion.path 
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 1, ease: "easeInOut" }}
                  d="M 40 25 L 40 20 C 40 16 43 14 47 14 L 53 14 C 57 14 60 16 60 20 L 60 25" 
                  stroke="currentColor" strokeWidth="3" strokeLinecap="round" 
                />
                
                {/* Sleeve lines */}
                <motion.path 
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 1.5, ease: "easeInOut" }}
                  d="M 23 55 L 77 55 M 26 80 L 74 80" 
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" 
                />

                {/* Defs for gradient */}
                <defs>
                  <linearGradient id="cupGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.05" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0.25" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-heading italic text-3xl mb-4 text-[var(--color-on-surface)]"
            >
              {CONFIG.shopName}
            </motion.h1>
            
            <p className="text-center text-xs text-[var(--color-on-surface-variant)] tracking-[0.3em] uppercase font-label">
              Brewing Experience...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <Navigation />
      
      <ParallaxHero 
        variants={CONFIG.variants}
        shopName={CONFIG.shopName}
        tagline={CONFIG.tagline}
        onPreloadComplete={handlePreloadComplete}
      />
      
      <ArtisanStories />
      
      <Sections />
      
      <Footer />
    </main>
  );
}
