"use client";

import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, TrendingUp, Search, Filter, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import AdjustStockModal from '@/components/inventory/AdjustStockModal';
import EditProductModal from '@/components/inventory/EditProductModal';
import Header from '@/components/layout/Header';
import { useRouter, useSearchParams } from 'next/navigation';

interface InventoryItem {
    inventory_id: number;
    product: {
        product_id: number;
        name: string;
        sku: string;
        category: {
            category_id: number;
            category_name: string;
        };
        category_id: number;
        cost_price: number | string;
        selling_price: number | string;
    };
    quantity: number;
    reorder_level: number;
    branch_id: number;
}

interface Category {
    category_id: number;
    category_name: string;
}

interface PaginationData {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
}

interface InventoryPageClientProps {
    stockItems: InventoryItem[];
    categories: Category[];
    pagination: PaginationData;
}

export default function InventoryPageClient({ stockItems, categories, pagination }: InventoryPageClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Local state for modals
    const [selectedProduct, setSelectedProduct] = useState<{ id: number, name: string, currentStock: number, branchId: number } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<any>(null);

    // Debounce search input
    const [localSearch, setLocalSearch] = useState(searchParams.get('search') || '');

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localSearch !== (searchParams.get('search') || '')) {
                updateParams('search', localSearch);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [localSearch]);

    // Metrics (Calculated from current page data for now, but ideally should be global stats. 
    // Since we only have page data, these might be slightly misleading if we don't fetch global stats.
    // NOTE: For 'Total Products', we use pagination.totalItems. 
    // For 'Value' and 'Alert', we strictly can only calculate based on loaded items unless we fetch aggregate stats separately.
    // For now, let's just use what we have, but display 'Page Value' or leave 'Total Value' as is (client side calc of page).
    // Better UX: Show 'Total Items' from pagination.
    const totalItems = pagination.totalItems;
    const lowStockItems = stockItems.filter(item => item.quantity <= item.reorder_level).length;
    const getCost = (item: InventoryItem) => Number(item.product.cost_price);
    const totalValue = stockItems.reduce((acc, item) => acc + (getCost(item) * item.quantity), 0);

    const updateParams = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        if (key !== 'page') {
            params.set('page', '1'); // Reset to page 1 on filter change
        }
        router.push(`?${params.toString()}`);
    };

    const handleAdjust = (item: InventoryItem) => {
        setSelectedProduct({
            id: item.product.product_id,
            name: item.product.name,
            currentStock: item.quantity,
            branchId: item.branch_id
        });
        setIsModalOpen(true);
    };

    const handleEdit = (item: InventoryItem) => {
        setProductToEdit({
            id: item.product.product_id,
            name: item.product.name,
            sku: item.product.sku,
            categoryId: item.product.category_id,
            costPrice: Number(item.product.cost_price),
            sellingPrice: Number(item.product.selling_price),
            reorderLevel: item.reorder_level
        });
        setEditModalOpen(true);
    };

    return (
        <div className="h-screen flex flex-col bg-gray-50/30 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50/50 to-transparent -z-10" />

            <Header title="Inventory Management" />

            <div className="flex-1 overflow-auto p-8 pt-6">
                <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">

                    {/* Actions Bar */}
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Overview</h2>
                            <p className="text-sm text-gray-500">Manage your products and stock levels</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    const params = new URLSearchParams(searchParams.toString());
                                    // Remove pagination params for export
                                    params.delete('page');
                                    window.open(`/inventory/export?${params.toString()}`, '_blank');
                                }}
                                className="px-5 py-2.5 bg-white border border-gray-200/60 rounded-xl text-gray-600 font-medium hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm hover:shadow-md flex items-center gap-2">
                                <span className="text-lg">📊</span> Export Report
                            </button>
                            <Link href="/inventory/add" className="group px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center gap-2 transform hover:-translate-y-0.5">
                                <Package size={18} className="group-hover:rotate-12 transition-transform" />
                                Add Product
                            </Link>
                        </div>
                    </div>

                    {/* Metrics (Now using Server Data where possible) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-sm hover:shadow-xl transition-all duration-300 group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3.5 bg-indigo-50 rounded-2xl text-indigo-600 group-hover:scale-110 transition-transform duration-300">
                                    <Package size={24} />
                                </div>
                                <span className="text-xs font-bold uppercase text-indigo-600 bg-indigo-50/50 px-3 py-1 rounded-full tracking-wide">Total</span>
                            </div>
                            <div className="text-4xl font-bold text-gray-900 mb-1 tracking-tight">{totalItems}</div>
                            <div className="text-sm text-gray-500 font-medium">Total products found</div>
                        </div>

                        {/* We display Low Stock for *current page* only for now as we didn't fetch global low stock count */}
                        <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-sm hover:shadow-xl transition-all duration-300 group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3.5 bg-rose-50 rounded-2xl text-rose-600 group-hover:scale-110 transition-transform duration-300">
                                    <AlertTriangle size={24} />
                                </div>
                                <span className="text-xs font-bold uppercase text-rose-600 bg-rose-50/50 px-3 py-1 rounded-full tracking-wide">Alert</span>
                            </div>
                            <div className="text-4xl font-bold text-gray-900 mb-1 tracking-tight">{lowStockItems}</div>
                            <div className="text-sm text-gray-500 font-medium">Low stock on this page</div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-2xl shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all"></div>
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="p-3.5 bg-white/20 backdrop-blur-sm rounded-2xl text-white">
                                    <TrendingUp size={24} />
                                </div>
                                <span className="text-xs font-bold uppercase text-white/90 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full tracking-wide">Value</span>
                            </div>
                            <div className="text-4xl font-bold mb-1 tracking-tight relative z-10">
                                ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className="text-sm text-indigo-100 font-medium relative z-10">Visible inventory value</div>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm mb-6 p-4 flex gap-4 items-center">
                        <div className="relative flex-1 max-w-md group">
                            <Search size={20} className="text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by name, SKU..."
                                value={localSearch}
                                onChange={(e) => setLocalSearch(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 bg-white/80 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none text-sm font-medium"
                            />
                        </div>

                        <div className="flex items-center gap-3 border-l border-gray-200/50 pl-4">
                            <div className="flex items-center gap-2">
                                <Filter size={18} className="text-gray-500" />
                                <span className="text-sm font-semibold text-gray-600">Filter:</span>
                            </div>
                            <select
                                value={searchParams.get('category') || 'all'}
                                onChange={(e) => updateParams('category', e.target.value === 'all' ? null : e.target.value)}
                                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 font-medium focus:ring-2 focus:ring-indigo-100 outline-none cursor-pointer hover:border-indigo-300 transition-colors"
                            >
                                <option value="all">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg shadow-gray-200/50 overflow-hidden flex flex-col min-h-[500px]">
                        <div className="overflow-auto flex-1">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50/90 backdrop-blur-sm border-b border-gray-100">
                                    <tr className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                        <th className="px-6 py-5">Product Details</th>
                                        <th className="px-6 py-5">SKU</th>
                                        <th className="px-6 py-5">Category</th>
                                        <th className="px-6 py-5">Stock Level</th>
                                        <th className="px-6 py-5">Status</th>
                                        <th className="px-6 py-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-gray-100">
                                    {stockItems.map((item) => (
                                        <tr key={item.inventory_id} className="hover:bg-indigo-50/40 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-lg">
                                                        {item.product.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 text-base">{item.product.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-gray-500 text-xs bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200">
                                                    {item.product.sku}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-gray-600 font-medium">
                                                    {item.product.category.category_name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-bold text-lg ${item.quantity <= item.reorder_level ? 'text-rose-600' : 'text-gray-700'}`}>
                                                        {item.quantity}
                                                    </span>
                                                    <span className="text-xs text-gray-400 font-medium">units</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.quantity <= item.reorder_level ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100">
                                                        <AlertTriangle size={14} className="fill-rose-600/20" /> Low Stock
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600 border border-green-100">
                                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> In Stock
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleAdjust(item)}
                                                        className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50 hover:border-gray-300 transition-all"
                                                    >
                                                        Adjust
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="px-4 py-2 rounded-lg bg-gray-900 text-white text-xs font-bold hover:bg-black hover:shadow-lg hover:-translate-y-0.5 transition-all"
                                                    >
                                                        Edit
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {stockItems.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                                                <div className="flex flex-col items-center justify-center gap-3">
                                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                                                        <Package size={32} className="text-gray-300" />
                                                    </div>
                                                    <p className="font-medium text-lg text-gray-600">No products found</p>
                                                    <p className="text-sm text-gray-400">Try adjusting your filters</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Footer */}
                        <div className="bg-white/50 backdrop-blur-sm border-t border-gray-100 p-4 flex justify-between items-center">
                            <span className="text-sm text-gray-500 font-medium">
                                Showing page {pagination.currentPage} of {pagination.totalPages}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    disabled={pagination.currentPage <= 1}
                                    onClick={() => updateParams('page', String(pagination.currentPage - 1))}
                                    className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-all"
                                >
                                    <ChevronLeft size={16} /> Previous
                                </button>
                                <button
                                    disabled={pagination.currentPage >= pagination.totalPages}
                                    onClick={() => updateParams('page', String(pagination.currentPage + 1))}
                                    className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-all"
                                >
                                    Next <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AdjustStockModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={selectedProduct}
            />

            <EditProductModal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                product={productToEdit}
                onSuccess={() => {
                    router.refresh();
                }}
            />
        </div>
    );
}
