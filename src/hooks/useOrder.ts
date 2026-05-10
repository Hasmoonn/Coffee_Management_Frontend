import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customization: any;
  menuItem: {
    id: string;
    name: string;
    imageUrl: string;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  orderType: string;
  status: string;
  totalAmount: number;
  discount: number;
  finalAmount: number;
  items: OrderItem[];
  createdAt: string;
}

export function useOrders(enabled: boolean = true) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    if (!enabled) return;
    setLoading(true);
    apiFetch<Order[] | { data: Order[] }>("/orders/my-orders", { auth: true })
      .then((res) => {
        const arr = Array.isArray(res) ? res : (res as any).data ?? [];
        setOrders(arr);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [enabled]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { orders, loading, error, refetch };
}
