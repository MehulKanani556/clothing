import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slice/auth.slice';
import { FiUser, FiBox, FiCreditCard, FiMapPin, FiLock, FiTrash2, FiLogOut } from 'react-icons/fi';
import { Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ProfileDetails from '../components/profile/ProfileDetails';
import MyOrders from '../components/profile/MyOrders';
import SavedCards from '../components/profile/SavedCards';
import SavedAddress from '../components/profile/SavedAddress';
import ChangePassword from '../components/profile/ChangePassword';
import DeleteAccount from '../components/profile/DeleteAccount';

export default function ProfilePage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, loading } = useSelector((state) => state.auth);
    const [activeTab, setActiveTab] = useState('profile');

    const handleLogout = () => {
        dispatch(logout())
            .unwrap()
            .then(() => {
                navigate('/');
                toast.success("Logged out successfully");
            })
            .catch(() => toast.error("Logout failed"));
    };

    const sidebarItems = [
        { name: 'My Profile', icon: <FiUser />, id: 'profile' },
        { name: 'My Orders', icon: <FiBox />, id: 'orders' },
        { name: 'Saved Cards', icon: <FiCreditCard />, id: 'cards' },
        { name: 'Saved Address', icon: <FiMapPin />, id: 'address' },
        { name: 'Change password', icon: <FiLock />, id: 'password' },
        { name: 'Delete Account', icon: <FiTrash2 />, id: 'delete' },
    ];

    if (!loading && !user) {
        return <Navigate to="/" replace />;
    }

    if (!user) return null;

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return <ProfileDetails />;
            case 'orders':
                return <MyOrders />;
            case 'cards':
                return <SavedCards />;
            case 'address':
                return <SavedAddress />;
            case 'password':
                return <ChangePassword />;
            case 'delete':
                return <DeleteAccount />;
            default:
                return null;
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen pt-12 pb-20 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar */}
                    <div className="lg:w-1/4">
                        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 text-center">
                            <img
                                src={user.photo || 'https://via.placeholder.com/150'}
                                alt={user.firstName}
                                className="w-24 h-24 rounded-full mx-auto object-cover mb-4"
                            />
                            <h3 className="text-lg font-bold text-gray-900 capitalize">{user.firstName} {user.lastName}</h3>
                            <p className="text-sm text-gray-500">{user.email}</p>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
                            {sidebarItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors border-l-4 w-full text-left
                                        ${activeTab === item.id
                                            ? 'border-black text-black bg-gray-50'
                                            : 'border-transparent text-gray-500 hover:text-black hover:bg-gray-50'
                                        }`}
                                >
                                    {item.icon}
                                    {item.name}
                                </button>
                            ))}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors border-l-4 border-transparent text-red-500 hover:text-red-700 hover:bg-red-50 w-full text-left"
                            >
                                <FiLogOut />
                                Sign out
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:w-3/4">
                        <div className="bg-white rounded-lg shadow-sm p-8 min-h-[500px]">
                            {renderContent()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
