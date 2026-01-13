
import React, { useRef, useEffect, useState } from 'react';
import { X, Printer, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
    saleData: any; // Using any for speed, but ideally strictly typed.
}

interface SystemSettings {
    system_name: string;
    currency: string;
    tax_rate: number;
    logo?: string;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, saleData }) => {
    const printRef = useRef<HTMLDivElement>(null);
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Fetch system settings
            fetch('/api/settings')
                .then(res => res.json())
                .then(data => setSettings(data))
                .catch(err => console.error('Failed to load settings:', err));
        }
    }, [isOpen]);

    if (!isOpen || !saleData) return null;

    const handlePrint = async () => {
        if (!printRef.current || isGenerating) return;

        setIsGenerating(true);
        try {
            // Capture the receipt content as canvas
            const canvas = await html2canvas(printRef.current, {
                scale: 2, // Higher quality
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true,
            });

            // Calculate PDF dimensions
            const imgWidth = 210; // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Create PDF
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Add image to PDF
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

            // Open PDF in new window for printing
            const pdfBlob = pdf.output('blob');
            const pdfUrl = URL.createObjectURL(pdfBlob);
            const printWindow = window.open(pdfUrl, '_blank');

            // Trigger print dialog after PDF loads
            if (printWindow) {
                printWindow.onload = () => {
                    printWindow.print();
                };
            }
        } catch (error) {
            console.error('Error generating PDF for print:', error);
            alert('Failed to prepare receipt for printing. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!printRef.current || isGenerating) return;

        setIsGenerating(true);
        try {
            // Capture the receipt content as canvas
            const canvas = await html2canvas(printRef.current, {
                scale: 2, // Higher quality
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true,
            });

            // Calculate PDF dimensions
            const imgWidth = 210; // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Create PDF
            const pdf = new jsPDF({
                orientation: imgHeight > imgWidth ? 'portrait' : 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Add image to PDF
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

            // Download PDF
            const invoiceNumber = saleData.invoice_number || 'receipt';
            pdf.save(`receipt-${invoiceNumber}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };


    const getCurrencySymbol = (currencyCode: string): string => {
        const currencyMap: { [key: string]: string } = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'SAR': '﷼',
            'AED': 'د.إ',
            'EGP': '£',
            'SDN': 'ج.س'
        };
        return currencyMap[currencyCode] || currencyCode;
    };

    const systemName = settings?.system_name || 'MADAR POS';
    const currency = settings?.currency || 'USD';
    const currencySymbol = getCurrencySymbol(currency);

    return (
        <>
            {/* Print-specific styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    body {
                        margin: 0;
                        padding: 0;
                    }
                    
                    /* Remove backdrop overlay styling for print */
                    .receipt-modal-backdrop {
                        background: white !important;
                        position: static !important;
                        display: block !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    
                    .receipt-modal-content {
                        max-width: 100% !important;
                        max-height: none !important;
                        box-shadow: none !important;
                        border: none !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        border-radius: 0 !important;
                        background: white !important;
                        overflow: visible !important;
                    }
                    
                    /* Hide all buttons, headers, and controls */
                    .print-hidden {
                        display: none !important;
                    }
                    
                    /* Make receipt content fill the page */
                    #receipt-content {
                        overflow: visible !important;
                        max-height: none !important;
                        padding: 0 !important;
                        background: white !important;
                    }
                    
                    /* Clean up backgrounds */
                    #receipt-content * {
                        background: transparent !important;
                    }
                    
                    /* Preserve borders */
                    .border-b {
                        border-bottom: 1px solid #000 !important;
                    }
                    
                    .border-t {
                        border-top: 1px solid #000 !important;
                    }
                    
                    .border-dashed {
                        border-style: dashed !important;
                        border-color: #666 !important;
                    }
                    
                    /* Table styling */
                    table {
                        border-collapse: collapse !important;
                        width: 100% !important;
                    }
                    
                    /* Text colors */
                    #receipt-content {
                        color: black !important;
                    }
                    
                    .text-gray-600,
                    .text-muted-foreground {
                        color: #666 !important;
                    }
                    
                    .text-green-600 {
                        color: #16a34a !important;
                    }
                    
                    /* Page settings */
                    @page {
                        margin: 15mm;
                        size: auto;
                    }
                }

                /* Screen styles for modal */
                @media screen {
                    .receipt-modal-backdrop {
                        position: fixed;
                        inset: 0;
                        z-index: 9999;
                        background-color: rgba(0, 0, 0, 0.5);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        animation: fadeIn 0.2s ease-in-out;
                    }

                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }

                    @keyframes slideUp {
                        from { transform: translateY(20px); opacity: 0; }
                        to { transform: translateY(0); opacity: 1; }
                    }

                    .receipt-modal-content {
                        animation: slideUp 0.3s ease-out;
                    }
                }
            `}} />

            <div className="receipt-modal-backdrop">
                <div
                    className="receipt-modal-content bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-200"
                >
                    {/* Header Actions */}
                    <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50/50 print-hidden">
                        <h3 className="font-bold text-lg text-gray-800">Sale Receipt</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-gray-100"
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Receipt Content - Scrollable */}
                    <div ref={printRef} className="overflow-y-auto p-6 flex-1" id="receipt-content">
                        {/* Business Header */}
                        <div className="text-center mb-6 receipt-section">
                            {settings?.logo && (
                                <img
                                    src={settings.logo}
                                    alt="Logo"
                                    className="h-12 mx-auto mb-2"
                                />
                            )}
                            <h2 className="text-2xl font-bold uppercase tracking-wide mb-1">
                                {systemName}
                            </h2>
                            <p className="text-sm text-gray-600 mb-0.5">
                                {saleData.branch?.branch_name || 'Main Branch'}
                            </p>
                            <p className="text-sm text-gray-600 mb-0.5">
                                {saleData.branch?.location || 'Location not set'}
                            </p>
                            <p className="text-sm text-gray-600">
                                {saleData.branch?.phone || 'Phone not set'}
                            </p>
                        </div>

                        {/* Divider */}
                        <div className="border-b border-dashed border-gray-300 my-4"></div>

                        {/* Transaction Details */}
                        <div className="mb-4 text-sm receipt-section">
                            <div className="flex justify-between mb-1.5">
                                <span className="text-gray-600 font-medium">Invoice:</span>
                                <span className="font-semibold">{saleData.invoice_number}</span>
                            </div>
                            <div className="flex justify-between mb-1.5">
                                <span className="text-gray-600 font-medium">Date:</span>
                                <span>{new Date(saleData.sale_date).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between mb-1.5">
                                <span className="text-gray-600 font-medium">Cashier:</span>
                                <span>{saleData.user?.full_name || 'Admin'}</span>
                            </div>
                            {saleData.customer && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600 font-medium">Customer:</span>
                                    <span>{saleData.customer.full_name}</span>
                                </div>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="border-b border-dashed border-gray-300 my-4"></div>

                        {/* Items Table */}
                        <div className="mb-4 receipt-section">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-300">
                                        <th className="pb-2 text-left font-semibold text-gray-700">Item</th>
                                        <th className="pb-2 text-right font-semibold text-gray-700">Qty</th>
                                        <th className="pb-2 text-right font-semibold text-gray-700">Price</th>
                                        <th className="pb-2 text-right font-semibold text-gray-700">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {saleData.sale_items?.map((item: any) => {
                                        const itemSubtotal = Number(item.subtotal);
                                        const itemDiscount = Number(item.discount || 0);
                                        const hasDiscount = itemDiscount > 0;

                                        return (
                                            <tr key={item.sale_item_id} className="border-b border-gray-100">
                                                <td className="py-2 pr-2">
                                                    <div className="font-medium text-gray-800">
                                                        {item.product?.name || 'Item'}
                                                    </div>
                                                    {item.product?.sku && (
                                                        <div className="text-xs text-gray-500 font-mono">
                                                            {item.product.sku}
                                                        </div>
                                                    )}
                                                    {hasDiscount && (
                                                        <div className="text-xs text-green-600 font-medium">
                                                            Discount: -{currencySymbol}{itemDiscount.toFixed(2)}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-2 text-right align-top">{item.quantity}</td>
                                                <td className="py-2 text-right align-top">
                                                    {currencySymbol}{Number(item.unit_price).toFixed(2)}
                                                </td>
                                                <td className="py-2 text-right align-top font-medium">
                                                    {currencySymbol}{itemSubtotal.toFixed(2)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Divider */}
                        <div className="border-b border-dashed border-gray-300 my-4"></div>

                        {/* Totals */}
                        <div className="receipt-section">
                            <div className="flex justify-between mb-2 text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium">
                                    {currencySymbol}{(Number(saleData.total_amount) - Number(saleData.tax) + Number(saleData.discount)).toFixed(2)}
                                </span>
                            </div>
                            {Number(saleData.discount) > 0 && (
                                <div className="flex justify-between mb-2 text-sm text-green-600">
                                    <span className="font-medium">Discount</span>
                                    <span className="font-medium">
                                        -{currencySymbol}{Number(saleData.discount).toFixed(2)}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between mb-2 text-sm">
                                <span className="text-gray-600">Tax</span>
                                <span className="font-medium">
                                    {currencySymbol}{Number(saleData.tax).toFixed(2)}
                                </span>
                            </div>

                            {/* Total */}
                            <div className="border-t border-gray-300 mt-3 pt-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-gray-800">TOTAL</span>
                                    <span className="text-2xl font-bold text-gray-900">
                                        {currencySymbol}{Number(saleData.total_amount).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="mt-3 text-center">
                                <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-700 uppercase">
                                    Paid via {saleData.payment_method}
                                </span>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="text-center text-xs text-gray-500 mt-8 receipt-section">
                            <p className="mb-1 font-medium">Thank you for shopping with us!</p>
                            <p className="mb-1">Please keep this receipt for returns.</p>
                            <div className="mt-4 font-mono text-[10px] opacity-50">
                                Receipt ID: {saleData.sale_id}
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 border-t border-gray-200 bg-gray-50/50 print-hidden">
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={onClose}
                                className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm text-gray-700"
                            >
                                Close
                            </button>
                            <button
                                onClick={handlePrint}
                                disabled={isGenerating}
                                className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Printer size={16} />
                                {isGenerating ? 'Preparing...' : 'Print'}
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isGenerating}
                                className="px-4 py-2.5 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ backgroundColor: 'var(--primary)' }}
                            >
                                <Download size={16} />
                                {isGenerating ? 'Generating...' : 'Save PDF'}
                            </button>
                        </div>
                        <p className="text-center text-xs text-gray-500 mt-2">
                            Tip: Click "Print" to print receipt or "Save PDF" to download
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ReceiptModal;
