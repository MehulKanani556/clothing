import { FiCreditCard, FiLock, FiMapPin, FiChevronDown, FiChevronUp, FiSmartphone } from 'react-icons/fi';
import { BsWallet2, BsBank, BsCashCoin } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { createPaymentOrder, processPaymentOrder } from '../redux/slice/payment.slice';
import { fetchCart } from '../redux/slice/cart.slice';
import { useState } from 'react';
import { useEffect } from 'react';

export default function PaymentPage() {
    const dispatch = useDispatch();
    const { items, totalPrice } = useSelector(state => state.cart);
    const { user } = useSelector(state => state.auth);

    // Derived state for address
    const activeAddress = user?.addresses?.find(addr => addr.isDefault) || user?.addresses?.[0];

    const [loading, setLoading] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState('card');
    const [isItemsExpanded, setIsItemsExpanded] = useState(false);
    const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);

    const [cardDetails, setCardDetails] = useState({
        number: '',
        expiry: '',
        cvv: '',
        holder: '',
        save: false
    });
    const [errors, setErrors] = useState({});

    // Fetch cart on mount if empty (optional safety check)
    useEffect(() => {
        if (!items.length) {
            dispatch(fetchCart());
        }
    }, [dispatch, items.length]);

    const formatCardNumber = (value) => {
        const cleaned = value.replace(/\s/g, '').replace(/\D/g, '');
        const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
        return formatted.substring(0, 19);
    };

    const formatExpiry = (value) => {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length >= 2) {
            return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
        }
        return cleaned;
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        let formattedValue = value;

        if (name === 'number') {
            formattedValue = formatCardNumber(value);
        } else if (name === 'expiry') {
            formattedValue = formatExpiry(value);
        } else if (name === 'cvv') {
            formattedValue = value.replace(/\D/g, '').substring(0, 4);
        } else if (name === 'holder') {
            formattedValue = value.toUpperCase();
        }

        setCardDetails(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : formattedValue
        }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        const cleanNumber = cardDetails.number.replace(/\s/g, '');
        if (!cleanNumber || cleanNumber.length < 13) {
            newErrors.number = 'Invalid card number';
        }

        if (!cardDetails.expiry || cardDetails.expiry.length !== 5) {
            newErrors.expiry = 'Invalid expiry date (MM/YY)';
        } else {
            const [mm, yy] = cardDetails.expiry.split('/');
            const month = parseInt(mm);
            if (month < 1 || month > 12) {
                newErrors.expiry = 'Invalid month';
            }
        }

        if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
            newErrors.cvv = 'Invalid CVV';
        }

        if (!cardDetails.holder || cardDetails.holder.length < 3) {
            newErrors.holder = 'Cardholder name required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePayment = async () => {
        if (selectedMethod !== 'card') {
            // Placeholder for other methods
            alert(`Payment method ${selectedMethod} is not yet implemented.`);
            return;
        }

        // Check for Auth Token
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        if (!token) {
            alert("Session expired or token missing. Please login again.");
            // Assuming you have access to navigate, or use window.location
            window.location.href = '/login';
            return;
        }

        if (!validateForm()) {
            alert('Please fill all card details correctly');
            return;
        }

        setLoading(true);

        try {
            // Step 1: Create Payment Order
            const orderData = {
                orderAmount: totalPrice,
                customerId: user?._id || 'guest',
                customerPhone: user?.mobileNumber || '9999999999',
                customerName: user?.firstName || 'Guest',
                customerEmail: user?.email || 'guest@example.com'
            };

            const orderResult = await dispatch(createPaymentOrder(orderData)).unwrap();

            if (!orderResult.success || !orderResult.paymentSessionId) {
                throw new Error('Failed to create payment session');
            }

            // Step 2: Process Payment
            let mm = "", yy = "";
            if (cardDetails.expiry && cardDetails.expiry.includes('/')) {
                [mm, yy] = cardDetails.expiry.split('/');
            } else {
                throw new Error("Invalid Expiry Date Format");
            }

            const cleanCardNumber = cardDetails.number.replace(/\s/g, '');

            const paymentMethod = {
                card: {
                    channel: "post",
                    card_number: cleanCardNumber,
                    card_holder_name: cardDetails.holder,
                    card_expiry_mm: mm,
                    card_expiry_yy: yy,
                    card_cvv: cardDetails.cvv
                }
            };

            let paymentResult;
            try {
                paymentResult = await dispatch(processPaymentOrder({
                    paymentSessionId: orderResult.paymentSessionId,
                    paymentMethod
                })).unwrap();
            } catch (err) {
                if (err.code === 'payment_method_unsupported' || (err.message && err.message.includes('mode not enabled'))) {
                    console.warn("S2S failed, falling back to Link method");
                    paymentResult = await dispatch(processPaymentOrder({
                        paymentSessionId: orderResult.paymentSessionId,
                        paymentMethod: {
                            card: {
                                channel: "link"
                            }
                        }
                    })).unwrap();
                } else {
                    throw err;
                }
            }

            // Step 3: Handle Response
            if (paymentResult.success && paymentResult.data) {
                const responseData = paymentResult.data;
                const payment_status = responseData.payment_status;
                const action = responseData.action;
                const url = responseData.data?.url || responseData.url;

                if (payment_status === "SUCCESS") {
                    alert("Payment Successful!");
                    // Navigate to success page
                } else if (action === "link" && url) {
                    window.location.href = url;
                } else if (action === "custom" && url) {
                    window.location.href = url;
                } else if (payment_status) {
                    alert(`Payment Status: ${payment_status}`);
                } else {
                    if (url) {
                        window.location.href = url;
                    } else {
                        alert(`Payment processing. Check console for details.`);
                    }
                }
            } else {
                throw new Error("Invalid payment response received");
            }

        } catch (error) {
            console.error('Payment Error:', error);
            alert(error.message || 'Payment failed');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'card', label: 'Debit & Credit card', icon: <FiCreditCard size={20} /> },
        { id: 'wallet', label: 'Wallet', icon: <BsWallet2 size={20} /> },
        { id: 'upi', label: 'UPI', icon: <FiSmartphone size={20} /> },
        { id: 'netbanking', label: 'Net Banking', icon: <BsBank size={20} /> },
        { id: 'cod', label: 'Cash on Delivery', icon: <BsCashCoin size={20} /> },
    ];

    return (
        <div className="min-h-screen bg-white py-10 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-xl font-bold text-gray-800 mb-8 uppercase tracking-wide">
                    CHOOSE YOUR PAYMENT METHOD
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Payment Methods & Form */}
                    <div className="lg:col-span-8 bg-white border border-gray-200 shadow-sm flex flex-col md:flex-row min-h-[500px]">
                        {/* Sidebar Tabs */}
                        <div className="w-full md:w-1/3 bg-gray-50 border-r border-gray-200 pt-6">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setSelectedMethod(tab.id)}
                                    className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all text-left
                                        ${selectedMethod === tab.id
                                            ? 'bg-white text-gray-900 border-l-4 border-gray-900'
                                            : 'text-gray-500 hover:bg-gray-100 border-l-4 border-transparent'
                                        }`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Content Area */}
                        <div className="w-full md:w-2/3 p-8">
                            {selectedMethod === 'card' ? (
                                <div className="space-y-6">
                                    {/* Card Brands */}
                                    <div className="flex gap-2 mb-2">
                                        <img src="https://img.icons8.com/color/48/visa.png" className="h-8" alt="Visa" />
                                        <img src="https://img.icons8.com/color/48/mastercard.png" className="h-8" alt="Mastercard" />
                                        <img src="https://img.icons8.com/color/48/amex.png" className="h-8" alt="Amex" />
                                    </div>

                                    {/* Form Fields */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                                            Card Number
                                        </label>
                                        <input
                                            type="text"
                                            name="number"
                                            value={cardDetails.number}
                                            onChange={handleInputChange}
                                            placeholder="Card Number"
                                            className="w-full px-4 py-3 bg-gray-100 border-none rounded focus:ring-1 focus:ring-gray-400 placeholder-gray-400 text-gray-800 text-sm"
                                        />
                                        {errors.number && <p className="text-red-500 text-xs mt-1">{errors.number}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                                                Expiry Date
                                            </label>
                                            <input
                                                type="text"
                                                name="expiry"
                                                value={cardDetails.expiry}
                                                onChange={handleInputChange}
                                                placeholder="MM/YY"
                                                className="w-full px-4 py-3 bg-gray-100 border-none rounded focus:ring-1 focus:ring-gray-400 placeholder-gray-400 text-gray-800 text-sm"
                                            />
                                            {errors.expiry && <p className="text-red-500 text-xs mt-1">{errors.expiry}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                                                CVV
                                            </label>
                                            <input
                                                type="password"
                                                name="cvv"
                                                value={cardDetails.cvv}
                                                onChange={handleInputChange}
                                                placeholder="CVV"
                                                maxLength="4"
                                                className="w-full px-4 py-3 bg-gray-100 border-none rounded focus:ring-1 focus:ring-gray-400 placeholder-gray-400 text-gray-800 text-sm"
                                            />
                                            {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                                            Card Holder Name
                                        </label>
                                        <input
                                            type="text"
                                            name="holder"
                                            value={cardDetails.holder}
                                            onChange={handleInputChange}
                                            placeholder="Card Holder Name"
                                            className="w-full px-4 py-3 bg-gray-100 border-none rounded focus:ring-1 focus:ring-gray-400 placeholder-gray-400 text-gray-800 text-sm"
                                        />
                                        {errors.holder && <p className="text-red-500 text-xs mt-1">{errors.holder}</p>}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="saveCard"
                                            name="save"
                                            checked={cardDetails.save}
                                            onChange={handleInputChange}
                                            className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-500"
                                        />
                                        <label htmlFor="saveCard" className="text-sm text-gray-500">
                                            Save your card for future transactions
                                        </label>
                                    </div>

                                    <button
                                        onClick={handlePayment}
                                        disabled={loading}
                                        className="w-full bg-gray-400 hover:bg-gray-500 text-white py-4 rounded font-bold text-sm uppercase transition-all disabled:opacity-50 mt-4"
                                        style={{ backgroundColor: '#AFAFAF' }}
                                    >
                                        {loading ? 'Processing...' : `Pay ₹${totalPrice.toLocaleString()}`}
                                    </button>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                                    <p className="mb-4">Select this payment method to proceed</p>
                                    <button className="bg-gray-800 text-white px-6 py-2 rounded shadow-md">
                                        Pay with {tabs.find(t => t.id === selectedMethod)?.label}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Summary */}
                    <div className="lg:col-span-4 space-y-4">
                        {/* Address */}
                        <div className="bg-white border border-gray-200 shadow-sm p-4 rounded">
                            <div className="flex justify-between items-start">
                                <div className="flex items-start gap-2 text-sm text-gray-600">
                                    <div className="mt-1"><FiMapPin /></div>
                                    <div>
                                        <p>Deliver to: <span className="font-bold text-gray-900">{activeAddress ? `${activeAddress.firstName} ${activeAddress.lastName}` : user?.firstName || 'User'}</span> <span className="bg-gray-100 px-1 text-xs ml-1 rounded">Home</span></p>
                                        {activeAddress && (
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                {[
                                                    activeAddress.buildingName,
                                                    activeAddress.locality,
                                                    activeAddress.city,
                                                    activeAddress.state,
                                                    activeAddress.pincode
                                                ].filter(Boolean).join(', ')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <button className="text-blue-600 text-sm font-semibold hover:underline">Change</button>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="bg-white border border-gray-200 shadow-sm rounded">
                            <div
                                className="flex justify-between items-center p-4 cursor-pointer"
                                onClick={() => setIsItemsExpanded(!isItemsExpanded)}
                            >
                                <span className="font-semibold text-gray-800">Items ({items.length})</span>
                                {isItemsExpanded ? <FiChevronUp /> : <FiChevronDown />}
                            </div>
                            {isItemsExpanded && (
                                <div className="p-4 border-t border-gray-100 max-h-64 overflow-y-auto space-y-3">
                                    {items.map(item => (
                                        <div key={item._id} className="flex gap-3">
                                            <img
                                                src={item.product?.variants?.[0]?.images?.[0] || 'https://via.placeholder.com/60'}
                                                alt={item.product?.name}
                                                className="w-12 h-12 object-cover rounded border border-gray-100"
                                            />
                                            <div className="text-xs">
                                                <p className="font-medium text-gray-900 line-clamp-1">{item.product?.name}</p>
                                                <p className="text-gray-500">Qty: {item.quantity}</p>
                                                <p className="font-semibold">₹{item.price.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Price Summary */}
                        <div className="bg-white border border-gray-200 shadow-sm rounded">
                            <div
                                className="flex justify-between items-center p-4 cursor-pointer"
                                onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                            >
                                <span className="font-semibold text-gray-800">Price Summary</span>
                                {isSummaryExpanded ? <FiChevronUp /> : <FiChevronDown />}
                            </div>
                            {isSummaryExpanded && (
                                <div className="p-4 border-t border-gray-100 space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-medium">₹{totalPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Delivery Charges</span>
                                        <span className="font-medium text-green-600">FREE</span>
                                    </div>
                                    <hr className="border-dashed border-gray-200" />
                                    <div className="flex justify-between text-base font-bold text-gray-900">
                                        <span>Subtotal</span>
                                        <span>₹{totalPrice.toLocaleString()}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}