import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { changeUserPassword } from '../../redux/slice/auth.slice';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ChangePassword() {
    const dispatch = useDispatch();
    const { user, loading } = useSelector((state) => state.auth);

    const [passwords, setPasswords] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState({
        old: false,
        new: false,
        confirm: false
    });

    const [error, setError] = useState('');

    const handleChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
        setError('');
    };

    const toggleShow = (field) => {
        setShowPassword({ ...showPassword, [field]: !showPassword[field] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (passwords.newPassword !== passwords.confirmPassword) {
            setError("New passwords do not match");
            return;
        }

        if (passwords.newPassword.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (!user?.email) {
            toast.error("User email not found");
            return;
        }

        try {
            const resultAction = await dispatch(changeUserPassword({
                email: user.email,
                oldPassword: passwords.oldPassword,
                newPassword: passwords.newPassword
            }));

            if (changeUserPassword.fulfilled.match(resultAction)) {
                toast.success("Password changed successfully");
                setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                toast.error(resultAction.payload?.message || "Failed to change password");
            }
        } catch (err) {
            console.error("Failed to change password:", err);
            toast.error("An unexpected error occurred");
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Change Password</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-1">
                {/* Old Password */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">Old Password</label>
                    <div className="relative">
                        <input
                            type={showPassword.old ? "text" : "password"}
                            name="oldPassword"
                            value={passwords.oldPassword}
                            onChange={handleChange}
                            placeholder="Your Old Password"
                            className="w-full bg-gray-100 border border-transparent rounded px-4 py-3 text-sm outline-none focus:bg-white focus:border-black transition-all placeholder-gray-400"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => toggleShow('old')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword.old ? <FiEyeOff /> : <FiEye />}
                        </button>
                    </div>
                </div>

                {/* New Password */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">New Password</label>
                    <div className="relative">
                        <input
                            type={showPassword.new ? "text" : "password"}
                            name="newPassword"
                            value={passwords.newPassword}
                            onChange={handleChange}
                            placeholder="Your New Password"
                            className="w-full bg-gray-100 border border-transparent rounded px-4 py-3 text-sm outline-none focus:bg-white focus:border-black transition-all placeholder-gray-400"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => toggleShow('new')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword.new ? <FiEyeOff /> : <FiEye />}
                        </button>
                    </div>
                </div>

                {/* Confirm Password */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">Confirm Password</label>
                    <div className="relative">
                        <input
                            type={showPassword.confirm ? "text" : "password"}
                            name="confirmPassword"
                            value={passwords.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm Your Password"
                            className="w-full bg-gray-100 border border-transparent rounded px-4 py-3 text-sm outline-none focus:bg-white focus:border-black transition-all placeholder-gray-400"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => toggleShow('confirm')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword.confirm ? <FiEyeOff /> : <FiEye />}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="text-red-500 text-sm">{error}</div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white font-medium py-3.5 rounded hover:bg-gray-900 transition-colors uppercase text-sm tracking-wide disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? 'Updating...' : 'Change Password'}
                </button>
            </form>
        </div>
    );
}
