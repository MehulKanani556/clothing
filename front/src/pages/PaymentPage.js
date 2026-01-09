import { FiCreditCard, FiLock, FiMapPin, FiChevronDown, FiChevronUp, FiSmartphone } from 'react-icons/fi';
import { BsWallet2, BsBank, BsCashCoin } from 'react-icons/bs';
import { load } from '@cashfreepayments/cashfree-js';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createPaymentOrder, processPaymentOrder, processCODPayment, createDbOrder, updateDbOrder, verifyPayment } from '../redux/slice/payment.slice';
import { fetchCart, clearCart } from '../redux/slice/cart.slice';
import { useState, useEffect } from 'react';



export default function PaymentPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const orderIdParam = searchParams.get('order_id');
    const { items, totalPrice } = useSelector(state => state.cart);
    const { user } = useSelector(state => state.auth);

    // Derived state for address
    const activeAddress = user?.addresses?.find(addr => addr.isDefault) || user?.addresses?.[0];

    const [loading, setLoading] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState('card');
    const [isItemsExpanded, setIsItemsExpanded] = useState(false);
    const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);

    useEffect(() => {
        load({
            env: 'sandbox',
            app_id: process.env.REACT_APP_CASHFREE_APP_ID,
            app_secret: process.env.REACT_APP_CASHFREE_APP_SECRET
        });
    }, []);

    const [cardDetails, setCardDetails] = useState({
        number: '',
        expiry: '',
        cvv: '',
        holder: '',
        save: false
    });

    const [upiDetails, setUpiDetails] = useState({
        upiId: ''
    });

    const [walletDetails, setWalletDetails] = useState({
        provider: ''
    });

    const [netBankingDetails, setNetBankingDetails] = useState({
        bankCode: ''
    });

    const [errors, setErrors] = useState({});

    // Verify Payment on Return
    useEffect(() => {
        if (orderIdParam) {
            const verify = async () => {
                setLoading(true);
                try {
                    const result = await dispatch(verifyPayment(orderIdParam)).unwrap();
                    if (result.success) {
                        dispatch(clearCart());
                        alert("Payment Successful!");
                        navigate('/profile'); // Redirect to my orders
                    }
                } catch (error) {
                    console.error("Verification failed", error);
                    alert("Payment Verification Failed. Please contact support if money was deducted.");
                } finally {
                    setLoading(false);
                }
            };
            verify();
        }
    }, [orderIdParam, dispatch, navigate]);

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
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Session expired or token missing. Please login again.");
            window.location.href = '/login';
            return;
        }

        // Validate based on payment method
        if (selectedMethod === 'card') {
            if (!validateForm()) {
                alert('Please fill all card details correctly');
                return;
            }
        } else if (selectedMethod === 'upi') {
            if (!upiDetails.upiId || !upiDetails.upiId.includes('@')) {
                alert('Please enter a valid UPI ID');
                return;
            }
        } else if (selectedMethod === 'wallet') {
            if (!walletDetails.provider) {
                alert('Please select a wallet provider');
                return;
            }
        } else if (selectedMethod === 'netbanking') {
            if (!netBankingDetails.bankCode) {
                alert('Please select a bank');
                return;
            }
        }

        setLoading(true);

        try {
            // Map items to backend expected structure
            const orderItems = items.map(item => {
                let sku = 'UNKNOWN';
                if (item.product?.variants) {
                    const variant = item.product.variants.find(v => v.color === item.color);
                    if (variant) {
                        const option = variant.options.find(o => o.size === item.size);
                        if (option) sku = option.sku;
                    }
                }
                return {
                    productId: item.product._id,
                    sku: sku,
                    quantity: item.quantity,
                    size: item.size,
                    color: item.color
                };
            });

            // Step 1: Create Database Order (Pending)
            const dbOrderData = {
                items: orderItems,
                shippingAddress: activeAddress,
                paymentMethod: selectedMethod === 'cod' ? 'COD' : 'Online',
                paymentInfo: { method: selectedMethod === 'cod' ? 'COD' : 'Cashfree' }
            };

            const dbOrderResult = await dispatch(createDbOrder(dbOrderData)).unwrap();
            const orderId = dbOrderResult.data.orderId; // e.g. ORD-123
            const dbId = dbOrderResult.data._id;

            // Handle COD separately (no payment gateway needed)
            if (selectedMethod === 'cod') {
                const codResult = await dispatch(processCODPayment(orderId)).unwrap();

                if (codResult.success) {
                    alert("Order Confirmed! You will pay on delivery.");
                    dispatch(clearCart());
                    navigate('/profile');
                }
                return;
            }

            // Step 2: Create Cashfree Session for Online Payments
            const sessionData = {
                orderAmount: totalPrice,
                customerId: user?._id || 'guest',
                customerPhone: user?.mobileNumber || '9999999999',
                customerName: user?.firstName || 'Guest',
                customerEmail: user?.email || 'guest@example.com',
                orderId: orderId
            };

            const sessionResult = await dispatch(createPaymentOrder(sessionData)).unwrap();

            if (!sessionResult.success || !sessionResult.paymentSessionId) {
                throw new Error('Failed to create payment session');
            }

            // Step 3: Process Payment based on method
            let paymentData = {
                paymentSessionId: sessionResult.paymentSessionId,
                paymentMethod: selectedMethod
            };

            switch (selectedMethod) {
                case 'card':
                    let mm = "", yy = "";
                    if (cardDetails.expiry && cardDetails.expiry.includes('/')) {
                        [mm, yy] = cardDetails.expiry.split('/');
                    } else {
                        throw new Error("Invalid Expiry Date Format");
                    }
                    const cleanCardNumber = cardDetails.number.replace(/\s/g, '');
                    paymentData = {
                        ...paymentData,
                        card_number: cleanCardNumber,
                        card_holder_name: cardDetails.holder,
                        expiry_mm: mm,
                        expiry_yy: yy,
                        cvv: cardDetails.cvv
                    };
                    break;

                case 'upi':
                    paymentData = {
                        ...paymentData,
                        upi_id: upiDetails.upiId
                    };
                    break;

                case 'wallet':
                    paymentData = {
                        ...paymentData,
                        wallet_provider: walletDetails.provider,
                        phone: user?.mobileNumber || '9999999999',
                        customerPhone: user?.mobileNumber || '9999999999'
                    };
                    break;

                case 'netbanking':
                    paymentData = {
                        ...paymentData,
                        netbanking_bank_code: netBankingDetails.bankCode
                    };
                    break;

                default:
                    throw new Error('Invalid payment method');
            }

            const result = await dispatch(processPaymentOrder(paymentData)).unwrap();

            // Step 4: Handle Response
            if (result.url) {
                // Redirect for authentication/completion
                window.location.href = result.url;
            } else if (result.success && (result.data?.payment_status === 'SUCCESS' || result.data?.status === 'SUCCESS')) {
                // Payment Completed (rare for most methods)
                await dispatch(updateDbOrder({
                    orderId: dbId,
                    status: 'Confirmed',
                    paymentStatus: 'Paid',
                    paymentGatewayDetails: result.data
                })).unwrap();

                alert("Payment Completed!");
                dispatch(clearCart());
                navigate('/profile');
            } else {
                if (result.data?.payment_status) {
                    alert(`Payment Status: ${result.data?.payment_status}`);
                } else {
                    alert("Payment processing initiated. Please check status.");
                }
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
                                            className="w-4 h-4 accent-black border-gray-300 rounded focus:ring-gray-500"
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
                            ) : selectedMethod === 'upi' ? (
                                <div className="space-y-6">
                                    <div className="mb-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FiSmartphone size={24} className="text-purple-600" />
                                            <h3 className="text-lg font-semibold text-gray-800">Pay with UPI</h3>
                                        </div>
                                        <p className="text-sm text-gray-500">Enter your UPI ID to complete the payment</p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                                            UPI ID
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={upiDetails.upiId}
                                                onChange={(e) => setUpiDetails({ upiId: e.target.value })}
                                                placeholder="yourname@upi"
                                                className="w-full px-4 py-3 bg-gray-100 border-none rounded focus:ring-1 focus:ring-purple-400 placeholder-gray-400 text-gray-800 text-sm"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">Example: 9876543210@paytm, user@oksbi</p>
                                    </div>

                                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
                                        <p className="text-xs font-semibold text-gray-600 mb-3">Supported UPI Apps</p>
                                        <div className="flex gap-4 flex-wrap justify-center">
                                            <div className="flex flex-col items-center">
                                                <img src="https://img.icons8.com/color/48/google-pay.png" className="h-12 w-12" alt="GPay" />
                                                {/* <span className="text-xs text-gray-600 mt-1">GPay</span> */}
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <img src="https://img.icons8.com/color/48/phone-pe.png" className="h-12 w-12" alt="PhonePe" />
                                                {/* <span className="text-xs text-gray-600 mt-1">PhonePe</span> */}
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <img src="https://img.icons8.com/color/48/paytm.png" className="h-12 w-12" alt="Paytm" />
                                                {/* <span className="text-xs text-gray-600 mt-1">Paytm</span> */}
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <img src="https://img.icons8.com/color/48/bhim.png" className="h-12 w-12" alt="BHIM" />
                                                {/* <span className="text-xs text-gray-600 mt-1">BHIM</span> */}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handlePayment}
                                        disabled={loading}
                                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded font-bold text-sm uppercase transition-all disabled:opacity-50 shadow-md"
                                    >
                                        {loading ? 'Processing...' : `Pay ₹${totalPrice.toLocaleString()}`}
                                    </button>
                                </div>
                            ) : selectedMethod === 'wallet' ? (
                                <div className="space-y-6">
                                    <div className="mb-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <BsWallet2 size={24} className="text-orange-600" />
                                            <h3 className="text-lg font-semibold text-gray-800">Pay with Wallet</h3>
                                        </div>
                                        <p className="text-sm text-gray-500">Select your preferred wallet</p>
                                    </div>

                                    <div className="space-y-3">
                                        {[
                                            { id: 'phonepe', name: 'PhonePe', icon: 'https://img.icons8.com/color/48/phone-pe.png', color: 'border-purple-500' },
                                            { id: 'paytm', name: 'Paytm', icon: 'https://img.icons8.com/color/48/paytm.png', color: 'border-blue-500' },
                                            { id: 'amazonpay', name: 'Amazon Pay', icon: 'https://img.icons8.com/color/48/amazon.png', color: 'border-orange-500' },
                                            { id: 'freecharge', name: 'Freecharge', icon: 'https://img.icons8.com/fluency/48/wallet--v1.png', color: 'border-yellow-500' },
                                            { id: 'mobikwik', name: 'Mobikwik', icon: 'https://img.icons8.com/fluency/48/money-bag.png', color: 'border-red-500' },
                                        ].map(wallet => (
                                            <button
                                                key={wallet.id}
                                                onClick={() => setWalletDetails({ provider: wallet.id })}
                                                className={`w-full flex items-center gap-3 p-4 border-2 rounded-lg transition-all ${walletDetails.provider === wallet.id
                                                        ? `${wallet.color} bg-gray-50 shadow-md`
                                                        : 'border-gray-200 hover:border-gray-400 hover:shadow-sm'
                                                    }`}
                                            >
                                                <div className="flex-shrink-0">
                                                    <img src={wallet.icon} className="h-10 w-10" alt={wallet.name} />
                                                </div>
                                                <span className="font-medium text-gray-800 flex-grow text-left">{wallet.name}</span>
                                                {walletDetails.provider === wallet.id && (
                                                    <span className="ml-auto text-green-600 font-bold text-lg">✓</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={handlePayment}
                                        disabled={loading || !walletDetails.provider}
                                        className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded font-bold text-sm uppercase transition-all disabled:opacity-50 shadow-md"
                                    >
                                        {loading ? 'Processing...' : `Pay ₹${totalPrice.toLocaleString()}`}
                                    </button>
                                </div>
                            ) : selectedMethod === 'netbanking' ? (
                                <div className="space-y-6">
                                    <div className="mb-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <BsBank size={24} className="text-blue-600" />
                                            <h3 className="text-lg font-semibold text-gray-800">Net Banking</h3>
                                        </div>
                                        <p className="text-sm text-gray-500">Select your bank to proceed</p>
                                    </div>

                                    {/* <div className="bg-blue-50 p-4 rounded-lg mb-4">
                                        <div className="flex gap-3 flex-wrap justify-center">
                                            <img src="https://img.icons8.com/color/48/sbi.png" className="h-10" alt="SBI" title="State Bank of India" />
                                            <img src="https://img.icons8.com/color/48/hdfc-bank.png" className="h-10" alt="HDFC" title="HDFC Bank" />
                                            <img src="https://img.icons8.com/color/48/icici-bank.png" className="h-10" alt="ICICI" title="ICICI Bank" />
                                            <img src="https://img.icons8.com/color/48/axis-bank.png" className="h-10" alt="Axis" title="Axis Bank" />
                                            <img src="https://img.icons8.com/color/48/bank-building.png" className="h-10" alt="Other Banks" title="Other Banks" />
                                        </div>
                                    </div> */}

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                                            Select Bank
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={netBankingDetails.bankCode}
                                                onChange={(e) => setNetBankingDetails({ bankCode: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-100 border-none rounded focus:ring-1 focus:ring-blue-400 text-gray-800 text-sm appearance-none cursor-pointer"
                                            >
                                                <option value="">Choose your bank</option>
                                                <option value={3333}>🏦 Test Bank</option>
                                                <option value="3003">🏦 Axis Bank</option>
                                                <option value="3005">🏦 Bank of Baroda</option>
                                                <option value="3009">🏦 HDFC Bank</option>
                                                <option value="3010">🏦 ICICI Bank</option>
                                                <option value="3013">🏦 IDBI Bank</option>
                                                <option value="3014">🏦 IndusInd Bank</option>
                                                <option value="3020">🏦 Kotak Mahindra Bank</option>
                                                <option value="3024">🏦 Punjab National Bank</option>
                                                <option value="3027">🏦 State Bank of India</option>
                                                <option value="3029">🏦 Union Bank of India</option>
                                                <option value="3032">🏦 Yes Bank</option>
                                            </select>
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                                <FiChevronDown className="text-gray-500" />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handlePayment}
                                        disabled={loading || !netBankingDetails.bankCode}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded font-bold text-sm uppercase transition-all disabled:opacity-50 shadow-md"
                                    >
                                        {loading ? 'Processing...' : `Pay ₹${totalPrice.toLocaleString()}`}
                                    </button>
                                </div>
                            ) : selectedMethod === 'cod' ? (
                                <div className="space-y-6">
                                    <div className="text-center py-8">
                                        <BsCashCoin size={64} className="mx-auto text-gray-400 mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Cash on Delivery</h3>
                                        <p className="text-sm text-gray-500 mb-6">
                                            Pay when you receive your order at your doorstep
                                        </p>
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                                            <p className="text-sm text-blue-800">
                                                <strong>Note:</strong> Please keep exact change ready. Our delivery partner will collect ₹{totalPrice.toLocaleString()} at the time of delivery.
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handlePayment}
                                        disabled={loading}
                                        className="w-full bg-gray-400 hover:bg-gray-500 text-white py-4 rounded font-bold text-sm uppercase transition-all disabled:opacity-50"
                                        style={{ backgroundColor: '#AFAFAF' }}
                                    >
                                        {loading ? 'Processing...' : 'Confirm Order'}
                                    </button>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                                    <p className="mb-4">Select this payment method to proceed</p>
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