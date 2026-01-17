import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBanners } from '../../../redux/slice/banner.slice';
import { fetchHeroBanners } from '../../../redux/slice/heroBanner.slice';
import {
    fetchHomeSettings,
    saveHomeSettings,
    setLayout,
    addBannerSlot,
    removeBannerSlot,
    toggleBannerMode,
    updateBannerSelection
} from '../../../redux/slice/adminHome.slice';
import OfferBanner from '../../../components/OfferBanner';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { MdDragIndicator, MdSave, MdViewStream, MdViewColumn, MdAdd, MdDeleteOutline, MdCropLandscape, MdVerticalSplit } from 'react-icons/md';
import { TbRectangle, TbColumns, TbColumns3 } from 'react-icons/tb';
import CustomSelect from '../../components/common/CustomSelect';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import HeroSection from '../../../components/HeroSection';
import DeleteModal from '../../components/modals/DeleteModal';

const SECTION_LABELS = {
    hero_section: 'Hero Slider Section',
    category_section: 'Category Section',
    most_popular: 'Most Popular Products',
    banner_slot_1: 'Banner Position 1',
    new_arrivals: 'New Arrivals',
    best_sellers: 'Best Sellers',
    banner_slot_2: 'Banner Position 2',
    shop_style: 'Shop For Style',
    top_checks: 'Top Checks'
};

export default function HomePreview() {
    const dispatch = useDispatch();
    const { banners, loading: bannersLoading } = useSelector((state) => state.banner);
    const {
        layout,
        bannerConfig,
        bannerSelections,
        loading: loadingLayout,
        saving
    } = useSelector((state) => state.adminHome);
    const { heroBanners } = useSelector((state) => state.heroBanner);

    const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
    const [sectionToDelete, setSectionToDelete] = React.useState(null);

    // Initial Data Fetch
    useEffect(() => {
        dispatch(fetchBanners());
        dispatch(fetchHeroBanners());
        dispatch(fetchHomeSettings());
    }, [dispatch]);

    // Derived state: Assign banners to slots based on selections
    const bannerAssignments = useMemo(() => {
        const assignments = {};
        const availableBanners = banners || [];

        layout.forEach(sectionKey => {
            if (sectionKey.startsWith('banner_slot')) {
                const mode = bannerConfig[sectionKey] || 'single';
                const selectedIds = bannerSelections[sectionKey] || [];

                // Map selected IDs to actual banner objects
                const assignedItems = [];
                const requiredCount = mode === 'triple' ? 3 : (mode === 'split' ? 2 : 1);

                for (let i = 0; i < requiredCount; i++) {
                    const id = selectedIds[i];
                    const found = availableBanners.find(b => b._id === id || b.id === id);
                    assignedItems.push(found || null);
                }

                assignments[sectionKey] = {
                    mode: mode,
                    items: assignedItems
                };
            }
        });
        return assignments;
    }, [layout, bannerConfig, bannerSelections, banners]);

    const handleOnDragEnd = (result) => {
        if (!result.destination) return;

        // Filter out hero_section from the source processing since it's not in the draggable list
        const draggableItems = layout.filter(k => k !== 'hero_section');
        const [reorderedItem] = draggableItems.splice(result.source.index, 1);
        draggableItems.splice(result.destination.index, 0, reorderedItem);

        // Always put hero_section at the start
        dispatch(setLayout(['hero_section', ...draggableItems]));
    };

    const handleToggleBannerMode = (slotKey) => {
        dispatch(toggleBannerMode(slotKey));
    };

    const handleUpdateBannerSelection = (slotKey, index, bannerId) => {
        dispatch(updateBannerSelection({ slotKey, index, bannerId }));
    };

    const handleAddBannerSlot = () => {
        dispatch(addBannerSlot());
    };

    const handleRemoveSection = (keyToRemove) => {
        setSectionToDelete(keyToRemove);
        setDeleteModalOpen(true);
    };

    const confirmDeleteSection = () => {
        if (sectionToDelete) {
            dispatch(removeBannerSlot(sectionToDelete));
            setDeleteModalOpen(false);
            setSectionToDelete(null);
        }
    };

    const handleSaveLayout = () => {
        dispatch(saveHomeSettings({ layout, bannerConfig, bannerSelections }));
    };

    // --- RENDER HELPERS ---

    const renderBannerItem = (banner, index, isSplit = false) => {
        if (!banner) {
            return (
                <div className={`flex items-center justify-center bg-gray-50 text-gray-400 italic text-sm p-4 text-center border-2 border-dashed border-gray-200 rounded-lg ${isSplit ? 'h-40' : 'h-64'}`}>
                    <div>
                        <span className="block font-medium">Select a Banner</span>
                        <span className="text-xs opacity-75">Use configuration panel &larr;</span>
                    </div>
                </div>
            );
        }

        return (
            <div className={`relative overflow-hidden group rounded-lg ${isSplit ? 'h-full' : ''}`}>
                <OfferBanner
                    title={banner.title}
                    subtitle={banner.subtitle}
                    image={banner.image}
                    buttonText={banner.buttonText}
                    link={banner.link}
                    reverse={!isSplit && banner.textPosition === 'right'}
                    textColor={banner.textColor}
                    highlightColor={banner.highlightColor}
                    buttonColor={banner.buttonColor}
                    bgColor={banner.backgroundColor}
                    textPosition={isSplit ? 'center' : banner.textPosition}
                />
            </div>
        );
    }

    const renderBannerSlot = (slotKey) => {
        // Use pre-calculated assignments
        const assignment = bannerAssignments[slotKey];
        if (!assignment) return null;

        const mode = assignment.mode;
        const isSplit = mode === 'split';
        const isTriple = mode === 'triple';
        // Pretty label for dynamic slots
        const label = SECTION_LABELS[slotKey] || `Banner Section ${slotKey.split('_').pop().slice(-4)}`;

        return (
            <div className="relative border-2 border-dashed border-blue-400 m-2 rounded-lg p-1 group transition-all">
                <div className="absolute top-0 left-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 z-10 font-bold uppercase tracking-wider shadow-sm rounded-br">
                    {label} {isTriple ? '(Triple View)' : (isSplit ? '(Split View)' : '')}
                </div>

                {bannersLoading ? (
                    <div className="h-64 flex items-center justify-center bg-gray-50 text-gray-400">Loading Banners...</div>
                ) : (
                    mode === 'triple' ? (
                        <div className="grid grid-cols-3 gap-2 mt-4">
                            {renderBannerItem(assignment.items[0], 0, true)}
                            {renderBannerItem(assignment.items[1], 1, true)}
                            {renderBannerItem(assignment.items[2], 2, true)}
                        </div>
                    ) : isSplit ? (
                        <div className="grid grid-cols-2 gap-2 mt-4">
                            {renderBannerItem(assignment.items[0], 0, true)}
                            {renderBannerItem(assignment.items[1], 1, true)}
                        </div>
                    ) : (
                        <div className="mt-4">
                            {renderBannerItem(assignment.items[0], 0, false)}
                        </div>
                    )
                )}
            </div>
        );
    };

    const renderSectionPreview = (key) => {
        if (key.startsWith('banner_slot')) {
            return renderBannerSlot(key);
        }

        switch (key) {
            case 'hero_section':
                return <HeroSection />;
            case 'category_section':
                return (
                    <section className="py-12 bg-white">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded flex items-center justify-center">
                                <span className="text-gray-400 font-medium">Category Section</span>
                            </div>
                        </div>
                    </section>
                );
            case 'most_popular':
                return (
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-lg md:text-2xl font-bold tracking-tight text-gray-900 uppercase">Most Popular</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 opacity-50">
                            {[1, 2, 3, 4].map((i) => <div key={i} className="h-64 bg-gray-100 rounded"></div>)}
                        </div>
                    </section>
                );
            case 'new_arrivals':
                return (
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-lg md:text-2xl font-bold tracking-tight text-gray-900 uppercase">New Arrivals</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 opacity-50">
                            {[1, 2, 3, 4].map((i) => <div key={i} className="h-64 bg-gray-100 rounded"></div>)}
                        </div>
                    </section>
                );
            case 'best_sellers':
                return (
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-lg md:text-2xl font-bold tracking-tight text-gray-900 uppercase">Best Sellers</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 opacity-50">
                            {[1, 2, 3, 4].map((i) => <div key={i} className="h-64 bg-gray-100 rounded"></div>)}
                        </div>
                    </section>
                );
            case 'shop_style':
                return (
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-lg md:text-2xl font-bold tracking-tight text-gray-900 uppercase">Shop For Style</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 opacity-50">
                            {[1, 2, 3, 4].map((i) => <div key={i} className="h-64 bg-gray-100 rounded"></div>)}
                        </div>
                    </section>
                );
            case 'top_checks':
                return (
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-12">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold tracking-tight text-gray-900 uppercase">Top Checks</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 opacity-50">
                            {[1, 2, 3, 4].map((i) => <div key={i} className="h-64 bg-gray-100 rounded"></div>)}
                        </div>
                    </section>
                );
            default:
                return null;
        }
    };

    return (
        <div className="p-6">
            <Breadcrumbs
                title="Home Page Layout"
                items={[
                    { label: 'Dashboard', to: '/admin/dashboard' },
                    { label: 'Home Page Layout' },
                ]}
            />

            <div className="flex justify-end mb-6 gap-2">
                <button
                    onClick={handleAddBannerSlot}
                    className="flex items-center gap-2 bg-white text-gray-700 border border-gray-300 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium"
                >
                    <MdAdd size={20} />
                    Add Banner Section
                </button>
                <button
                    onClick={handleSaveLayout}
                    disabled={saving || loadingLayout}
                    className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50"
                >
                    <MdSave size={20} />
                    {saving ? 'Saving...' : 'Save Layout'}
                </button>
            </div>

            {/* <div className="flex gap-3">
                    <button
                        onClick={handleAddBannerSlot}
                        className="flex items-center gap-2 bg-white text-gray-700 border border-gray-300 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium"
                    >
                        <MdAdd size={20} />
                        Add Banner Section
                    </button>
                    <button
                        onClick={handleSaveLayout}
                        disabled={saving || loadingLayout}
                        className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50"
                    >
                        <MdSave size={20} />
                        {saving ? 'Saving...' : 'Save Layout'}
                    </button>
                </div> */}

            <div className="flex flex-col xl:flex-row gap-8">
                {/* 1. Draggable Configuration Panel */}
                <div className="w-full xl:w-80 shrink-0">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-6 max-h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar">
                        <h3 className="font-bold text-gray-700 mb-4 uppercase text-xs tracking-wider border-b pb-2">Page Sections</h3>

                        {loadingLayout ? (
                            <div className="text-center py-4 text-gray-400 text-sm">Loading ordering...</div>
                        ) : (
                            <>
                                {/* Static Hero Section */}
                                <div className="mb-4">
                                    <div className="p-3 rounded-lg border border-gray-200 bg-gray-50 flex flex-col gap-2">
                                        <div className="flex items-center gap-3">
                                            <div className="text-gray-400 opacity-50 cursor-not-allowed">
                                                <MdDragIndicator size={18} />
                                            </div>
                                            <div className="p-1.5 rounded bg-gray-200 text-gray-500">
                                                <MdViewStream size={14} />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 flex-1 truncate">
                                                Hero Slider Section
                                            </span>
                                            <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                                Fixed
                                            </span>
                                        </div>
                                        {/* Thumbnails of Hero Banners */}
                                        <div className="pl-9 mt-1">
                                            <div className="text-[10px] uppercase text-gray-400 font-bold tracking-wider mb-2">
                                                Active Slides ({heroBanners?.length || 0}):
                                            </div>
                                            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                                {heroBanners && heroBanners.map(banner => (
                                                    <div key={banner._id} className="w-12 h-8 rounded overflow-hidden shrink-0 border border-gray-200 relative group/thumb">
                                                        <img
                                                            src={banner.image}
                                                            alt={banner.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ))}
                                                {(!heroBanners || heroBanners.length === 0) && (
                                                    <div className="text-xs text-gray-400 italic">No banners active</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <DragDropContext onDragEnd={handleOnDragEnd}>
                                    <Droppable droppableId="sections">
                                        {(provided) => (
                                            <ul className="space-y-4" {...provided.droppableProps} ref={provided.innerRef}>
                                                {layout.filter(key => key !== 'hero_section').map((key, index) => (
                                                    <Draggable key={key} draggableId={key} index={index}>
                                                        {(provided, snapshot) => (
                                                            <li
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className={`p-3 rounded-lg border flex flex-col gap-2 bg-white transition-all group/item
                                                                    ${snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500 z-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
                                                                `}
                                                            >
                                                                <div className="flex items-center gap-3 cursor-move">
                                                                    <div className="text-gray-400">
                                                                        <MdDragIndicator size={18} />
                                                                    </div>
                                                                    <div className={`p-1.5 rounded ${key.startsWith('banner_slot') ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                                                        <MdViewStream size={14} />
                                                                    </div>
                                                                    <span className="text-sm font-medium text-gray-700 flex-1 truncate">
                                                                        {SECTION_LABELS[key] || `Banner Section ${key.split('_').pop().slice(-4)}`}
                                                                    </span>

                                                                    {/* Remove Action */}
                                                                    {key.startsWith('banner_slot') && (
                                                                        <button
                                                                            onClick={() => handleRemoveSection(key)}
                                                                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover/item:opacity-100 transition-opacity"
                                                                            title="Remove this banner section"
                                                                        >
                                                                            <MdDeleteOutline size={16} />
                                                                        </button>
                                                                    )}
                                                                </div>

                                                                {/* Banner Controls */}
                                                                {key.startsWith('banner_slot') && (
                                                                    <div className="pl-9 pt-2 border-t border-gray-100 mt-1 space-y-2">
                                                                        {/* Toggle Mode */}
                                                                        <button
                                                                            onClick={() => handleToggleBannerMode(key)}
                                                                            className={`w-full text-xs flex items-center justify-center gap-1.5 px-2 py-1.5 rounded border transition-colors mb-2 ${bannerConfig[key] === 'triple'
                                                                                ? 'bg-purple-50 text-purple-600 border-purple-200'
                                                                                : bannerConfig[key] === 'split'
                                                                                    ? 'bg-blue-50 text-blue-600 border-blue-200'
                                                                                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                                                                }`}
                                                                        >
                                                                            {bannerConfig[key] === 'triple' ? (
                                                                                <TbColumns3 size={14} />
                                                                            ) : bannerConfig[key] === 'split' ? (
                                                                                <TbColumns size={14} />
                                                                            ) : (
                                                                                <TbRectangle size={14} />
                                                                            )}
                                                                            {bannerConfig[key] === 'triple' ? 'Triple View Active' : (bannerConfig[key] === 'split' ? 'Split View Active' : 'Single View')}
                                                                        </button>

                                                                        {/* Selectors */}
                                                                        <div className="space-y-1.5">
                                                                            <div className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">
                                                                                Select Banners:
                                                                            </div>

                                                                            {/* Slot 1 Selector */}
                                                                            <CustomSelect
                                                                                value={(bannerSelections[key] && bannerSelections[key][0]) || ''}
                                                                                onChange={(val) => handleUpdateBannerSelection(key, 0, val)}
                                                                                options={banners ? banners.map(b => ({ label: b.title, value: b._id })) : []}
                                                                                placeholder={bannerConfig[key] === 'split' || bannerConfig[key] === 'triple' ? 'First Banner' : 'Select Banner'}
                                                                                className="w-full text-xs"
                                                                            />

                                                                            {/* Slot 2 Selector (Split or Triple) */}
                                                                            {(bannerConfig[key] === 'split' || bannerConfig[key] === 'triple') && (
                                                                                <CustomSelect
                                                                                    value={(bannerSelections[key] && bannerSelections[key][1]) || ''}
                                                                                    onChange={(val) => handleUpdateBannerSelection(key, 1, val)}
                                                                                    options={banners ? banners.map(b => ({ label: b.title, value: b._id })) : []}
                                                                                    placeholder="Second Banner"
                                                                                    className="w-full text-xs"
                                                                                />
                                                                            )}

                                                                            {/* Slot 3 Selector (Triple Only) */}
                                                                            {bannerConfig[key] === 'triple' && (
                                                                                <CustomSelect
                                                                                    value={(bannerSelections[key] && bannerSelections[key][2]) || ''}
                                                                                    onChange={(val) => handleUpdateBannerSelection(key, 2, val)}
                                                                                    options={banners ? banners.map(b => ({ label: b.title, value: b._id })) : []}
                                                                                    placeholder="Third Banner"
                                                                                    className="w-full text-xs"
                                                                                />
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </li>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </ul>
                                        )}
                                    </Droppable>
                                </DragDropContext>
                            </>
                        )}

                        <div className="mt-6 p-4 bg-blue-50 text-blue-800 text-xs rounded-lg border border-blue-100">
                            <strong>How to use:</strong>
                            <p className="mt-1">
                                1. Add banner slots using the button above.<br />
                                2. Click toggle button to cycle <strong>Single &rarr; Split &rarr; Triple</strong> views.<br />
                                3. <strong>Select specific banners</strong> for each slot using the dropdowns.
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. Live Preview */}
                <div className="flex-1 min-w-0">
                    <div className="flex justify-center">
                        <div className="w-full bg-white shadow-2xl rounded-xl overflow-hidden border border-gray-200 origin-top">
                            {/* Fixed Header Placeholder */}
                            <header className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
                                <div className="w-8 h-8 bg-black rounded flex items-center justify-center text-white font-bold">L</div>
                                <div className="flex gap-4 text-xs font-semibold uppercase text-gray-500">
                                    <span className="hidden sm:block">Men</span>
                                    <span className="hidden sm:block">Women</span>
                                    <span className="hidden sm:block">Kids</span>
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                                    <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                                </div>
                            </header>

                            {/* Dynamic Content Area */}
                            <div className="bg-white min-h-[600px]">
                                {layout.map((key) => (
                                    <React.Fragment key={key}>
                                        {renderSectionPreview(key)}
                                    </React.Fragment>
                                ))}
                            </div>

                            {/* Fixed Footer Placeholder */}
                            <footer className="bg-gray-900 text-white py-12 mt-8 text-center text-sm opacity-80">
                                Footer Content
                            </footer>
                        </div>
                    </div>
                </div>
            </div>

            <DeleteModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDeleteSection}
                title="Remove Section"
                message="Are you sure you want to remove this banner section?"
            />
        </div>
    );
}
