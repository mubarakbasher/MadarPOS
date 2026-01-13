
"use client";

import Header from "../../components/layout/Header";
import ReceiptModal from "../../components/sales/ReceiptModal";
import { Search, Plus, Minus, CreditCard, Banknote, Users, Trash2, ShoppingCart, Loader, X, User as UserIcon, Tag, Percent } from "lucide-react";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Product {
    product_id: number;
    name: string;
    sku: string;
    selling_price: number;
    cost_price: number; // needed? maybe not for POS
    inventory: {
        quantity: number;
    }[];
    category: {
        category_name: string;
    };
}

interface CartItem {
    id: number; // product_id
    name: string;
    price: number;
    quantity: number;
    maxStock: number;
    discount: number; // Item level discount value
    discountType: 'fixed' | 'percent';
}

interface Customer {
    customer_id: number;
    full_name: string;
    phone: string;
    email: string;
    balance: number;
}

export default function SalesPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    // Customer State
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [customerSearch, setCustomerSearch] = useState('');
    const [customerResults, setCustomerResults] = useState<Customer[]>([]);
    const [loadingCustomers, setLoadingCustomers] = useState(false);

    // Receipt State
    const [showReceipt, setShowReceipt] = useState(false);
    const [recentSale, setRecentSale] = useState<any>(null);



    // Discount State
    const [globalDiscount, setGlobalDiscount] = useState<{ value: number, type: 'fixed' | 'percent' }>({ value: 0, type: 'fixed' });
    const [showGlobalDiscountInput, setShowGlobalDiscountInput] = useState(false);

    // Item Discount State (Editing)
    const [editingItemDiscount, setEditingItemDiscount] = useState<number | null>(null); // cart item id
    const [tempItemDiscount, setTempItemDiscount] = useState<{ value: number, type: 'fixed' | 'percent' }>({ value: 0, type: 'fixed' });

    // Search Customers Effect
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (showCustomerModal) {
                setLoadingCustomers(true);
                try {
                    const res = await fetch(`/api/customers?search=${encodeURIComponent(customerSearch)}`);
                    if (res.ok) {
                        const data = await res.json();
                        setCustomerResults(data);
                    }
                } catch (e) {
                    console.error("Failed to search customers", e);
                } finally {
                    setLoadingCustomers(false);
                }
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [customerSearch, showCustomerModal]);

    // Fetch products
    useEffect(() => {
        async function fetchProducts() {
            try {
                // Determine API endpoint - for now using a raw fetch to /api/products if we had GET, 
                // but we didn't make one yet. We can use the inventory/page method or create a new one.
                // Or I can execute a server action?
                // Let's assume for this specific step, I will create a simple GET route or mock it?
                // Actually, I can use the existing server action pattern if I convert this to use a server component wrapper,
                // but to keep it simple and dynamic, I'll fetch from a new endpoint I'll create quickly or just inline.
                // Wait, I didn't create GET /api/products yet. I only have POST.
                // I will quickly create GET /api/products first? No, I'll fetch from the inventory page API? No.
                // I will assume I have a GET /api/pos/products endpoint. I will create it in a second.

                const res = await fetch('/api/pos/products');
                if (res.ok) {
                    const data = await res.json();
                    setProducts(data);
                }
            } catch (error) {
                console.error("Failed to load products", error);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

    // Filter products
    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || p.category.category_name === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const addToCart = (product: Product) => {
        // Check stock
        const currentStock = product.inventory[0]?.quantity || 0;
        if (currentStock <= 0) return alert('Out of stock');

        setCart(prev => {
            const existing = prev.find(item => item.id === product.product_id);
            if (existing) {
                if (existing.quantity >= currentStock) {
                    alert('Not enough stock available');
                    return prev;
                }
                return prev.map(item => item.id === product.product_id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, {
                id: product.product_id,
                name: product.name,
                price: Number(product.selling_price),
                quantity: 1,

                maxStock: currentStock,
                discount: 0,
                discountType: 'fixed'
            }];
        });
    };

    const updateQuantity = (id: number, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = item.quantity + delta;
                if (newQty > item.maxStock) {
                    alert('Max stock reached');
                    return item;
                }
                return newQty > 0 ? { ...item, quantity: newQty } : item;
            }
            return item;
        }));
    };

    const removeFromCart = (id: number) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const updateItemDiscount = (id: number, value: number, type: 'fixed' | 'percent') => {
        setCart(prev => prev.map(item => item.id === id ? { ...item, discount: value, discountType: type } : item));
        setEditingItemDiscount(null);
    };

    const clearCart = () => setCart([]);

    // Calculations
    // Calculations
    const cartItemsSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Calculate total discount from line items
    const lineItemsDiscountTotal = cart.reduce((sum, item) => {
        const itemTotal = item.price * item.quantity;
        const discountAmount = item.discountType === 'fixed'
            ? Math.min(item.discount, itemTotal)
            : itemTotal * (item.discount / 100);
        return sum + discountAmount;
    }, 0);

    const subtotalAfterLineDiscounts = Math.max(0, cartItemsSubtotal - lineItemsDiscountTotal);

    // Global Discount
    const globalDiscountAmount = globalDiscount.type === 'fixed'
        ? Math.min(globalDiscount.value, subtotalAfterLineDiscounts)
        : subtotalAfterLineDiscounts * (globalDiscount.value / 100);

    const taxableAmount = Math.max(0, subtotalAfterLineDiscounts - globalDiscountAmount);

    const tax = taxableAmount * 0.10; // 10% tax on the discounted amount
    const total = taxableAmount + tax;
    const totalDiscount = lineItemsDiscountTotal + globalDiscountAmount;

    const processPayment = async (method: 'Cash' | 'Card') => {
        if (cart.length === 0) return;
        setProcessing(true);

        try {
            const res = await fetch('/api/sales/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart.map(i => {
                        const iTotal = i.price * i.quantity;
                        const iDisc = i.discountType === 'fixed' ? i.discount : iTotal * (i.discount / 100);
                        return {
                            productId: i.id,
                            quantity: i.quantity,
                            price: i.price,
                            name: i.name,
                            discount: iDisc
                        };
                    }),
                    paymentMethod: method,
                    subtotal: cartItemsSubtotal, // Raw subtotal
                    tax,
                    discount: totalDiscount, // Total discount (lines + global)
                    total,
                    customerId: selectedCustomer?.customer_id
                })
            });

            if (!res.ok) throw new Error('Checkout failed');

            const data = await res.json();

            // Fetch full sale details for receipt
            try {
                const saleRes = await fetch(`/api/sales/${data.saleId}`);
                if (saleRes.ok) {
                    const saleData = await saleRes.json();
                    setRecentSale(saleData);
                    setShowReceipt(true);
                }
            } catch (err) {
                console.error("Failed to fetch receipt data", err);
                alert(`Sale Completed! ID: ${data.saleId} (Receipt load failed)`);
            }

            setCart([]);
            setSelectedCustomer(null);

            // We reload only after receipt is closed or handled? 
            // Better to just refresh products or wait. 
            // If I reload window, the modal disappears.
            // So remove window.reload() and just refetch products manually or let it be.
            // Ideally we re-fetch products to update stock UI:
            // fetchProducts(); (if I move it out of useEffect)

            // For now, let's just clear cart. Real-stock update requires re-fetch.
            // To keep it simple, I won't auto-reload page yet.

        } catch (error) {
            alert('Error processing sale');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="p-8">Loading POS...</div>;

    const categories = ['All', ...Array.from(new Set(products.map(p => p.category.category_name)))];

    return (
        <div className="flex h-screen flex-col bg-background overflow-hidden font-sans text-foreground">
            <Header title="Point of Sale" />

            <div className="flex flex-1 overflow-hidden">
                {/* Left Side: Product Catalog */}
                <div className="flex flex-col flex-1 border-r border-border bg-gray-50/30 dark:bg-black/20">

                    {/* Filters */}
                    <div className="px-6 py-4 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                            />
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            {categories.map((cat, i) => (
                                <button key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${selectedCategory === cat
                                            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                                            : 'bg-card text-muted-foreground border border-border hover:bg-muted/50'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-6 pt-0 overflow-y-auto content-start">
                        {filteredProducts.map((p) => {
                            const stock = p.inventory[0]?.quantity || 0;
                            return (
                                <div key={p.product_id}
                                    onClick={() => addToCart(p)}
                                    className={`group relative bg-card rounded-xl border border-border hover:border-primary/50 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 overflow-hidden ${stock === 0 ? 'opacity-60 grayscale' : ''}`}
                                >
                                    <div className="h-32 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-300">
                                        {p.category.category_name === 'Electronics' ? '💻' : '📦'}
                                    </div>
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="font-semibold text-sm truncate flex-1 pr-2" title={p.name}>{p.name}</p>
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-3 font-mono">{p.sku}</p>
                                        <div className="flex justify-between items-end">
                                            <span className="font-bold text-lg text-primary">${Number(p.selling_price).toFixed(2)}</span>
                                            <span className={`text-xs px-2 py-1 rounded-md font-medium ${stock < 5 ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400'}`}>
                                                {stock} left
                                            </span>
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors pointer-events-none" />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Side: Cart */}
                <div className="w-[400px] flex-shrink-0 bg-card flex flex-col shadow-xl border-l border-border z-20">
                    <div className="p-5 border-b border-border bg-card">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-xl tracking-tight">Current Order</h3>
                            <button
                                onClick={clearCart}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 transition-colors dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50"
                            >
                                <Trash2 size={14} />
                                <span>Clear</span>
                            </button>
                        </div>

                        <div className={`p-3 rounded-xl border transition-all ${selectedCustomer ? 'bg-primary/5 border-primary/20' : 'bg-muted/30 border-dashed border-border hover:bg-muted/50'}`}>
                            {selectedCustomer ? (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
                                            <UserIcon size={18} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm ">{selectedCustomer.full_name}</p>
                                            <p className="text-xs text-muted-foreground">{selectedCustomer.phone || selectedCustomer.email}</p>
                                        </div>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); setSelectedCustomer(null); }} className="text-muted-foreground hover:text-red-500 p-1 transition-colors">
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <button onClick={() => setShowCustomerModal(true)} className="w-full flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground py-1">
                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                        <Plus size={16} />
                                    </div>
                                    <span>Add Customer</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Customer Modal */}
                    {showCustomerModal && (
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                            <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">
                                <div className="p-4 border-b border-border flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                                    <h3 className="font-bold text-lg">Select Customer</h3>
                                    <button onClick={() => setShowCustomerModal(false)} className="text-muted-foreground hover:text-foreground transition-colors"><X size={20} /></button>
                                </div>
                                <div className="p-4 space-y-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="Search by name, phone..."
                                            value={customerSearch}
                                            onChange={e => setCustomerSearch(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                                        />
                                    </div>
                                    <div className="overflow-y-auto max-h-[300px] space-y-2 pr-1">
                                        {loadingCustomers ? (
                                            <div className="py-8 text-center text-muted-foreground text-sm animate-pulse">Searching...</div>
                                        ) : (
                                            <>
                                                <div
                                                    onClick={() => { setSelectedCustomer(null); setShowCustomerModal(false); }}
                                                    className="p-3 rounded-lg border border-dashed border-border hover:bg-muted/50 cursor-pointer flex items-center gap-3 transition-colors"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                                        <Users size={16} />
                                                    </div>
                                                    <span className="font-medium text-sm">Walk-in Customer</span>
                                                </div>
                                                {customerResults.map(c => (
                                                    <div key={c.customer_id}
                                                        onClick={() => { setSelectedCustomer(c); setShowCustomerModal(false); }}
                                                        className={`p-3 rounded-lg border cursor-pointer flex items-center gap-3 transition-colors ${selectedCustomer?.customer_id === c.customer_id ? 'bg-primary/5 border-primary/30' : 'border-transparent hover:bg-muted/50'}`}
                                                    >
                                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 flex items-center justify-center text-xs font-bold ring-2 ring-white dark:ring-gray-800">
                                                            {c.full_name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex flex-col flex-1">
                                                            <span className="text-sm font-semibold">{c.full_name}</span>
                                                            <span className="text-xs text-muted-foreground">{c.phone || c.email}</span>
                                                        </div>
                                                        {c.balance !== 0 && (
                                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.balance > 0 ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'}`}>
                                                                {c.balance > 0 ? `+${c.balance}` : c.balance}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                                {customerResults.length === 0 && !loadingCustomers && (
                                                    <div className="py-8 text-center text-muted-foreground text-sm">No customers found</div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Cart Items List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30 dark:bg-black/10">
                        {cart.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-10">
                                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                                    <ShoppingCart size={24} className="opacity-50" />
                                </div>
                                <p className="font-medium">Cart is empty</p>
                                <p className="text-xs mt-1 opacity-70">Tap items to add them</p>
                            </div>
                        )}
                        {cart.map((item) => (
                            <div key={item.id} className="bg-card rounded-xl p-3 border border-border shadow-sm flex flex-col gap-3 group">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm truncate">{item.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-muted-foreground font-mono">${item.price.toFixed(2)}</span>
                                            {item.discount > 0 && (
                                                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900/50">
                                                    -{item.discountType === 'fixed' ? '$' + item.discount : item.discount + '%'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-bold text-sm block">
                                            ${((item.price * item.quantity) - (item.discountType === 'fixed' ? Math.min(item.discount, item.price * item.quantity) : (item.price * item.quantity * (item.discount / 100)))).toFixed(2)}
                                        </span>
                                        {item.discount > 0 && <span className="text-[10px] text-muted-foreground line-through decoration-red-400/50">${(item.price * item.quantity).toFixed(2)}</span>}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    {editingItemDiscount === item.id ? (
                                        <div className="flex items-center gap-1.5 animate-in slide-in-from-left-2 fade-in duration-200">
                                            <input
                                                type="number"
                                                className="w-14 p-1 text-xs border rounded bg-background focus:ring-1 focus:ring-primary outline-none"
                                                value={tempItemDiscount.value}
                                                onChange={e => setTempItemDiscount({ ...tempItemDiscount, value: Number(e.target.value) })}
                                                autoFocus
                                            />
                                            <select
                                                className="p-1 text-xs border rounded bg-background focus:ring-1 focus:ring-primary outline-none"
                                                value={tempItemDiscount.type}
                                                onChange={e => setTempItemDiscount({ ...tempItemDiscount, type: e.target.value as any })}
                                            >
                                                <option value="fixed">$</option>
                                                <option value="percent">%</option>
                                            </select>
                                            <button onClick={() => updateItemDiscount(item.id, tempItemDiscount.value, tempItemDiscount.type)} className="w-5 h-5 flex items-center justify-center bg-primary text-primary-foreground rounded hover:bg-primary/90"><Tag size={10} /></button>
                                            <button onClick={() => setEditingItemDiscount(null)} className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:bg-muted rounded"><X size={12} /></button>
                                        </div>
                                    ) : (
                                        <button onClick={() => { setEditingItemDiscount(item.id); setTempItemDiscount({ value: item.discount, type: item.discountType }); }} className="text-xs text-primary/80 hover:text-primary hover:underline flex items-center gap-1 transition-colors">
                                            <Tag size={12} /> {item.discount > 0 ? 'Edit' : 'Discount'}
                                        </button>
                                    )}

                                    <div className="flex items-center bg-muted/50 rounded-lg p-0.5 border border-border">
                                        <button
                                            onClick={() => updateQuantity(item.id, -1)}
                                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-background hover:shadow-sm transition-all text-muted-foreground hover:text-foreground active:scale-95"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="w-8 text-center text-sm font-semibold font-mono">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, 1)}
                                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-background hover:shadow-sm transition-all text-muted-foreground hover:text-foreground active:scale-95"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Totals & Payment */}
                    <div className="p-5 bg-card border-t border-border shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)] z-30">
                        <div className="flex justify-between text-sm mb-2 text-muted-foreground">
                            <span>Subtotal</span>
                            <span className="font-mono text-foreground">${cartItemsSubtotal.toFixed(2)}</span>
                        </div>
                        {totalDiscount > 0 && (
                            <div className="flex justify-between text-sm mb-2 text-green-600 font-medium">
                                <span>Total Savings</span>
                                <span className="font-mono">-${totalDiscount.toFixed(2)}</span>
                            </div>
                        )}

                        {/* Global Discount Input Toggle */}
                        <div className="mb-3">
                            {!showGlobalDiscountInput ? (
                                <button onClick={() => setShowGlobalDiscountInput(true)} className="text-xs text-primary/80 hover:text-primary hover:underline flex items-center gap-1 transition-colors">
                                    <Percent size={12} /> {globalDiscount.value > 0 ? 'Edit Global Discount' : 'Add Order Discount'}
                                </button>
                            ) : (
                                <div className="flex items-center gap-2 mt-1 animate-in slide-in-from-top-1 fade-in">
                                    <input
                                        type="number"
                                        className="w-20 p-1.5 text-sm border rounded bg-background focus:ring-1 focus:ring-primary outline-none"
                                        placeholder="0"
                                        value={globalDiscount.value}
                                        onChange={e => setGlobalDiscount({ ...globalDiscount, value: Number(e.target.value) })}
                                        autoFocus
                                    />
                                    <div className="flex border rounded overflow-hidden bg-muted/50 p-0.5">
                                        <button
                                            onClick={() => setGlobalDiscount({ ...globalDiscount, type: 'fixed' })}
                                            className={`px-2.5 py-1 text-xs rounded transition-all ${globalDiscount.type === 'fixed' ? 'bg-background shadow-sm font-bold text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                        >$</button>
                                        <button
                                            onClick={() => setGlobalDiscount({ ...globalDiscount, type: 'percent' })}
                                            className={`px-2.5 py-1 text-xs rounded transition-all ${globalDiscount.type === 'percent' ? 'bg-background shadow-sm font-bold text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                        >%</button>
                                    </div>
                                    <button onClick={() => setShowGlobalDiscountInput(false)} className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90">Done</button>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between text-sm mb-4 text-muted-foreground">
                            <span>Tax (10%)</span>
                            <span className="font-mono text-foreground">${tax.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between items-end mb-6 pt-4 border-t border-dashed border-border">
                            <div>
                                <span className="text-sm text-muted-foreground block mb-0.5">Total Amount</span>
                                <span className="text-3xl font-bold tracking-tight text-foreground">${total.toFixed(2)}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mb-1">
                                {cart.length} items
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <button
                                onClick={() => processPayment('Cash')}
                                disabled={processing || cart.length === 0}
                                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-border bg-background hover:bg-gray-50 hover:border-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.98]"
                            >
                                <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform dark:bg-green-950/30 dark:text-green-400">
                                    <Banknote size={18} />
                                </div>
                                <span className="font-semibold text-sm">Cash</span>
                            </button>
                            <button
                                onClick={() => processPayment('Card')}
                                disabled={processing || cart.length === 0}
                                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-border bg-background hover:bg-gray-50 hover:border-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.98]"
                            >
                                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform dark:bg-blue-950/30 dark:text-blue-400">
                                    <CreditCard size={18} />
                                </div>
                                <span className="font-semibold text-sm">Card</span>
                            </button>
                        </div>

                        <button
                            onClick={() => processPayment('Cash')}
                            disabled={processing || cart.length === 0}
                            className="w-full py-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2 text-lg"
                        >
                            {processing ? <Loader className="animate-spin" size={24} /> : (
                                <>
                                    <span>Charge ${total.toFixed(2)}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <ReceiptModal
                    isOpen={showReceipt}
                    onClose={() => {
                        setShowReceipt(false);
                        setRecentSale(null);
                        window.location.reload(); // Refresh to update stock after closing receipt
                    }}
                    saleData={recentSale}
                />
            </div>
        </div>
    );
}
