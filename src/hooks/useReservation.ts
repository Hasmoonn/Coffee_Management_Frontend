// src/hooks/useReservation.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import type {
  BackendTable,
  BackendReservation,
  CreateReservationPayload,
  AvailabilityQuery,
} from "@/types/reservation";

/* ── Get available tables ──────────────────────────────────────────── */
export function useTableAvailability(query: AvailabilityQuery) {
  const [tables, setTables] = useState<BackendTable[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    // Need date AND time AND guests for backend to compute availability
    if (!query.date || !query.time || !query.guests) {
      setTables([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    params.append("date", query.date);
    params.append("time", query.time);
    params.append("guests", String(query.guests));

    apiFetch<BackendTable[]>(`/reservations/availability?${params}`)
      .then(setTables)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [query.date, query.time, query.guests]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { tables, loading, error, refetch };
}

/* ── Create reservation ────────────────────────────────────────────── */
export function useCreateReservation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reservation, setReservation] =
    useState<BackendReservation | null>(null);

  const create = useCallback(async (payload: CreateReservationPayload) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFetch<BackendReservation>("/reservations", {
        method: "POST",
        body: JSON.stringify(payload),
        auth: true,
      });
      setReservation(result);
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Reservation failed";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    create,
    loading,
    error,
    reservation,
    reset: () => setReservation(null),
  };
}

/* ── My reservations ───────────────────────────────────────────────── */
export function useMyReservations() {
  const [reservations, setReservations] = useState<BackendReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    setLoading(true);
    apiFetch<BackendReservation[] | { data: BackendReservation[] }>(
      "/reservations/my-reservations",
      { auth: true }
    )
      .then((res) => {
        const data = Array.isArray(res)
          ? res
          : (res as { data: BackendReservation[] }).data ?? [];
        setReservations(data);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { reservations, loading, error, refetch };
}