"use client";

import { useState, useEffect } from "react";
import type { MenuItem } from "@/types/menu";

export interface CartItem {
  id: string; // unique ID for the cart item (since same menu item can have different customizations)
  menuItem: MenuItem;
  quantity: number;
  customization?: any;
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("cart");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
  }, []);

  const saveCart = (newItems: CartItem[]) => {
    setItems(newItems);
    localStorage.setItem("cart", JSON.stringify(newItems));
    // Dispatch custom event for cross-hook synchronization
    window.dispatchEvent(new Event("cart-updated"));
  };

  useEffect(() => {
    const handleUpdate = () => {
      const saved = localStorage.getItem("cart");
      if (saved) {
        try {
          setItems(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse cart", e);
        }
      } else {
        setItems([]);
      }
    };

    window.addEventListener("cart-updated", handleUpdate);
    // Also listen for storage events from other tabs
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("cart-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const addItem = (menuItem: MenuItem, quantity: number = 1, customization?: any) => {
    const existingIndex = items.findIndex(
      (item) => item.menuItem.id === menuItem.id && JSON.stringify(item.customization) === JSON.stringify(customization)
    );

    if (existingIndex >= 0) {
      const newItems = [...items];
      newItems[existingIndex].quantity += quantity;
      saveCart(newItems);
    } else {
      const newItem: CartItem = {
        id: Math.random().toString(36).substr(2, 9),
        menuItem,
        quantity,
        customization,
      };
      saveCart([...items, newItem]);
    }
  };

  const removeItem = (id: string) => {
    saveCart(items.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    saveCart(
      items.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    saveCart([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );

  return {
    items: mounted ? items : [],
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems: mounted ? totalItems : 0,
    subtotal: mounted ? subtotal : 0,
  };
}
