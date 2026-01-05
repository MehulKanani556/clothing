import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { deleteMyAccount } from '../../redux/slice/auth.slice';
import toast from 'react-hot-toast';
import { FiX } from 'react-icons/fi';

export default function DeleteAccount() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, loading } = useSelector((state) => state.auth);
    const [showModal, setShowModal] = useState(false);

    // OTP State Integration (Mock flow based on image, real flow needs backend otp support)
    // The requirement implies just UI flow for now or triggering the actual delete which is available at backend.
    // The backend `deleteUser` does not currently require OTP. We will implement the UI as requested
    // but the final action will call the existing delete endpoint.
    // If real OTP is needed for delete, backend needs update. 
    // Assuming we simulate OTP or just use the UI for confirmation as per current backend capability.

    const [step, setStep] = useState(1); // 1: Initial Modal, 2: OTP Verification
    const [otp, setOtp] = useState(['', '', '', '', '']); // 5 digit OTP as per image

    // Derive contact info dynamically
    const contactInfo = user?.mobileNumber || user?.email;
    const contactType = user?.mobileNumber ? 'Mobile No' : 'Email';

    const handleDeleteClick = () => {
        setShowModal(true);
        setStep(1);
    };

    const handleSendOtp = () => {
        // In a real app, dispatch(sendDeleteOtp()) here
        toast.success(`OTP Sent to your ${contactType === 'Mobile No' ? 'mobile' : 'email'}`);
        setStep(2);
    };

    const handleOtpChange = (index, value) => {
        if (value.length > 1) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto move to next input
        if (value && index < 4) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const confirmDelete = async () => {
        // Here we would verify OTP. Since backend doesn't have verify-delete-otp, 
        // we proceed to delete directly after UI "verification".

        // Check if OTP is entered (simulation)
        if (otp.join('').length !== 5) {
            toast.error("Please enter valid OTP");
            return;
        }

        try {
            if (!user?._id) return;

            const resultAction = await dispatch(deleteMyAccount(user._id));
            if (deleteMyAccount.fulfilled.match(resultAction)) {
                toast.success("Account deleted successfully");
                navigate('/');
            } else {
                toast.error(resultAction.payload?.message || "Failed to delete account");
            }
        } catch (err) {
            console.error(err);
            toast.error("An error occurred");
        }
    };

    return (
        <div className="w-full">
            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide mb-8">DELETE ACCOUNT</h2>

            <div className="bg-white border border-gray-100 rounded-lg p-8">
                <p className="font-medium text-gray-900 mb-4">When you deactivate your account</p>

                <ul className="space-y-3 text-sm text-gray-500 mb-8 list-none">
                    <li className="flex gap-2">
                        <span>-</span>
                        <span>You are logged out of your Quickcart Account</span>
                    </li>
                    <li className="flex gap-2">
                        <span>-</span>
                        <span>Your public profile on Quickcart is no longer visible</span>
                    </li>
                    <li className="flex gap-2">
                        <span>-</span>
                        <span>Your reviews/ratings are still visible, while your profile information is shown as 'unavailable' as a result of deactivation.</span>
                    </li>
                    <li className="flex gap-2">
                        <span>-</span>
                        <span>Your wishlist items are no longer accessible through the associated public hyperlink. Wishlist is shown as 'unavailable' as a result of deactivation</span>
                    </li>
                    <li className="flex gap-2">
                        <span>-</span>
                        <span>You will be unsubscribed from receiving promotional emails from Quickcart.</span>
                    </li>
                    <li className="flex gap-2">
                        <span>-</span>
                        <span>Your account data is retained and is restored in case you choose to reactivate your account</span>
                    </li>
                    <li className="flex gap-2">
                        <span>-</span>
                        <span>Your wishlist items are no longer accessible through the associated public hyperlink. Wishlist is shown as 'unavailable' as a result of deactivation</span>
                    </li>
                    <li className="flex gap-2">
                        <span>-</span>
                        <span>You will be unsubscribed from receiving promotional emails from Quickcart.</span>
                    </li>
                </ul>

                <button
                    onClick={handleDeleteClick}
                    className="bg-black text-white px-8 py-3 rounded text-sm font-medium hover:bg-gray-900 transition-colors uppercase tracking-wide"
                >
                    Delete my account
                </button>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative z-10 overflow-hidden animation-fade-in p-8 text-center">
                        <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <FiX size={20} />
                        </button>

                        <h3 className="text-lg font-bold text-gray-900 mb-6">Delete Account</h3>

                        {step === 1 ? (
                            <>
                                <p className="text-gray-600 text-sm mb-6">
                                    Are you sure you want delete your<br />account?
                                </p>

                                <div className="mb-6">
                                    <label className="block text-left text-xs font-medium text-gray-500 mb-1.5 uppercase">{contactType}</label>
                                    <div className="flex bg-gray-50 rounded border border-gray-200 overflow-hidden">
                                        {contactType === 'Mobile No' && <div className="px-3 py-2.5 text-gray-500 text-sm border-r border-gray-200">+91</div>}
                                        <input
                                            type="text"
                                            value={contactInfo || ''}
                                            readOnly
                                            className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none text-gray-700"
                                        />
                                        <button
                                            onClick={handleSendOtp}
                                            className="px-4 py-2.5 text-xs font-bold text-gray-900 hover:bg-gray-100 transition-colors uppercase border-l border-gray-200"
                                        >
                                            Send OTP
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="text-gray-600 text-sm mb-6">
                                    Are you sure you want delete your<br />account?
                                </p>
                                <div className="mb-6">
                                    <label className="block text-left text-xs font-medium text-gray-500 mb-1.5 uppercase">{contactType}</label>
                                    {/* Showing just the OTP inputs now as per typical 2-step or the image implies combined. 
                                        The image shows both Send OTP button AND OTP inputs. Let's combine them for Step 2 */}
                                    <div className="flex bg-gray-50 rounded border border-gray-200 overflow-hidden mb-4 opacity-75">
                                        {contactType === 'Mobile No' && <div className="px-3 py-2.5 text-gray-500 text-sm border-r border-gray-200">+91</div>}
                                        <input
                                            type="text"
                                            value={contactInfo || ''}
                                            readOnly
                                            className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none text-gray-700"
                                        />
                                        <button
                                            disabled
                                            className="px-4 py-2.5 text-xs font-bold text-gray-400 uppercase border-l border-gray-200"
                                        >
                                            Sent
                                        </button>
                                    </div>

                                    <div className="flex justify-between gap-3 mb-2">
                                        {otp.map((digit, index) => (
                                            <input
                                                key={index}
                                                id={`otp-${index}`}
                                                type="text"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                                className="w-12 h-12 text-center text-lg font-bold bg-gray-50 border border-gray-200 rounded focus:border-black focus:bg-white outline-none transition-all"
                                            />
                                        ))}
                                    </div>
                                    <div className="text-right">
                                        <button onClick={handleSendOtp} className="text-[10px] font-medium text-gray-900 hover:underline">Resend?</button>
                                        <span className="text-[10px] text-gray-400 mx-1">Didn't received code?</span>
                                    </div>
                                </div>
                            </>
                        )}

                        <button
                            onClick={step === 2 ? confirmDelete : () => toast.error("Please Send OTP first")}
                            className="w-full bg-black text-white font-medium py-3 rounded hover:bg-gray-900 transition-colors uppercase text-sm tracking-wide"
                        >
                            Delete my Account
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
