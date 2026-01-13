
import React, { useState, useEffect } from 'react';
import { X, Save, Loader, Trash } from 'lucide-react';

interface EditProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: {
        id: number;
        name: string;
        sku: string;
        categoryId: number;
        costPrice: number;
        sellingPrice: number;
        reorderLevel: number;
    } | null;
    onSuccess: () => void;
}

interface BranchInventory {
    branchId: number;
    branchName: string;
    location: string | null;
    quantity: number;
    reorderLevel: number;
    isLowStock: boolean;
}

export default function EditProductModal({ isOpen, onClose, product, onSuccess }: EditProductModalProps) {
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [categories, setCategories] = useState<{ category_id: number, category_name: string }[]>([]);
    const [branchInventory, setBranchInventory] = useState<BranchInventory[]>([]);
    const [loadingInventory, setLoadingInventory] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        categoryId: '',
        costPrice: '',
        sellingPrice: '',
        reorderLevel: ''
    });

    useEffect(() => {
        if (isOpen) {
            // Fetch categories
            fetch('/api/categories')
                .then(res => res.json())
                .then(data => setCategories(data))
                .catch(err => console.error("Failed to load categories", err));

            // Fetch branch inventory
            if (product) {
                setLoadingInventory(true);
                fetch(`/api/products/${product.id}/inventory`)
                    .then(res => res.json())
                    .then(data => setBranchInventory(data))
                    .catch(err => console.error("Failed to load branch inventory", err))
                    .finally(() => setLoadingInventory(false));
            }

            // Populate form
            if (product) {
                setFormData({
                    name: product.name,
                    sku: product.sku,
                    categoryId: String(product.categoryId),
                    costPrice: String(product.costPrice),
                    sellingPrice: String(product.sellingPrice),
                    reorderLevel: String(product.reorderLevel)
                });
            }
        }
    }, [isOpen, product]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!product) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/products/${product.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error('Failed to update product');

            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            alert('Failed to update product');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!product || !confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

        setDeleting(true);
        try {
            const res = await fetch(`/api/products/${product.id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to delete product');
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            alert(error.message);
        } finally {
            setDeleting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden animate-in zoom-in-95 duration-200"
                style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
            >
                {/* Header */}
                <div className="relative px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-indigo-50/30 to-white">
                    <div>
                        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                            Edit Product
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">Update product details and inventory settings</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all duration-200"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">

                    {/* Name Field */}
                    <div className="group">
                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 block group-focus-within:text-indigo-600 transition-colors">
                            Product Name
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Premium Wireless Mouse"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 outline-none text-gray-700 font-medium placeholder:text-gray-400"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    {/* Dual Columns: SKU & Category */}
                    <div className="grid grid-cols-2 gap-5">
                        <div className="group">
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 block group-focus-within:text-indigo-600 transition-colors">
                                SKU / Code
                            </label>
                            <input
                                type="text"
                                placeholder="PROD-001"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 outline-none text-gray-700 font-mono text-sm"
                                value={formData.sku}
                                onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                required
                            />
                        </div>
                        <div className="group">
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 block group-focus-within:text-indigo-600 transition-colors">
                                Category
                            </label>
                            <div className="relative">
                                <select
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 outline-none text-gray-700 appearance-none cursor-pointer"
                                    value={formData.categoryId}
                                    onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(c => (
                                        <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Financials Row */}
                    <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100 grid grid-cols-2 gap-5">
                        <div className="group">
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 block group-focus-within:text-green-600 transition-colors">
                                Cost Price
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full pl-7 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-100 focus:border-green-500 transition-all outline-none text-gray-700 font-medium"
                                    value={formData.costPrice}
                                    onChange={e => setFormData({ ...formData, costPrice: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="group">
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 block group-focus-within:text-indigo-600 transition-colors">
                                Selling Price
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full pl-7 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none text-gray-900 font-bold"
                                    value={formData.sellingPrice}
                                    onChange={e => setFormData({ ...formData, sellingPrice: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Branch Inventory Section */}
                    <div className="group">
                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2.5 block">
                            Stock by Branch
                        </label>
                        {loadingInventory ? (
                            <div className="flex items-center justify-center p-8 bg-gray-50/50 rounded-xl">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-sm font-medium">Loading branch inventory...</span>
                                </div>
                            </div>
                        ) : branchInventory.length > 0 ? (
                            <div className="space-y-2">
                                {branchInventory.map((branch) => (
                                    <div
                                        key={branch.branchId}
                                        className="p-4 bg-gradient-to-r from-gray-50 to-gray-50/30 rounded-xl border border-gray-100 hover:border-indigo-200 transition-all duration-200 hover:shadow-sm"
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="flex-1">
                                                <div className="font-bold text-gray-900 text-sm mb-0.5">
                                                    {branch.branchName}
                                                </div>
                                                {branch.location && (
                                                    <div className="text-xs text-gray-500">
                                                        📍 {branch.location}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <div className={`text-2xl font-bold ${branch.isLowStock ? 'text-rose-600' : 'text-gray-900'}`}>
                                                        {branch.quantity}
                                                    </div>
                                                    <div className="text-xs text-gray-400 font-medium">units</div>
                                                </div>
                                                {branch.isLowStock && (
                                                    <div className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200">
                                                        <span className="text-xs font-bold text-rose-600">Low</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-6 bg-gray-50/50 rounded-xl border border-gray-100 text-center">
                                <div className="text-sm text-gray-500">No inventory data available for this product</div>
                            </div>
                        )}
                    </div>

                    {/* Inventory Settings */}
                    <div className="group">
                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 block group-focus-within:text-orange-500 transition-colors">
                            Low Stock Alert Level
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="number"
                                className="w-24 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-100 focus:border-orange-500 transition-all outline-none text-gray-700 font-medium"
                                value={formData.reorderLevel}
                                onChange={e => setFormData({ ...formData, reorderLevel: e.target.value })}
                                required
                            />
                            <span className="text-xs text-gray-400">
                                System will alert when stock falls below this quantity.
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={loading || deleting}
                            className="px-4 py-2.5 rounded-xl border border-red-100 text-red-600 font-medium hover:bg-red-50 transition-all duration-200 flex items-center gap-2"
                        >
                            {deleting ? <Loader size={18} className="animate-spin" /> : <Trash size={18} />}
                            Delete Product
                        </button>

                        <div className="flex gap-3">
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
                                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                            >
                                {loading ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
