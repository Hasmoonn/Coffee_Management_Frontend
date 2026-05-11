"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import CursorGlow from "@/components/CursorGlow";
import { useUser } from "@/hooks/useUser";
import { useOrders } from "@/hooks/useOrder";
import { useMyReservations } from "@/hooks/useReservation";
import { useMyPoints } from "@/hooks/useLoyalty";
import { 
  UserCircle2, 
  ShoppingBag, 
  CalendarDays, 
  Award,
  Clock,
  MapPin,
  ChevronRight,
  LogOut
} from "lucide-react";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "reservations" | "loyalty">("profile");
  const { user, loading: userLoading } = useUser();
  const { orders, loading: ordersLoading } = useOrders();
  const { reservations, loading: resLoading } = useMyReservations();
  const { data: loyaltyData, loading: loyaltyLoading } = useMyPoints();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/";
  };

  if (!mounted) return null;

  if (!user && !userLoading) {
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
    return null;
  }

  const tabs = [
    { id: "profile", label: "My Profile", icon: UserCircle2 },
    { id: "orders", label: "Order History", icon: ShoppingBag },
    { id: "reservations", label: "Reservations", icon: CalendarDays },
    { id: "loyalty", label: "Loyalty & Rewards", icon: Award },
  ] as const;

  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <CursorGlow />
      <Navigation />

      <div className="pt-32 pb-20 px-5 md:px-10 max-w-[1320px] mx-auto relative z-10">
        <div className="mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading italic text-3xl xs:text-4xl sm:text-5xl lg:text-6xl text-[var(--color-on-surface)]"
          >
            Welcome back, <br/>
            <span className="text-[var(--color-secondary)]">{user?.name || "Artisan"}</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-label text-sm tracking-[0.2em] uppercase text-[var(--color-on-surface-variant)] mt-4"
          >
            Your Brew & Co. Experience
          </motion.p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full lg:w-1/4"
          >
            <div className="flex flex-row lg:flex-col gap-2 sticky top-32 overflow-x-auto pb-4 lg:pb-0 lg:overflow-visible scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 text-left whitespace-nowrap lg:whitespace-normal flex-shrink-0 lg:flex-shrink ${
                      isActive 
                        ? "bg-[var(--color-secondary)] text-[#1a120b] shadow-[0_8px_30px_rgba(196,168,130,0.2)]" 
                        : "hover:bg-[var(--color-surface-container)] text-[var(--color-on-surface)]"
                    }`}
                  >
                    <Icon size={20} className={isActive ? "text-[#1a120b]" : "text-[var(--color-secondary)]"} />
                    <span className="font-label text-[10px] sm:text-xs font-bold tracking-[0.15em] uppercase">
                      {tab.label}
                    </span>
                  </button>
                );
              })}

              <button
                onClick={handleLogout}
                className="flex items-center gap-4 px-6 py-4 lg:mt-8 rounded-2xl hover:bg-red-500/10 text-red-400 transition-all duration-300 text-left border border-transparent hover:border-red-500/20 whitespace-nowrap flex-shrink-0"
              >
                <LogOut size={20} />
                <span className="font-label text-[10px] sm:text-xs font-bold tracking-[0.15em] uppercase">
                  Sign Out
                </span>
              </button>
            </div>
          </motion.div>

          {/* Content Area */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full lg:w-3/4 min-h-[500px]"
          >
            <AnimatePresence mode="wait">
              {activeTab === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] rounded-3xl p-8 md:p-12"
                >
                  <h2 className="font-heading text-3xl mb-8 text-[var(--color-on-surface)]">Account Details</h2>
                  
                  {userLoading ? (
                    <div className="animate-pulse space-y-6">
                      <div className="h-12 bg-[var(--color-surface-container-high)] rounded-xl w-full"></div>
                      <div className="h-12 bg-[var(--color-surface-container-high)] rounded-xl w-full"></div>
                      <div className="h-12 bg-[var(--color-surface-container-high)] rounded-xl w-full"></div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-[var(--color-background)] p-6 rounded-2xl border border-[var(--color-outline-variant)]">
                          <label className="font-label text-[10px] text-[var(--color-on-surface-variant)] tracking-[0.2em] uppercase mb-2 block">Full Name</label>
                          <p className="font-body text-lg text-[var(--color-on-surface)]">{user?.name}</p>
                        </div>
                        <div className="bg-[var(--color-background)] p-6 rounded-2xl border border-[var(--color-outline-variant)]">
                          <label className="font-label text-[10px] text-[var(--color-on-surface-variant)] tracking-[0.2em] uppercase mb-2 block">Email Address</label>
                          <p className="font-body text-lg text-[var(--color-on-surface)]">{user?.email}</p>
                        </div>
                        <div className="bg-[var(--color-background)] p-6 rounded-2xl border border-[var(--color-outline-variant)]">
                          <label className="font-label text-[10px] text-[var(--color-on-surface-variant)] tracking-[0.2em] uppercase mb-2 block">Phone Number</label>
                          <p className="font-body text-lg text-[var(--color-on-surface)]">{user?.phone || "Not provided"}</p>
                        </div>
                        <div className="bg-[var(--color-background)] p-6 rounded-2xl border border-[var(--color-outline-variant)]">
                          <label className="font-label text-[10px] text-[var(--color-on-surface-variant)] tracking-[0.2em] uppercase mb-2 block">Member Since</label>
                          <p className="font-body text-lg text-[var(--color-on-surface)]">
                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "orders" && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <h2 className="font-heading text-3xl mb-8 text-[var(--color-on-surface)]">Order History</h2>
                  
                  {ordersLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-[var(--color-surface-container-low)] animate-pulse rounded-2xl"></div>
                      ))}
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] rounded-3xl p-12 text-center">
                      <ShoppingBag size={48} className="mx-auto text-[var(--color-secondary)] opacity-50 mb-4" />
                      <h3 className="font-heading text-2xl mb-2">No orders yet</h3>
                      <p className="text-[var(--color-on-surface-variant)] mb-6">Discover our artisanal menu and place your first order.</p>
                      <a href="/menu" className="inline-block bg-[var(--color-secondary)] text-[#1a120b] font-label text-xs tracking-[0.15em] uppercase font-bold px-8 py-3 rounded-full hover:brightness-105 transition-all">
                        Explore Menu
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map(order => (
                        <div key={order.id} className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] rounded-2xl p-6 hover:border-[var(--color-secondary)]/30 transition-all">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <span className="font-label text-xs tracking-[0.1em] text-[var(--color-secondary)]">#{order.orderNumber}</span>
                                <span className={`text-[10px] uppercase font-bold tracking-[0.1em] px-2 py-1 rounded-full ${
                                  order.status === 'DELIVERED' || order.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400' :
                                  order.status === 'PENDING' ? 'bg-orange-500/10 text-orange-400' :
                                  'bg-blue-500/10 text-blue-400'
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                              <p className="text-sm text-[var(--color-on-surface-variant)] flex items-center gap-2">
                                <Clock size={14} />
                                {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-heading text-xl text-[var(--color-on-surface)]">Rs. {order.finalAmount.toFixed(2)}</p>
                              <p className="text-xs text-[var(--color-on-surface-variant)] uppercase tracking-wider">{order.orderType.replace('_', ' ')}</p>
                            </div>
                          </div>
                          <div className="border-t border-[var(--color-outline-variant)] pt-4">
                            <p className="text-sm text-[var(--color-on-surface)] line-clamp-1">
                              {order.items.map(item => `${item.quantity}x ${item.menuItem?.name || 'Item'}`).join(', ')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "reservations" && (
                <motion.div
                  key="reservations"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex justify-between items-end mb-8">
                    <h2 className="font-heading text-3xl text-[var(--color-on-surface)]">Reservations</h2>
                    <a href="/reservations" className="text-[var(--color-secondary)] text-sm font-label tracking-[0.1em] uppercase hover:underline flex items-center gap-1">
                      Book New <ChevronRight size={14}/>
                    </a>
                  </div>
                  
                  {resLoading ? (
                    <div className="space-y-4">
                      {[1, 2].map(i => (
                        <div key={i} className="h-40 bg-[var(--color-surface-container-low)] animate-pulse rounded-2xl"></div>
                      ))}
                    </div>
                  ) : reservations.length === 0 ? (
                    <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] rounded-3xl p-12 text-center">
                      <CalendarDays size={48} className="mx-auto text-[var(--color-secondary)] opacity-50 mb-4" />
                      <h3 className="font-heading text-2xl mb-2">No reservations yet</h3>
                      <p className="text-[var(--color-on-surface-variant)] mb-6">Book a table for your next artisanal coffee experience.</p>
                      <a href="/reservations" className="inline-block border border-[var(--color-secondary)] text-[var(--color-secondary)] font-label text-xs tracking-[0.15em] uppercase font-bold px-8 py-3 rounded-full hover:bg-[var(--color-secondary)]/10 transition-all">
                        Book a Table
                      </a>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {reservations.map(res => (
                        <div key={res.id} className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] rounded-2xl p-6 flex flex-col md:flex-row justify-between md:items-center gap-6">
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-[var(--color-secondary)]/10 border border-[var(--color-secondary)]/20 flex flex-col items-center justify-center text-[var(--color-secondary)]">
                              <span className="text-xs uppercase font-label tracking-widest">{new Date(res.date).toLocaleString('default', { month: 'short' })}</span>
                              <span className="text-xl font-heading font-bold">{new Date(res.date).getDate()}</span>
                            </div>
                            <div>
                              <h4 className="font-heading text-xl text-[var(--color-on-surface)] mb-1">Table for {res.guests}</h4>
                              <p className="text-sm text-[var(--color-on-surface-variant)] flex items-center gap-2 mb-1">
                                <Clock size={14} /> {res.time}
                              </p>
                              <div className="flex gap-2 items-center">
                                <span className={`text-[10px] uppercase font-bold tracking-[0.1em] px-2 py-1 rounded-full ${
                                  res.status === 'CONFIRMED' ? 'bg-green-500/10 text-green-400' :
                                  res.status === 'CANCELLED' ? 'bg-red-500/10 text-red-400' :
                                  'bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]'
                                }`}>
                                  {res.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "loyalty" && (
                <motion.div
                  key="loyalty"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <h2 className="font-heading text-3xl mb-8 text-[var(--color-on-surface)]">Loyalty & Rewards</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-[var(--color-surface-container-low)] to-[var(--color-surface-container)] border border-[var(--color-secondary)]/30 rounded-3xl p-8 relative overflow-hidden">
                      <div className="absolute -right-10 -top-10 text-[var(--color-secondary)]/10">
                        <Award size={150} />
                      </div>
                      <div className="relative z-10">
                        <p className="font-label text-xs tracking-[0.2em] uppercase text-[var(--color-secondary)] mb-2">Available Points</p>
                        <h3 className="font-heading text-6xl text-[var(--color-on-surface)] mb-4">
                          {loyaltyLoading ? "..." : loyaltyData?.points || 0}
                        </h3>
                        <p className="text-sm text-[var(--color-on-surface-variant)]">
                          Earn 1 point for every Rs. 100 spent.
                        </p>
                      </div>
                    </div>

                    <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] rounded-3xl p-8">
                      <p className="font-label text-xs tracking-[0.2em] uppercase text-[var(--color-on-surface-variant)] mb-6">Current Tier</p>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-[var(--color-secondary)] text-[#1a120b] flex items-center justify-center">
                          <Award size={24} />
                        </div>
                        <div>
                          <h4 className="font-heading text-2xl text-[var(--color-on-surface)]">Artisan</h4>
                          <p className="text-sm text-[var(--color-on-surface-variant)]">Gold Member</p>
                        </div>
                      </div>
                      <div className="w-full bg-[var(--color-surface-container-high)] rounded-full h-2 mt-6">
                        <div className="bg-[var(--color-secondary)] h-2 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                      <p className="text-xs text-[var(--color-on-surface-variant)] text-right mt-2">150 points to Platinum</p>
                    </div>
                  </div>

                  <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] rounded-3xl p-8 mt-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-heading text-2xl text-[var(--color-on-surface)]">Stamp Card</h3>
                      <span className="text-[var(--color-secondary)] text-sm font-bold">{user?.stampCount || 0}/10 Stamps</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {[...Array(10)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-14 h-14 rounded-full flex items-center justify-center border-2 ${
                            i < (user?.stampCount || 0) 
                              ? 'border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]' 
                              : 'border-[var(--color-outline-variant)] bg-[var(--color-background)] text-[var(--color-outline-variant)]'
                          }`}
                        >
                          {i < (user?.stampCount || 0) ? (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                              <Award size={20} />
                            </motion.div>
                          ) : (
                            <span className="font-label text-xs">{i + 1}</span>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-[var(--color-on-surface-variant)] mt-6">
                      Buy 10 coffees, get your 11th free! Valid on any handcrafted beverage.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
