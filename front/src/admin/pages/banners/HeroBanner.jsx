import React, { useEffect, useState } from 'react'
import Breadcrumbs from '../../components/common/Breadcrumbs'
import HeroBannerModal from '../../components/modals/HeroBannerModal';
import HeroBannerViewModal from '../../components/modals/HeroBannerViewModal';
import { FiEdit2, FiEye, FiPlus, FiTrash2 } from 'react-icons/fi';
import { deleteHeroBanner, fetchAdminHeroBanners } from '../../../redux/slice/heroBanner.slice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import DeleteModal from '../../components/modals/DeleteModal';

export default function HeroBanner() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewingBanner, setViewingBanner] = useState(null);
    const dispatch = useDispatch();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Delete Modal State
    const [bannerToDelete, setBannerToDelete] = useState(null); // Banner to delete
    const { heroBanners, loading, error } = useSelector((state) => state.heroBanner);

    useEffect(() => {
        dispatch(fetchAdminHeroBanners());
    }, []);

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingBanner(null);
    };

    const handleEdit = (banner) => {
        setEditingBanner(banner);
        setIsModalOpen(true);
    };

    const handleView = (banner) => {
        setViewingBanner(banner);
        setIsViewModalOpen(true);
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

    const handleDelete = (id) => {
        setBannerToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (bannerToDelete) {
            try {
                await dispatch(deleteHeroBanner(bannerToDelete)).unwrap();
                toast.success('Hero Banner deleted successfully');
                setIsDeleteModalOpen(false);
                setBannerToDelete(null);
            } catch (error) {
                toast.error('Failed to delete hero banner');
            }
        }
    };

    if (loading && !heroBanners.length) return <div className="p-8 text-center">Loading heroBanners...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className='p-6 bg-[#f9f9f9]'>
            <Breadcrumbs
                title="Hero Banner"
                items={[
                    { label: 'Dashboard', to: '/admin/dashboard' },
                    { label: 'Banner' },
                    { label: 'Hero Banner' },
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

            <div className="grid grid-cols-1 gap-12">
                {heroBanners.map((banner) => (
                    <div key={banner._id} className="relative w-full h-[600px] bg-[#f5f5f7] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl group border border-gray-200">
                        {/* Background Image */}
                        <div className="absolute inset-0 w-full h-full">
                            <img
                                src={banner.image}
                                alt={banner.title}
                                className="w-full h-full object-cover object-center transition-transform duration-[2000ms] ease-out group-hover:scale-105"
                            />
                            {/* Complex Gradient Overlay to mimic HeroSection */}
                            <div className={`absolute inset-0 bg-gradient-to-r ${banner.backgroundColor} via-white/40 to-white/10 mix-blend-multiply opacity-60`} />
                            <div className={`absolute inset-0 bg-gradient-to-r from-white via-white/60 to-transparent`} />
                        </div>

                        {/* Content Container */}
                        <div
                            className={`absolute inset-0 flex items-center p-8 md:p-20 
                                ${banner.textPosition === 'right' ? 'justify-end' : 'justify-start'}
                            `}
                        >
                            <div className={`max-w-2xl relative z-10 ${banner.textPosition === 'right' ? 'text-right items-end flex flex-col' : 'text-left items-start'}`}>
                                {/* Subtitle */}
                                {banner.subtitle && (
                                    <div className="mb-4 animate-float">
                                        <span
                                            className="font-black tracking-[0.3em] uppercase text-sm block"
                                            style={{ color: banner.subtitleHighlightColor || '#ECA72C' }}
                                        >
                                            <span className="inline-block border-b-2 border-current pb-1">
                                                {renderHighlightedText(banner.subtitle, banner.subtitleHighlightColor || '#ECA72C')}
                                            </span>
                                        </span>
                                    </div>
                                )}

                                {/* Title */}
                                <h1
                                    className="text-5xl md:text-7xl font-black leading-[0.9] mb-6 drop-shadow-sm tracking-tight"
                                    style={{ color: banner.textColor }}
                                >
                                    {renderHighlightedText(banner.title, banner.titleHighlightColor)}
                                </h1>

                                {/* Description */}
                                {banner.description && (
                                    <p
                                        className="mt-4 text-gray-700 text-lg md:text-xl mb-10 leading-relaxed max-w-md font-medium"
                                        style={{ color: banner.descriptionColor || '#374151' }}
                                    >
                                        {banner.description}
                                    </p>
                                )}

                                {/* Button */}
                                <button
                                    className="group/btn relative overflow-hidden px-8 py-4 rounded-[4px] text-sm font-bold uppercase tracking-widest shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                                    style={{ backgroundColor: banner.buttonColor, color: '#ffffff' }}
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        {banner.buttonText}
                                        <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                    </span>
                                    <div className="absolute inset-0 bg-white/20 transform scale-x-0 origin-left transition-transform duration-500 ease-out group-hover/btn:scale-x-100"></div>
                                </button>
                            </div>
                        </div>

                        {/* Top Bar Actions (Always Visible) */}
                        <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-20">
                            {/* Status Badge */}
                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm backdrop-blur-md ${banner.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                }`}>
                                {banner.isActive ? 'Active' : 'Inactive'}
                            </span>

                            {/* Edit/Delete Controls */}
                            <div className="flex bg-white/90 backdrop-blur-md rounded-lg shadow-sm border border-gray-100/50 overflow-hidden">
                                <button
                                    onClick={() => handleView(banner)}
                                    className="p-3 hover:bg-blue-50 text-blue-600 transition-colors border-r border-gray-100/50"
                                    title="View"
                                >
                                    <FiEye size={18} />
                                </button>
                                <button
                                    onClick={() => handleEdit(banner)}
                                    className="p-3 hover:bg-gray-50 text-gray-700 transition-colors border-r border-gray-100/50"
                                    title="Edit"
                                >
                                    <FiEdit2 size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(banner._id)}
                                    className="p-3 hover:bg-red-50 text-red-500 transition-colors"
                                    title="Delete"
                                >
                                    <FiTrash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}


                {heroBanners.length === 0 && (
                    <div className="text-center py-24 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-500 text-xl font-medium">No hero banners found.</p>
                        <p className="text-gray-400 mt-2">Create your first banner to get started!</p>
                    </div>
                )}
            </div>

            <HeroBannerModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                editBanner={editingBanner}
            />

            <HeroBannerViewModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                banner={viewingBanner}
            />

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Hero Banner"
                message="Are you sure you want to delete this hero banner? This action cannot be undone."
            />
        </div>
    )
}