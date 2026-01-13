"use client";

import React from 'react';

interface SaleItem {
    sale_item_id: number;
    product: { name: string };
    quantity: number;
    unit_price: string;
    subtotal: string;
}

interface Sale {
    sale_id: number;
    invoice_number: string;
    sale_date: string;
    total_amount: string;
    payment_method: string;
    user: { full_name: string };
    customer: { full_name: string } | null;
    sale_items: SaleItem[];
}

interface ExportData {
    sales: Sale[];
    settings: {
        system_name: string;
        currency: string;
    };
    cashierFilter: {
        full_name: string;
    } | null;
    stats: {
        totalRevenue: number;
        totalTransactions: number;
        avgTransaction: number;
    };
}

export default function SalesExportClient({ data }: { data: ExportData }) {
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

                    #print-content * {
                        background: white !important;
                        box-shadow: none !important;
                    }

                    #print-content {
                        color: black !important;
                    }

                    .no-print {
                        display: none !important;
                    }

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
                    {/* Print Button */}
                    <div className="no-print mb-6 flex justify-between items-center border-b pb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Sales Report Preview</h1>
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
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Sales Report</h2>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p><strong>Generated:</strong> {new Date().toLocaleString()}</p>
                            {data.cashierFilter && (
                                <p><strong>Cashier:</strong> {data.cashierFilter.full_name}</p>
                            )}
                        </div>
                    </div>

                    {/* Summary Statistics */}
                    <div className="grid grid-cols-3 gap-6 mb-8">
                        <div className="border border-gray-200 rounded-lg p-4 text-center">
                            <div className="text-3xl font-bold text-green-600 mb-1">
                                {currencySymbol}{data.stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className="text-sm text-gray-600 font-medium">Total Revenue</div>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4 text-center">
                            <div className="text-3xl font-bold text-indigo-600 mb-1">{data.stats.totalTransactions}</div>
                            <div className="text-sm text-gray-600 font-medium">Total Transactions</div>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4 text-center">
                            <div className="text-3xl font-bold text-blue-600 mb-1">
                                {currencySymbol}{data.stats.avgTransaction.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className="text-sm text-gray-600 font-medium">Average Transaction</div>
                        </div>
                    </div>

                    {/* Sales Table */}
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Transaction Details</h3>
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-100 border-b-2 border-gray-300">
                                    <th className="border border-gray-300 px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Date</th>
                                    <th className="border border-gray-300 px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Invoice #</th>
                                    <th className="border border-gray-300 px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Customer</th>
                                    <th className="border border-gray-300 px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Cashier</th>
                                    <th className="border border-gray-300 px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Payment</th>
                                    <th className="border border-gray-300 px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.sales.map((sale, index) => (
                                    <tr key={sale.sale_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">
                                            {new Date(sale.sale_date).toLocaleString()}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900">
                                            {sale.invoice_number}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">
                                            {sale.customer ? sale.customer.full_name : 'Walk-in'}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">
                                            {sale.user.full_name}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600">
                                            {sale.payment_method}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-sm text-right font-semibold text-gray-900">
                                            {currencySymbol}{Number(sale.total_amount).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                                {data.sales.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                                            No sales transactions found.
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
