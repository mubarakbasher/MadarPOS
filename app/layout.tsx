import "./globals.css";
import AppShell from "../components/layout/AppShell";
import Sidebar from "../components/layout/Sidebar";
import React from 'react';
import PWAHandler from "../components/pwa/PWAHandler";

export const metadata = {
    title: 'MADAR POS - Point of Sale System',
    description: 'Modern Point of Sale System with Offline Capability',
    manifest: '/manifest.json',
    themeColor: '#4F46E5',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'MADAR POS'
    },
    viewport: {
        width: 'device-width',
        initialScale: 1,
        maximumScale: 1,
        userScalable: false,
        viewportFit: 'cover'
    }
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <link rel="manifest" href="/manifest.json" />
                <meta name="theme-color" content="#4F46E5" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content="MADAR POS" />
                <link rel="apple-touch-icon" href="/icon-192.png" />
            </head>
            <body className="flex">
                <PWAHandler />
                <AppShell sidebar={<Sidebar />}>
                    {children}
                </AppShell>
            </body>
        </html>
    );
}
