
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string;
    trend?: string;
    trendUp?: boolean;
    icon: React.ReactNode;
}

export default function StatCard({ title, value, trend, trendUp, icon }: StatCardProps) {
    return (
        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden relative">
            <div className="flex justify-between items-start mb-4 relative z-10 p-6 pb-0">
                <div className="p-3.5 bg-indigo-50/50 rounded-2xl text-indigo-600 group-hover:scale-110 transition-transform duration-300">
                    {React.cloneElement(icon as React.ReactElement, { size: 24 })}
                </div>
                {trend && (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${trendUp ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'}`}>
                        {trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {trend}
                    </span>
                )}
            </div>

            <div className="p-6 pt-2 relative z-10">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">{title}</h3>
                <div className="text-3xl font-bold text-gray-900 tracking-tight">{value}</div>
            </div>

            {/* Decorative Background Blur */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors"></div>
        </div>
    );
}
