import React, { useRef } from 'react';
import { MdClose, MdPrint, MdDownload, MdCloudDownload } from 'react-icons/md';

const InvoiceModal = ({ isOpen, onClose, order }) => {
    const printRef = useRef();

    if (!isOpen || !order) return null;

    // Define styles as a constant to inject in both locations
    const styles = `
        @page { size: auto; margin: 5mm; }
        body { font-family: 'Inter', sans-serif; padding: 20px; color: #1f2937; -webkit-print-color-adjust: exact; print-color-adjust: exact; background-color: white; }
        .invoice-box { max-width: 800px; margin: auto; padding: 20px; border: 1px solid #eee; box-shadow: none; font-size: 14px; line-height: 20px; color: #555; background-color: white; }
        .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .company-details h2 { font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 2px; }
        .company-details p { margin: 0; font-size: 12px; color: #6b7280; line-height: 1.4; }
        .invoice-details { text-align: right; }
        .invoice-details h1 { font-size: 28px; font-weight: 800; color: #4f46e5; margin: 0 0 5px; letter-spacing: -1px; }
        .invoice-details p { margin: 0; font-size: 12px; color: #6b7280; }
        .invoice-details .order-id { font-weight: 600; color: #111827; margin-bottom: 3px; font-size: 14px; }
        
        .bill-to { margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-start; }
        .bill-to-section h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; font-weight: 600; margin: 0 0 8px; }
        .bill-to-section .client-name { font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 3px; }
        .bill-to-section .address { font-size: 13px; color: #4b5563; line-height: 1.5; }
        
        .status-box { background: #f9fafb; padding: 10px 15px; border-radius: 6px; text-align: right; min-width: 180px; }
        .status-row { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 12px; }
        .status-row:last-child { margin-bottom: 0; }
        .status-badge { display: inline-block; padding: 1px 6px; border-radius: 3px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
        .status-paid { background: #d1fae5; color: #047857; }
        .status-pending { background: #fef3c7; color: #b45309; }
        
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { text-align: left; padding: 10px 8px; background-color: #f3f4f6; color: #374151; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e5e7eb; }
        td { padding: 10px 8px; border-bottom: 1px solid #e5e7eb; vertical-align: middle; }
        .item-name { font-weight: 600; color: #111827; font-size: 13px; }
        .item-meta { font-size: 11px; color: #6b7280; margin-top: 2px; }
        .col-qty, .col-price, .col-total { text-align: right; }
        
        .totals { display: flex; justify-content: flex-end; }
        .totals-box { width: 250px; }
        .total-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f3f4f6; }
        .total-row:last-child { border-bottom: none; border-top: 2px solid #111827; margin-top: 5px; padding-top: 10px; }
        .total-label { color: #6b7280; font-size: 13px; }
        .total-value { font-weight: 600; color: #111827; font-size: 14px; }
        .grand-total-label { font-weight: 700; color: #111827; font-size: 15px; }
        .grand-total-value { font-weight: 800; color: #4f46e5; font-size: 18px; }
        
        .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 11px; }
    `;

    const handlePrint = () => {
        const printContent = printRef.current;
        const windowUrl = 'about:blank';
        const uniqueName = new Date();
        const windowName = 'Print' + uniqueName.getTime();
        const printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=0,height=0');

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Invoice #${order.orderId}</title>
                    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
                    <style>
                        ${styles}
                    </style>
                </head>
                <body>
                    <div class="invoice-box">
                       ${printContent.innerHTML}
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-200">
            {/* Inject styles into current document for the preview */}
            <style>{styles}</style>

            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <span>Invoice Preview</span>
                    </h2>
                    <div className="flex gap-3">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors font-medium shadow-sm text-sm"
                        >
                            <MdPrint size={18} />
                            Print / Download
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <MdClose size={22} />
                        </button>
                    </div>
                </div>

                {/* Modal Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-gray-100/50">
                    {/* The Preview uses the exact same HTML structure and classes as the print version */}
                    <div ref={printRef} className="invoice-box bg-white shadow-sm border border-gray-200 mx-auto">

                        {/* Header */}
                        <div className="header">
                            <div className="company-details">
                                <h2>UBOLD CLOTHING</h2>
                                <p>
                                    123 Business Street<br />
                                    Fashion City, FC 123456<br />
                                    support@ubold.com
                                </p>
                            </div>
                            <div className="invoice-details">
                                <h1>INVOICE</h1>
                                <p className="order-id">#{order.orderId}</p>
                                <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>

                        {/* Bill To & Info */}
                        <div className="bill-to">
                            <div className="bill-to-section">
                                <h3>Bill To</h3>
                                <div className="client-name">{order.user?.firstName} {order.user?.lastName}</div>
                                <div className="address">
                                    {order.shippingAddress?.streetAddress}<br />
                                    {order.shippingAddress?.city}, {order.shippingAddress?.state}<br />
                                    {order.shippingAddress?.zipCode}, {order.shippingAddress?.country}<br />
                                    {order.shippingAddress?.mobile}
                                </div>
                            </div>

                            <div className="status-box">
                                <div className="status-row">
                                    <span className="status-label">Payment Method:</span>
                                    <span className="status-value">{order.paymentMethod}</span>
                                </div>
                                <div className="status-row">
                                    <span className="status-label">Payment Status:</span>
                                    <span className={`status-badge ${order.paymentStatus === 'Paid' ? 'status-paid' : 'status-pending'}`}>
                                        {order.paymentStatus}
                                    </span>
                                </div>
                                <div className="status-row" style={{ marginTop: '5px' }}>
                                    <span className="status-label">Trans. ID:</span>
                                    <span className="status-value" style={{ fontFamily: 'monospace' }}>
                                        {order._id.slice(-6).toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: '45%' }}>Item Description</th>
                                    <th className="col-qty" style={{ width: '15%' }}>Qty</th>
                                    <th className="col-price" style={{ width: '20%' }}>Price</th>
                                    <th className="col-total" style={{ width: '20%' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items?.map((item, idx) => (
                                    <tr key={idx}>
                                        <td>
                                            <div className="item-name">{item.name}</div>
                                            <div className="item-meta">Size: {item.size} | SKU: {item.sku}</div>
                                        </td>
                                        <td className="col-qty">{item.quantity}</td>
                                        <td className="col-price">₹{item.price?.toFixed(2)}</td>
                                        <td className="col-total">₹{item.totalPrice?.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Totals */}
                        <div className="totals">
                            <div className="totals-box">
                                <div className="total-row">
                                    <span className="total-label">Subtotal</span>
                                    <span className="total-value">₹{order.subTotal?.toFixed(2)}</span>
                                </div>
                                <div className="total-row">
                                    <span className="total-label">Tax (GST)</span>
                                    <span className="total-value">₹{order.taxTotal?.toFixed(2)}</span>
                                </div>
                                <div className="total-row">
                                    <span className="total-label">Shipping</span>
                                    <span className="total-value">₹0.00</span>
                                </div>
                                <div className="total-row">
                                    <span className="grand-total-label">Total</span>
                                    <span className="grand-total-value">₹{order.grandTotal?.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="footer">
                            <p>Thank you for your business!</p>
                            <p>For any queries, please contact support@ubold.com or call +1 234 567 890</p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceModal;
