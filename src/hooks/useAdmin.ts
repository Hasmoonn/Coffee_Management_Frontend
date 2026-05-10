import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { Order } from "./useOrder";
import { BackendReservation } from "@/types/reservation";

export function useAdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<any>("/orders", { auth: true });
      // Support both { data: [...] } and plain [...] response formats
      const arr = Array.isArray(res) ? res : res.data || [];
      setOrders(Array.isArray(arr) ? arr : []);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      await apiFetch(`/orders/${id}/status`, {
        method: "PATCH",
        auth: true,
        body: { status },
      });
      await fetchOrders();
    } catch (e: any) {
      throw new Error(e.message);
    }
  };

  return { orders, loading, error, refetch: fetchOrders, updateOrderStatus };
}

export function useAdminReservations() {
  const [reservations, setReservations] = useState<BackendReservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<any>("/reservations", { auth: true });
      // Support both { data: [...] } and plain [...] response formats
      const arr = Array.isArray(res) ? res : res.data || [];
      setReservations(Array.isArray(arr) ? arr : []);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const updateReservationStatus = async (id: string, status: string) => {
    try {
      await apiFetch(`/reservations/${id}/status`, {
        method: "PATCH",
        auth: true,
        body: { status },
      });
      await fetchReservations();
    } catch (e: any) {
      throw new Error(e.message);
    }
  };

  return { reservations, loading, error, refetch: fetchReservations, updateReservationStatus };
}
export function useAdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<any>("/admin/users", { auth: true });
      const arr = Array.isArray(res) ? res : res.data || [];
      setUsers(Array.isArray(arr) ? arr : []);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const deleteUser = async (id: string) => {
    try {
      await apiFetch(`/admin/users/${id}`, { method: "DELETE", auth: true });
      await fetchUsers();
    } catch (e: any) {
      throw new Error(e.message);
    }
  };

  return { users, loading, error, refetch: fetchUsers, deleteUser };
}

export function useAdminMenu() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMenu = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<any>("/menu?limit=100", { auth: true });
      const arr = Array.isArray(res) ? res : res.data || [];
      setItems(Array.isArray(arr) ? arr : []);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const createMenuItem = async (data: any) => {
    await apiFetch("/menu", { method: "POST", auth: true, body: data });
    await fetchMenu();
  };

  const updateMenuItem = async (id: string, data: any) => {
    await apiFetch(`/menu/${id}`, { method: "PUT", auth: true, body: data });
    await fetchMenu();
  };

  const deleteMenuItem = async (id: string) => {
    await apiFetch(`/menu/${id}`, { method: "DELETE", auth: true });
    await fetchMenu();
  };

  return { items, loading, refetch: fetchMenu, createMenuItem, updateMenuItem, deleteMenuItem };
}

export function useAdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<any>("/categories");
      const arr = Array.isArray(res) ? res : res.data || [];
      setCategories(Array.isArray(arr) ? arr : []);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, refetch: fetchCategories };
}

export function useAnalytics() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiFetch<any>("/analytics/overview", { auth: true }),
      apiFetch<any>("/analytics/weekly-revenue", { auth: true }),
      apiFetch<any>("/analytics/best-sellers", { auth: true }),
      apiFetch<any>("/analytics/orders", { auth: true })
    ])
      .then(([overview, weekly, bestSellers, orderStats]) => {
        setStats({
          ...overview,
          weekly,
          bestSellers,
          orderStats
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading };
}
