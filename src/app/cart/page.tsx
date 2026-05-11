"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import CursorGlow from "@/components/CursorGlow";
import { useCart } from "@/hooks/useCart";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, Coffee } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, clearCart } = useCart();
  const [orderType, setOrderType] = useState<"DINE_IN" | "TAKE_AWAY" | "DELIVERY">("TAKE_AWAY");
  const [specialNote, setSpecialNote] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const orderData = {
        orderType,
        items: items.map(item => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          customization: item.customization
        })),
        specialNote,
        ...(orderType === "DELIVERY" && { deliveryAddress })
      };

      await apiFetch("/orders", {
        method: "POST",
        body: JSON.stringify(orderData),
        auth: true
      });

      clearCart();
      router.push("/dashboard");
    } catch (err: any) {
      if (err.message.includes("401")) {
        router.push("/auth/login?redirect=/cart");
      } else {
        setError(err.message || "Failed to place order. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <CursorGlow />
      <Navigation />

      <div className="pt-32 pb-20 px-5 md:px-10 max-w-[1320px] mx-auto relative z-10 min-h-screen">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="font-heading italic text-3xl sm:text-5xl lg:text-6xl text-[var(--color-on-surface)] flex items-center gap-4">
            Your Cart
            <ShoppingBag size={32} className="text-[var(--color-secondary)] opacity-50 md:w-10 md:h-10" />
          </h1>
        </motion.div>

        {items.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] rounded-3xl p-16 text-center max-w-2xl mx-auto mt-20"
          >
            <Coffee size={64} className="mx-auto text-[var(--color-secondary)] opacity-30 mb-6" />
            <h2 className="font-heading text-3xl mb-4 text-[var(--color-on-surface)]">Your cart is empty</h2>
            <p className="text-[var(--color-on-surface-variant)] mb-8">
              Looks like you haven't added any artisanal beverages or treats yet.
            </p>
            <button 
              onClick={() => router.push("/menu")}
              className="bg-[var(--color-secondary)] text-[#1a120b] font-label font-bold tracking-[0.2em] uppercase text-xs px-8 py-4 rounded-full hover:brightness-105 transition-all shadow-[0_10px_30px_rgba(196,168,130,0.2)]"
            >
              Explore Menu
            </button>
          </motion.div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Cart Items */}
            <div className="w-full lg:w-2/3 space-y-6">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] rounded-2xl p-4 md:p-6 flex flex-col md:flex-row gap-6 items-start md:items-center"
                  >
                    <div className="w-full md:w-24 h-24 bg-[var(--color-surface-container)] rounded-xl overflow-hidden flex-shrink-0 relative">
                      {item.menuItem.imageUrl ? (
                        <img src={item.menuItem.imageUrl} alt={item.menuItem.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--color-secondary)]/50">
                          <Coffee size={32} />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-grow flex flex-col justify-center h-full">
                      <h3 className="font-heading text-xl text-[var(--color-on-surface)] mb-1">{item.menuItem.name}</h3>
                      <p className="font-label text-xs tracking-wider text-[var(--color-secondary)]">Rs. {item.menuItem.price.toFixed(2)}</p>
                      
                      {item.customization && (
                        <p className="text-[10px] text-[var(--color-on-surface-variant)] mt-2 uppercase tracking-wider">
                          Customized
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                      <div className="flex items-center gap-3 bg-[var(--color-surface-container)] rounded-full p-1 border border-[var(--color-outline-variant)]">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)] transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="font-label font-bold text-sm w-4 text-center">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)] transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      
                      <div className="text-right flex flex-col items-end gap-2">
                        <p className="font-heading text-lg font-bold">
                          Rs. {(item.menuItem.price * item.quantity).toFixed(2)}
                        </p>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-red-400/70 hover:text-red-400 transition-colors p-2"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full lg:w-1/3"
            >
              <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] rounded-3xl p-8 sticky top-32">
                <h3 className="font-heading text-2xl text-[var(--color-on-surface)] mb-6">Order Summary</h3>
                
                <div className="space-y-4 mb-8">
                  <div className="flex flex-col gap-3">
                    <label className="font-label text-xs tracking-[0.1em] uppercase text-[var(--color-on-surface-variant)]">Order Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["TAKE_AWAY", "DINE_IN", "DELIVERY"].map((type) => (
                        <button
                          key={type}
                          onClick={() => setOrderType(type as any)}
                          className={`py-3 px-2 rounded-xl border text-[10px] font-bold tracking-wider transition-all uppercase ${
                            orderType === type 
                              ? "bg-[var(--color-secondary)]/10 border-[var(--color-secondary)] text-[var(--color-secondary)]" 
                              : "border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] hover:border-[var(--color-outline)]"
                          }`}
                        >
                          {type.replace("_", " ")}
                        </button>
                      ))}
                    </div>
                  </div>

                  {orderType === "DELIVERY" && (
                    <div className="flex flex-col gap-2 pt-2">
                      <label className="font-label text-xs tracking-[0.1em] uppercase text-[var(--color-on-surface-variant)]">Delivery Address</label>
                      <input 
                        type="text" 
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Enter full address"
                        className="w-full bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] rounded-xl px-4 py-3 text-sm text-[var(--color-on-surface)] focus:outline-none focus:border-[var(--color-secondary)] transition-colors"
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-2 pt-2">
                    <label className="font-label text-xs tracking-[0.1em] uppercase text-[var(--color-on-surface-variant)]">Special Note (Optional)</label>
                    <input 
                      type="text" 
                      value={specialNote}
                      onChange={(e) => setSpecialNote(e.target.value)}
                      placeholder="Any specific requests?"
                      className="w-full bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] rounded-xl px-4 py-3 text-sm text-[var(--color-on-surface)] focus:outline-none focus:border-[var(--color-secondary)] transition-colors"
                    />
                  </div>
                </div>

                <div className="border-t border-[var(--color-outline-variant)] py-4 space-y-3">
                  <div className="flex justify-between items-center text-sm text-[var(--color-on-surface-variant)]">
                    <span>Subtotal</span>
                    <span>Rs. {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-[var(--color-on-surface-variant)]">
                    <span>Taxes & Fees (10%)</span>
                    <span>Rs. {(subtotal * 0.1).toFixed(2)}</span>
                  </div>
                  {orderType === "DELIVERY" && (
                    <div className="flex justify-between items-center text-sm text-[var(--color-on-surface-variant)]">
                      <span>Delivery Fee</span>
                      <span>Rs. 500.00</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-[var(--color-outline-variant)] pt-4 pb-8">
                  <div className="flex justify-between items-center">
                    <span className="font-heading text-xl text-[var(--color-on-surface)]">Total</span>
                    <span className="font-heading text-3xl text-[var(--color-secondary)]">
                      Rs. {(subtotal * 1.1 + (orderType === "DELIVERY" ? 500 : 0)).toFixed(2)}
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                    {error}
                  </div>
                )}

                <button 
                  onClick={handleCheckout}
                  disabled={isSubmitting || (orderType === "DELIVERY" && !deliveryAddress)}
                  className="w-full group flex items-center justify-between bg-[var(--color-secondary)] text-[#1a120b] font-label font-bold tracking-[0.2em] uppercase text-xs px-6 py-4 rounded-full hover:brightness-105 transition-all shadow-[0_10px_30px_rgba(196,168,130,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{isSubmitting ? "Processing..." : "Place Order"}</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
