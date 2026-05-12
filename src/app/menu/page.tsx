// app/menu/page.tsx
"use client";

import React, { useState, useRef, useMemo } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  Coffee,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Info,
  X,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useCategories, useCategoryMenu, useAllMenuItems } from "@/hooks/useMenu";
import { useCart } from "@/hooks/useCart";
import { getImageUrl } from "@/lib/api";
import type { BackendMenuItem } from "@/types/menu";

/* ─── Cart ──────────────────────────────────────────────────────────── */
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

const ALL_SLUG = "__all__";

/* ─── Helpers ───────────────────────────────────────────────────────── */
function intensityFromPrice(price: number): number {
  if (price <= 4) return 1;
  if (price <= 5) return 2;
  if (price <= 5.5) return 3;
  if (price <= 6.5) return 4;
  return 5;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=800&fit=crop";

/* ─── Skeleton ──────────────────────────────────────────────────────── */
function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] overflow-hidden animate-pulse">
      <div className="h-52 bg-[var(--color-surface-container-high)]" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-[var(--color-surface-container-high)] rounded w-3/4" />
        <div className="h-3 bg-[var(--color-surface-container-high)] rounded w-1/2" />
        <div className="h-3 bg-[var(--color-surface-container-high)] rounded w-full" />
        <div className="h-3 bg-[var(--color-surface-container-high)] rounded w-5/6" />
        <div className="h-10 bg-[var(--color-surface-container-high)] rounded-full mt-4" />
      </div>
    </div>
  );
}

/* ─── Error state ───────────────────────────────────────────────────── */
function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center col-span-full">
      <div className="w-14 h-14 rounded-full border border-red-500/20 bg-red-500/10 flex items-center justify-center">
        <AlertCircle size={24} className="text-red-400" />
      </div>
      <p className="font-heading italic text-xl text-[var(--color-on-surface-variant)]">
        {message}
      </p>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────── */
export default function MenuPage() {
  const [activeSlug, setActiveSlug] = useState<string>("");
  const { items: cartItems, addItem, totalItems: cartCount, subtotal: cartTotal } = useCart();
  const [selectedItem, setSelectedItem] = useState<BackendMenuItem | null>(null);
  const router = useRouter();

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const {
    categories,
    loading: catsLoading,
    error: catsError,
  } = useCategories();

  const resolvedSlug = activeSlug || ALL_SLUG;
  const isAllView = resolvedSlug === ALL_SLUG;

  const {
    data: categoryData,
    loading: catLoading,
    error: catError,
  } = useCategoryMenu(isAllView ? "" : resolvedSlug);

  const {
    data: allData,
    loading: allLoading,
    error: allError,
  } = useAllMenuItems(1, 100);

  const displayedItems: BackendMenuItem[] = isAllView
    ? allData?.data ?? []
    : categoryData?.items ?? [];

  const itemsLoading = isAllView ? allLoading : catLoading;
  const itemsError = isAllView ? allError : catError;

  const addToCart = (item: BackendMenuItem) => {
    addItem(item as any);
  };

  // For non-"all" view, get the category meta
  const activeCategory = useMemo(
    () =>
      isAllView
        ? null
        : categories.find((c) => c.slug === resolvedSlug) ??
          categoryData?.category ??
          null,
    [isAllView, categories, resolvedSlug, categoryData]
  );

  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-on-background)]">
      <Navigation />

      {/* ── Hero ── */}
      <section
        ref={heroRef}
        className="relative h-[65vh] min-h-[480px] flex items-center justify-center overflow-hidden"
      >
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1920&h=1080&fit=crop"
            alt="Menu Hero"
            fill
            className="object-cover scale-110"
            priority
            sizes="100vw"
          />
        </motion.div>
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-black/20 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
        {[20, 40, 60, 80].map((pos) => (
          <div
            key={pos}
            className="absolute top-0 bottom-0 w-px bg-white/5"
            style={{ left: `${pos}%` }}
          />
        ))}
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
              Crafted with Devotion
            </span>
            <div className="h-px w-16 bg-[var(--color-secondary)]" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="font-heading text-4xl xs:text-5xl sm:text-7xl md:text-8xl font-medium italic text-white leading-[0.95] md:leading-[0.9] tracking-tight mb-6"
          >
            Our
            <br />
            <span className="text-[var(--color-secondary)]">Menu</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.45 }}
            className="font-body text-white/55 text-lg max-w-md mx-auto leading-relaxed"
          >
            Every drink is composed — sourced, roasted, and extracted with the
            precision of a ritual.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="font-label text-white/30 text-[9px] tracking-[0.3em] uppercase">
            Explore
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-px h-8 bg-gradient-to-b from-[var(--color-secondary)]/60 to-transparent"
          />
        </motion.div>
      </section>

      {/* ── Sticky Category Nav ── */}
      <section className="sticky top-20 z-40 py-3 md:py-4 px-4 md:px-12 bg-[var(--color-background)]/85 backdrop-blur-2xl border-b border-[var(--color-outline-variant)]/40">
        <div className="max-w-[1300px] mx-auto flex items-center justify-between gap-3 md:gap-6">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 flex-grow">
            {/* "All" pill — always first */}
            <motion.button
              onClick={() => setActiveSlug(ALL_SLUG)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`px-5 py-2.5 rounded-full font-label text-[10px] tracking-[0.2em] uppercase transition-all duration-300 flex-shrink-0 ${
                isAllView
                  ? "bg-[var(--color-secondary)] text-[#1a120b] shadow-[0_6px_20px_rgba(196,168,130,0.3)]"
                  : "border border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] hover:border-[var(--color-secondary)]/40 hover:text-[var(--color-secondary)]"
              }`}
            >
              All
            </motion.button>

            {/* Category pills */}
            {catsLoading
              ? [...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-9 w-28 rounded-full bg-[var(--color-surface-container-high)] animate-pulse flex-shrink-0"
                  />
                ))
              : catsError ? (
                <span className="font-label text-red-400 text-xs tracking-wider">
                  Failed to load categories
                </span>
              ) : (
                categories.map((cat) => {
                  const isActive = !isAllView && resolvedSlug === cat.slug;
                  return (
                    <motion.button
                      key={cat.id}
                      onClick={() => setActiveSlug(cat.slug)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className={`px-5 py-2.5 rounded-full font-label text-[10px] tracking-[0.2em] uppercase transition-all duration-300 flex-shrink-0 ${
                        isActive
                          ? "bg-[var(--color-secondary)] text-[#1a120b] shadow-[0_6px_20px_rgba(196,168,130,0.3)]"
                          : "border border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] hover:border-[var(--color-secondary)]/40 hover:text-[var(--color-secondary)]"
                      }`}
                    >
                      {cat.name}
                    </motion.button>
                  );
                })
              )}
          </div>

          <Link href="/cart" passHref>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-full border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] font-label text-[10px] tracking-[0.2em] uppercase flex-shrink-0"
            >
              <ShoppingBag size={14} />
              Cart
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[var(--color-secondary)] text-[#1a120b] text-[10px] font-bold flex items-center justify-center"
                >
                  {cartCount}
                </motion.span>
              )}
            </motion.button>
          </Link>
        </div>
      </section>

      {/* ── Section ── */}
      <AnimatePresence mode="wait">
        <motion.section
          key={resolvedSlug}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden"
        >
          {/* Banner */}
          <div className="relative h-[220px] md:h-[300px] overflow-hidden">
            <motion.div
              key={resolvedSlug + "-img"}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
            >
              <Image
                src={
                  isAllView
                    ? "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1920&h=600&fit=crop"
                    : getImageUrl(activeCategory?.imageUrl ||
                      categoryData?.category?.imageUrl ||
                      FALLBACK_IMAGE)
                }
                alt={
                  isAllView
                    ? "All Menu Items"
                    : activeCategory?.name ?? categoryData?.category?.name ?? ""
                }
                fill
                className="object-cover"
                sizes="100vw"
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-black/40 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50" />

            <div className="absolute top-6 right-8 pointer-events-none">
              <span className="font-heading italic text-white/5 text-[10vw] font-bold leading-none select-none">
                {isAllView
                  ? "Menu"
                  : activeCategory?.name ?? categoryData?.category?.name}
              </span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 pb-8">
              <div className="max-w-[1300px] mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-px w-10 bg-[var(--color-secondary)]" />
                    <span className="font-label text-[var(--color-secondary)] tracking-[0.25em] uppercase text-[10px]">
                      {itemsLoading
                        ? "Loading..."
                        : `${displayedItems.length} ${displayedItems.length === 1 ? "item" : "items"}`}
                    </span>
                  </div>
                  <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl italic font-medium text-white leading-tight mb-2">
                    {isAllView
                      ? "All Items"
                      : activeCategory?.name ?? categoryData?.category?.name}
                  </h2>
                  <p className="font-body text-white/60 max-w-lg leading-relaxed text-sm">
                    {isAllView
                      ? "Explore our complete collection — from signature espressos to seasonal pastries."
                      : activeCategory?.description ??
                        categoryData?.category?.description ??
                        ""}
                  </p>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Items grid */}
          <div className="px-4 md:px-12 py-10 md:py-14 max-w-[1300px] mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
              {itemsLoading ? (
                [...Array(6)].map((_, i) => <CardSkeleton key={i} />)
              ) : itemsError ? (
                <ErrorState message="Couldn't load menu items. Is the server running?" />
              ) : displayedItems.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-24 gap-4">
                  <Coffee
                    size={40}
                    className="text-[var(--color-secondary)]/40"
                  />
                  <p className="font-heading italic text-xl text-[var(--color-on-surface-variant)]">
                    No items in this category yet.
                  </p>
                </div>
              ) : (
                displayedItems.map((item, index) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    fallbackCategoryName={
                      categoryData?.category?.name ??
                      activeCategory?.name ??
                      "Menu"
                    }
                    index={index}
                    onAdd={() => addToCart(item)}
                    onSelect={() => setSelectedItem(item)}
                  />
                ))
              )}
            </div>
          </div>
        </motion.section>
      </AnimatePresence>

      {/* ── Static sections ── */}
      <PairingSection />
      <BottomCta />

      {/* ── Modals ── */}
      <AnimatePresence>
        {selectedItem && (
          <ItemDetailModal
            item={selectedItem}
            fallbackCategoryName={
              categoryData?.category?.name ?? activeCategory?.name ?? "Menu"
            }
            onClose={() => setSelectedItem(null)}
            onAdd={() => {
              addToCart(selectedItem);
              setSelectedItem(null);
            }}
          />
        )}
      </AnimatePresence>



      <Footer />
    </main>
  );
}

/* ─── Menu Item Card ────────────────────────────────────────────────── */
function MenuItemCard({
  item,
  fallbackCategoryName,
  index,
  onAdd,
  onSelect,
}: {
  item: BackendMenuItem;
  fallbackCategoryName: string;
  index: number;
  onAdd: () => void;
  onSelect: () => void;
}) {
  const intensity = intensityFromPrice(item.price);
  const categoryName = item.category?.name ?? fallbackCategoryName;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: index * 0.04,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`group relative rounded-2xl border bg-[var(--color-surface-container-low)] overflow-hidden transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] ${
        item.isAvailable
          ? "border-[var(--color-outline-variant)] hover:border-[var(--color-secondary)]/30"
          : "border-[var(--color-outline-variant)]/40 opacity-60"
      }`}
    >
      <div
        className="relative h-52 overflow-hidden cursor-pointer"
        onClick={onSelect}
      >
        <Image
          src={getImageUrl(item.imageUrl || FALLBACK_IMAGE)}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
          {item.isSeasonal && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-label text-[8px] tracking-[0.2em] uppercase backdrop-blur-sm">
              Seasonal
            </span>
          )}
          {item.isFeatured && (
            <span className="px-2.5 py-1 rounded-full bg-[var(--color-secondary)]/20 border border-[var(--color-secondary)]/30 text-[var(--color-secondary)] font-label text-[8px] tracking-[0.2em] uppercase backdrop-blur-sm flex items-center gap-1">
              <Coffee size={10} className="fill-current" />
              Featured
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/60 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-300"
        >
          <Info size={14} />
        </button>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0">
            <h3 className="font-heading text-lg font-medium italic text-[var(--color-on-surface)] leading-tight truncate">
              {item.name}
            </h3>
            <p className="font-label text-[var(--color-secondary)] text-[10px] tracking-[0.2em] uppercase mt-1">
              {categoryName}
            </p>
          </div>
          <span className="font-heading text-2xl font-medium text-[var(--color-secondary)] flex-shrink-0">
            Rs. {item.price.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="font-label text-[var(--color-on-surface-variant)] text-[9px] tracking-wider uppercase">
            Strength
          </span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={`w-3 h-1.5 rounded-full ${
                  level <= intensity
                    ? "bg-[var(--color-secondary)]"
                    : "bg-[var(--color-outline-variant)]"
                }`}
              />
            ))}
          </div>
        </div>

        <p className="font-body text-[var(--color-on-surface-variant)] text-sm leading-relaxed mb-5 line-clamp-2">
          {item.description}
        </p>

        <div className="flex items-center gap-3">
          <div className="flex gap-3">
            {item.calories != null && (
              <span className="font-label text-[var(--color-on-surface-variant)] text-[9px] tracking-wider uppercase">
                {item.calories} cal
              </span>
            )}
            {item.preparationTime > 0 && (
              <span className="font-label text-[var(--color-on-surface-variant)] text-[9px] tracking-wider uppercase">
                ~{item.preparationTime}min
              </span>
            )}
          </div>

          <motion.button
            onClick={onAdd}
            disabled={!item.isAvailable}
            whileHover={
              item.isAvailable
                ? { scale: 1.04, boxShadow: "0 8px 24px rgba(196,168,130,0.3)" }
                : {}
            }
            whileTap={item.isAvailable ? { scale: 0.96 } : {}}
            className={`ml-auto flex items-center gap-2 px-5 py-2.5 rounded-full font-label font-bold uppercase tracking-[0.15em] text-[10px] transition-all ${
              item.isAvailable
                ? "bg-[var(--color-secondary)] text-[#1a120b] hover:brightness-105"
                : "bg-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] cursor-not-allowed"
            }`}
          >
            <Plus size={12} />
            {item.isAvailable ? "Add" : "Unavailable"}
          </motion.button>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-secondary)]/0 to-[var(--color-secondary)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-2xl" />
    </motion.div>
  );
}

/* ─── Item Detail Modal ─────────────────────────────────────────────── */
function ItemDetailModal({
  item,
  fallbackCategoryName,
  onClose,
  onAdd,
}: {
  item: BackendMenuItem;
  fallbackCategoryName: string;
  onClose: () => void;
  onAdd: () => void;
}) {
  const intensity = intensityFromPrice(item.price);
  const categoryName = item.category?.name ?? fallbackCategoryName;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-xl p-6"
      onClick={onClose}
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-secondary)]/60 to-transparent" />

      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-[95%] md:w-full max-w-5xl max-h-[90vh] md:max-h-[85vh] overflow-hidden rounded-[32px] md:rounded-[40px] border border-white/10 bg-black/40 backdrop-blur-3xl shadow-[0_40px_120px_rgba(0,0,0,0.8)] flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image Section */}
        <div className="relative w-full md:w-[45%] h-72 md:h-auto overflow-hidden shrink-0">
          <motion.div
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full"
          >
            <Image
              src={getImageUrl(item.imageUrl || FALLBACK_IMAGE)}
              alt={item.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 45vw"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/60 via-transparent to-transparent md:from-black/20" />
          
          <div className="absolute bottom-6 left-6 flex gap-2 flex-wrap">
            {item.isFeatured && (
              <span className="px-3 py-1.5 rounded-full bg-[var(--color-secondary)]/20 border border-[var(--color-secondary)]/30 text-[var(--color-secondary)] font-label text-[8px] tracking-[0.2em] uppercase backdrop-blur-md">
                Signature
              </span>
            )}
            {item.isSeasonal && (
              <span className="px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-label text-[8px] tracking-[0.2em] uppercase backdrop-blur-md">
                Seasonal
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="md:hidden absolute top-4 right-4 w-10 h-10 rounded-full border border-white/10 bg-black/40 backdrop-blur-xl flex items-center justify-center text-white/70 hover:text-white transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 scrollbar-hide relative">
          <button
            onClick={onClose}
            className="hidden md:flex absolute top-8 right-8 w-12 h-12 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"
          >
            <X size={20} />
          </button>

          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <p className="font-label text-[var(--color-secondary)] text-[10px] tracking-[0.4em] uppercase mb-4 opacity-70">
                {categoryName}
              </p>
              <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl italic font-medium text-white leading-[0.95] tracking-tight mb-6">
                {item.name}
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-center gap-6 mb-8"
            >
              <span className="font-heading text-3xl md:text-4xl font-medium text-[var(--color-secondary)]">
                Rs. {item.price.toFixed(2)}
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <p className="font-body text-white/60 text-base md:text-lg leading-relaxed mb-10">
                {item.description}
              </p>
            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
              {item.calories != null && (
                <div className="p-4 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm">
                  <p className="font-label text-white/40 text-[8px] tracking-widest uppercase mb-1">
                    Energy
                  </p>
                  <p className="font-body text-white text-xs font-semibold">
                    {item.calories} cal
                  </p>
                </div>
              )}
              <div className="p-4 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm">
                <p className="font-label text-white/40 text-[8px] tracking-widest uppercase mb-1">
                  Crafting
                </p>
                <p className="font-body text-white text-xs font-semibold">
                  ~{item.preparationTime} min
                </p>
              </div>
              <div className="p-4 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm">
                <p className="font-label text-white/40 text-[8px] tracking-widest uppercase mb-1">
                  Intensity
                </p>
                <div className="flex gap-1 mt-1.5">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`w-3 h-1 rounded-full ${
                        level <= intensity ? "bg-[var(--color-secondary)]" : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="p-4 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm">
                <p className="font-label text-white/40 text-[8px] tracking-widest uppercase mb-1">
                  Status
                </p>
                <p className={`font-body text-xs font-semibold ${item.isAvailable ? "text-emerald-400" : "text-red-400"}`}>
                  {item.isAvailable ? "Ready" : "Unavailable"}
                </p>
              </div>
            </div>

            <motion.button
              onClick={onAdd}
              disabled={!item.isAvailable}
              whileHover={item.isAvailable ? { scale: 1.02, y: -2 } : {}}
              whileTap={item.isAvailable ? { scale: 0.98 } : {}}
              className={`w-full py-5 rounded-full font-label font-bold uppercase tracking-[0.3em] text-[10px] transition-all flex items-center justify-center gap-4 ${
                item.isAvailable
                  ? "bg-[var(--color-secondary)] text-[#1a120b] shadow-[0_20px_40px_rgba(196,168,130,0.25)]"
                  : "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"
              }`}
            >
              <Plus size={16} strokeWidth={3} />
              {item.isAvailable ? `Add to Order — Rs. ${item.price.toFixed(2)}` : "Unavailable"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Cart Drawer ───────────────────────────────────────────────────── */
function CartDrawer({
  cart,
  total,
  onClose,
  onAdd,
  onRemove,
}: {
  cart: CartItem[];
  total: number;
  onClose: () => void;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-[var(--color-surface-container)] border-l border-[var(--color-outline-variant)] flex flex-col shadow-[0_0_60px_rgba(0,0,0,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[var(--color-secondary)]/60 to-transparent" />

        <div className="flex items-center justify-between p-6 border-b border-[var(--color-outline-variant)]">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <ShoppingBag size={18} className="text-[var(--color-secondary)]" />
              <h3 className="font-heading text-xl italic font-medium text-[var(--color-on-surface)]">
                Your Order
              </h3>
            </div>
            <p className="font-label text-[var(--color-on-surface-variant)] text-[10px] tracking-wider uppercase">
              {cart.reduce((s, i) => s + i.quantity, 0)} items
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full border border-[var(--color-outline-variant)] flex items-center justify-center text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-16 h-16 rounded-full border border-[var(--color-outline-variant)] flex items-center justify-center">
                <Coffee
                  size={28}
                  className="text-[var(--color-secondary)] opacity-50"
                />
              </div>
              <p className="font-heading italic text-lg text-[var(--color-on-surface-variant)]">
                Your cart is empty
              </p>
              <p className="font-body text-[var(--color-on-surface-variant)] text-sm">
                Add something delicious from the menu
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-4 p-4 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)]"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-[var(--color-outline-variant)] relative">
                  <Image
                    src={item.imageUrl || FALLBACK_IMAGE}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-heading italic text-sm text-[var(--color-on-surface)] truncate">
                    {item.name}
                  </h4>
                  <p className="font-label text-[var(--color-secondary)] text-xs mt-0.5">
                    Rs. {item.price.toFixed(2)} each
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => onRemove(item.id)}
                    className="w-8 h-8 rounded-full border border-[var(--color-outline-variant)] flex items-center justify-center text-[var(--color-on-surface-variant)] hover:border-red-400 hover:text-red-400 transition-colors"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="font-label text-[var(--color-on-surface)] text-sm w-6 text-center font-medium">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onAdd(item.id)}
                    className="w-8 h-8 rounded-full border border-[var(--color-outline-variant)] flex items-center justify-center text-[var(--color-on-surface-variant)] hover:border-[var(--color-secondary)] hover:text-[var(--color-secondary)] transition-colors"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                <span className="font-heading text-base font-medium text-[var(--color-on-surface)] w-14 text-right flex-shrink-0">
                  Rs. {(item.price * item.quantity).toFixed(2)}
                </span>
              </motion.div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)]">
            <div className="flex items-center justify-between mb-5">
              <span className="font-label text-[var(--color-on-surface-variant)] text-xs tracking-wider uppercase">
                Total
              </span>
              <span className="font-heading text-3xl font-medium text-[var(--color-secondary)]">
                Rs. {total.toFixed(2)}
              </span>
            </div>

            <motion.button
              whileHover={{
                scale: 1.02,
                boxShadow: "0 10px 30px rgba(196,168,130,0.35)",
              }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 rounded-full bg-[var(--color-secondary)] text-[#1a120b] font-label font-bold uppercase tracking-[0.2em] text-xs hover:brightness-105 transition-all flex items-center justify-center gap-3"
            >
              Checkout
              <ArrowRight size={14} />
            </motion.button>

            <p className="font-label text-[var(--color-on-surface-variant)]/50 text-[9px] tracking-wider text-center mt-3">
              Free pickup · 15 min preparation
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ─── Pairing Section ───────────────────────────────────────────────── */
function PairingSection() {
  const PAIRINGS = [
    {
      drink: "Velvet Espresso",
      food: "Almond Croissant",
      note: "The dark roast cuts through the buttery sweetness perfectly.",
      image:
        "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop",
    },
    {
      drink: "Honey Lavender Latte",
      food: "Cardamom Bun",
      note: "Floral meets spice — a Scandinavian-Mediterranean marriage.",
      image:
        "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop",
    },
    {
      drink: "Cold Brew",
      food: "Dark Chocolate Brownie",
      note: "Smooth cold brew and fudgy brownie — the ultimate afternoon duo.",
      image:
        "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=400&fit=crop",
    },
  ];

  return (
    <section className="py-28 px-6 md:px-12 bg-[var(--color-surface-container-lowest)] border-y border-[var(--color-outline-variant)]">
      <div className="max-w-[1300px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-3 mb-5">
            <div className="h-px w-10 bg-[var(--color-secondary)]" />
            <span className="font-label text-[var(--color-secondary)] tracking-[0.3em] uppercase text-[10px]">
              Our Recommendations
            </span>
            <div className="h-px w-10 bg-[var(--color-secondary)]" />
          </div>
          <h2 className="font-heading text-4xl md:text-6xl italic font-medium text-[var(--color-on-background)] leading-[0.95] tracking-tight">
            Perfect
            <br />
            <span className="text-[var(--color-secondary)]">Pairings</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PAIRINGS.map((pair, i) => (
            <motion.div
              key={pair.drink}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.12 }}
              className="group relative p-6 rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container)] hover:border-[var(--color-secondary)]/30 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute -top-4 -right-4 font-heading text-[80px] font-bold text-[var(--color-secondary)]/5 select-none leading-none">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="relative z-10">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border border-[var(--color-outline-variant)] mb-5 relative">
                  <Image
                    src={pair.image}
                    alt={pair.food}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="font-heading italic text-base text-[var(--color-on-surface)]">
                    {pair.drink}
                  </span>
                  <span className="text-[var(--color-secondary)]">+</span>
                  <span className="font-heading italic text-base text-[var(--color-on-surface)]">
                    {pair.food}
                  </span>
                </div>
                <p className="font-body text-[var(--color-on-surface-variant)] text-sm leading-relaxed italic">
                  &ldquo;{pair.note}&rdquo;
                </p>
                <div className="flex items-center gap-1 mt-4">
                  <span className="font-label text-[var(--color-secondary)] text-[10px] tracking-[0.2em] uppercase">
                    Staff Pick
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Bottom CTA ────────────────────────────────────────────────────── */
function BottomCta() {
  return (
    <section className="relative py-36 px-6 md:px-12 overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1920&h=800&fit=crop"
          alt=""
          fill
          className="object-cover opacity-15"
          sizes="100vw"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-[var(--color-background)]/85 to-[var(--color-background)]" />
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
            Ready to Order?
          </span>
          <div className="h-px w-12 bg-[var(--color-secondary)]" />
        </div>

        <h2 className="font-heading text-4xl xs:text-5xl md:text-7xl italic font-medium text-[var(--color-on-background)] leading-[0.95] tracking-tight mb-6">
          Skip the Line,
          <br />
          <span className="text-[var(--color-secondary)]">Order Ahead</span>
        </h2>

        <p className="font-body text-[var(--color-on-surface-variant)] text-base leading-relaxed mb-10 max-w-md mx-auto">
          Place your order now and pick it up in 15 minutes. Freshly made,
          perfectly timed, waiting for you.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/reservations"
              className="inline-flex items-center gap-3 px-9 py-4 rounded-full bg-[var(--color-secondary)] text-[#1a120b] font-label font-bold uppercase tracking-[0.2em] text-xs shadow-[0_10px_30px_rgba(196,168,130,0.3)] hover:brightness-105 transition-all"
            >
              <ShoppingBag size={14} />
              Reserve a Table
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/loyalty"
              className="inline-flex items-center gap-3 px-9 py-4 rounded-full border border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] font-label uppercase tracking-[0.2em] text-xs hover:border-[var(--color-secondary)] hover:text-[var(--color-secondary)] transition-all"
            >
              Join Loyalty Program
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}