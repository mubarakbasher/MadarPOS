"use client";

import React from 'react';

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
        cost_price: string;
        selling_price: string;
    };
    quantity: number;
    reorder_level: number;
}

interface ExportData {
    items: InventoryItem[];
    settings: {
        system_name: string;
        currency: string;
    };
    filters: {
        search: string;
        categoryId?: number;
        categoryName?: string | null;
    };
    stats: {
        totalProducts: number;
        lowStockItems: number;
        totalValue: number;
    };
}

export default function InventoryExportClient({ data }: { data: ExportData }) {
    const currency = data.settings.currency || 'USD';
    const currencySymbol = currency === 'USD' ? '$' : currency;

    return (
        <>
            {/* Print-specific styles */}
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    
                    #print-content,
                    #print-content * {
                        visibility: visible;
                    }
                    
                    #print-content {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        padding: 0;
                        margin: 0;
                    }

                    /* Remove backgrounds for print */
                    #print-content * {
                        background: white !important;
                        box-shadow: none !important;
                    }

                    /* Ensure proper text colors */
                    #print-content {
                        color: black !important;
                    }

                    /* Hide print button */
                    .no-print {
                        display: none !important;
                    }

                    /* Optimize table for print */
                    table {
                        page-break-inside: avoid;
                    }

                    thead {
                        display: table-header-group;
                    }

                    tr {
                        page-break-inside: avoid;
                    }
                }

                @media screen {
                    .print-page {
                        min-height: 100vh;
                        background: linear-gradient(to bottom, #f3f4f6 0%, #ffffff 100%);
                    }
                }
            `}</style>

            <div className="print-page">
                <div id="print-content" className="max-w-7xl mx-auto p-8 bg-white shadow-lg my-8">
                    {/* Print Button - Hidden on print */}
                    <div className="no-print mb-6 flex justify-between items-center border-b pb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Inventory Report Preview</h1>
                            <p className="text-sm text-gray-500">Press Ctrl+P or click Print to save as PDF</p>
                        </div>
                        <button
                            onClick={() => window.print()}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Print / Save as PDF
                        </button>
                    </div>

                    {/* Report Header */}
                    <div className="text-center mb-8 border-b pb-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{data.settings.system_name}</h1>
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Inventory Report</h2>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p><strong>Generated:</strong> {new Date().toLocaleString()}</p>
                            {data.filters.search && (
                                <p><strong>Search Filter:</strong> "{data.filters.search}"</p>
                            )}
                            {data.filters.categoryName && (
                                <p><strong>Category Filter:</strong> {data.filters.categoryName}</p>
                            )}
                        </div>
                    </div>

                    {/* Summary Statistics */}
                    <div className="grid grid-cols-3 gap-6 mb-8">
                        <div className="border border-gray-200 rounded-lg p-4 text-center">
                            <div className="text-3xl font-bold text-indigo-600 mb-1">{data.stats.totalProducts}</div>
                            <div className="text-sm text-gray-600 font-medium">Total Products</div>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4 text-center">
                            <div className="text-3xl font-bold text-rose-600 mb-1">{data.stats.lowStockItems}</div>
                            <div className="text-sm text-gray-600 font-medium">Low Stock Items</div>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4 text-center">
                            <div className="text-3xl font-bold text-green-600 mb-1">
                                {currencySymbol}{data.stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className="text-sm text-gray-600 font-medium">Total Inventory Value</div>
                        </div>
                    </div>

                    {/* Inventory Table */}
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Inventory Details</h3>
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-100 border-b-2 border-gray-300">
                                    <th className="border border-gray-300 px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Product Name</th>
                                    <th className="border border-gray-300 px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">SKU</th>
                                    <th className="border border-gray-300 px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Category</th>
                                    <th className="border border-gray-300 px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">Quantity</th>
                                    <th className="border border-gray-300 px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">Cost Price</th>
                                    <th className="border border-gray-300 px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">Selling Price</th>
                                    <th className="border border-gray-300 px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">Total Value</th>
                                    <th className="border border-gray-300 px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.items.map((item, index) => {
                                    const costPrice = Number(item.product.cost_price);
                                    const sellingPrice = Number(item.product.selling_price);
                                    const totalValue = costPrice * item.quantity;
                                    const isLowStock = item.quantity <= item.reorder_level;

                                    return (
                                        <tr key={item.inventory_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900">
                                                {item.product.name}
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600 font-mono">
                                                {item.product.sku}
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600">
                                                {item.product.category.category_name}
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2 text-sm text-right font-semibold">
                                                <span className={isLowStock ? 'text-rose-600' : 'text-gray-900'}>
                                                    {item.quantity}
                                                </span>
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2 text-sm text-right text-gray-700">
                                                {currencySymbol}{costPrice.toFixed(2)}
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2 text-sm text-right text-gray-700">
                                                {currencySymbol}{sellingPrice.toFixed(2)}
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2 text-sm text-right font-semibold text-gray-900">
                                                {currencySymbol}{totalValue.toFixed(2)}
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">
                                                {isLowStock ? (
                                                    <span className="inline-block px-2 py-1 text-xs font-bold text-rose-700 bg-rose-100 border border-rose-300 rounded">
                                                        LOW STOCK
                                                    </span>
                                                ) : (
                                                    <span className="inline-block px-2 py-1 text-xs font-bold text-green-700 bg-green-100 border border-green-300 rounded">
                                                        IN STOCK
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {data.items.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                                            No inventory items found matching the current filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="text-center text-sm text-gray-500 border-t pt-6 mt-8">
                        <p>This report was generated from {data.settings.system_name}</p>
                        <p className="text-xs mt-1">Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
                    </div>
                </div>
            </div>
        </>
    );
}
