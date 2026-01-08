import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById, updateProductReview, removeProductReview } from '../../../redux/slice/product.slice';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import { MdEdit, MdStar, MdShoppingBag, MdInventory, MdCheckCircle, MdVisibility } from 'react-icons/md';
import DataTable from '../../components/common/DataTable';
import ReviewStatusModal from '../../components/modals/ReviewStatusModal';
import { updateReviewStatus } from '../../../redux/slice/review.slice';

const ProductsDetails = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { product, loading, error } = useSelector((state) => state.product);

    const [selectedVariant, setSelectedVariant] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        if (id) {
            dispatch(fetchProductById(id));
        }
    }, [dispatch, id]);

    useEffect(() => {
        if (product && product.variants?.length > 0) {
            // Default to the first variant or the one marked isDefault
            const defaultVar = product.variants.find(v => v.isDefault) || product.variants[0];
            setSelectedVariant(defaultVar);
            if (defaultVar.images?.length > 0) {
                setSelectedImage(defaultVar.images[0]);
            }
        }
    }, [product]);

    const handleVariantChange = (variant) => {
        setSelectedVariant(variant);
        if (variant.images?.length > 0) {
            setSelectedImage(variant.images[0]);
        }
    };

    const [isTransitioning, setIsTransitioning] = useState(false);

    // Review Modal States
    const [selectedReview, setSelectedReview] = useState(null);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('edit'); // 'edit' or 'view'

    useEffect(() => {
        if (!selectedVariant?.images || selectedVariant.images.length <= 1) return;

        const interval = setInterval(() => {
            setIsTransitioning(true);
            setTimeout(() => {
                setSelectedImage(prev => {
                    const currentIndex = selectedVariant.images.indexOf(prev);
                    const nextIndex = (currentIndex + 1) % selectedVariant.images.length;
                    return selectedVariant.images[nextIndex];
                });
                setIsTransitioning(false);
            }, 500);
        }, 3000);

        return () => clearInterval(interval);
    }, [selectedVariant]);

    // Review Handlers
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

    if (error) {
        return <div className="p-8 text-center text-red-500">{error}</div>;
    }

    if (!product) {
        return <div className="p-8 text-center text-gray-500">Product not found</div>;
    }

    // Derived Data
    const currentPrice = selectedVariant?.options[0]?.price || 0;
    const mrp = selectedVariant?.options[0]?.mrp || 0;
    const discount = mrp > 0 ? Math.round(((mrp - currentPrice) / mrp) * 100) : 0;
    const currentSku = selectedVariant?.options[0]?.sku || 'N/A';
    const currentStock = selectedVariant?.options?.reduce((acc, curr) => acc + curr.stock, 0) || 0;
    const totalOrders = product.orderCount || 0;
    const totalRevenue = product.totalEarnings || 0;

    // Calculate Rating Breakdown Percentages
    const totalReviews = product.rating?.count || 0;
    const breakdownCounts = product.rating?.breakdown || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    // Create array [5, 4, 3, 2, 1] with percentages
    const ratingPercentages = [5, 4, 3, 2, 1].map(star => {
        const count = breakdownCounts[star] || 0;
        return totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    });

    const reviewsColumns = [
        {
            header: 'Reviewer',
            accessor: 'user',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700 font-bold uppercase overflow-hidden shrink-0 text-xs">
                        {row.user?.avatar ?
                            <img src={row.user.avatar} className="w-full h-full object-cover" alt="" />
                            : (row.user?.firstName?.[0] || 'U')}
                    </div>
                    <div>
                        <div className="font-bold text-gray-900 leading-tight">{row.user?.firstName} {row.user?.lastName}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{row.user?.email || 'user@example.com'}</div>
                    </div>
                </div>
            )
        },
        {
            header: 'Review',
            accessor: 'review',
            render: (row) => (
                <div className="max-w-md">
                    <div className="flex text-amber-400 text-xs mb-1.5">
                        {[...Array(5)].map((_, i) => (
                            <MdStar key={i} className={i < row.rating ? 'fill-current' : 'text-gray-200'} size={14} />
                        ))}
                    </div>
                    {row.title && <div className="font-bold text-gray-800 text-sm mb-1">{row.title}</div>}
                    <p className="text-gray-500 italic text-xs leading-relaxed line-clamp-2 transition-all">
                        "{row.review}"
                    </p>
                </div>
            )
        },
        {
            header: 'Date',
            accessor: 'createdAt',
            sortable: true,
            render: (row) => (
                <div className="text-gray-500 text-xs whitespace-nowrap">
                    {new Date(row.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    })}
                    <div className="text-xs text-gray-500 mt-1">
                        {new Date(row.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            )
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${row.status === 'Published' ? 'bg-emerald-100 text-emerald-700' :
                    row.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-600'
                    }`}>
                    {row.status || 'Published'}
                </span>
            )
        },
        {
            header: 'Actions',
            accessor: 'actions',
            render: (row) => (
                <div className="flex items-center justify-center gap-2 text-gray-400">
                    <button onClick={() => handleViewReview(row)} className="hover:text-black transition-colors" title="View">
                        <MdVisibility size={18} />
                    </button>
                    <button onClick={() => handleEditStatus(row)} className="hover:text-black transition-colors" title="Edit Status">
                        <MdEdit size={18} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="p-6 animate-fade-in-up">
            <div className="space-y-8">
                <Breadcrumbs
                    title='Product Details'
                    items={[
                        { label: 'Dashboard', to: '/admin/dashboard' },
                        { label: 'Products', to: '/admin/products' },
                        { label: product.name }
                    ]}
                />

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                        {/* LEFT COLUMN: IMAGES & ACTIONS (5 cols) */}
                        <div className="lg:col-span-12 xl:col-span-5 space-y-6">
                            {/* Main Image Container */}
                            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 group text-center sticky top-6">
                                <div className="aspect-square w-full flex items-center justify-center mix-blend-multiply mb-4">
                                    {selectedImage ? (
                                        <img
                                            src={selectedImage}
                                            alt={product.name}
                                            className={`max-h-full max-w-full object-contain transition-all duration-500 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100 '}`}
                                        />
                                    ) : (
                                        <MdShoppingBag size={80} className="text-gray-200" />
                                    )}
                                </div>
                                {discount > 0 && (
                                    <div className="absolute top-4 left-4 bg-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                                        {discount}% OFF
                                    </div>
                                )}

                                {/* Thumbnails */}
                                {selectedVariant?.images?.length > 0 && (
                                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide justify-center">
                                        {selectedVariant.images.map((img, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedImage(img)}
                                                className={`w-16 h-16 shrink-0 rounded-xl border-2 bg-gray-50 p-1 ${selectedImage === img ? 'border-gray-800' : 'border-transparent hover:border-gray-200'} transition-all`}
                                            >
                                                <img src={img} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT COLUMN: DETAILS (7 cols) */}
                        <div className="lg:col-span-12 xl:col-span-7 space-y-8">

                            {/* Top Meta: Stock Status & Ratings */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${currentStock > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                    <span className={`w-2 h-2 rounded-full ${currentStock > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                    {currentStock > 0 ? 'In Stock' : 'Out of Stock'}
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="flex text-amber-400">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <MdStar key={star} size={20} className={star <= (product.rating?.average || 0) ? 'fill-current' : 'text-gray-200'} />
                                        ))}
                                    </div>
                                    <span className="text-sm text-gray-500 font-medium">({product.rating?.count || 0} Reviews)</span>
                                </div>
                            </div>

                            {/* Title */}
                            <div>
                                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-tight mb-2">
                                    {product.name}
                                </h1>
                                <div className="text-sm text-gray-500 flex items-center gap-2">
                                    <span>Brand: <span className="text-gray-900 font-medium">{product.brand}</span></span>
                                    <span className="text-gray-300">|</span>
                                    <span>Category: <span className="text-gray-900 font-medium">{product.category?.name}</span></span>
                                </div>
                            </div>

                            {/* Meta Grid (Reference Style) */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 p-6 bg-gray-50 rounded-xl border border-gray-100/50">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">SKU</label>
                                    <div className="font-mono text-sm font-semibold text-gray-800">{currentSku}</div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Sub-Category</label>
                                    <div className="text-sm font-semibold text-gray-800">{product.subCategory?.name || '-'}</div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Stock</label>
                                    <div className="text-sm font-semibold text-gray-800">{currentStock} Units</div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Published</label>
                                    <div className="text-sm font-semibold text-gray-800">{new Date(product.createdAt).toLocaleDateString()}</div>
                                </div>
                            </div>

                            {/* Stats Row (Orders/Revenue) */}
                            <div className="grid grid-cols-2 gap-8 border-t border-b border-gray-100 py-6">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Total Orders</label>
                                    <div className="text-3xl font-extrabold text-gray-900 tracking-tight">{totalOrders.toLocaleString()}</div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Total Revenue</label>
                                    <div className="text-3xl font-extrabold text-emerald-600 tracking-tight">₹{totalRevenue.toLocaleString()}</div>
                                </div>
                            </div>

                            {/* Price Area */}
                            <div className="flex items-end gap-3">
                                <span className="text-4xl font-black text-gray-900 tracking-tight">₹{currentPrice.toLocaleString()}</span>
                                {mrp > currentPrice && (
                                    <div className="mb-1.5 flex items-center gap-2">
                                        <span className="text-lg text-gray-400 line-through font-medium">₹{mrp.toLocaleString()}</span>
                                        <span className="text-sm font-bold text-rose-600">({discount}% OFF)</span>
                                    </div>
                                )}
                            </div>

                            {/* Bio / Description */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Product Info</h3>
                                <p className="text-gray-600 leading-relaxed text-sm">
                                    {product.description || 'No description available for this product.'}
                                </p>
                            </div>

                            {/* Variants Selector */}
                            {product.variants?.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Available Variants ({product.variants.length})</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {product.variants.map((variant, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleVariantChange(variant)}
                                                className={`relative group h-16 flex items-center gap-2 px-2 bg-white border rounded-md transition-all ${selectedVariant?._id === variant._id ? 'border-gray-900 ring-1 ring-gray-900 shadow-sm' : 'border-gray-200 hover:border-gray-400'}`}
                                            >
                                                <div className="w-12 h-12 rounded-md bg-gray-100 overflow-hidden shrink-0">
                                                    {variant.images?.[0] && <img src={variant.images[0]} alt="" className="w-full h-full object-cover" />}
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-xs font-bold text-gray-900 leading-none">{variant.color}</div>
                                                    <div className="text-[11px] text-gray-500 leading-none mt-0.5">{variant.options?.length} Sizes</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Selected Variant Stock Table */}
                            {selectedVariant?.options?.length > 0 && (
                                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                                        <span className="text-xs font-bold text-gray-600 uppercase">Input Inventory ({selectedVariant.color})</span>
                                    </div>
                                    <table className="w-full text-sm">
                                        <thead className="bg-white text-gray-500">
                                            <tr className="border-b border-gray-100">
                                                <th className="px-4 py-3 text-left font-medium">Size</th>
                                                <th className="px-4 py-3 text-left font-medium">SKU</th>
                                                <th className="px-4 py-3 text-right font-medium">Price</th>
                                                <th className="px-4 py-3 text-right font-medium">Stock</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {selectedVariant.options.map((opt, i) => (
                                                <tr key={i} className="group hover:bg-gray-50/50">
                                                    <td className="px-4 py-3 font-semibold text-gray-900">{opt.size}</td>
                                                    <td className="px-4 py-3 text-xs font-mono text-gray-500">{opt.sku}</td>
                                                    <td className="px-4 py-3 text-right">₹{opt.price}</td>
                                                    <td className="px-4 py-3 text-right font-medium text-gray-900">{opt.stock}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Review Visuals (Real Data) */}
                            <div className="border-t border-gray-100 pt-8">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Reviews & Rating</h3>
                                <div className="bg-gray-50 rounded-xl p-6 flex flex-col md:flex-row items-center gap-8 shadow-inner">
                                    <div className="text-center">
                                        <div className="text-5xl font-black text-gray-900">{product.rating?.average || 0}</div>
                                        <div className="flex text-amber-400 justify-center my-2">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <MdStar key={star} size={16} className={star <= (product.rating?.average || 0) ? 'fill-current' : 'text-gray-300'} />
                                            ))}
                                        </div>
                                        <div className="text-xs text-gray-500 font-medium">Based on {totalReviews} reviews</div>
                                    </div>
                                    <div className="flex-1 w-full space-y-2">
                                        {[5, 4, 3, 2, 1].map((r, i) => (
                                            <div key={r} className="flex items-center gap-3 text-xs">
                                                <span className="font-bold text-gray-600 w-3">{r}</span>
                                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gray-900 rounded-full" style={{ width: `${ratingPercentages[i]}%` }}></div>
                                                </div>
                                                <span className="text-gray-400 w-8 text-right">{ratingPercentages[i]}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Reviews List */}
                                {product.reviews && product.reviews.length > 0 && (
                                    <div className="mt-8 space-y-6">
                                        {product.reviews && product.reviews.length > 0 && (
                                            <DataTable
                                                columns={reviewsColumns}
                                                data={product.reviews}
                                                selection={false}
                                                pagination={{
                                                    current: 1,
                                                    total: product.reviews.length,
                                                    start: 1,
                                                    end: product.reviews.length,
                                                    totalPages: 1
                                                }}
                                                onPageChange={() => { }}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <ReviewStatusModal
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                onConfirm={confirmUpdateStatus}
                review={selectedReview}
                readOnly={modalMode === 'view'}
            />
        </div >
    );
};

export default ProductsDetails;