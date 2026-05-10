// components/Navigation.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut, UserCircle2, ArrowUpRight, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useUser } from "@/hooks/useUser";

export default function Navigation() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { totalItems } = useCart();
  const { user } = useUser(isLoggedIn);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);

    const handleScroll = () => {
      const sectionsEl = document.getElementById("sections-wrapper");
      if (sectionsEl) {
        setIsScrolled(sectionsEl.getBoundingClientRect().top <= 120);
      } else {
        setIsScrolled(window.scrollY > 50);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    // Global redirect for admins on customer pages
    if (token && user && (user.role === "ADMIN" || user.role === "STAFF") && !pathname?.startsWith("/admin")) {
      window.location.href = "/admin";
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, [user, pathname]);

  if (pathname?.startsWith("/admin")) return null;

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsLoggedIn(false);
    setIsMobileMenuOpen(false);
    window.location.href = "/";
  };

  const navLinks = [
    { name: "Menu", href: "/menu" },
    { name: "Reservations", href: "/reservations" },
    { name: "Loyalty", href: "/loyalty" },
    { name: "Gallery", href: "/gallery" },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-5 left-1/2 -translate-x-1/2 w-[95%] max-w-[1320px] z-50 transition-all duration-500 ${
        isScrolled ? "scale-[0.985]" : "scale-100"
      }`}
    >
      <div
        className={`relative overflow-hidden rounded-full border transition-all duration-500 ${
          isScrolled
            ? "bg-black/55 border-white/10 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.45)] py-3 px-5 md:px-8"
            : "bg-black/25 border-white/10 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.30)] py-4 px-5 md:px-8"
        }`}
      >
        {/* cinematic glow */}
        <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-[var(--color-secondary)]/6 via-transparent to-[var(--color-secondary)]/6" />
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-px w-[40%] bg-gradient-to-r from-transparent via-[var(--color-secondary)]/60 to-transparent" />
        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] rounded-full" />

        <div className="relative z-10 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="hidden sm:flex flex-col leading-none">
              <span className="font-label text-[9px] tracking-[0.35em] uppercase text-white/45 mb-1">
                Artisan Roast House
              </span>
              <span className="font-heading italic text-2xl md:text-[30px] font-medium tracking-tight text-white">
                Brew & Co.
              </span>
            </div>

            <div className="sm:hidden">
              <span className="font-heading italic text-2xl font-medium tracking-tight text-white">
                Brew & Co.
              </span>
            </div>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-5">
            <ul className="flex items-center gap-1">
              {navLinks.map((link, index) => (
                <motion.li
                  key={link.name}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + index * 0.05, duration: 0.45 }}
                >
                  <Link
                    href={link.href}
                    className="group relative px-3 py-2 font-label text-[11px] tracking-[0.18em] uppercase text-white/78 hover:text-white transition-colors duration-300"
                  >
                    {link.name}
                    <span className="absolute left-3 right-3 bottom-[6px] h-px origin-left scale-x-0 bg-gradient-to-r from-[var(--color-secondary)] to-transparent transition-transform duration-300 group-hover:scale-x-100" />
                  </Link>
                </motion.li>
              ))}
            </ul>

            <div className="h-5 w-px bg-white/10" />

            <Link href="/cart" className="relative flex items-center justify-center h-10 w-10 rounded-full hover:bg-white/10 transition-colors text-white/80 hover:text-white">
              <ShoppingBag size={18} />
              {mounted && totalItems > 0 && (
                <span className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-[var(--color-secondary)] text-[#1a120b] flex items-center justify-center text-[8px] font-bold">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Auth */}
            {mounted && isLoggedIn ? (
              <div className="flex items-center gap-3">

                <Link href="/dashboard" className="flex items-center gap-2 rounded-full border border-[var(--color-secondary)]/20 bg-[var(--color-secondary)]/10 px-3.5 py-2 text-[var(--color-secondary)] backdrop-blur-md hover:bg-[var(--color-secondary)]/20 transition-all cursor-pointer">
                  <UserCircle2 size={15} />
                  <span className="font-label text-[10px] tracking-[0.2em] uppercase font-bold">
                    Dashboard
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-3.5 py-2 font-label text-[10px] tracking-[0.2em] uppercase text-red-300 hover:bg-red-500/15 transition-all"
                >
                  <LogOut size={13} />
                  Logout
                </button>
              </div>
            ) : (
              mounted && (
                <div className="flex items-center gap-3">
                  <Link
                    href="/auth/login"
                    className="font-label text-[10px] tracking-[0.22em] uppercase text-white/65 hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>

                  <Link
                    href="/auth/register"
                    className="group inline-flex items-center gap-2 rounded-full border border-[var(--color-secondary)]/20 bg-[var(--color-secondary)] px-4 py-2.5 text-[#1a120b] shadow-[0_8px_24px_rgba(196,168,130,0.28)] transition-all duration-300 hover:brightness-105 hover:shadow-[0_10px_30px_rgba(196,168,130,0.38)]"
                  >
                    <span className="font-label text-[10px] font-bold tracking-[0.22em] uppercase">
                      Join Us
                    </span>
                    <ArrowUpRight size={13} />
                  </Link>
                </div>
              )
            )}
          </div>

          {/* Mobile Cart & Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <Link href="/cart" className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white backdrop-blur-md transition hover:bg-white/10">
              <ShoppingBag size={18} />
              {mounted && totalItems > 0 && (
                <span className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-[var(--color-secondary)] text-[#1a120b] flex items-center justify-center text-[8px] font-bold">
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white backdrop-blur-md transition hover:bg-white/10"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile cinematic menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden mt-4 overflow-hidden rounded-[24px] border border-white/10 bg-black/70 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
          >
            <div className="pointer-events-none h-px w-full bg-gradient-to-r from-transparent via-[var(--color-secondary)]/70 to-transparent" />
            <div className="relative p-6">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[var(--color-secondary)]/8 via-transparent to-transparent" />

              <div className="relative z-10">
                <div className="mb-6">
                  <p className="font-label text-[10px] tracking-[0.3em] uppercase text-[var(--color-secondary)] mb-2">
                    Navigate the Experience
                  </p>
                  <h3 className="font-heading italic text-2xl text-white">
                    Brew & Co.
                  </h3>
                </div>

                <div className="flex flex-col">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.25 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="group flex items-center justify-between border-b border-white/8 py-4 text-white/80 transition-colors hover:text-white"
                      >
                        <span className="font-label text-xs tracking-[0.2em] uppercase">
                          {link.name}
                        </span>
                        <ArrowUpRight
                          size={14}
                          className="text-[var(--color-secondary)] opacity-60 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                        />
                      </Link>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 pt-2">
                  {mounted && isLoggedIn ? (
                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        href="/dashboard"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-2 rounded-full border border-[var(--color-secondary)]/20 bg-[var(--color-secondary)]/10 py-3 text-[var(--color-secondary)] font-label font-bold text-xs tracking-[0.22em] uppercase hover:bg-[var(--color-secondary)]/20 transition-all"
                      >
                        <UserCircle2 size={14} />
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 py-3 text-red-300 font-label text-xs tracking-[0.22em] uppercase hover:bg-red-500/15 transition-all"
                      >
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        href="/auth/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-center rounded-full border border-white/10 bg-white/5 py-3 text-white/80 font-label text-xs tracking-[0.2em] uppercase hover:bg-white/10 transition-all"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/auth/register"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-center rounded-full bg-[var(--color-secondary)] py-3 text-[#1a120b] font-label font-bold text-xs tracking-[0.2em] uppercase hover:brightness-105 transition-all"
                      >
                        Join Us
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}