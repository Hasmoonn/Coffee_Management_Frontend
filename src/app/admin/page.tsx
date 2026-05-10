"use client";

import React, { useState, useEffect } from "react";
import { getImageUrl } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import CursorGlow from "@/components/CursorGlow";
import { useUser } from "@/hooks/useUser";
import { 
  useAdminOrders, 
  useAdminReservations, 
  useAdminUsers, 
  useAdminMenu, 
  useAnalytics,
  useAdminCategories
} from "@/hooks/useAdmin";
import { 
  Users, 
  ShoppingBag, 
  CalendarDays, 
  Settings,
  Clock,
  LogOut,
  Coffee,
  LayoutDashboard,
  Utensils,
  TrendingUp,
  Trash2,
  Plus,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Menu as MenuIcon,
  X,
  BarChart3,
  PieChart,
  Award
} from "lucide-react";
import Link from "next/link";

type TabType = "overview" | "orders" | "reservations" | "menu" | "users";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, loading: userLoading } = useUser();
  
  const { orders, loading: ordersLoading, updateOrderStatus } = useAdminOrders();
  const { reservations, loading: resLoading, updateReservationStatus } = useAdminReservations();
  const { users, loading: usersLoading, deleteUser } = useAdminUsers();
  const { items: menuItems, loading: menuLoading, deleteMenuItem, createMenuItem, updateMenuItem } = useAdminMenu();
  const { categories } = useAdminCategories();
  const { stats, loading: statsLoading } = useAnalytics();
  
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!user && !userLoading) {
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login?redirect=/admin";
    }
    return null;
  }

  if (user && user.role !== "ADMIN" && user.role !== "STAFF") {
    if (typeof window !== "undefined") {
      window.location.href = "/dashboard";
    }
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/";
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "reservations", label: "Reservations", icon: CalendarDays },
    { id: "menu", label: "Menu Items", icon: Utensils },
    { id: "users", label: "Users", icon: Users },
  ] as const;

  const SidebarContent = () => (
    <>
      <div className="p-8">
        <Link href="/" className="flex flex-col leading-none mb-12 group">
          <span className="font-label text-[9px] tracking-[0.35em] uppercase text-white/45 mb-1">
            Management Portal
          </span>
          <span className="font-heading italic text-2xl font-medium tracking-tight text-white group-hover:text-[var(--color-secondary)] transition-colors">
            Brew & Co.
          </span>
        </Link>

        <nav className="flex flex-col gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsSidebarOpen(false);
                }}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 text-left ${
                  isActive 
                    ? "bg-[var(--color-secondary)] text-[#1a120b] shadow-[0_8px_30px_rgba(196,168,130,0.2)]" 
                    : "hover:bg-white/5 text-white/60 hover:text-white"
                }`}
              >
                <Icon size={18} className={isActive ? "text-[#1a120b]" : "text-[var(--color-secondary)]"} />
                <span className="font-label text-[11px] font-bold tracking-[0.15em] uppercase">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-8 border-t border-white/5">
        <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-white/5">
          <div className="w-10 h-10 rounded-full bg-[var(--color-secondary)]/20 flex items-center justify-center text-[var(--color-secondary)]">
            <ShieldCheck size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white truncate w-32">{user?.name}</span>
            <span className="text-[9px] uppercase tracking-widest text-white/40">{user?.role}</span>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-2xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all font-label text-[10px] font-bold tracking-widest uppercase border border-red-500/20"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <main className="relative min-h-screen bg-[#0c0908] text-[#e0d7d0] overflow-hidden flex">
      <CursorGlow />
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 bg-[#140e0a] border-r border-white/5 flex-col z-50 shadow-[20px_0_50px_rgba(0,0,0,0.3)]">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] lg:hidden"
            />
            <motion.aside 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-80 bg-[#140e0a] z-[70] flex flex-col lg:hidden border-r border-white/10"
            >
              <div className="absolute top-8 right-8">
                <button onClick={() => setIsSidebarOpen(false)} className="text-white/40 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto h-screen relative bg-[radial-gradient(circle_at_top_right,rgba(196,168,130,0.03),transparent_40%)] custom-scrollbar">
        <header className="sticky top-0 z-40 bg-[#0c0908]/80 backdrop-blur-2xl border-b border-white/5 p-6 md:px-10 flex justify-between items-center transition-all duration-300">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-3 bg-white/5 rounded-2xl text-[var(--color-secondary)] hover:bg-white/10 transition-all border border-white/5"
            >
              <MenuIcon size={20} />
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-label mb-1">Portal / {activeTab}</span>
              <h1 className="font-heading italic text-2xl md:text-4xl text-white tracking-tight">
                {tabs.find(t => t.id === activeTab)?.label}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {/* The Back to Site link is removed because admins are restricted to the dashboard while logged in */}
          </div>
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto pb-24">
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-10"
              >
                {statsLoading && !stats ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-40 bg-white/5 animate-pulse rounded-[2rem]" />
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: "Total Revenue", value: `$${stats?.totalRevenue?.toFixed(2) || "0.00"}`, icon: TrendingUp, color: "text-green-400", bg: "bg-green-400/10" },
                    { label: "Total Orders", value: stats?.totalOrders || "0", icon: ShoppingBag, color: "text-[var(--color-secondary)]", bg: "bg-[var(--color-secondary)]/10" },
                    { label: "Pending Reservations", value: stats?.pendingReservations || "0", icon: CalendarDays, color: "text-orange-400", bg: "bg-orange-400/10" },
                    { label: "Total Users", value: stats?.totalUsers || "0", icon: Users, color: "text-purple-400", bg: "bg-purple-400/10" },
                  ].map((s, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="group relative bg-[#1a120b] border border-white/5 rounded-[2rem] p-7 shadow-2xl hover:border-[var(--color-secondary)]/20 transition-all duration-500 overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/[0.02] to-transparent rounded-bl-[4rem]" />
                      <div className="relative z-10 flex justify-between items-start mb-6">
                        <div className={`p-4 rounded-2xl ${s.bg} ${s.color} border border-white/5`}>
                          <s.icon size={24} />
                        </div>
                      </div>
                      <div className="relative z-10">
                        <p className="text-[10px] uppercase tracking-[0.25em] text-white/30 font-label mb-2 group-hover:text-white/50 transition-colors">{s.label}</p>
                        <h3 className="text-3xl font-heading text-white tracking-tight">{s.value}</h3>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="bg-[#1a120b] border border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-secondary)]/20 to-transparent" />
                    <div className="flex justify-between items-center mb-10">
                      <h3 className="font-heading text-2xl italic flex items-center gap-4 text-white">
                        <Clock size={22} className="text-[var(--color-secondary)]" /> Recent Orders
                      </h3>
                      <button onClick={() => setActiveTab("orders")} className="text-[10px] font-label uppercase tracking-widest text-white/30 hover:text-[var(--color-secondary)] transition-colors">View All</button>
                    </div>
                    <div className="space-y-5">
                      {Array.isArray(orders) && orders.length > 0 ? orders.slice(0, 5).map(order => (
                        <div key={order.id} className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all group">
                          <div className="flex gap-4 items-center">
                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-[var(--color-secondary)] group-hover:scale-110 transition-transform">
                              <ShoppingBag size={20} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-white mb-1">Order #{order.orderNumber}</span>
                              <span className="text-[10px] text-white/40 uppercase tracking-widest font-label">{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className="text-sm font-bold text-[var(--color-secondary)]">${order.finalAmount.toFixed(2)}</span>
                            <span className="text-[8px] font-label uppercase tracking-widest px-3 py-1 rounded-full bg-white/5 text-white/30 border border-white/5">
                              {order.status}
                            </span>
                          </div>
                        </div>
                      )) : (
                        <div className="py-12 text-center text-white/20 text-sm font-body italic">No recent orders</div>
                      )}
                    </div>
                  </div>

                  <div className="bg-[#1a120b] border border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-400/20 to-transparent" />
                    <div className="flex justify-between items-center mb-10">
                      <h3 className="font-heading text-2xl italic flex items-center gap-4 text-white">
                        <CalendarDays size={22} className="text-orange-400" /> Upcoming Reservations
                      </h3>
                      <button onClick={() => setActiveTab("reservations")} className="text-[10px] font-label uppercase tracking-widest text-white/30 hover:text-orange-400 transition-colors">View All</button>
                    </div>
                    <div className="space-y-5">
                      {Array.isArray(reservations) && reservations.length > 0 ? reservations.filter(r => r.status === 'CONFIRMED').slice(0, 5).map(res => (
                        <div key={res.id} className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all group">
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-orange-400/10 border border-orange-400/20 flex flex-col items-center justify-center text-orange-400 group-hover:bg-orange-400/20 transition-all">
                              <span className="text-[9px] uppercase font-bold tracking-tighter">{new Date(res.date).toLocaleString('default', { month: 'short' })}</span>
                              <span className="text-xl font-heading font-bold leading-none">{new Date(res.date).getDate()}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-white mb-1">Table for {res.guests}</span>
                              <span className="text-[10px] text-white/40 flex items-center gap-2 uppercase tracking-widest">
                                <Clock size={10} /> {res.time}
                              </span>
                            </div>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:text-[var(--color-secondary)] group-hover:translate-x-1 transition-all">
                            <ChevronRight size={18} />
                          </div>
                        </div>
                      )) : (
                        <div className="py-12 text-center text-white/20 text-sm font-body italic">No upcoming reservations</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Performance Intelligence Section */}
                <div className="space-y-10">
                  <div className="flex items-center gap-6">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <h2 className="font-heading italic text-3xl text-white/40">Performance Intelligence</h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                    {/* Weekly Revenue Trends */}
                    <div className="xl:col-span-2 bg-[#1a120b] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-secondary)]/30 to-transparent" />
                      <div className="flex justify-between items-center mb-12">
                        <div className="flex flex-col">
                          <h3 className="font-heading text-2xl italic text-white flex items-center gap-4">
                            <BarChart3 size={22} className="text-[var(--color-secondary)]" /> Revenue Trajectory
                          </h3>
                          <p className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-label mt-1">Last 7 Days Performance</p>
                        </div>
                        <div className="flex gap-2">
                           {stats?.weekly?.map((_: any, i: number) => (
                             <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/5 group-hover:bg-[var(--color-secondary)]/20 transition-all duration-700" style={{ transitionDelay: `${i * 100}ms` }} />
                           ))}
                        </div>
                      </div>

                      <div className="flex justify-between gap-4 h-64 px-4">
                        {stats?.weekly?.map((day: any, i: number) => {
                          const revenues = stats.weekly.map((d: any) => Number(d.revenue));
                          const maxVal = Math.max(...revenues, 100);
                          const currentRevenue = Number(day.revenue);
                          const height = (currentRevenue / maxVal) * 100;
                          return (
                            <div key={i} className="flex-1 h-full flex flex-col items-center group/bar">
                              <div className="relative w-full flex-1 flex items-end justify-center mb-6">
                                <motion.div 
                                  initial={{ height: 0 }}
                                  animate={{ height: `${height}%` }}
                                  transition={{ delay: 0.2 + i * 0.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                  className="w-[60%] bg-gradient-to-t from-[var(--color-secondary)]/10 via-[var(--color-secondary)] to-white/20 rounded-t-xl relative shadow-[0_0_40px_rgba(196,168,130,0.1)] group-hover/bar:brightness-125 transition-all"
                                >
                                   <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-all pointer-events-none scale-90 group-hover/bar:scale-100">
                                      <span className="text-[10px] font-bold text-white">${currentRevenue.toFixed(0)}</span>
                                   </div>
                                </motion.div>
                              </div>
                              <span className="text-[9px] uppercase tracking-widest text-white/20 font-label group-hover/bar:text-[var(--color-secondary)] transition-colors">
                                {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Best Selling Showcase */}
                    <div className="bg-[#1a120b] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />
                      <div className="flex flex-col mb-10">
                        <h3 className="font-heading text-2xl italic text-white flex items-center gap-4">
                          <Award size={22} className="text-amber-400" /> Best Sellers
                        </h3>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-label mt-1">High-Volume Menu Items</p>
                      </div>

                      <div className="space-y-6">
                        {stats?.bestSellers?.slice(0, 4).map((item: any, i: number) => (
                          <div key={i} className="flex items-center gap-5 group/item">
                            <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/5 group-hover/item:border-amber-400/30 transition-all flex-shrink-0">
                               <img src={getImageUrl(item.imageUrl)} alt={item.name} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-700" />
                            </div>
                            <div className="flex-1 flex flex-col min-w-0">
                               <span className="text-sm font-bold text-white truncate mb-1 group-hover/item:text-amber-400 transition-colors">{item.name}</span>
                               <div className="flex items-center gap-3">
                                  <span className="text-[9px] uppercase tracking-widest text-white/30 font-label">{item.totalSold} Units Sold</span>
                                  <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                                     <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(item.totalSold / (stats.bestSellers[0]?.totalSold || 1)) * 100}%` }}
                                        className="h-full bg-amber-400/40"
                                     />
                                  </div>
                               </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Order Distribution */}
                  <div className="bg-[#1a120b] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
                     <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent" />
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="flex flex-col">
                           <h3 className="font-heading text-2xl italic text-white flex items-center gap-4">
                              <PieChart size={22} className="text-blue-400" /> Order Operations Health
                           </h3>
                           <p className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-label mt-1">Status Distribution Overview</p>
                        </div>
                        <div className="flex flex-wrap gap-8 items-center">
                           {stats?.orderStats?.map((s: any, i: number) => (
                             <div key={i} className="flex items-center gap-4">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.status === 'DELIVERED' ? '#4ade80' : s.status === 'PENDING' ? '#facc15' : s.status === 'CANCELLED' ? '#f87171' : '#60a5fa' }} />
                                <div className="flex flex-col">
                                   <span className="text-xs font-bold text-white">{s._count}</span>
                                   <span className="text-[8px] uppercase tracking-widest text-white/30 font-label">{s.status}</span>
                                </div>
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}

            {activeTab === "orders" && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {ordersLoading ? (
                  <div className="grid gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-white/5 animate-pulse rounded-[2rem]"></div>)}
                  </div>
                ) : (
                  <div className="bg-[#1a120b] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-left min-w-[800px]">
                        <thead>
                          <tr className="border-b border-white/5 bg-white/[0.03]">
                            <th className="p-8 font-label text-[10px] uppercase tracking-[0.25em] text-white/40">Order Details</th>
                            <th className="p-8 font-label text-[10px] uppercase tracking-[0.25em] text-white/40">Type</th>
                            <th className="p-8 font-label text-[10px] uppercase tracking-[0.25em] text-white/40">Total</th>
                            <th className="p-8 font-label text-[10px] uppercase tracking-[0.25em] text-white/40">Status Update</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.isArray(orders) && orders.length > 0 ? orders.map(order => (
                            <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors group">
                              <td className="p-8">
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold text-[var(--color-secondary)] mb-1">#{order.orderNumber}</span>
                                  <span className="text-[10px] text-white/40 font-label">{new Date(order.createdAt).toLocaleString()}</span>
                                </div>
                              </td>
                              <td className="p-8">
                                <span className="text-[9px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 rounded-lg bg-white/5 text-white/40 border border-white/5">
                                  {order.orderType.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="p-8">
                                <span className="text-lg font-heading text-white">${order.finalAmount.toFixed(2)}</span>
                              </td>
                              <td className="p-8">
                                <div className="flex items-center gap-3">
                                  <select 
                                    value={order.status}
                                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                    className="bg-[#0c0908] border border-white/10 rounded-2xl px-5 py-3 text-[11px] text-[var(--color-secondary)] font-bold tracking-widest uppercase outline-none focus:border-[var(--color-secondary)]/50 transition-all appearance-none cursor-pointer min-w-[160px] text-center shadow-inner"
                                  >
                                    {["PENDING", "CONFIRMED", "PREPARING", "READY", "DELIVERED", "CANCELLED"].map(s => (
                                      <option key={s} value={s}>{s}</option>
                                    ))}
                                  </select>
                                  <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] ${
                                    order.status === 'READY' ? 'text-green-400 bg-green-400' : 
                                    order.status === 'PENDING' ? 'text-yellow-400 bg-yellow-400' :
                                    order.status === 'CANCELLED' ? 'text-red-400 bg-red-400' : 'text-blue-400 bg-blue-400'
                                  }`} />
                                </div>
                              </td>
                            </tr>
                          )) : (
                            <tr><td colSpan={4} className="p-20 text-center font-body italic text-white/20 text-lg">No orders found in the system</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "reservations" && (
              <motion.div
                key="reservations"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                {Array.isArray(reservations) && reservations.length > 0 ? reservations.map((res, i) => (
                  <motion.div 
                    key={res.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-[#1a120b] border border-white/5 rounded-[2.5rem] p-8 flex flex-col gap-8 shadow-2xl relative group hover:border-[var(--color-secondary)]/20 transition-all duration-500"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-[var(--color-secondary)]/10 border border-[var(--color-secondary)]/20 flex flex-col items-center justify-center text-[var(--color-secondary)] shadow-lg group-hover:scale-105 transition-transform duration-500">
                          <span className="text-[10px] uppercase font-bold tracking-widest mb-1">{new Date(res.date).toLocaleString('default', { month: 'short' })}</span>
                          <span className="text-2xl font-heading font-bold leading-none">{new Date(res.date).getDate()}</span>
                        </div>
                        <div className="flex flex-col">
                          <h4 className="font-heading italic text-xl text-white mb-1">Table for {res.guests} Guests</h4>
                          <div className="flex items-center gap-4 text-white/40 font-label text-[10px] tracking-[0.2em] uppercase">
                            <span className="flex items-center gap-2"><Clock size={12} /> {res.time}</span>
                            <span className="w-1 h-1 rounded-full bg-white/10" />
                            <span>{res.user?.name || "Guest"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-[8px] font-bold tracking-[0.25em] uppercase px-3 py-1.5 rounded-full border ${
                          res.status === 'CONFIRMED' ? 'bg-green-400/10 text-green-400 border-green-400/20' :
                          res.status === 'CANCELLED' ? 'bg-red-400/10 text-red-400 border-red-400/20' :
                          'bg-white/5 text-white/30 border-white/5'
                        }`}>
                          {res.status}
                        </span>
                      </div>
                    </div>

                    {res.specialRequests && (
                      <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 text-xs italic text-white/40 leading-relaxed font-body">
                        "{res.specialRequests}"
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div className="flex flex-col gap-2">
                        <label className="text-[9px] uppercase tracking-widest text-white/30 font-label ml-1">Status Action</label>
                        <select 
                          value={res.status}
                          onChange={(e) => updateReservationStatus(res.id, e.target.value)}
                          className="bg-[#0c0908] border border-white/10 rounded-2xl px-5 py-4 text-[10px] text-[var(--color-secondary)] font-bold tracking-widest uppercase outline-none focus:border-[var(--color-secondary)]/50 transition-all cursor-pointer shadow-inner"
                        >
                          {["CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-2">
                         <label className="text-[9px] uppercase tracking-widest text-white/30 font-label ml-1">Contact</label>
                         <div className="h-[52px] bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-center text-[10px] text-white/30 font-label tracking-widest uppercase">
                           Details
                         </div>
                      </div>
                    </div>
                  </motion.div>
                )) : (
                  <div className="col-span-full py-32 text-center text-white/20 italic font-heading text-2xl">No reservations found</div>
                )}
              </motion.div>
            )}

            {activeTab === "menu" && (
              <motion.div
                key="menu"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-12"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#1a120b] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
                  <div className="flex flex-col">
                    <h3 className="font-heading italic text-3xl text-white mb-2">Artisanal Offerings</h3>
                    <p className="text-xs text-white/40 font-body">Manage and refine the culinary collection</p>
                  </div>
                  <button 
                    onClick={() => {
                      setEditingItem(null);
                      setShowItemModal(true);
                    }}
                    className="flex items-center gap-3 bg-[var(--color-secondary)] text-[#1a120b] px-8 py-4 rounded-[1.5rem] font-label text-[11px] font-bold tracking-[0.2em] uppercase hover:brightness-110 active:scale-95 transition-all shadow-xl"
                  >
                    <Plus size={20} strokeWidth={3} /> Create Masterpiece
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {Array.isArray(menuItems) && menuItems.length > 0 ? menuItems.map((item, i) => (
                    <motion.div 
                      key={item.id} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-[#1a120b] border border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-[var(--color-secondary)]/30 transition-all duration-700 shadow-2xl relative"
                    >
                      <div className="h-60 relative overflow-hidden bg-[#0c0908]">
                        {item.imageUrl ? (
                          <img 
                            src={getImageUrl(item.imageUrl)} 
                            alt={item.name} 
                            className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-110 transition-all duration-1000 ease-out" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center opacity-20"><Coffee size={64} /></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1a120b] via-transparent to-transparent" />
                        <div className="absolute top-6 right-6 bg-black/60 backdrop-blur-xl px-5 py-2.5 rounded-2xl border border-white/10 shadow-2xl">
                          <span className="text-lg font-heading italic text-[var(--color-secondary)]">${item.price.toFixed(2)}</span>
                        </div>
                        {!item.isAvailable && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                            <span className="text-[10px] font-label uppercase tracking-[0.4em] text-white/60 bg-white/5 px-6 py-3 rounded-full border border-white/10">Unavailable</span>
                          </div>
                        )}
                      </div>
                      <div className="p-8">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex flex-col">
                            <span className="text-[9px] uppercase tracking-[0.3em] text-[var(--color-secondary)] font-label mb-1">
                              {item.category?.name || "Uncategorized"}
                            </span>
                            <h4 className="font-heading italic text-2xl text-white group-hover:text-[var(--color-secondary)] transition-colors tracking-tight">{item.name}</h4>
                          </div>
                        </div>
                        <p className="text-xs text-white/30 font-body line-clamp-2 mb-8 min-h-[40px] leading-relaxed italic">
                          "{item.description}"
                        </p>
                        <div className="flex gap-4">
                          <button 
                            onClick={() => {
                              setEditingItem(item);
                              setShowItemModal(true);
                            }}
                            className="flex-1 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white py-4 rounded-2xl transition-all font-label text-[10px] font-bold uppercase tracking-[0.2em] border border-white/5 shadow-inner"
                          >
                            Refine
                          </button>
                          <button 
                            onClick={() => {
                              if(window.confirm('Erase this item from existence?')) {
                                deleteMenuItem(item.id);
                              }
                            }}
                            className="w-14 flex items-center justify-center bg-red-500/5 hover:bg-red-500/20 text-red-500/30 hover:text-red-400 py-4 rounded-2xl transition-all border border-red-500/10"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )) : (
                    <div className="col-span-full py-40 flex flex-col items-center justify-center text-center">
                       <Coffee size={48} className="text-white/10 mb-6" />
                       <p className="text-white/20 italic font-heading text-2xl">The collection is currently empty</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "users" && (
              <motion.div
                key="users"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {usersLoading ? (
                  <div className="h-64 bg-white/5 animate-pulse rounded-[2.5rem]"></div>
                ) : (
                  <div className="bg-[#1a120b] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-left min-w-[700px]">
                        <thead>
                          <tr className="border-b border-white/5 bg-white/[0.03]">
                            <th className="p-8 font-label text-[10px] uppercase tracking-[0.25em] text-white/40">Patron Info</th>
                            <th className="p-8 font-label text-[10px] uppercase tracking-[0.25em] text-white/40">Credentials</th>
                            <th className="p-8 font-label text-[10px] uppercase tracking-[0.25em] text-white/40">Authority</th>
                            <th className="p-8 font-label text-[10px] uppercase tracking-[0.25em] text-white/40">Joined</th>
                            <th className="p-8 font-label text-[10px] uppercase tracking-[0.25em] text-white/40 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.isArray(users) && users.length > 0 ? users.map(u => (
                            <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors group">
                              <td className="p-8">
                                <div className="flex items-center gap-5">
                                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-sm text-[var(--color-secondary)] font-heading italic font-bold border border-white/5 shadow-inner">
                                    {u.name.charAt(0)}
                                  </div>
                                  <span className="text-sm font-bold text-white tracking-tight">{u.name}</span>
                                </div>
                              </td>
                              <td className="p-8">
                                <span className="text-xs text-white/40 font-body">{u.email}</span>
                              </td>
                              <td className="p-8">
                                <span className={`text-[9px] font-bold tracking-[0.25em] uppercase px-4 py-2 rounded-xl border ${
                                  u.role === 'ADMIN' ? 'bg-orange-500/10 text-orange-400 border-orange-400/20 shadow-[0_0_15px_rgba(251,146,60,0.1)]' : 'bg-white/5 text-white/40 border-white/5'
                                }`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="p-8">
                                <span className="text-[10px] text-white/30 uppercase tracking-widest font-label">{new Date(u.createdAt).toLocaleDateString()}</span>
                              </td>
                              <td className="p-8 text-right">
                                {u.role !== 'ADMIN' && (
                                  <button 
                                    onClick={() => {
                                      if(window.confirm('Permanently remove this patron?')) {
                                        deleteUser(u.id);
                                      }
                                    }}
                                    className="text-red-400/20 hover:text-red-400 transition-all p-3 hover:bg-red-400/10 rounded-xl border border-transparent hover:border-red-400/20"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                )}
                              </td>
                            </tr>
                          )) : (
                            <tr><td colSpan={5} className="p-20 text-center text-white/20 italic font-body">No users found</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-10 border-t border-white/5 mt-auto bg-[#0c0908]/50 backdrop-blur-md">
           <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
             <p className="text-[9px] uppercase tracking-[0.4em] text-white/10 font-label">
               Brew & Co. Administrative System &copy; 2026 • Secure & Encrypted
             </p>
             <div className="flex gap-8 items-center opacity-20">
                <span className="h-px w-12 bg-white" />
                <Coffee size={14} className="text-white" />
                <span className="h-px w-12 bg-white" />
             </div>
           </div>
        </div>
      </div>

      {/* Menu Item Modal */}
      <AnimatePresence>
        {showItemModal && (
          <MenuItemModal 
            isOpen={showItemModal}
            onClose={() => setShowItemModal(false)}
            categories={categories}
            onSubmit={async (data) => {
              if (editingItem) {
                await updateMenuItem(editingItem.id, data);
              } else {
                await createMenuItem(data);
              }
              setShowItemModal(false);
            }}
            initialData={editingItem}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

function MenuItemModal({ isOpen, onClose, categories, onSubmit, initialData }: any) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price || "",
    categoryId: initialData?.categoryId || "",
    calories: initialData?.calories || "",
    preparationTime: initialData?.preparationTime || "5",
    isAvailable: initialData?.isAvailable ?? true,
    isFeatured: initialData?.isFeatured ?? false,
  });
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState(initialData?.imageUrl ? getImageUrl(initialData.imageUrl) : null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value.toString());
      });
      if (image) data.append("image", image);
      await onSubmit(data);
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-5xl bg-[#1a120b] border border-white/10 rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)]"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[var(--color-secondary)] to-transparent" />
        
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row h-full max-h-[90vh] overflow-y-auto md:overflow-hidden">
          {/* Left Side: Image Upload Section */}
          <div className="w-full md:w-[40%] bg-[#0c0908] p-8 md:p-12 border-r border-white/5 flex flex-col">
            <div className="mb-10">
              <h3 className="font-heading italic text-3xl text-white mb-2">Visual Essence</h3>
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/30 font-label">The aesthetic representation</p>
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
              <div className="relative aspect-[4/5] w-full rounded-[2rem] overflow-hidden bg-white/5 border border-white/10 group cursor-pointer shadow-inner">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white/20 gap-4 p-10 text-center">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/5 mb-2">
                      <Plus size={32} strokeWidth={1} />
                    </div>
                    <span className="text-[10px] font-label uppercase tracking-widest leading-relaxed">
                      Select Artwork<br/>(PNG, JPG, WEBP)
                    </span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImage(file);
                      setPreview(URL.createObjectURL(file));
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer z-20"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center z-10">
                  <span className="text-[10px] font-label uppercase tracking-widest text-white bg-white/10 backdrop-blur-xl px-8 py-4 rounded-full border border-white/20 shadow-2xl scale-90 group-hover:scale-100 transition-transform duration-500">
                    {preview ? "Replace Masterpiece" : "Upload Image"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Details Form Section */}
          <div className="flex-1 p-8 md:p-12 md:overflow-y-auto custom-scrollbar flex flex-col">
            <div className="flex justify-between items-start mb-12">
              <div className="flex flex-col">
                <h3 className="font-heading italic text-4xl text-white mb-2 tracking-tight">
                  {initialData ? "Refine Creation" : "New Masterpiece"}
                </h3>
                <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-secondary)] font-label">
                  Culinary Specification
                </p>
              </div>
              <button 
                type="button" 
                onClick={onClose} 
                className="text-white/20 hover:text-white transition-all p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/5"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-12 flex-1">
              <div className="space-y-10">
                <div className="relative group">
                  <label className="text-[9px] uppercase tracking-[0.4em] text-white/30 font-label mb-3 block ml-1 group-focus-within:text-[var(--color-secondary)] transition-colors">
                    Creation Identity
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-transparent border-b border-white/10 py-4 px-1 text-2xl text-white outline-none focus:border-[var(--color-secondary)] transition-all placeholder:text-white/5 font-heading italic tracking-tight"
                    placeholder="e.g. Midnight Velvet Espresso"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                  <div className="relative group">
                    <label className="text-[9px] uppercase tracking-[0.4em] text-white/30 font-label mb-3 block ml-1 group-focus-within:text-[var(--color-secondary)] transition-colors">
                      Price (USD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 text-white/20 font-heading italic text-xl">$</span>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full bg-transparent border-b border-white/10 py-4 pl-6 text-xl text-white outline-none focus:border-[var(--color-secondary)] transition-all font-heading italic"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="relative group">
                    <label className="text-[9px] uppercase tracking-[0.4em] text-white/30 font-label mb-3 block ml-1 group-focus-within:text-[var(--color-secondary)] transition-colors">
                      Genre / Category
                    </label>
                    <select
                      required
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full bg-transparent border-b border-white/10 py-4 px-1 text-xl text-white outline-none focus:border-[var(--color-secondary)] transition-all appearance-none cursor-pointer font-heading italic"
                    >
                      <option value="" className="bg-[#1a120b]">Select Genre</option>
                      {categories.map((cat: any) => (
                        <option key={cat.id} value={cat.id} className="bg-[#1a120b]">{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                  <div className="relative group">
                    <label className="text-[9px] uppercase tracking-[0.4em] text-white/30 font-label mb-3 block ml-1 group-focus-within:text-[var(--color-secondary)] transition-colors">
                      Calories
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.calories}
                      onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                      className="w-full bg-transparent border-b border-white/10 py-4 px-1 text-xl text-white outline-none focus:border-[var(--color-secondary)] transition-all font-heading italic"
                      placeholder="0"
                    />
                  </div>
                  <div className="relative group">
                    <label className="text-[9px] uppercase tracking-[0.4em] text-white/30 font-label mb-3 block ml-1 group-focus-within:text-[var(--color-secondary)] transition-colors">
                      Prep Time (min)
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.preparationTime}
                      onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                      className="w-full bg-transparent border-b border-white/10 py-4 px-1 text-xl text-white outline-none focus:border-[var(--color-secondary)] transition-all font-heading italic"
                      placeholder="5"
                    />
                  </div>
                </div>

                <div className="relative group">
                  <label className="text-[9px] uppercase tracking-[0.4em] text-white/30 font-label mb-3 block ml-1 group-focus-within:text-[var(--color-secondary)] transition-colors">
                    Sensory Description
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-2xl py-5 px-6 text-sm text-white/70 outline-none focus:border-[var(--color-secondary)] focus:bg-white/[0.04] transition-all resize-none placeholder:text-white/10 font-body leading-relaxed shadow-inner"
                    placeholder="Describe the notes, texture, and soul of this creation..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center pt-4">
                <div className="flex flex-wrap gap-8">
                  <label className="flex items-center gap-4 cursor-pointer group">
                    <div className={`w-12 h-6 rounded-full relative transition-all duration-500 shadow-inner ${formData.isAvailable ? 'bg-[var(--color-secondary)]' : 'bg-white/10'}`}>
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={formData.isAvailable}
                        onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                      />
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all duration-500 shadow-md ${formData.isAvailable ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                    <span className="text-[10px] font-label uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">Available</span>
                  </label>

                  <label className="flex items-center gap-4 cursor-pointer group">
                    <div className={`w-12 h-6 rounded-full relative transition-all duration-500 shadow-inner ${formData.isFeatured ? 'bg-orange-500' : 'bg-white/10'}`}>
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      />
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all duration-500 shadow-md ${formData.isFeatured ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                    <span className="text-[10px] font-label uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">Featured</span>
                  </label>
                </div>
                
                <div className="flex justify-end gap-4">
                   <button
                    type="button"
                    onClick={onClose}
                    className="px-8 py-5 bg-white/5 text-white/40 hover:text-white hover:bg-white/10 rounded-2xl font-label text-[10px] font-bold uppercase tracking-[0.2em] transition-all border border-white/5"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none px-10 bg-[var(--color-secondary)] text-[#1a120b] py-5 rounded-2xl font-label text-[10px] font-bold uppercase tracking-[0.3em] hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_15px_35px_rgba(196,168,130,0.25)] disabled:opacity-50"
                  >
                    {isSubmitting ? "Processing..." : initialData ? "Apply Changes" : "Confirm Creation"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
