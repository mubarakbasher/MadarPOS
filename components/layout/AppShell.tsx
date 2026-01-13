"use client";

import React from 'react';
import { usePathname } from 'next/navigation';

export default function AppShell({ children, sidebar }: { children: React.ReactNode, sidebar: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = pathname === '/login' || pathname === '/signup';

    if (isAuthPage) {
        return (
            <main className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
                {children}
            </main>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            {sidebar}
            <main className="flex-1 ml-[280px] w-[calc(100%-280px)] min-h-screen transition-all duration-300">
                {children}
            </main>
        </div>
    );
}
