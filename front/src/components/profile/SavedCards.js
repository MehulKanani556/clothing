import React, { useState } from 'react';
import { FiTrash2, FiPlus, FiX } from 'react-icons/fi';
import { FaCcMastercard, FaCcVisa } from 'react-icons/fa';

export default function SavedCards() {
    const [cards, setCards] = useState([
        { id: 1, number: '5520 0100 3356 6888', holder: 'James Smith', expiry: '12/26', type: 'mastercard' },
        { id: 2, number: '4120 0100 3356 6888', holder: 'James Smith', expiry: '10/28', type: 'visa' },
        { id: 3, number: '1520 0100 3356 6888', holder: 'James Smith', expiry: '09/25', type: 'mastercard' },
    ]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [cardToDelete, setCardToDelete] = useState(null);

    const [newCard, setNewCard] = useState({
        number: '',
        expiry: '',
        cvv: '',
        holder: ''
    });

    const [errors, setErrors] = useState({});

    // Identify card type based on number
    const getCardType = (number) => {
        const cleanNumber = number.replace(/\s+/g, '');
        if (/^4/.test(cleanNumber)) return 'visa';
        if (/^5[1-5]/.test(cleanNumber)) return 'mastercard';
        return 'mastercard'; // Default
    };

    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        if (parts.length) {
            return parts.join(' ');
        } else {
            return v;
        }
    };

    const formatExpiry = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return v.substring(0, 2) + '/' + v.substring(2, 4);
        }
        return v;
    };

    const validateCardNumber = (number) => {
        const cleanNumber = number.replace(/\s+/g, '');
        if (cleanNumber.length !== 16) return "Card number must be 16 digits";
        // Simple Luhn Algorithm can be added here if needed, but length check is often enough for UI
        return null;
    };

    const validateExpiry = (expiry) => {
        if (!expiry) return "Required";
        const parts = expiry.split('/');
        if (parts.length !== 2) return "Invalid format (MM/YY)";

        const month = parseInt(parts[0], 10);
        const year = parseInt(parts[1], 10);

        if (!month || !year || month < 1 || month > 12) return "Invalid month";

        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1; // 1-12

        if (year < currentYear || (year === currentYear && month < currentMonth)) {
            return "Card has expired";
        }

        return null;
    };

    const validateForm = () => {
        const newErrors = {};

        const numErr = validateCardNumber(newCard.number);
        if (numErr) newErrors.number = numErr;

        const expErr = validateExpiry(newCard.expiry);
        if (expErr) newErrors.expiry = expErr;

        if (!newCard.cvv || newCard.cvv.length < 3 || newCard.cvv.length > 4) {
            newErrors.cvv = "Invalid CVV";
        }

        if (!newCard.holder || newCard.holder.length < 3) {
            newErrors.holder = "Name must be at least 3 chars";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleDeleteClick = (card) => {
        setCardToDelete(card);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        setCards(cards.filter(c => c.id !== cardToDelete.id));
        setShowDeleteModal(false);
        setCardToDelete(null);
    };

    const handleAddSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const card = {
            id: Date.now(),
            number: newCard.number,
            holder: newCard.holder,
            expiry: newCard.expiry,
            type: getCardType(newCard.number)
        };
        setCards([...cards, card]);
        setNewCard({ number: '', expiry: '', cvv: '', holder: '' });
        setErrors({});
        setShowAddModal(false);
    };

    const handleNumberChange = (e) => {
        const val = e.target.value;
        // Limit to 19 characters (16 digits + 3 spaces)
        if (val.replace(/\s/g, '').length > 16) return;
        setNewCard({ ...newCard, number: formatCardNumber(val) });
        if (errors.number) setErrors({ ...errors, number: null });
    };

    const handleExpiryChange = (e) => {
        const val = e.target.value;
        // Limit to 5 chars (MM/YY)
        if (val.length > 5) return;
        setNewCard({ ...newCard, expiry: formatExpiry(val) });
        if (errors.expiry) setErrors({ ...errors, expiry: null });
    };

    const handleCvvChange = (e) => {
        const val = e.target.value.replace(/\D/g, '');
        if (val.length > 4) return;
        setNewCard({ ...newCard, cvv: val });
        if (errors.cvv) setErrors({ ...errors, cvv: null });
    };

    return (
        <div className="w-full relative">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">SAVED CARDS</h2>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-sm text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                    <FiPlus /> Add New Card
                </button>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                {cards.map((card) => (
                    <div key={card.id} className="relative bg-[#0F1115] text-white p-6 rounded-xl shadow-lg aspect-[1.586/1] flex flex-col justify-between overflow-hidden group">
                        {/* Background Gradient/Mesh Effect (subtle) */}
                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-gray-800/20 to-transparent pointer-events-none"></div>

                        {/* Card Header */}
                        <div className="flex justify-between items-start z-10">
                            {/* Logo */}
                            <div className="flex items-center gap-2">
                                {card.type === 'visa' ? (
                                    <FaCcVisa className="text-4xl text-white opacity-90" />
                                ) : (
                                    <div className="flex relative">
                                        <div className="w-8 h-8 rounded-full bg-red-600 opacity-90 z-10"></div>
                                        <div className="w-8 h-8 rounded-full bg-yellow-500 opacity-90 -ml-4"></div>
                                    </div>
                                )}
                            </div>
                            {/* Delete Button */}
                            <button
                                onClick={() => handleDeleteClick(card)}
                                className="text-red-500 hover:text-red-400 p-1 rounded-full hover:bg-white/10 transition-colors"
                            >
                                <FiTrash2 size={18} />
                            </button>
                        </div>

                        {/* Card Number */}
                        <div className="space-y-1 z-10 my-4">
                            <p className="text-xl sm:text-2xl font-mono tracking-wider">{card.number}</p>
                        </div>

                        {/* Card Footer Details */}
                        <div className="flex justify-between items-end z-10">
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase text-gray-400 tracking-wider">Card Holder Name</p>
                                <p className="text-sm font-medium tracking-wide uppercase">{card.holder}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase text-gray-400 tracking-wider">Expiry</p>
                                <p className="text-sm font-medium tracking-wide">{card.expiry}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>


            {/* Add Card Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative z-10 overflow-hidden animation-fade-in">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">Add New card</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <FiX size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddSubmit} className="p-6 space-y-6">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase">Card Number</label>
                                <input
                                    type="text"
                                    placeholder="0000 0000 0000 0000"
                                    value={newCard.number}
                                    onChange={handleNumberChange}
                                    className={`w-full bg-gray-50 border ${errors.number ? 'border-red-500' : 'border-transparent'} focus:border-black focus:bg-white rounded-md px-4 py-3 text-sm outline-none transition-all placeholder-gray-400`}
                                    required
                                />
                                {errors.number && <p className="text-red-500 text-xs mt-1">{errors.number}</p>}
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase">Expiry Date</label>
                                    <input
                                        type="text"
                                        placeholder="MM/YY"
                                        value={newCard.expiry}
                                        onChange={handleExpiryChange}
                                        className={`w-full bg-gray-50 border ${errors.expiry ? 'border-red-500' : 'border-transparent'} focus:border-black focus:bg-white rounded-md px-4 py-3 text-sm outline-none transition-all placeholder-gray-400`}
                                        required
                                    />
                                    {errors.expiry && <p className="text-red-500 text-xs mt-1">{errors.expiry}</p>}
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase">CVV</label>
                                    <input
                                        type="password"
                                        placeholder="CVV"
                                        value={newCard.cvv}
                                        onChange={handleCvvChange}
                                        maxLength={4}
                                        className={`w-full bg-gray-50 border ${errors.cvv ? 'border-red-500' : 'border-transparent'} focus:border-black focus:bg-white rounded-md px-4 py-3 text-sm outline-none transition-all placeholder-gray-400`}
                                        required
                                    />
                                    {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase">Card Holder Name</label>
                                <input
                                    type="text"
                                    placeholder="Card Holder Name"
                                    value={newCard.holder}
                                    onChange={(e) => {
                                        setNewCard({ ...newCard, holder: e.target.value });
                                        if (errors.holder) setErrors({ ...errors, holder: null });
                                    }}
                                    className={`w-full bg-gray-50 border ${errors.holder ? 'border-red-500' : 'border-transparent'} focus:border-black focus:bg-white rounded-md px-4 py-3 text-sm outline-none transition-all placeholder-gray-400`}
                                    required
                                />
                                {errors.holder && <p className="text-red-500 text-xs mt-1">{errors.holder}</p>}
                            </div>

                            <button type="submit" className="w-full bg-black text-white font-medium py-3 rounded-md hover:bg-gray-900 transition-colors uppercase text-sm tracking-wide">
                                Save card
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Card Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)}></div>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-sm relative z-10 overflow-hidden px-6 py-8 text-center">
                        <button onClick={() => setShowDeleteModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <FiX size={20} />
                        </button>

                        <h3 className="text-lg font-bold text-gray-900 mb-2">Delete</h3>
                        <p className="text-gray-500 text-sm mb-8">Are you sure you want to<br />Delete Card?</p>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 bg-white border border-gray-200 text-gray-700 font-medium py-2.5 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 bg-black text-white font-medium py-2.5 rounded-md hover:bg-gray-800 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
