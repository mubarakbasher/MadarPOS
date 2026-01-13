"use client";

import { Bell, Search, Loader } from "lucide-react";
import React, { useEffect, useState } from 'react';

interface UserProfile {
    full_name: string;
    role: string;
    email: string;
}

export default function Header({ title }: { title: string }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                }
            } catch (error) {
                console.error("Failed to fetch user info", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    return (
        <header className="flex items-center justify-between h-20 px-8 mb-4">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    {loading ? '...' : `Welcome back, ${user ? user.full_name : 'Guest'}`}
                </div>
            </div>

            <div className="flex items-center gap-5">
                <div className="relative group">
                    <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Quick search..."
                        className="w-[320px] pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all outline-none font-medium text-sm shadow-sm"
                    />
                </div>

                <div className="h-8 w-[1px] bg-gray-200"></div>

                <button className="p-2.5 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50 transition-all shadow-sm relative">
                    <Bell size={20} />
                    <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 border-2 border-white rounded-full"></span>
                </button>

                <div className="flex items-center gap-3 pl-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-200">
                        {loading ? '...' : user ? user.full_name.charAt(0).toUpperCase() : '?'}
                    </div>
                    {loading ? (
                        <div className="h-8 w-24 bg-gray-100 rounded animate-pulse"></div>
                    ) : (
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-800 leading-tight">{user ? user.full_name : 'Guest'}</span>
                            <span className="text-xs text-gray-500 font-medium">{user ? user.role : 'Visitor'}</span>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
