import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById, updateProductReview, removeProductReview } from '../../../redux/slice/product.slice';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import { MdEdit, MdStar, MdShoppingBag, MdVisibility, MdCalendarToday, MdArrowBack, MdInventory, MdAttachMoney } from 'react-icons/md';
import DataTable from '../../components/common/DataTable';
import ReviewStatusModal from '../../components/modals/ReviewStatusModal';
import { updateReviewStatus } from '../../../redux/slice/review.slice';

const ProductsDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { product, loading, error } = useSelector((state) => state.product);

    const [selectedVariant, setSelectedVariant] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Review Modal States
    const [selectedReview, setSelectedReview] = useState(null);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('edit');

    useEffect(() => {
        if (id) {
            dispatch(fetchProductById(id));
        }
    }, [dispatch, id]);

    useEffect(() => {
        if (product && product.variants?.length > 0) {
            const defaultVar = product.variants.find(v => v.isDefault) || product.variants[0];
            setSelectedVariant(defaultVar);
            if (defaultVar.images?.length > 0) {
                setSelectedImage(defaultVar.images[0]);
            }
        }
    }, [product]);

    // Auto-slideshow for images
    useEffect(() => {
        let interval;
        if (selectedVariant?.images?.length > 1) {
            interval = setInterval(() => {
                const currentIndex = selectedVariant.images.indexOf(selectedImage);
                const nextIndex = (currentIndex + 1) % selectedVariant.images.length;
                handleImageChange(selectedVariant.images[nextIndex]);
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [selectedVariant, selectedImage]);

    const handleImageChange = (newImg) => {
        if (newImg === selectedImage) return;
        setIsTransitioning(true);
        setTimeout(() => {
            setSelectedImage(newImg);
            setIsTransitioning(false);
        }, 300);
    };

    const handleVariantChange = (variant) => {
        setSelectedVariant(variant);
        if (variant.images?.length > 0) {
            handleImageChange(variant.images[0]);
        }
    };

    const handleEditStatus = (review) => {
        setSelectedReview(review);
        setModalMode('edit');
        setIsStatusModalOpen(true);
    };

    const handleViewReview = (review) => {
        setSelectedReview(review);
        setModalMode('view');
        setIsStatusModalOpen(true);
    };

    const confirmUpdateStatus = async (newStatus) => {
        if (selectedReview) {
            const resultAction = await dispatch(updateReviewStatus({ id: selectedReview._id, status: newStatus }));
            if (updateReviewStatus.fulfilled.match(resultAction)) {
                if (newStatus !== 'Published') {
                    dispatch(removeProductReview(selectedReview._id));
                } else {
                    dispatch(updateProductReview(resultAction.payload.data));
                }
                setIsStatusModalOpen(false);
                toast.success('Review status updated successfully');
            } else {
                toast.error('Failed to update review status');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) return <div className="p-8 text-center text-red-500 font-medium">{error}</div>;
    if (!product) return <div className="p-8 text-center text-gray-500 font-medium">Product not found</div>;

    // Derived Data
    const currentPrice = selectedVariant?.options[0]?.price || 0;
    const currentStock = selectedVariant?.options?.reduce((acc, curr) => acc + curr.stock, 0) || 0;
    const currentSku = selectedVariant?.options[0]?.sku || '-';

    const reviewsColumns = [
        {
            header: 'Reviewer',
            accessor: 'user',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-bold uppercase overflow-hidden text-xs">
                        {row.user?.avatar ? <img src={row.user.avatar} className="w-full h-full object-cover" alt="" /> : (row.user?.firstName?.[0] || 'U')}
                    </div>
                    <div className="font-medium text-gray-900 text-sm">{row.user?.firstName} {row.user?.lastName}</div>
                </div>
            )
        },
        {
            header: 'Rating',
            accessor: 'rating',
            render: (row) => (
                <div className="flex text-amber-400 text-xs gap-0.5">
                    {[...Array(5)].map((_, i) => (
                        <MdStar key={i} className={i < row.rating ? 'fill-current' : 'text-gray-200'} />
                    ))}
                </div>
            )
        },
        {
            header: 'Review',
            accessor: 'review',
            render: (row) => <span className="text-gray-500 text-sm line-clamp-1">{row.review}</span>
        },
        {
            header: 'Date',
            accessor: 'createdAt',
            render: (row) => <span className="text-gray-500 text-xs">{new Date(row.createdAt).toLocaleDateString()}</span>
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => (
                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${row.status === 'Published' ? 'bg-green-100 text-green-700' : row.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                    {row.status || 'Published'}
                </span>
            )
        },
        {
            header: 'Actions',
            render: (row) => (
                <div className="flex items-center gap-2 text-gray-400">
                    <button onClick={() => handleViewReview(row)} className="hover:text-black p-1"><MdVisibility size={18} /></button>
                    <button onClick={() => handleEditStatus(row)} className="hover:text-black p-1"><MdEdit size={18} /></button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 p-6">
            <Breadcrumbs
                title='Product Details'
                items={[
                    { label: 'Dashboard', to: '/admin/dashboard' },
                    { label: 'Products', to: '/admin/products' },
                    { label: product.name }
                ]}
            />

            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <MdArrowBack size={24} />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                <span className={`px-3 py-1 text-xs rounded-full font-semibold ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {product.isActive ? 'Active' : 'Inactive'}
                </span>
            </div>

            {/* Main Product Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex flex-col md:flex-row">

                    {/* Left: Image Section */}
                    <div className="md:w-1/3 p-8 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col items-center">
                        <div className="relative mb-6 w-full aspect-square flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                            {selectedImage ? (
                                <img src={selectedImage} alt={product.name} className={`w-full h-full object-contain mix-blend-multiply transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`} />
                            ) : (
                                <div className="text-gray-300 flex flex-col items-center">
                                    <MdShoppingBag size={64} />
                                    <span className="text-xs font-bold uppercase tracking-widest mt-2">No Preview</span>
                                </div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {selectedVariant?.images?.length > 0 && (
                            <div className="flex gap-2 w-full justify-center overflow-x-auto pb-2">
                                {selectedVariant.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleImageChange(img)}
                                        className={`w-12 h-12 rounded-lg border p-1 bg-white ${selectedImage === img ? 'border-gray-900 ring-1 ring-gray-900' : 'border-gray-200 hover:border-gray-300'} transition-all`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-contain" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Details Section */}
                    <div className="md:w-2/3 p-8 space-y-8">
                        {/* Product Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</label>
                                <p className="mt-1 text-xl font-bold text-gray-900 flex items-center gap-1">
                                    ₹ {currentPrice.toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Stock</label>
                                <p className="mt-1 text-xl font-bold text-gray-900 flex items-center gap-1">
                                    {/* <MdInventory className="text-gray-400" /> */}
                                    {currentStock}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Brand</label>
                                <p className="mt-1 text-gray-900 font-medium">{product.brand}</p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU</label>
                                <p className="mt-1 text-gray-900 font-mono text-sm">{currentSku}</p>
                            </div>
                        </div>

                        <div className="border-t border-gray-100"></div>

                        {/* Description & Category */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</label>
                                <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                                    {product.description || 'No description available.'}
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</label>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium text-gray-700">{product.category?.name}</span>
                                        {product.subCategory && <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium text-gray-700">{product.subCategory.name}</span>}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Timeline</label>
                                    <p className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                                        <MdCalendarToday className="text-gray-400" size={16} />
                                        Created: {new Date(product.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100"></div>

                        {/* Variants Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Variants ({product.variants?.length})</label>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {product.variants?.map((variant, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleVariantChange(variant)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${selectedVariant?._id === variant._id ? 'border-gray-900 bg-gray-900 text-white shadow-md' : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'}`}
                                    >
                                        <div className="w-5 h-5 rounded bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                                            {variant.images?.[0] && <img src={variant.images[0]} alt="" className="w-full h-full object-cover" />}
                                        </div>
                                        <span className="font-medium">{variant.color}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Inventory Table for Selected Variant */}
                            {selectedVariant?.options?.length > 0 && (
                                <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-semibold">
                                            <tr>
                                                <th className="px-4 py-2">Size</th>
                                                <th className="px-4 py-2">SKU</th>
                                                <th className="px-4 py-2 text-right">Price</th>
                                                <th className="px-4 py-2 text-right">Stock</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {selectedVariant.options.map((opt, i) => (
                                                <tr key={i} className="hover:bg-gray-50">
                                                    <td className="px-4 py-2 font-medium text-gray-900">{opt.size}</td>
                                                    <td className="px-4 py-2 text-gray-500 font-mono text-xs">{opt.sku}</td>
                                                    <td className="px-4 py-2 text-right text-gray-700">₹{opt.price}</td>
                                                    <td className="px-4 py-2 text-right font-medium">{opt.stock}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-6">
                <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Reviews</h3>
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-semibold">{product.reviews?.length || 0}</span>
                </div>

                {product.reviews && product.reviews.length > 0 ? (
                    <DataTable
                        columns={reviewsColumns}
                        data={product.reviews}
                        selection={false}
                        searchProps={{ hidden: true }}
                    />
                ) : (
                    <div className="bg-white p-12 rounded-xl border border-gray-200 text-center text-gray-500 flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                            <MdStar size={24} />
                        </div>
                        <p>No reviews have been submitted for this product yet.</p>
                    </div>
                )}
            </div>

            <ReviewStatusModal
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                onConfirm={confirmUpdateStatus}
                review={selectedReview}
                readOnly={modalMode === 'view'}
            />
        </div>
    );
};

export default ProductsDetails;
