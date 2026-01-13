"use client";

import { LayoutDashboard, ShoppingCart, Package, Users, Settings, LogOut, FileText, Menu, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from 'next/link';

interface UserProfile {
    full_name: string;
    role: string;
    email: string;
}

export default function Sidebar() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

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
            }
        };
        fetchUser();
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
            router.refresh();
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <>
            {/* Hamburger Menu Button (Mobile Only) */}
            <button
                onClick={toggleMobileMenu}
                className="hamburger-menu"
                aria-label="Toggle menu"
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Overlay */}
            <div
                className={`mobile-overlay ${isMobileMenuOpen ? 'active' : ''}`}
                onClick={toggleMobileMenu}
            />

            {/* Sidebar */}
            <aside className={`w-[280px] h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 z-50 shadow-lg ${isMobileMenuOpen ? 'sidebar-mobile-shown' : 'sidebar-mobile-hidden'
                }`}>
                {/* Brand Header */}
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
                            <span className="font-bold text-lg">M</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-none">
                                MADAR
                            </h1>
                            <p className="text-xs text-gray-400 font-medium mt-1">POS & Inventory</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-3 mt-2">Main Menu</p>
                    <ul className="flex flex-col gap-1">
                        <NavItem href="/" icon={<LayoutDashboard size={20} />} label="Dashboard" active={pathname === '/'} />
                        <NavItem href="/sales" icon={<ShoppingCart size={20} />} label="Point of Sale" active={pathname === '/sales'} />
                        <NavItem href="/inventory" icon={<Package size={20} />} label="Inventory" active={pathname.startsWith('/inventory')} />
                        <NavItem href="/reports" icon={<FileText size={20} />} label="Reports" active={pathname.startsWith('/reports')} />
                    </ul>

                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-8 mb-4 px-3">Management</p>
                    <ul className="flex flex-col gap-1">
                        <NavItem href="/users" icon={<Users size={20} />} label="Team Members" active={pathname.startsWith('/users')} />
                        <NavItem href="/branches" icon={<Package size={20} />} label="Branches" active={pathname.startsWith('/branches')} />
                        <NavItem href="/customers" icon={<Users size={20} />} label="Customers" active={pathname.startsWith('/customers')} />
                        <NavItem href="/settings" icon={<Settings size={20} />} label="Settings" active={pathname.startsWith('/settings')} />
                    </ul>
                </nav>

                {/* User Profile / Logout */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 transition-all text-left group hover:shadow-sm"
                    >
                        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden">
                            {user ? (
                                <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                                    {user.full_name.charAt(0)}
                                </div>
                            ) : (
                                <Users size={18} />
                            )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold text-gray-800 truncate">{user ? user.full_name : 'Loading...'}</p>
                            <p className="text-xs text-gray-500 truncate capitalize">{user ? user.role : '...'}</p>
                        </div>
                        <LogOut size={16} className="text-gray-400 group-hover:text-rose-500 transition-colors" />
                    </button>
                </div>
            </aside>
        </>
    );
}

function NavItem({ icon, label, href, active }: { icon: React.ReactNode; label: string; href: string, active?: boolean }) {
    return (
        <li>
            <Link href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-[0.95rem] group relative overflow-hidden ${active
                    ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`}
            >
                {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-600 rounded-r-full"></div>}
                <span className={active ? 'text-indigo-600' : 'group-hover:text-gray-800'}>{icon}</span>
                <span>{label}</span>
            </Link>
        </li>
    )
}
