
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Package, Save, Trash2, AlertCircle, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Branch {
    branch_id: number;
    branch_name: string;
}

interface Product {
    product_id: number;
    name: string;
    sku: string;
}

interface TransferItem {
    productId: number;
    productName: string;
    quantity: number;
    maxStock: number;
}

export default function TransferPage() {
    const router = useRouter();
    const [branches, setBranches] = useState<Branch[]>([]);
    const [products, setProducts] = useState<Product[]>([]);

    // Form State
    const [fromBranch, setFromBranch] = useState<string>('');
    const [toBranch, setToBranch] = useState<string>('');
    const [items, setItems] = useState<TransferItem[]>([]);

    // Item Input State
    const [selectedProduct, setSelectedProduct] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(1);
    const [currentStock, setCurrentStock] = useState<number | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchBranches();
        fetchProducts();
    }, []);

    // Fetch stock whenever Product or Source Branch changes
    useEffect(() => {
        if (selectedProduct && fromBranch) {
            fetchStock(selectedProduct, fromBranch);
        } else {
            setCurrentStock(null);
        }
    }, [selectedProduct, fromBranch]);

    const fetchBranches = async () => {
        const res = await fetch('/api/branches');
        if (res.ok) setBranches(await res.json());
    };

    const fetchProducts = async () => {
        // Fetching all products for dropdown (limit 20-50 for now)
        const res = await fetch('/api/products?search=');
        if (res.ok) setProducts(await res.json());
    };

    const fetchStock = async (pId: string, bId: string) => {
        const res = await fetch(`/api/inventory?productId=${pId}&branchId=${bId}`);
        if (res.ok) {
            const data = await res.json();
            // If data is { quantity: 0 }, data.quantity is 0
            setCurrentStock(data.quantity !== undefined ? data.quantity : 0);
        } else {
            setCurrentStock(0);
        }
    };

    const addItem = () => {
        if (!selectedProduct || !quantity || !currentStock) return;
        if (quantity <= 0) return;
        if (quantity > currentStock) {
            alert(`Insufficient stock. Max available: ${currentStock}`);
            return;
        }

        // Check if item already in list
        if (items.find(i => i.productId === parseInt(selectedProduct))) {
            alert('Item already added to transfer list');
            return;
        }

        const prod = products.find(p => p.product_id === parseInt(selectedProduct));
        if (!prod) return;

        setItems([...items, {
            productId: prod.product_id,
            productName: prod.name,
            quantity: quantity,
            maxStock: currentStock
        }]);

        // Reset input
        setSelectedProduct('');
        setQuantity(1);
        setCurrentStock(null);
    };

    const removeItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handleSubmit = async () => {
        if (!fromBranch || !toBranch) {
            setError('Please select both source and destination branches');
            return;
        }
        if (fromBranch === toBranch) {
            setError('Source and destination branches must be different');
            return;
        }
        if (items.length === 0) {
            setError('Please add at least one item to transfer');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const payload = {
                fromBranchId: parseInt(fromBranch),
                toBranchId: parseInt(toBranch),
                items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
                userId: 1 // Hardcoded for now, should come from auth context
            };

            const res = await fetch('/api/inventory/transfer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setSuccess('Transfer completed successfully!');
                setTimeout(() => {
                    router.push('/inventory');
                }, 2000);
            } else {
                const data = await res.json();
                setError(data.error || 'Transfer failed');
            }
        } catch (e) {
            console.error(e);
            setError('An error occurred during transfer');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            {/* Header */}
            <div className="mb-6">
                <Link href="/inventory" className="text-muted hover:text-primary flex items-center gap-2 mb-2 text-sm transition-colors">
                    <ArrowLeft size={16} /> Back to Inventory
                </Link>
                <h1 className="h3">Inter-Branch Transfer</h1>
                <p className="text-muted">Move stock between branches</p>
            </div>

            <div className="grid gap-6">
                {/* Configuration Card */}
                <div className="card">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Package size={20} className="text-primary" />
                        Transfer Details
                    </h2>

                    <div className="grid grid-cols-2 gap-8 items-center">
                        <div className="grid gap-2">
                            <label className="text-sm font-bold text-muted">From Branch (Source)</label>
                            <select
                                className="input" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                                value={fromBranch}
                                onChange={(e) => {
                                    setFromBranch(e.target.value);
                                    setItems([]); // Clear items if source changes
                                }}
                            >
                                <option value="">Select Source Branch</option>
                                {branches.map(b => (
                                    <option key={b.branch_id} value={b.branch_id}>{b.branch_name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-center">
                            <ArrowRight className="text-muted" size={24} />
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-bold text-muted">To Branch (Destination)</label>
                            <select
                                className="input" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
                                value={toBranch}
                                onChange={(e) => setToBranch(e.target.value)}
                            >
                                <option value="">Select Destination Branch</option>
                                {branches.map(b => (
                                    <option key={b.branch_id} value={b.branch_id} disabled={b.branch_id.toString() === fromBranch}>{b.branch_name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Items Builder Card */}
                {fromBranch && (
                    <div className="card">
                        <h2 className="text-lg font-bold mb-4">Add Items</h2>
                        <div className="flex gap-4 items-end mb-6 p-4 rounded-lg" style={{ background: 'var(--surface-hover)' }}>
                            <div className="flex-1 grid gap-2">
                                <label className="text-sm font-bold text-muted">Product</label>
                                <select
                                    className="input" style={{ padding: '0.6rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                                    value={selectedProduct}
                                    onChange={(e) => setSelectedProduct(e.target.value)}
                                >
                                    <option value="">Select Product</option>
                                    {products.map(p => (
                                        <option key={p.product_id} value={p.product_id}>{p.name} ({p.sku})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="w-32 grid gap-2">
                                <label className="text-sm font-bold text-muted">Quantity</label>
                                <input
                                    type="number"
                                    className="input" style={{ padding: '0.6rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', width: '100%' }}
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                                />
                            </div>

                            <div className="w-32 grid gap-2">
                                <label className="text-sm font-bold text-muted">Stock</label>
                                <div className="text-sm font-medium" style={{ padding: '0.6rem', color: currentStock === 0 ? 'var(--danger)' : 'var(--text-main)' }}>
                                    {currentStock !== null ? `${currentStock} Avail.` : '-'}
                                </div>
                            </div>

                            <button
                                className="btn btn-secondary"
                                onClick={addItem}
                                disabled={!selectedProduct || !currentStock || quantity <= 0 || quantity > currentStock}
                            >
                                <Plus size={18} /> Add
                            </button>
                        </div>

                        {/* Items List */}
                        {items.length > 0 ? (
                            <table style={{ width: '100%' }}>
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: 'left', padding: '0.5rem', fontSize: '0.85rem' }}>Product</th>
                                        <th style={{ textAlign: 'left', padding: '0.5rem', fontSize: '0.85rem' }}>Quantity</th>
                                        <th style={{ textAlign: 'right', padding: '0.5rem', fontSize: '0.85rem' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, index) => (
                                        <tr key={index} style={{ borderTop: '1px solid var(--border)' }}>
                                            <td style={{ padding: '0.75rem' }}>{item.productName}</td>
                                            <td style={{ padding: '0.75rem' }}>{item.quantity}</td>
                                            <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                                                <button onClick={() => removeItem(index)} className="text-danger hover:text-danger-dark">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center text-muted text-sm py-4">No items added yet</div>
                        )}
                    </div>
                )}

                {error && (
                    <div className="flex items-center gap-2 p-4 text-danger bg-red-50 rounded-lg border border-red-100" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="flex items-center gap-2 p-4 text-success bg-green-50 rounded-lg border border-green-100" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                        <AlertCircle size={20} />
                        {success}
                    </div>
                )}

                <div className="flex justify-end gap-3">
                    <Link href="/inventory" className="btn btn-ghost">Cancel</Link>
                    <button
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={loading || items.length === 0}
                    >
                        {loading ? 'Processing...' : <><Save size={18} /> Confirm Transfer</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
