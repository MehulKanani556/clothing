import React, { useState } from 'react';
import { FiTrash2, FiPlus, FiX } from 'react-icons/fi';
import { FaCcMastercard, FaCcVisa } from 'react-icons/fa';

export default function SavedCards() {
    const [cards, setCards] = useState([
        { id: 1, number: '1520 0100 3356 6888', holder: 'John Smith', expiry: '24/11', type: 'mastercard' },
        { id: 2, number: '1520 0100 3356 6888', holder: 'John Smith', expiry: '24/11', type: 'mastercard' },
        { id: 3, number: '1520 0100 3356 6888', holder: 'John Smith', expiry: '24/11', type: 'mastercard' },
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
        const card = {
            id: Date.now(),
            number: newCard.number,
            holder: newCard.holder,
            expiry: newCard.expiry,
            type: 'mastercard' // simplified for now
        };
        setCards([...cards, card]);
        setNewCard({ number: '', expiry: '', cvv: '', holder: '' });
        setShowAddModal(false);
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
                                <div className="flex relative">
                                    <div className="w-8 h-8 rounded-full bg-red-600 opacity-90 z-10"></div>
                                    <div className="w-8 h-8 rounded-full bg-yellow-500 opacity-90 -ml-4"></div>
                                </div>
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
                                    placeholder="Card Number"
                                    value={newCard.number}
                                    onChange={(e) => setNewCard({ ...newCard, number: e.target.value })}
                                    className="w-full bg-gray-50 border border-transparent focus:border-black focus:bg-white rounded-md px-4 py-3 text-sm outline-none transition-all placeholder-gray-400"
                                    required
                                />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase">Expiry Date</label>
                                    <input
                                        type="text"
                                        placeholder="MM/YY"
                                        value={newCard.expiry}
                                        onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })}
                                        className="w-full bg-gray-50 border border-transparent focus:border-black focus:bg-white rounded-md px-4 py-3 text-sm outline-none transition-all placeholder-gray-400"
                                        required
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase">CVV</label>
                                    <input
                                        type="password"
                                        placeholder="CVV"
                                        value={newCard.cvv}
                                        onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value })}
                                        className="w-full bg-gray-50 border border-transparent focus:border-black focus:bg-white rounded-md px-4 py-3 text-sm outline-none transition-all placeholder-gray-400"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase">Card Holder Name</label>
                                <input
                                    type="text"
                                    placeholder="Card Holder Name"
                                    value={newCard.holder}
                                    onChange={(e) => setNewCard({ ...newCard, holder: e.target.value })}
                                    className="w-full bg-gray-50 border border-transparent focus:border-black focus:bg-white rounded-md px-4 py-3 text-sm outline-none transition-all placeholder-gray-400"
                                    required
                                />
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
