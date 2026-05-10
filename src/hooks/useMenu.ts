// src/hooks/useMenu.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import type {
  BackendMenuItem,
  BackendCategory,
  PaginatedMenuResponse,
  CategoryMenuResponse,
} from "@/types/menu";

/* ── Fetch all categories via a wide menu fetch ──────────────────── */
export function useCategories() {
  const [categories, setCategories] = useState<BackendCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<PaginatedMenuResponse>("/menu?limit=100")
      .then((res) => {
        const seen = new Set<string>();
        const cats: BackendCategory[] = [];
        res.data.forEach((item) => {
          // category may be undefined on this endpoint — skip if missing
          if (item.category && !seen.has(item.category.id)) {
            seen.add(item.category.id);
            cats.push(item.category);
          }
        });
        cats.sort((a, b) => a.sortOrder - b.sortOrder);
        setCategories(cats);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading, error };
}

/* ── Items by category slug ─────────────────────────────────────── */
export function useCategoryMenu(slug: string) {
  const [data, setData] = useState<CategoryMenuResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    setData(null);

    apiFetch<CategoryMenuResponse>(`/menu/category/${slug}`)
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  return { data, loading, error };
}

/* ── Featured items ─────────────────────────────────────────────── */
export function useFeaturedItems() {
  const [items, setItems] = useState<BackendMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<BackendMenuItem[]>("/menu/featured")
      .then(setItems)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { items, loading, error };
}

/* ── Single item ────────────────────────────────────────────────── */
export function useMenuItem(id: string) {
  const [item, setItem] = useState<BackendMenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    apiFetch<BackendMenuItem>(`/menu/${id}`)
      .then(setItem)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { item, loading, error };
}

/* ── All items paginated ────────────────────────────────────────── */
export function useAllMenuItems(
  page = 1,
  limit = 20,
  categoryId?: string
) {
  const [data, setData] = useState<PaginatedMenuResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(categoryId ? { categoryId } : {}),
    });
    apiFetch<PaginatedMenuResponse>(`/menu?${params}`)
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page, limit, categoryId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}