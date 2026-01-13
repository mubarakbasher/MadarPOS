
"use client";

import Header from "@/components/layout/Header";
import StatCard from "@/components/ui/StatCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import { DollarSign, Package, ShoppingBag, Loader, ArrowRight, Clock, TrendingUp } from "lucide-react";
import React, { useEffect, useState } from 'react';
import Link from "next/link";

interface DashboardStats {
    totalRevenue: number;
    todayRevenue: number;
    monthRevenue: number;
    totalSales: number;
    todaySales: number;
    lowStockCount: number;
    recentSales: {
        id: number;
        invoice: string;
        user: string;
        total: number;
        date: string;
    }[];
}

export default function Home() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch('/api/dashboard/stats');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Failed to load dashboard", error);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-gray-50 text-gray-500 gap-3">
            <Loader className="animate-spin text-indigo-600" size={24} />
            <span className="font-medium">Loading Dashboard...</span>
        </div>
    );

    if (!stats) return (
        <div className="h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Failed to load data</h3>
                <button onClick={() => window.location.reload()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Retry</button>
            </div>
        </div>
    );

    return (
        <div className="h-screen flex flex-col bg-gray-50/30 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50/50 to-transparent -z-10" />

            <Header title="Dashboard" />

            <div className="flex-1 overflow-auto p-8 pt-6">
                <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500">

                    {/* Today's Overview */}
                    <div className="mb-8">
                        <div className="flex items-end justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Today's Performance</h2>
                                <p className="text-sm text-gray-500">Real-time overview of your business day.</p>
                            </div>
                            <div className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-500 flex items-center gap-2 shadow-sm">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Live
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-6">
                            <StatCard
                                title="Today's Revenue"
                                value={`$${stats.todayRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                                trend="Daily"
                                trendUp={true}
                                icon={<DollarSign />}
                            />
                            <StatCard
                                title="Today's Sales"
                                value={stats.todaySales.toString()}
                                trend="Orders"
                                trendUp={true}
                                icon={<ShoppingBag />}
                            />
                            <StatCard
                                title="Low Stock Alerts"
                                value={`${stats.lowStockCount}`}
                                trend={stats.lowStockCount > 0 ? "Action Required" : "Healthy"}
                                trendUp={stats.lowStockCount === 0}
                                icon={<Package />}
                            />
                            <StatCard
                                title="Month Revenue"
                                value={`$${stats.monthRevenue.toLocaleString(undefined, { minimumFractionDigits: 0 })}`}
                                trend="This Month"
                                trendUp={true}
                                icon={<TrendingUp />}
                            />
                        </div>
                    </div>

                    {/* Charts & Recent Activity Section */}
                    <div className="grid grid-cols-3 gap-8">

                        {/* Main Chart Area */}
                        <div className="col-span-2 h-[500px]">
                            <RevenueChart />
                        </div>

                        {/* Recent Sales List */}
                        <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-white/60 shadow-sm h-full flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-800">Recent Sales</h3>
                                <Link href="/sales" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1">
                                    View All <ArrowRight size={14} />
                                </Link>
                            </div>

                            <div className="flex flex-col gap-3 flex-1 overflow-auto pr-1 custom-scrollbar">
                                {stats.recentSales.length === 0 && (
                                    <div className="flex flex-col items-center justify-center flex-1 text-gray-400 opacity-60">
                                        <ShoppingBag size={48} className="mb-2" />
                                        <p className="text-sm">No recent sales</p>
                                    </div>
                                )}
                                {stats.recentSales.map((sale) => (
                                    <div key={sale.id} className="flex items-center justify-between p-3 bg-white/50 border border-gray-100 hover:border-indigo-100 hover:bg-white rounded-xl transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <ShoppingBag size={18} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-gray-800">{sale.invoice || `#${sale.id}`}</p>
                                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                                    <Clock size={10} />
                                                    {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="font-bold text-sm text-gray-900 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100 group-hover:border-indigo-100 transition-colors">
                                            +${sale.total.toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
