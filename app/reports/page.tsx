
"use client";

import React, { useState, useEffect } from 'react';
import { FileText, Calendar, DollarSign, User as UserIcon, ChevronDown, ChevronUp, Search, Eye, ShoppingBag, Users, Package, Download } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';

interface SaleItem {
    sale_item_id: number;
    product: { name: string };
    quantity: number;
    unit_price: number;
    subtotal: number;
}

interface Sale {
    sale_id: number;
    invoice_number: string | null;
    sale_date: string;
    total_amount: number;
    payment_method: string;
    user: { full_name: string };
    customer: { full_name: string } | null;
    sale_items: SaleItem[];
}

interface Cashier {
    user_id: number;
    full_name: string;
}

export default function ReportsPage() {
    const [sales, setSales] = useState<Sale[]>([]);
    const [cashiers, setCashiers] = useState<Cashier[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [expandedSale, setExpandedSale] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCashierId, setSelectedCashierId] = useState<string>('all');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch sales with cashier filter if selected
                const salesUrl = selectedCashierId === 'all'
                    ? '/api/reports/sales'
                    : `/api/reports/sales?userId=${selectedCashierId}`;

                const res = await fetch(salesUrl);
                if (res.ok) {
                    const data = await res.json();
                    setSales(data);
                }

                // Fetch stats
                const statsRes = await fetch('/api/dashboard/stats');
                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setStats(statsData);
                }

                // Fetch cashiers list
                const cashiersRes = await fetch('/api/users');
                if (cashiersRes.ok) {
                    const cashiersData = await cashiersRes.json();
                    setCashiers(cashiersData);
                }
            } catch (error) {
                console.error("Failed to load data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [selectedCashierId]);

    const toggleExpand = (id: number) => {
        setExpandedSale(expandedSale === id ? null : id);
    };

    const filteredSales = sales.filter(s =>
        (s.invoice_number && s.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
        s.user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.customer && s.customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const totalRevenue = filteredSales.reduce((acc, curr) => acc + curr.total_amount, 0);
    const selectedCashier = cashiers.find(c => c.user_id === Number(selectedCashierId));

    const handleExport = () => {
        const params = new URLSearchParams();
        if (selectedCashierId !== 'all') {
            params.set('userId', selectedCashierId);
        }
        window.open(`/reports/export?${params.toString()}`, '_blank');
    };

    return (
        <div style={{ padding: '2rem' }}>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="h3 mb-1">Sales Reports</h1>
                    <p className="text-muted">View transaction history and revenue</p>
                </div>
                <button
                    onClick={handleExport}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Download size={18} />
                    Export Report
                </button>
            </div>

            {/* Cashier Filter */}
            <div className="card mb-6" style={{ padding: '1.5rem' }}>
                <div className="flex items-center gap-4">
                    <label className="text-sm font-bold">Filter by Cashier:</label>
                    <select
                        value={selectedCashierId}
                        onChange={(e) => setSelectedCashierId(e.target.value)}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border)',
                            fontSize: '0.9rem',
                            minWidth: '200px'
                        }}
                    >
                        <option value="all">All Cashiers</option>
                        {cashiers.map(cashier => (
                            <option key={cashier.user_id} value={cashier.user_id}>
                                {cashier.full_name}
                            </option>
                        ))}
                    </select>
                    {selectedCashier && (
                        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                            <div className="text-muted text-sm">Total Sales by {selectedCashier.full_name}</div>
                            <div className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
                                ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Metrics */}
            {stats && (
                <div className="grid gap-6 mb-8" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                    <StatCard
                        title="Total Revenue"
                        value={`$${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                        trend={(stats.monthRevenue && stats.totalRevenue) ? `+${((stats.monthRevenue / stats.totalRevenue) * 100).toFixed(1)}%` : "N/A"}
                        trendUp={true}
                        icon={<DollarSign size={24} />}
                    />
                    <StatCard
                        title="Total Transactions"
                        value={stats.totalSales.toString()}
                        trend={(stats.todaySales && stats.totalSales) ? `+${((stats.todaySales / stats.totalSales) * 100).toFixed(1)}%` : "N/A"}
                        trendUp={true}
                        icon={<FileText size={24} />}
                    />
                    <StatCard
                        title="Avg. Transaction"
                        value={stats.totalSales > 0 ? `$${(stats.totalRevenue / stats.totalSales).toFixed(2)}` : "$0.00"}
                        trend="Per Order"
                        trendUp={true}
                        icon={<ShoppingBag size={24} />}
                    />
                    <StatCard
                        title="Active Cashiers"
                        value={cashiers.length.toString()}
                        trend="Staff Members"
                        trendUp={true}
                        icon={<Users size={24} />}
                    />
                </div>
            )}

            {/* Table */}
            <div className="card">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-bold">Recent Transactions</h2>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <Search size={16} className="text-muted" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Search invoice, cashier, or customer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.5rem 1rem 0.5rem 2.5rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border)',
                                fontSize: '0.9rem'
                            }}
                        />
                    </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'var(--background)', color: 'var(--foreground-secondary)', fontSize: '0.85rem', textAlign: 'left' }}>
                        <tr>
                            <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Date</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Invoice #</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Customer</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Cashier</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Payment</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Total</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Details</th>
                        </tr>
                    </thead>
                    <tbody style={{ fontSize: '0.95rem' }}>
                        {loading ? (
                            <tr><td colSpan={7} className="p-4 text-center">Loading sales history...</td></tr>
                        ) : filteredSales.length === 0 ? (
                            <tr><td colSpan={7} className="p-4 text-center text-muted">No transactions found</td></tr>
                        ) : (
                            filteredSales.map((sale) => (
                                <React.Fragment key={sale.sale_id}>
                                    <tr style={{ borderBottom: '1px solid var(--border)', background: expandedSale === sale.sale_id ? 'var(--surface-hover)' : 'transparent' }}>
                                        <td style={{ padding: '1rem', color: 'var(--muted)' }}>
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} />
                                                {new Date(sale.sale_date).toLocaleString()}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem', fontWeight: 500 }}>{sale.invoice_number || 'N/A'}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <div className="flex items-center gap-2">
                                                <UserIcon size={14} className="text-muted" />
                                                {sale.customer ? sale.customer.full_name : 'Walk-in'}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div className="flex items-center gap-2">
                                                <UserIcon size={14} className="text-muted" />
                                                {sale.user.full_name}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '0.85rem' }}>
                                                {sale.payment_method}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                                            ${sale.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <button
                                                onClick={() => toggleExpand(sale.sale_id)}
                                                className="btn btn-icon btn-sm"
                                            >
                                                {expandedSale === sale.sale_id ? <ChevronUp size={18} /> : <Eye size={18} />}
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedSale === sale.sale_id && (
                                        <tr style={{ background: 'var(--surface-hover)' }}>
                                            <td colSpan={7} style={{ padding: '0 1rem 1rem 1rem' }}>
                                                <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                                                    <h4 className="text-sm font-bold mb-2">Order Summary</h4>
                                                    <table style={{ width: '100%', fontSize: '0.9rem' }}>
                                                        <thead>
                                                            <tr style={{ color: 'var(--muted)' }}>
                                                                <th style={{ textAlign: 'left', paddingBottom: '0.5rem' }}>Product</th>
                                                                <th style={{ textAlign: 'right', paddingBottom: '0.5rem' }}>Qty</th>
                                                                <th style={{ textAlign: 'right', paddingBottom: '0.5rem' }}>Price</th>
                                                                <th style={{ textAlign: 'right', paddingBottom: '0.5rem' }}>Subtotal</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {sale.sale_items.map(item => (
                                                                <tr key={item.sale_item_id}>
                                                                    <td style={{ padding: '0.25rem 0' }}>{item.product.name}</td>
                                                                    <td style={{ textAlign: 'right', padding: '0.25rem 0' }}>{item.quantity}</td>
                                                                    <td style={{ textAlign: 'right', padding: '0.25rem 0' }}>${item.unit_price.toFixed(2)}</td>
                                                                    <td style={{ textAlign: 'right', padding: '0.25rem 0', fontWeight: 500 }}>${item.subtotal.toFixed(2)}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
