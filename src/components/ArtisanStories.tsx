// components/ArtisanStories.tsx
"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const STORIES = [
  {
    id: 1,
    label: "Origin Story",
    title: "Ethiopia Yirgacheffe",
    subtitle: "Single Origin",
    desc: "Traced from altitude-grown highland farms, these beans carry floral jasmine and bright citrus — a cup that tastes like dawn over the Great Rift Valley.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDcSOBFmSDtk-tDl5SKdW_DyBp6m5Gyu_4bp_HyvW0_nA1Es5SGZO5NtzO7R69m5Pv2e_DTzr3y78RXJ7lyXSc4eUeFvi1Z_AU_JVx_3CQAMlq_L-kz27pmMdbqCKqXGf7DA06UxHyRtPuSI5hp0RFqzHLnPGTzgDGbwLAD2Wm2WeHmRSl5q-f0hTMcnd_icmCvc-tj11P_YHT7lUoXhZGRLY9GvpcarEG2XipUvbDmFHzzkHOh7ymvxCjx7dh5zJGiVM0LvZp3upyK",
    tag: "2,200m Altitude",
    accent: "from-amber-900/80",
  },
  {
    id: 2,
    label: "Craft Process",
    title: "The Roastery",
    subtitle: "Small Batch Excellence",
    desc: "Every Monday at 5AM, our roastmaster hand-selects the week's green beans. The drum roaster runs for exactly 11 minutes — not a second more.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDSZqBXuk0dZIzSwXn_PaUQwFAfcWJqCKwSLLGsoz0k91sEh8p4Gsvqpwq9YhB6v1XU4KyJ4IK3rb3sn16xJ-SQWEXZich8T-rfVACdVDz6UiBvACv_bsKQacDlz2Qt12gHcoEPGdyNcv81tl9DkBIb5PusDNnTvPanMaHipCeinzGwrYunNKsO1joRgn1rBD5kQHP8FhM_HIjRkdZzc_IGYsL3RZyThkvas3oIbm5QFjOWK72eOr80iHDNx--gD5vAtwF82MPmzGZo",
    tag: "11-Minute Roast",
    accent: "from-stone-900/80",
  },
  {
    id: 3,
    label: "Signature Pour",
    title: "Honey Lavender Latte",
    subtitle: "Seasonal Masterpiece",
    desc: "Raw local honey from Knuckles mountain range, organic Provence lavender, and our signature double ristretto — crafted for those who seek something transcendent.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDwzKEsOOIdBlNc0CHcb3PF4zd8DbNPnTr-udy7wy8hBGIzxRVpbDipSt0wYlXTeq4qXC5Ls3la5haMVfos6JZGmkUBshcpBgVdvd3FtHs5uCm4s3Uq7T7I3RvcFDYqdqTH6bXMFw3wzhgEt38kduTMHnE3gAEtS5uZMXMM84CXlvCMfIWpDKUGFoozwfJvOLOLsaUo1-oLGi0ff3zMc0zSM1_swH3d-H06bsNcPkoMpKJW3DZFRPDQpJpZKYWR4SiNTSt1sXbXyNJ4",
    tag: "Limited Edition",
    accent: "from-purple-900/60",
  },
];

export default function ArtisanStories() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -40]);

  return (
    <section
      ref={containerRef}
      className="relative bg-[var(--color-background)] overflow-hidden py-32 md:py-48"
    >
      {/* Cinematic Ambient Glows */}
      <motion.div
        style={{ y: y1 }}
        className="pointer-events-none absolute -top-64 -right-64 w-[700px] h-[700px] rounded-full bg-[var(--color-secondary)]/8 blur-[120px]"
      />
      <motion.div
        style={{ y: y2 }}
        className="pointer-events-none absolute -bottom-64 -left-64 w-[600px] h-[600px] rounded-full bg-[var(--color-secondary)]/6 blur-[100px]"
      />

      {/* Film-grain texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 max-w-[1300px] mx-auto px-6 md:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as any }}
          className="mb-24 md:mb-32"
        >
          <div className="flex items-center gap-4 mb-6">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="h-px w-16 bg-[var(--color-secondary)] origin-left"
            />
            <span className="font-label text-[var(--color-secondary)] tracking-[0.25em] uppercase text-xs">
              The Artisan Chronicles
            </span>
          </div>

          <h2 className="font-heading text-4xl xs:text-5xl sm:text-7xl md:text-8xl font-medium text-[var(--color-on-background)] leading-[0.95] md:leading-[0.9] tracking-tight mb-6">
            Stories
            <br />
            <em className="text-[var(--color-secondary)] italic">Behind</em>
            <br />
            the Cup
          </h2>

          <p className="font-body text-[var(--color-on-surface-variant)] text-base sm:text-lg max-w-md leading-relaxed mt-8 ml-0 md:ml-auto md:text-right">
            Every sip is the culmination of a thousand decisions — from altitude
            to extraction time. We obsess so you can simply enjoy.
          </p>
        </motion.div>

        {/* Story Cards — Cinematic Layout */}
        <div className="space-y-8 md:space-y-6">
          {STORIES.map((story, i) => (
            <StoryCard key={story.id} story={story} index={i} />
          ))}
        </div>

        {/* Bottom CTA Strip */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-24 flex flex-col md:flex-row items-center justify-between gap-8 border-t border-[var(--color-outline-variant)] pt-16"
        >
          <div>
            <p className="font-label text-[var(--color-secondary)] tracking-[0.2em] uppercase text-xs mb-2">
              Join the Journey
            </p>
            <h3 className="font-heading text-3xl md:text-4xl text-[var(--color-on-background)] italic font-medium">
              Become a Brew & Co. Member
            </h3>
          </div>
          <motion.a
            href="/auth/register"
            whileHover={{
              scale: 1.04,
              boxShadow: "0 16px 48px rgba(196,168,130,0.35)",
            }}
            whileTap={{ scale: 0.97 }}
            className="flex-shrink-0 px-10 py-4 rounded-full bg-[var(--color-secondary)] text-[#1a120b] font-label font-bold uppercase tracking-[0.2em] text-xs shadow-[0_8px_30px_rgba(196,168,130,0.2)] hover:brightness-105 transition-all"
          >
            Start Your Story
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}

function StoryCard({
  story,
  index,
}: {
  story: (typeof STORIES)[0];
  index: number;
}) {
  const isEven = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 1,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1] as any,
      }}
      className={`group relative flex flex-col ${
        isEven ? "md:flex-row" : "md:flex-row-reverse"
      } gap-0 rounded-2xl overflow-hidden border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] shadow-2xl hover:shadow-[0_32px_80px_rgba(0,0,0,0.35)] transition-shadow duration-700 min-h-[420px] md:h-[500px]`}
    >
      {/* Image Panel */}
      <div className="relative w-full md:w-[55%] overflow-hidden flex-shrink-0 h-64 md:h-full">
        <motion.img
          src={story.image}
          alt={story.title}
          className="w-full h-full object-cover"
          initial={{ scale: 1.08 }}
          whileInView={{ scale: 1 }}
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] as any }}
        />

        {/* Cinematic overlays */}
        <div
          className={`absolute inset-0 bg-gradient-to-t ${story.accent} to-transparent opacity-60`}
        />
        <div
          className={`absolute inset-0 bg-gradient-to-t md:bg-gradient-to-${isEven ? "r" : "l"} from-transparent to-[var(--color-surface-container-low)]/90`}
        />

        {/* Frame number */}
        <div className="absolute top-6 left-6">
          <span className="font-heading text-white/20 text-7xl font-bold leading-none select-none">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        {/* Tag Badge */}
        <motion.div
          initial={{ opacity: 0, x: isEven ? -20 : 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="absolute bottom-6 left-6"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-secondary)]/20 border border-[var(--color-secondary)]/40 backdrop-blur-md text-[var(--color-secondary)] font-label text-[10px] tracking-[0.2em] uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-secondary)] animate-pulse" />
            {story.tag}
          </span>
        </motion.div>
      </div>

      {/* Content Panel */}
      <div
        className={`relative flex flex-col justify-center p-8 md:p-12 lg:p-16 flex-1 ${
          isEven ? "" : ""
        }`}
      >
        {/* Decorative vertical line */}
        <motion.div
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className={`absolute top-0 ${
            isEven ? "left-0" : "right-0"
          } w-px h-full bg-gradient-to-b from-transparent via-[var(--color-secondary)]/30 to-transparent origin-top hidden md:block`}
        />

        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="font-label text-[var(--color-secondary)] tracking-[0.25em] uppercase text-[10px] mb-4 block"
        >
          {story.label}
        </motion.span>

        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="font-heading text-4xl md:text-5xl font-medium italic text-[var(--color-on-background)] leading-tight mb-2"
        >
          {story.title}
        </motion.h3>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="font-label text-[var(--color-secondary)] tracking-widest text-xs uppercase mb-6"
        >
          {story.subtitle}
        </motion.p>

        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="w-10 h-px bg-[var(--color-secondary)]/50 mb-6 origin-left"
        />

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="font-body text-[var(--color-on-surface-variant)] leading-relaxed text-base max-w-sm"
        >
          {story.desc}
        </motion.p>

        <motion.button
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          whileHover={{ x: 6 }}
          className="mt-8 flex items-center gap-3 text-[var(--color-secondary)] font-label text-xs tracking-[0.2em] uppercase group/btn w-fit"
        >
          <span>Discover More</span>
          <motion.span
            className="w-8 h-px bg-[var(--color-secondary)] block"
            initial={{ width: "2rem" }}
            whileHover={{ width: "3rem" }}
          />
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="group-hover/btn:translate-x-1 transition-transform"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </motion.button>

        {/* Ambient glow on hover */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--color-secondary)]/0 to-[var(--color-secondary)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      </div>
    </motion.div>
  );
}