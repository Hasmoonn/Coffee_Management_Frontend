// components/Footer.tsx
"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Mail, ArrowUpRight, MapPin } from "lucide-react";

const NAV_LINKS = [
  {
    heading: "Explore",
    links: [
      { label: "Menu", href: "#menu" },
      { label: "Our Story", href: "#story" },
      { label: "The Roastery", href: "#roastery" },
      { label: "Loyalty Rewards", href: "#loyalty" },
    ],
  },
  {
    heading: "Visit",
    links: [
      { label: "Reservations", href: "/reservations" },
      { label: "Gallery", href: "/gallery" },
      { label: "Events", href: "#events" },
      { label: "Gift Cards", href: "#gifts" },
    ],
  },
];

/* ── Inline SVG social icons (no lucide dependency) ── */
function IconInstagram({ size = 15 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconX({ size = 15 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.261 5.632 5.903-5.632Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const SOCIALS = [
  { Icon: IconInstagram, href: "#", label: "Instagram" },
  { Icon: IconX, href: "#", label: "X (Twitter)" },
  {
    Icon: ({ size = 15 }: { size?: number }) => <Mail size={size} />,
    href: "#",
    label: "Email",
  },
];

export default function Footer() {
  const footerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ["start end", "end end"],
  });
  const logoY = useTransform(scrollYProgress, [0, 1], [40, 0]);
  const logoOpacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

  return (
    <footer
      ref={footerRef}
      className="relative bg-[var(--color-surface-container-lowest)] overflow-hidden"
    >
      {/* Ambient top glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[2px] bg-gradient-to-r from-transparent via-[var(--color-secondary)]/40 to-transparent" />
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[120px] bg-[var(--color-secondary)]/5 blur-[60px] rounded-full" />

      {/* Vertical decorative lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-[var(--color-secondary)]/10 via-transparent to-transparent"
            style={{ left: `${25 + i * 16}%` }}
          />
        ))}
      </div>

      {/* Cinematic large logo watermark */}
      <motion.div
        style={{ y: logoY, opacity: logoOpacity }}
        className="pointer-events-none absolute inset-x-0 top-12 flex items-center justify-center overflow-hidden"
        aria-hidden
      >
        <span className="font-heading italic text-[15vw] sm:text-[12vw] font-bold text-[var(--color-secondary)]/5 select-none whitespace-nowrap leading-none tracking-tight">
          Brew & Co.
        </span>
      </motion.div>

      <div className="relative z-10 max-w-[1300px] mx-auto px-6 md:px-12">
        {/* Top section */}
        <div className="pt-24 pb-16 grid grid-cols-1 md:grid-cols-12 gap-12 border-b border-[var(--color-outline-variant)]">
          
          {/* ── Brand column ── */}
          <div className="md:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                href="/"
                className="inline-block font-heading italic text-5xl font-medium text-[var(--color-secondary)] mb-6 hover:brightness-110 transition-all"
              >
                Brew & Co.
              </Link>

              <p className="font-body text-[var(--color-on-surface-variant)] leading-relaxed max-w-sm mb-8 text-base">
                Crafting cinematic coffee experiences in the heart of
                Colombo&apos;s Artisan District. Every cup is a small act of
                devotion.
              </p>

              {/* Location */}
              <div className="flex items-start gap-3 mb-8">
                <MapPin
                  size={16}
                  className="text-[var(--color-secondary)] mt-0.5 flex-shrink-0"
                />
                <p className="font-body text-[var(--color-on-surface-variant)] text-sm leading-relaxed">
                  123 Galle Road, Colombo 03
                  <br />
                  Colombo, Sri Lanka
                  <br />
                  +94 11 234 5678
                </p>
              </div>

              {/* Social icons */}
              <div className="flex gap-3">
                {SOCIALS.map(({ Icon, href, label }) => (
                  <motion.a
                    key={label}
                    href={href}
                    aria-label={label}
                    whileHover={{
                      scale: 1.1,
                      borderColor: "var(--color-secondary)",
                      color: "var(--color-secondary)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 rounded-full border border-[var(--color-outline-variant)] flex items-center justify-center text-[var(--color-on-surface-variant)] transition-colors duration-300"
                  >
                    <Icon size={15} />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── Nav columns ── */}
          {NAV_LINKS.map((col, colIdx) => (
            <div key={col.heading} className="md:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.7,
                  delay: 0.1 + colIdx * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <h4 className="font-label text-[var(--color-on-surface)] text-xs tracking-[0.25em] uppercase font-medium mb-6">
                  {col.heading}
                </h4>
                <ul className="space-y-3.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="font-body text-[var(--color-on-surface-variant)] text-sm hover:text-[var(--color-secondary)] transition-colors duration-200 flex items-center gap-1 group"
                      >
                        {link.label}
                        <ArrowUpRight
                          size={11}
                          className="opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          ))}

          {/* ── Newsletter column ── */}
          <div className="md:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.7,
                delay: 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <h4 className="font-label text-[var(--color-on-surface)] text-xs tracking-[0.25em] uppercase font-medium mb-6">
                Stay in the Loop
              </h4>
              <p className="font-body text-[var(--color-on-surface-variant)] text-sm leading-relaxed mb-5">
                Seasonal menus, roasting notes, and exclusive member drops —
                straight to your inbox.
              </p>

              <div className="flex flex-col gap-3">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-full border border-[var(--color-outline-variant)] bg-[var(--color-surface-container)] text-[var(--color-on-surface)] font-body text-sm placeholder:text-[var(--color-on-surface-variant)]/50 focus:outline-none focus:border-[var(--color-secondary)] transition-colors"
                />
                <motion.button
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 8px 24px rgba(196,168,130,0.3)",
                  }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-3 rounded-full bg-[var(--color-secondary)] text-[#1a120b] font-label font-bold uppercase tracking-[0.15em] text-xs hover:brightness-105 transition-all"
                >
                  Subscribe
                </motion.button>
              </div>

              <p className="font-label text-[var(--color-on-surface-variant)]/50 text-[10px] mt-3 tracking-wide">
                No spam. Unsubscribe anytime.
              </p>
            </motion.div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="py-8 flex flex-col md:flex-row items-center justify-between gap-5"
        >
          <p className="font-label text-[var(--color-on-surface-variant)]/50 text-xs tracking-wider">
            © {new Date().getFullYear()} Brew & Co. All rights reserved.
            Crafted with obsession in Colombo, Sri Lanka.
          </p>

          <div className="flex items-center gap-6">
            {["Privacy Policy", "Terms of Service", "Accessibility"].map(
              (item) => (
                <Link
                  key={item}
                  href="#"
                  className="font-label text-[var(--color-on-surface-variant)]/50 text-xs tracking-wider hover:text-[var(--color-secondary)] transition-colors"
                >
                  {item}
                </Link>
              )
            )}
          </div>
        </motion.div>
      </div>
    </footer>
  );
}