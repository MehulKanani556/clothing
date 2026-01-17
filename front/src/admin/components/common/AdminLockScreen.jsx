import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { unlockSession, logout, verifyPassword } from '../../../redux/slice/auth.slice';
import { MdLockOpen, MdArrowForward } from 'react-icons/md';
import toast from 'react-hot-toast';

const AdminLockScreen = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleUnlock = async (e) => {
        e.preventDefault();
        if (!password) {
            setError('Please enter your password');
            return;
        }

        try {
            setLoading(true);
            setError('');
            // Verify password by attempting to login again
            await dispatch(verifyPassword({ email: user?.email, password })).unwrap();
            dispatch(unlockSession());
            toast.success('Welcome back!');
            setPassword('');
        } catch (err) {
            setError(err?.message || 'Incorrect password! Please try again.');
        } finally {
            setLoading(false);
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
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all text-center tracking-widest disabled:bg-gray-100 disabled:text-gray-400"
                                placeholder="••••••••"
                                autoFocus
                                disabled={loading}
                            />
                        </div>

                        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white py-3 rounded-xl font-semibold shadow-lg shadow-gray-200/50 hover:bg-gray-800 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Unlocking...
                                </span>
                            ) : (
                                <>
                                    <MdLockOpen size={20} />
                                    Unlock Session
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminLockScreen;
