import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff } from 'react-icons/fi';
import { fetchAdminBanners, deleteBanner, toggleBannerStatus } from '../../../redux/slice/banner.slice';
import BannerModal from '../../components/modals/BannerModal';
import { toast } from 'react-hot-toast';

export default function Banners() {
    const dispatch = useDispatch();
    const { banners, loading, error } = useSelector((state) => state.banner);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);

    useEffect(() => {
        dispatch(fetchAdminBanners());
    }, [dispatch]);

    const handleEdit = (banner) => {
        setEditingBanner(banner);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this banner?')) {
            dispatch(deleteBanner(id));
        }
    };

    const handleToggleStatus = (id) => {
        dispatch(toggleBannerStatus(id));
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingBanner(null);
    };

    if (loading && !banners.length) return <div className="p-8 text-center">Loading banners...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Banners Management</h1>
                    <p className="text-gray-500 mt-1">Manage your homepage hero banners</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                    <FiPlus />
                    Add New Banner
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {banners.map((banner) => (
                    <div key={banner._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col md:flex-row h-auto md:h-80 shadow-sm hover:shadow-md transition-shadow">
                        {/* Image Section */}
                        <div className="w-full md:w-1/2 h-48 md:h-full relative bg-gray-100">
                            <img
                                src={banner.image}
                                alt={banner.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-medium">
                                Position: {banner.textPosition.toUpperCase()}
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${banner.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {banner.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                    <span className="text-xs text-gray-500">Order: {banner.order}</span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mt-4 mb-2">{banner.title.replace(/[\[\]]/g, '')}</h3>
                                <p className="text-gray-600 mb-4">{banner.subtitle.replace(/[\[\]]/g, '')}</p>
                                <div className="inline-block bg-black text-white px-6 py-2 rounded-md text-sm font-medium">
                                    {banner.buttonText}
                                </div>
                                <p className="text-xs text-gray-400 mt-2">Link: {banner.link}</p>
                            </div>

                            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => handleToggleStatus(banner._id)}
                                    className={`p-2 rounded-lg transition-colors ${banner.isActive
                                        ? 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                                        }`}
                                    title={banner.isActive ? "Deactivate" : "Activate"}
                                >
                                    {banner.isActive ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                                <button
                                    onClick={() => handleEdit(banner)}
                                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                    title="Edit"
                                >
                                    <FiEdit2 size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(banner._id)}
                                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                    title="Delete"
                                >
                                    <FiTrash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {banners.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-500">No banners found. Create your first banner!</p>
                    </div>
                )}
            </div>

            <BannerModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                editBanner={editingBanner}
            />
        </div>
    );
}