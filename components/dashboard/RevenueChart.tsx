
"use client";

import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader, Calendar } from 'lucide-react';

export default function RevenueChart() {
    const [data, setData] = useState<{ name: string; revenue: number }[]>([]);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState(7); // Default 7 days

    useEffect(() => {
        const fetchRevenue = async (days: number) => {
            setLoading(true);
            try {
                const res = await fetch(`/api/dashboard/revenue?days=${days}`);
                if (res.ok) {
                    const chartData = await res.json();
                    setData(chartData);
                }
            } catch (error) {
                console.error("Failed to fetch revenue", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRevenue(range);
    }, [range]);

    return (
        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Revenue Overview</h3>
                    <p className="text-sm text-gray-500">Income trends over time</p>
                </div>

                <div className="relative">
                    <select
                        value={range}
                        onChange={(e) => setRange(parseInt(e.target.value))}
                        className="appearance-none pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 font-medium focus:ring-2 focus:ring-indigo-100 outline-none cursor-pointer hover:border-gray-300 transition-colors shadow-sm"
                    >
                        <option value={7}>Last 7 Days</option>
                        <option value={14}>Last 14 Days</option>
                        <option value={30}>Last 30 Days</option>
                    </select>
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
            </div>

            <div className="flex-1 w-full min-h-[300px]">
                {loading ? (
                    <div className="h-full flex items-center justify-center text-gray-400 gap-2">
                        <Loader className="animate-spin" size={20} /> Loading Chart...
                    </div>
                ) : data.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                        No sales data for this period
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748B', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748B', fontSize: 12 }}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#FFFFFF',
                                    border: '1px solid #E2E8F0',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                                itemStyle={{ color: '#4F46E5', fontWeight: 600 }}
                                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                            />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#6366F1"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorRevenue)"
                                activeDot={{ r: 6, strokeWidth: 0, fill: '#4F46E5' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
