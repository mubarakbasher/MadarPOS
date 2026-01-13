"use client";

import React, { useState } from 'react';
import { X, Save, Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AdjustStockModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: {
        id: number;
        name: string;
        currentStock: number;
        branchId: number;
    } | null;
}

export default function AdjustStockModal({ isOpen, onClose, product }: AdjustStockModalProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [physicalQty, setPhysicalQty] = useState('');
    const [reason, setReason] = useState('correction');
    const [notes, setNotes] = useState('');

    if (!isOpen || !product) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/inventory/adjust', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: product.id,
                    branchId: product.branchId,
                    physicalQuantity: parseInt(physicalQty),
                    reason: reason,
                    notes: notes
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Adjustment failed');
            }

            // Success
            onClose();
            router.refresh();

        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-800">Adjust Stock</h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all duration-200"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="mb-6 p-4 bg-indigo-50/50 text-indigo-700 rounded-xl border border-indigo-100 text-sm flex flex-col gap-1">
                        <div className="flex justify-between">
                            <span className="font-semibold text-indigo-900">Product:</span>
                            <span>{product.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold text-indigo-900">Current System Stock:</span>
                            <span className="font-mono font-bold">{product.currentStock}</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div className="flex flex-col gap-1.5 animate-in slide-in-from-bottom-2 duration-300 delay-100">
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">New Physical Quantity</label>
                            <input
                                type="number"
                                required
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none text-gray-700 font-bold text-lg"
                                placeholder="e.g. 18"
                                value={physicalQty}
                                onChange={(e) => setPhysicalQty(e.target.value)}
                            />
                            <p className="text-xs text-gray-400">Enter the actual count found on shelf.</p>
                        </div>

                        <div className="flex flex-col gap-1.5 animate-in slide-in-from-bottom-2 duration-300 delay-200">
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Reason</label>
                            <div className="relative">
                                <select
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none text-gray-700 appearance-none cursor-pointer"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                >
                                    <option value="correction">Correction / Audit</option>
                                    <option value="damage">Damaged Goods</option>
                                    <option value="theft">Theft / Loss</option>
                                    <option value="return">Customer Return (Restock)</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5 animate-in slide-in-from-bottom-2 duration-300 delay-300">
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Notes (Optional)</label>
                            <textarea
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none text-gray-700 resize-none"
                                rows={2}
                                placeholder="Add any additional details..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100 animate-in slide-in-from-bottom-2 duration-300 delay-400">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
                                Confirm Adjustment
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
