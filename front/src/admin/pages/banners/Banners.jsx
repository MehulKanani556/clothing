import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff } from 'react-icons/fi';
import { fetchAdminBanners, deleteBanner, toggleBannerStatus } from '../../../redux/slice/banner.slice';
import BannerModal from '../../components/modals/BannerModal';
import BannerPreviewModal from '../../components/modals/BannerPreviewModal'; // Import Preview Modal
import DeleteModal from '../../components/modals/DeleteModal'; // Import Delete Modal
import { toast } from 'react-hot-toast';
import Breadcrumbs from '../../components/common/Breadcrumbs';

export default function Banners() {
    const dispatch = useDispatch();
    const { banners, loading, error } = useSelector((state) => state.banner);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false); // Preview State
    const [previewBanner, setPreviewBanner] = useState(null); // Preview Data
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Delete Modal State
    const [bannerToDelete, setBannerToDelete] = useState(null); // Banner to delete

    useEffect(() => {
        dispatch(fetchAdminBanners());
    }, [dispatch]);

    const handleEdit = (banner) => {
        setEditingBanner(banner);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        setBannerToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (bannerToDelete) {
            try {
                await dispatch(deleteBanner(bannerToDelete)).unwrap();
                toast.success('Banner deleted successfully');
                setIsDeleteModalOpen(false);
                setBannerToDelete(null);
            } catch (error) {
                toast.error('Failed to delete banner');
            }
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await dispatch(toggleBannerStatus(id)).unwrap();
            toast.success('Banner status updated');
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handlePreview = (banner) => {
        setPreviewBanner(banner);
        setIsPreviewOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingBanner(null);
    };

    const renderHighlightedText = (text, highlightColor) => {
        if (!text) return null;
        return text.split(/\[(.*?)\]/).map((part, i) =>
            i % 2 === 1 ? (
                <span key={i} style={{ color: highlightColor }}>{part}</span>
            ) : (
                <span key={i}>{part}</span>
            )
        );
    };

    if (loading && !banners.length) return <div className="p-8 text-center">Loading banners...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="p-6 bg-[#f9f9f9]">
            <Breadcrumbs
                title="Banners"
                items={[
                    { label: 'Dashboard', to: '/admin/dashboard' },
                    { label: 'Banners' },
                ]}
            />
            <div className="flex justify-end mb-6">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
                >
                    <FiPlus />
                    Add New
                </button>
            </div>
            <div className="grid grid-cols-1 gap-6">
                {banners.map((banner) => (
                    <div key={banner._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col md:flex-row h-auto md:h-80 shadow-sm hover:shadow-md transition-shadow group">
                        {/* Image Section */}
                        <div className="w-full md:w-1/2 h-48 md:h-full relative bg-gray-100 overflow-hidden">
                            <img
                                src={banner.image}
                                alt={banner.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                                {banner.textPosition.toUpperCase()}
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${banner.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {banner.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">Order: {banner.order}</span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mt-5 mb-2 line-clamp-2">{renderHighlightedText(banner.title, banner.highlightColor)}</h3>
                                <p className="text-gray-600 mb-4 line-clamp-2">{renderHighlightedText(banner.subtitle, banner.subtitleHighlightColor || '#ECA72C')}</p>

                                <div className="inline-block bg-black text-white px-5 py-2 rounded-md text-sm font-bold tracking-wide">
                                    {banner.buttonText}
                                </div>
                                <p className="text-xs text-gray-400 mt-3 truncate font-mono bg-gray-50 p-1 rounded w-fit max-w-full">Link: {banner.link}</p>
                            </div>

                            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-2 mr-auto md:mr-0">
                                    <span className="text-xs text-gray-400 font-medium">Status</span>
                                    <button
                                        onClick={() => handleToggleStatus(banner._id)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-0 focus:ring-black ${banner.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                                        title={banner.isActive ? "Deactivate" : "Activate"}
                                    >
                                        <span
                                            className={`${banner.isActive ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                        />
                                    </button>
                                </div>
                                <button
                                    onClick={() => handlePreview(banner)}
                                    className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                                    title="Preview"
                                >
                                    <FiEye size={18} />
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

            <BannerPreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                banner={previewBanner}
            />

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Banner"
                message="Are you sure you want to delete this banner? This action cannot be undone."
            />
        </div>
    );
}