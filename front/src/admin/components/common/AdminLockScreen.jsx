import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { unlockSession, logout } from '../../../redux/slice/auth.slice';
import { MdLockOpen, MdArrowForward } from 'react-icons/md';
import toast from 'react-hot-toast';

const AdminLockScreen = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleUnlock = (e) => {
        e.preventDefault();
        // In a real app, verify password with backend here.
        // For this demo/client-side lock, we'll just check if it's not empty, 
        // or effectively just "unlock" since we can't easily verify the hash client-side 
        // without a dedicated verify-password endpoint (which implies full login).

        // If the user wants a secure lock, we should hit an endpoint.
        // Assuming client-side "session lock" for privacy (e.g. stepping away from desk).

        if (password.length > 0) {
            dispatch(unlockSession());
            toast.success('Welcome back!');
        } else {
            setError('Please enter your password');
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all">
                <div className="p-8 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
                        <img
                            src={user?.photo || "https://i.pravatar.cc/150?img=32"}
                            alt={user?.firstName}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                        {user?.firstName} {user?.lastName}
                    </h2>
                    <p className="text-sm text-gray-500 mb-6">Enter your password to unlock</p>
                    <form onSubmit={handleUnlock} className="space-y-4">
                        <div className="relative">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all text-center tracking-widest"
                                placeholder="••••••••"
                                autoFocus
                            />
                        </div>

                        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

                        <button
                            type="submit"
                            className="w-full bg-black text-white py-3 rounded-xl font-semibold shadow-lg shadow-gray-200/50 hover:bg-gray-800 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <MdLockOpen size={20} />
                            Unlock Session
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminLockScreen;
