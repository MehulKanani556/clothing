import React, { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel, DialogTitle } from '@headlessui/react'
import { XMarkIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { login, register, forgotPassword, verifyOtp, resetPassword, clearMessage, verifyRegistration } from '../redux/slice/auth.slice';

export default function AuthModal({ isOpen, closeModal, initialView = 'login' }) {
    const [view, setView] = useState(initialView);
    const dispatch = useDispatch();
    const { loading, error, message, isAuthenticated } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        mobileNo: '',
        otp: ['', '', '', '', '', ''] // Assuming 4 or 6 digits, let's go with 4 based on typical flows or 6. User code had 4 digits random.
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setView(initialView);
            setFormData({
                email: '',
                password: '',
                confirmPassword: '',
                firstName: '',
                lastName: '',
                mobileNo: '',
                otp: ['', '', '', '', '', '']
            });
        }
    }, [isOpen, initialView]);

    useEffect(() => {
        if (isAuthenticated && isOpen) {
            dispatch(clearMessage());
            closeModal();
        }
    }, [isAuthenticated, isOpen, closeModal]);

    useEffect(() => {
        if (error || message) {
            dispatch(clearMessage());
        }
    }, [view]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleOtpChange = (element, index) => {
        if (isNaN(element.value)) return false;

        const otp = [...formData.otp];
        otp[index] = element.value;
        setFormData({ ...formData, otp });

        // Focus next input
        if (element.nextSibling && element.value) {
            element.nextSibling.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const data = e.clipboardData.getData('text');
        if (!/^\d+$/.test(data)) return;

        const digits = data.split('').slice(0, 6);
        const newOtp = [...formData.otp];

        digits.forEach((digit, index) => {
            if (index < 6) {
                newOtp[index] = digit;
            }
        });

        setFormData({ ...formData, otp: newOtp });
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !formData.otp[index] && index > 0) {
            e.preventDefault();
            const prevInput = e.target.previousSibling;
            if (prevInput) {
                prevInput.focus();
            }
        }
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        if (view === 'login') {
            dispatch(login({ email: formData.email, password: formData.password }));
        } else if (view === 'register') {
            const userData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
                mobileNumber: formData.mobileNo,
                role: 'user',
                photo:''// Placeholder
            };
            dispatch(register(userData)).then((res) => {
                if (res.meta.requestStatus === 'fulfilled') {
                    setView('verify-registration-otp');
                }
            });
        } else if (view === 'forgot-password') {
            dispatch(forgotPassword(formData.email)).then((res) => {
                if (res.meta.requestStatus === 'fulfilled') {
                    setView('verify-otp');
                }
            });
        } else if (view === 'verify-otp') {
            const otpValue = formData.otp.join('');
            dispatch(verifyOtp({ email: formData.email, otp: otpValue })).then((res) => {
                if (res.meta.requestStatus === 'fulfilled') {
                    setView('reset-password');
                }
            });
        } else if (view === 'verify-registration-otp') { // New case
            const otpValue = formData.otp.join('');
            dispatch(verifyRegistration({ email: formData.email, otp: otpValue })).then((res) => {

            });
        } else if (view === 'reset-password') {
            if (formData.password !== formData.confirmPassword) {
                alert("Passwords do not match");
                return;
            }
            dispatch(resetPassword({ email: formData.email, newPassword: formData.password })).then((res) => {
                if (res.meta.requestStatus === 'fulfilled') {
                    setView('login');
                }
            });
        }
    };

    const renderView = () => {
        switch (view) {
            case 'login':
                return (
                    <>
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Sign in</h2>
                            <p className="text-sm text-gray-500 mt-1">Welcome back! Please sign in.</p>
                        </div>
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Your Email"
                                    className="w-full rounded-md border-0 bg-gray-100 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-black placeholder:text-gray-400 sm:text-sm sm:leading-6"
                                    value={formData.email} onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="Your Password"
                                        className="w-full rounded-md border-0 bg-gray-100 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-black placeholder:text-gray-400 sm:text-sm sm:leading-6"
                                        value={formData.password} onChange={handleChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeSlashIcon className="h-5 w-5" aria-hidden="true" /> : <EyeIcon className="h-5 w-5" aria-hidden="true" />}
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 accent-black focus:ring-black"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-xs text-gray-500">
                                        Remember Me
                                    </label>
                                </div>
                                <div className="text-sm">
                                    <button type="button" onClick={() => setView('forgot-password')} className="font-semibold text-red-600 hover:text-red-500 text-xs">
                                        Forgot Password?
                                    </button>
                                </div>
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex w-full justify-center rounded-md bg-black px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                                >
                                    {loading ? 'Signing in...' : 'Sign in'}
                                </button>
                            </div>
                        </form>
                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="bg-white px-2 text-gray-500">OR</span>
                                </div>
                            </div>
                            <div className="mt-6 grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1"
                                >
                                    <FaGoogle className="h-4 w-4 text-red-500" />
                                    <span>Google</span>
                                </button>
                                <button
                                    type="button"
                                    className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1"
                                >
                                    <FaFacebook className="h-4 w-4 text-blue-600" />
                                    <span>Facebook</span>
                                </button>
                            </div>
                        </div>
                        <p className="mt-6 text-center text-xs text-gray-500">
                            Didn't have an account?{' '}
                            <button onClick={() => setView('register')} className="font-semibold leading-6 text-gray-900 border-b border-gray-900">
                                Create Account
                            </button>
                        </p>
                    </>
                );
            case 'register':
                return (
                    <>
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
                            <p className="text-sm text-gray-500 mt-1">Register your account easily.</p>
                        </div>
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                    <input type="text" name="firstName" placeholder="First Name" className="w-full rounded-md border-0 bg-gray-100 px-3 py-2 text-gray-900" value={formData.firstName} onChange={handleChange} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                    <input type="text" name="lastName" placeholder="Last Name" className="w-full rounded-md border-0 bg-gray-100 px-3 py-2 text-gray-900" value={formData.lastName} onChange={handleChange} required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile No</label>
                                <div className="flex">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                        +91
                                    </span>
                                    <input type="text" name="mobileNo" placeholder="Your Mobile No" className="w-full rounded-r-md border-0 bg-gray-100 px-3 py-2 text-gray-900" value={formData.mobileNo} onChange={handleChange} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input type="email" name="email" placeholder="Your Email" className="w-full rounded-md border-0 bg-gray-100 px-3 py-2 text-gray-900" value={formData.email} onChange={handleChange} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <div className="relative">
                                    <input type={showPassword ? "text" : "password"} name="password" placeholder="Your Password" className="w-full rounded-md border-0 bg-gray-100 px-3 py-2 text-gray-900" value={formData.password} onChange={handleChange} required />
                                    <button type="button" className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <button type="submit" disabled={loading} className="flex w-full justify-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800">
                                    {loading ? 'Creating...' : 'Create Account'}
                                </button>
                            </div>
                        </form>
                        <p className="mt-6 text-center text-xs text-gray-500">
                            Already have an account?{' '}
                            <button onClick={() => setView('login')} className="font-semibold leading-6 text-gray-900 border-b border-gray-900">
                                Sign In
                            </button>
                        </p>
                    </>
                )
            case 'forgot-password':
                return (
                    <>
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Forgot Password?</h2>
                            <p className="text-xs text-gray-500 mt-1">To recover your account, please enter your email below.</p>
                        </div>
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input type="email" name="email" placeholder="Your Email" className="w-full rounded-md border-0 bg-gray-100 px-3 py-2 text-gray-900" value={formData.email} onChange={handleChange} required />
                            </div>
                            <button type="submit" disabled={loading} className="flex w-full justify-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800">
                                {loading ? 'Sending...' : 'Send Code'}
                            </button>
                        </form>
                    </>
                )
            case 'verify-otp':
                return (
                    <>
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Verify OTP</h2>
                            <div className="text-xs text-gray-500 mt-1">
                                <p>We've sent a code to <span className="font-bold">{formData.email}</span></p>
                                <p>Please enter it to verify your Email.</p>
                            </div>
                        </div>
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div className="flex justify-center gap-2">
                                {formData.otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        placeholder="_"
                                        type="text"
                                        maxLength="1"
                                        className="w-10 h-10 text-center rounded-md border bg-gray-100 text-gray-900 focus:ring-2 focus:ring-black"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(e.target, index)}
                                        onFocus={e => e.target.select()}
                                        onPaste={handleOtpPaste}
                                        onKeyDown={(e) => handleKeyDown(e, index)}
                                    />
                                ))}
                            </div>
                            <button type="submit" disabled={loading} className="flex w-full justify-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800">
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </button>
                        </form>
                        <p className="mt-4 text-center text-xs text-gray-500">
                            Didn't receive code? <button onClick={() => dispatch(forgotPassword(formData.email))} className="font-semibold text-gray-900">Resend</button>
                        </p>
                    </>
                )
            case 'verify-registration-otp': // UI for Registration OTP
                return (
                    <>
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Verify OTP</h2>
                            <div className="text-xs text-gray-500 mt-1">
                                <p>We've sent a code to <span className="font-bold">{formData.email}</span></p>
                                <p>Please enter it to verify your Email.</p>
                            </div>
                        </div>
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div className="flex justify-center gap-2">
                                {formData.otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        type="text"
                                        maxLength="1"
                                        className="w-10 h-10 text-center rounded-md border bg-gray-100 text-gray-900 focus:ring-2 focus:ring-black"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(e.target, index)}
                                        onFocus={e => e.target.select()}
                                        onPaste={handleOtpPaste}
                                        onKeyDown={(e) => handleKeyDown(e, index)}
                                    />
                                ))}
                            </div>
                            <button type="submit" disabled={loading} className="flex w-full justify-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800">
                                {loading ? 'Creating Account...' : 'Verify & Create'}
                            </button>
                        </form>
                        {/* Resend Logic for Registration? Might need a different action or just re-trigger register */}
                    </>
                )
            case 'reset-password':
                return (
                    <>
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Reset Password</h2>
                            <p className="text-xs text-gray-500 mt-1">Create a unique password.</p>
                        </div>
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                <div className="relative">
                                    <input type={showPassword ? "text" : "password"} name="password" placeholder="New Password" className="w-full rounded-md border-0 bg-gray-100 px-3 py-2 text-gray-900" value={formData.password} onChange={handleChange} required />
                                    <button type="button" className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                <div className="relative">
                                    <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm Password" className="w-full rounded-md border-0 bg-gray-100 px-3 py-2 text-gray-900" value={formData.confirmPassword} onChange={handleChange} required />
                                    <button type="button" className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                        {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="flex w-full justify-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800">
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    </>
                )
            default:
                return null;
        }
    }

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={closeModal}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="w-full max-w-4xl transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl transition-all h-[600px] flex">
                                {/* Image Section */}
                                <div className={`hidden md:block md:w-1/2 relative `}>
                                    <img
                                        src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80"
                                        alt="Auth Background"
                                        className="absolute inset-0 h-full w-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/10"></div>
                                </div>

                                {/* Form Section */}
                                <div className="w-full md:w-1/2 p-8 md:p-12 relative flex flex-col justify-center">
                                    <button
                                        type="button"
                                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
                                        onClick={closeModal}
                                    >
                                        <span className="sr-only">Close</span>
                                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                    </button>

                                    {error && (
                                        <div className="mb-4 bg-red-50 p-2 text-sm text-red-600 rounded">
                                            {typeof error === 'string' ? error : error.message || 'An error occurred'}
                                        </div>
                                    )}
                                    {message && (
                                        <div className="mb-4 bg-green-50 p-2 text-sm text-green-600 rounded">
                                            {message}
                                        </div>
                                    )}

                                    {renderView()}
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
