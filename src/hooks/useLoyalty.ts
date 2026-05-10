// src/hooks/useLoyalty.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import type {
  BackendReward,
  UserPoints,
  StampCard,
  PointsHistoryItem,
  RedeemResult,
} from "@/types/loyalty";

/* ── Available rewards (public — no auth needed) ── */
export function useAvailableRewards() {
  const [rewards, setRewards] = useState<BackendReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    apiFetch<BackendReward[]>("/loyalty/rewards")
      .then(setRewards)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { rewards, loading, error };
}

/* ── My points (auth required) ── */
export function useMyPoints(enabled: boolean = true) {
  const [data, setData] = useState<UserPoints | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    if (!enabled) return;
    setLoading(true);
    apiFetch<UserPoints>("/loyalty/points", { auth: true })
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [enabled]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

/* ── Stamp card (auth) ── */
export function useStampCard(enabled: boolean = true) {
  const [data, setData] = useState<StampCard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    if (!enabled) return;
    setLoading(true);
    apiFetch<StampCard>("/loyalty/stamp-card", { auth: true })
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [enabled]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

/* ── Points history (auth) ── */
export function usePointsHistory(enabled: boolean = true) {
  const [history, setHistory] = useState<PointsHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    if (!enabled) return;
    setLoading(true);
    apiFetch<PointsHistoryItem[] | { data: PointsHistoryItem[] }>(
      "/loyalty/history",
      { auth: true }
    )
      .then((res) => {
        const arr = Array.isArray(res)
          ? res
          : (res as { data: PointsHistoryItem[] }).data ?? [];
        setHistory(arr);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [enabled]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { history, loading, error, refetch };
}

/* ── Redeem reward ── */
export function useRedeemReward() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redeem = useCallback(async (rewardId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFetch<RedeemResult>("/loyalty/redeem", {
        method: "POST",
        body: JSON.stringify({ rewardId }),
        auth: true,
      });
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Redemption failed";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { redeem, loading, error };
}