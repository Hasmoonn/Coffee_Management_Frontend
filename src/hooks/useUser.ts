import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  loyaltyPoints: number;
  stampCount: number;
  dateOfBirth: string | null;
  createdAt: string;
}

export function useUser(enabled: boolean = true) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    if (!enabled) return;
    setLoading(true);
    apiFetch<UserProfile>("/users/profile", { auth: true })
      .then(setUser)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [enabled]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { user, loading, error, refetch };
}
