import React, { useEffect, useState, useRef, useCallback } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { MdImage, MdDelete, MdDragIndicator, } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { getLegalPage, upsertLegalPage } from '../../../redux/slice/legalPage.slice';
import toast from 'react-hot-toast';
import { FiCopy, FiRefreshCcw } from 'react-icons/fi';
import { LuTrash2, LuUpload } from 'react-icons/lu';
import axios from 'axios';
import { BASE_URL } from '../../../utils/BASE_URL';
import { useLocation } from 'react-router-dom';
import 'react-quill-new/dist/quill.snow.css';
import LinkModal from '../../components/modals/LinkModal';
import CustomToolbar from '../../components/common/EditorToolbar';
import EditorSidebar from '../../components/common/EditorSidebar';
import Breadcrumbs from '../../components/common/Breadcrumbs';


// Register Custom Font Sizes (Pixels) safely
try {
    const Size = ReactQuill.Quill.import('attributors/style/size');
    Size.whitelist = ['10px', '12px', '14px', '16px', '18px', '20px', '24px', '30px', '32px', '36px', '48px', '60px', '72px'];
    ReactQuill.Quill.register(Size, true);
} catch (e) {
    console.warn("Could not register custom sizes", e);
}

// Register Custom Font Weight (Bold replacement)
try {
    const Parchment = ReactQuill.Quill.import('parchment');
    const StyleAttributor = Parchment.Attributor?.Style || Parchment.StyleAttributor;

    if (StyleAttributor) {
        const fontWeight = new StyleAttributor('bold', 'font-weight', {
            scope: Parchment.Scope.INLINE,
            whitelist: ['100', '200', '300', '400', '500', '600', '700', '800', '900']
        });
        ReactQuill.Quill.register(fontWeight, true);
    }
} catch (e) {
    console.warn("Could not register custom font weight", e);
}

// Register Custom Line Spacing Attributes
try {
    const Parchment = ReactQuill.Quill.import('parchment');
    const StyleAttributor = Parchment.Attributor?.Style || Parchment.StyleAttributor;

    if (StyleAttributor) {
        // Create spacing attributors
        const spacingBefore = new StyleAttributor('spacing-before', 'padding-top', {
            scope: Parchment.Scope.BLOCK
        });

        const spacingAfter = new StyleAttributor('spacing-after', 'padding-bottom', {
            scope: Parchment.Scope.BLOCK
        });

        ReactQuill.Quill.register(spacingBefore, true);
        ReactQuill.Quill.register(spacingAfter, true);
    } else {
        console.warn("StyleAttributor not found in Parchment");
    }
} catch (e) {
    console.warn("Could not register custom spacing attributes", e);
}

export default function PrivacyPolicy() {

    const dispatch = useDispatch();
    const location = useLocation();
    const { currentLegalPage } = useSelector((state) => state.legalPage);
    const [blocks, setBlocks] = useState([]);
    const [activeBlockId, setActiveBlockId] = useState(null);

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [activeQuill, setActiveQuill] = useState(null);
    const [formats, setFormats] = useState({});
    const emojiPickerRef = useRef(null);
    const quillRefs = useRef({});
    // const [customColor, setCustomColor] = useState('#000000');

    // Link Modal States
    const [linkModalOpen, setLinkModalOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [selectedText, setSelectedText] = useState('');
    const [savedSelection, setSavedSelection] = useState(null);
    const [imageUploadLoading, setImageUploadLoading] = useState(false);

    // Determine Page Context based on URL
    const getPageContext = () => {
        const path = location.pathname;
        if (path.includes('privacy-policy')) return { slug: 'privacy-policy', title: 'PRIVACY POLICY', apiTitle: 'Privacy Policy' };
        if (path.includes('terms-conditions')) return { slug: 'terms-conditions', title: 'TERMS & CONDITIONS', apiTitle: 'Terms & Conditions' };
        if (path.includes('security')) return { slug: 'security', title: 'SECURITY', apiTitle: 'Security' };
        if (path.includes('cookie-statement')) return { slug: 'cookie-statement', title: 'COOKIE STATEMENT', apiTitle: 'Cookie Statement' };
        if (path.includes('legal-page')) return { slug: 'legal-page', title: 'LEGAL PAGE', apiTitle: 'Legal Page' };
        return { slug: 'privacy-policy', title: 'PRIVACY POLICY', apiTitle: 'Privacy Policy' }; // Default
    };

    const { slug, title, apiTitle } = getPageContext();

    console.log(currentLegalPage);

    // Disable default toolbar modules
    const modules = React.useMemo(() => ({
        toolbar: false,
        history: { delay: 1000, maxStack: 50, userOnly: true }
    }), []);

    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                if (!event.target.closest('.ql-emoji')) {
                    setShowEmojiPicker(false);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const onEmojiClick = useCallback((emojiData) => {
        if (activeQuill) {
            const range = activeQuill.getSelection(true);
            if (range) {
                // Determine insertion index
                // Sometimes range.index is what we need.
                activeQuill.insertText(range.index, emojiData.emoji, 'user');
                // Move cursor after emoji
                activeQuill.setSelection(range.index + emojiData.emoji.length);
            } else {
                // Fallback if no selection, maybe append? Or retry focusing.
                // Quill usually reports null selection if blur.
                // We rely on activeQuill being the last focused.
                const length = activeQuill.getLength();
                activeQuill.insertText(length - 1, emojiData.emoji, 'user');
            }
            setShowEmojiPicker(false);
        }
    }, [activeQuill]);

    // Fetch page data when slug changes
    useEffect(() => {
        setBlocks([]); // Clear previous blocks
        dispatch(getLegalPage(slug));
    }, [dispatch, slug]);

    useEffect(() => {
        if (currentLegalPage?.structure && currentLegalPage.slug === slug) {
            // Normalize structure from backend: ensure Quill-compatible content
            const normalizedBlocks = currentLegalPage.structure.map(block => {
                let content = block.content;
                let type = block.type;

                // 1) Arrays -> HTML string (for lists)
                if (Array.isArray(content)) {
                    content = '<ul>' + content.map(item => `<li>${item}</li>`).join('') + '</ul>';
                }

                // 2) Map unknown types -> supported types
                if (type === 'heading' || type === 'section-heading') {
                    type = type === 'heading' ? 'title' : 'text';
                } else if (type === 'info-box') {
                    type = 'text';
                }

                // 3) Ensure content is string
                if (typeof content !== 'string') {
                    content = String(content || '');
                }

                return { ...block, content, type };
            });
            setBlocks(normalizedBlocks);
        } else if (!currentLegalPage && slug) {
            // If no data found on server (or just loaded), currentLegalPage might be null or from previous page
            // Just wait for getLegalPage result. 
            // If we want to be safe, we can check if loading is false. 
            // But clearing blocks in the slug effect is good enough.
        }
    }, [currentLegalPage, slug]);

    const addBlock = (type, content = '', format = null, afterId = null) => {
        const newId = `block-${Date.now()}`;
        const newBlock = { id: newId, type, content };

        setBlocks(prev => {
            if (afterId) {
                const index = prev.findIndex(b => b.id === afterId);
                if (index !== -1) {
                    const newBlocks = [...prev];
                    newBlocks.splice(index + 1, 0, newBlock);
                    return newBlocks;
                }
            }
            return [...prev, newBlock];
        });

        setTimeout(() => {
            setActiveBlockId(newId);
            const quill = quillRefs.current[newId];
            if (quill) {
                const editor = quill.getEditor();
                editor.focus();
                if (format) {
                    Object.entries(format).forEach(([key, value]) => {
                        editor.format(key, value);
                    });
                    // Also update toolbar state
                    setFormats(format);
                }
            }
        }, 100);
    };

    const updateBlockContent = useCallback((id, content) => {
        setBlocks(prev => prev.map(b => (b.id === id && b.content !== content) ? { ...b, content } : b));
    }, []);

    const handleSave = () => {
        const htmlContent = blocks.map(block => {
            if (block.type === 'title') return `<h2 class="text-2xl font-bold my-4">${block.content}</h2>`;
            if (block.type === 'image') return `<img src="${block.content}" alt="${apiTitle} Image" class="w-full h-auto my-6 rounded-lg shadow-sm" />`;
            return `<div class="mb-4 w-full max-w-full">${block.content}</div>`;
        }).join('');

        dispatch(upsertLegalPage({
            slug: slug,
            title: apiTitle,
            content: htmlContent,
            structure: blocks
        }));
    };

    // Update Formats on selection change
    const handleSelectionChange = useCallback((range, source, editor, id) => {
        const quill = quillRefs.current[id]?.getEditor();
        if (quill) {
            if (source === 'user') {
                setActiveQuill(quill);
            }
            if (range) {
                // Get both inline and line-level formats
                const inlineFormats = quill.getFormat(range);
                const [line] = quill.getLine(range.index);
                let lineFormats = {};

                if (line && line.domNode) {
                    // Extract line-level formats (spacing)
                    const style = line.domNode.style;
                    if (style.paddingTop) {
                        lineFormats['spacing-before'] = style.paddingTop;
                    }
                    if (style.paddingBottom) {
                        lineFormats['spacing-after'] = style.paddingBottom;
                    }
                }

                // Merge inline and line formats
                setFormats({ ...inlineFormats, ...lineFormats });
            }
        }
    }, [activeQuill]);

    // Also track focus explicitly
    const handleEditorFocus = useCallback((range, source, editor, id) => {
        const quill = quillRefs.current[id]?.getEditor();
        if (quill && activeQuill !== quill) {
            setActiveQuill(quill);
            if (range) {
                // Get both inline and line-level formats
                const inlineFormats = quill.getFormat(range);
                const [line] = quill.getLine(range.index);
                let lineFormats = {};

                if (line && line.domNode) {
                    const style = line.domNode.style;
                    if (style.paddingTop) {
                        lineFormats['spacing-before'] = style.paddingTop;
                    }
                    if (style.paddingBottom) {
                        lineFormats['spacing-after'] = style.paddingBottom;
                    }
                }

                setFormats({ ...inlineFormats, ...lineFormats });
            }
        }
    }, [activeQuill]);


    // Link Modal Handlers
    const handleOpenLinkModal = useCallback(() => {
        if (!activeQuill) {
            toast.error('Please select text in the editor first');
            return;
        }

        const selection = activeQuill.getSelection();
        if (!selection || selection.length === 0) {
            toast.error('Please select text to add a link');
            return;
        }

        // Save the selection
        setSavedSelection(selection);

        // Get selected text
        const text = activeQuill.getText(selection.index, selection.length);
        setSelectedText(text);

        // Check if selection already has a link
        const format = activeQuill.getFormat(selection);
        if (format.link) {
            setLinkUrl(format.link);
        } else {
            setLinkUrl('');
        }

        setLinkModalOpen(true);
    }, [activeQuill]);

    const handleApplyLink = useCallback(() => {
        if (!activeQuill || !savedSelection) return;

        // Restore selection
        activeQuill.setSelection(savedSelection);

        if (linkUrl.trim()) {
            // Apply link
            activeQuill.format('link', linkUrl.trim(), 'user');
            toast.success('Link applied successfully');
        }

        // Close modal and reset
        setLinkModalOpen(false);
        setLinkUrl('');
        setSelectedText('');
        setSavedSelection(null);
    }, [activeQuill, savedSelection, linkUrl]);

    const handleRemoveLink = useCallback(() => {
        if (!activeQuill || !savedSelection) return;

        // Restore selection
        activeQuill.setSelection(savedSelection);

        // Remove link
        activeQuill.format('link', false, 'user');
        toast.success('Link removed successfully');

        // Close modal and reset
        setLinkModalOpen(false);
        setLinkUrl('');
        setSelectedText('');
        setSavedSelection(null);
    }, [activeQuill, savedSelection]);

    const handleCloseLinkModal = useCallback(() => {
        setLinkModalOpen(false);
        setLinkUrl('');
        setSelectedText('');
        setSavedSelection(null);
    }, []);

    const handleImageUpload = async (file, blockId) => {
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            setImageUploadLoading(true);
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            };
            const response = await axios.post(`${BASE_URL}/legal-page-upload`, formData, config);
            if (response.data.success) {
                updateBlockContent(blockId, response.data.url);
                toast.success('Image uploaded successfully!');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error.response?.data?.message || 'Failed to upload image');
        } finally {
            setImageUploadLoading(false);
        }
    };

    const duplicateBlock = (blockId) => {
        setBlocks(prev => {
            const index = prev.findIndex(b => b.id === blockId);
            if (index !== -1) {
                const blockToDuplicate = prev[index];
                const newBlock = {
                    ...blockToDuplicate,
                    id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                };
                const newBlocks = [...prev];
                newBlocks.splice(index + 1, 0, newBlock);
                return newBlocks;
            }
            return prev;
        });
    };

    return (
        <div className="privacy-policy-container p-6">
            {/* Top Header Row */}
            <Breadcrumbs
                title={title}
                items={[
                    { label: 'Dashboard', to: '/admin/dashboard' },
                    { label: 'Page Management' },
                    { label: apiTitle }
                ]}
            />
            <div className="flex flex-1 h-[calc(100vh-170px)] relative">
                {/* SIDEBAR - Styled like the image */}
                <EditorSidebar onAddBlock={addBlock} onSave={handleSave} onLinkClick={handleOpenLinkModal} />

                {/* RIGHT SIDE: Fixed Toolbar + Scrollable Content */}
                <div className="flex-1 flex flex-col h-full bg-[#F9FAFB] relative w-full overflow-hidden">

                    {/* 1. FIXED TOOLBAR AREA */}
                    <div className="flex-none  pt-6  w-full backdrop-blur-md  border-gray-200 z-40 relative">
                        {/* <div className="max-w-5xl mx-auto py-3 px-6 relative"> */}
                        <CustomToolbar
                            activeQuill={activeQuill}
                            formats={formats}
                            setFormats={setFormats}
                            onAddBlock={addBlock}
                            onToggleEmoji={() => setShowEmojiPicker(!showEmojiPicker)}
                            onLinkClick={handleOpenLinkModal}
                        />
                        {showEmojiPicker && (
                            <div
                                ref={emojiPickerRef}
                                className="emoji-picker-container absolute top-20 left-1/2 -translate-x-1/2 z-[100] shadow-2xl rounded-2xl overflow-hidden border border-gray-100"
                            >
                                <EmojiPicker
                                    onEmojiClick={onEmojiClick}
                                    autoFocusSearch={false}
                                    theme="light"
                                    searchPlaceholder="Search emojis..."
                                    width={350}
                                    height={450}
                                />
                            </div>
                        )}
                        {/* </div> */}
                    </div>

                    {/* 2. SCROLLABLE CANVAS */}
                    <div className="flex-1 overflow-y-auto p-3 md:p-6 xl:p-12 h-[calc(100vh-1000px)] custom-scrollbar scroll-smooth">
                        <div className="h-full mx-auto ">
                            {/* Editor Area */}
                            <div className="space-y-6 pb-32 min-h-[600px]">
                                {blocks.length === 0 && (
                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-20 text-center text-gray-400 bg-white/50">
                                        <p className="text-lg font-medium">Add Element here</p>
                                    </div>
                                )}

                                <DragDropContext onDragEnd={(res) => {
                                    if (!res.destination) return;
                                    const items = Array.from(blocks);
                                    const [reordered] = items.splice(res.source.index, 1);
                                    items.splice(res.destination.index, 0, reordered);
                                    setBlocks(items);
                                }}>
                                    <Droppable droppableId="blocks">
                                        {(provided) => (
                                            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-6">
                                                {blocks.map((block, index) => (
                                                    <Draggable key={block.id} draggableId={block.id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                className={`relative group bg-white border-2 border-dashed transition-all rounded-lg p-6
                                                                                               ${activeBlockId === block.id ? 'border-[#A8A8A8] shadow-md ring-0' : 'border-gray-200 hover:border-gray-300'}
                                                                                           `}
                                                                onClick={(e) => {
                                                                    if (!e.target.closest('.ql-editor')) {
                                                                        setActiveBlockId(block.id);
                                                                    }
                                                                }}
                                                            >
                                                                {/* Controls Top-Right Outside */}
                                                                <div className="absolute right-2 -top-5 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                                                    <div {...provided.dragHandleProps} className="p-2 bg-white border text-secondary border-gray-200 shadow-sm rounded-lg hover:bg-gray-50 cursor-move">
                                                                        <MdDragIndicator size={16} />
                                                                    </div>
                                                                    {block.type === 'image' && block.content && (
                                                                        <label className="p-2 bg-white border border-gray-200 shadow-sm rounded-lg text-[#14AE5C] hover:bg-green-50 cursor-pointer">
                                                                            <FiRefreshCcw size={16} />
                                                                            <input
                                                                                type="file"
                                                                                hidden
                                                                                accept="image/*"
                                                                                onChange={(e) => handleImageUpload(e.target.files[0], block.id)}
                                                                            />
                                                                        </label>
                                                                    )}

                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); duplicateBlock(block.id); }}
                                                                        className="p-2 bg-white border border-gray-200 shadow-sm rounded-lg text-black hover:bg-red-50"
                                                                        title="Duplicate"
                                                                    >
                                                                        <FiCopy size={16} />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); setBlocks(blocks.filter(b => b.id !== block.id)); }}
                                                                        className="p-2 bg-white border border-gray-200 shadow-sm rounded-lg text-[#EC221F] hover:bg-red-50"
                                                                    >
                                                                        <LuTrash2 size={16} />
                                                                    </button>
                                                                </div>

                                                                {/* Block Content Rendering */}
                                                                <div className="min-h-[60px] flex flex-col justify-center">
                                                                    {block.type === 'image' ? (
                                                                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded bg-gray-50/50">
                                                                            {block.content ? (
                                                                                <div className="relative w-full">
                                                                                    <img src={block.content} alt="Content" className="w-full h-auto rounded shadow-sm" />
                                                                                </div>
                                                                            ) : (
                                                                                <div className="text-center w-full p-8">
                                                                                    {imageUploadLoading ? (
                                                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-3"></div>
                                                                                    ) : (
                                                                                        <MdImage size={48} className="text-gray-200 mx-auto mb-3" />
                                                                                    )}
                                                                                    <div className="flex flex-col gap-2 items-center">
                                                                                        <button
                                                                                            onClick={() => document.getElementById(`file-upload-${block.id}`).click()}
                                                                                            className="px-4 py-2 bg-white border text-secondary border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
                                                                                        >
                                                                                            <LuUpload size={16} />
                                                                                            Upload Image
                                                                                        </button>
                                                                                        <input
                                                                                            id={`file-upload-${block.id}`}
                                                                                            type="file"
                                                                                            hidden
                                                                                            accept="image/*"
                                                                                            onChange={(e) => handleImageUpload(e.target.files[0], block.id)}
                                                                                        />
                                                                                        <span className="text-xs text-gray-400">or paste URL below</span>
                                                                                        <input
                                                                                            type="text"
                                                                                            placeholder="Paste image URL..."
                                                                                            className="max-w-md w-full mx-auto text-sm border border-gray-200 rounded px-4 py-2 text-secondary outline-none text-center bg-white focus:border-black transition-colors"
                                                                                            onBlur={(e) => updateBlockContent(block.id, e.target.value)}
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <div onClick={() => setActiveBlockId(block.id)}>
                                                                            {(block.type === 'list' || block.type === 'title') && <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">{block.type === 'list' ? 'Points List' : 'Title'}</label>}
                                                                            <ReactQuill
                                                                                ref={(el) => quillRefs.current[block.id] = el}
                                                                                theme="snow"
                                                                                modules={modules}
                                                                                placeholder={block.type === 'list' ? "Points List..." : "Enter text..."}
                                                                                value={block.content}
                                                                                onChange={(val, delta, source) => {
                                                                                    if (source === 'user') updateBlockContent(block.id, val);
                                                                                }}
                                                                                onChangeSelection={(range, source, editor) => handleSelectionChange(range, source, editor, block.id)}
                                                                                onFocus={(range, source, editor) => handleEditorFocus(range, source, editor, block.id)}
                                                                                className="minimal-quill text-secondary"
                                                                                onKeyDown={(e) => {
                                                                                    if (e.key === 'Enter' && !e.shiftKey && block.type !== 'list') {
                                                                                        // e.preventDefault();
                                                                                        const quill = quillRefs.current[block.id].getEditor();
                                                                                        const selection = quill.getSelection();
                                                                                        const currentFormat = selection ? quill.getFormat(selection.index - 1) : {};

                                                                                        setTimeout(() => {
                                                                                            if (currentFormat) {
                                                                                                Object.keys(currentFormat).forEach((key) => {
                                                                                                    quill.format(key, currentFormat[key]);
                                                                                                });
                                                                                            }
                                                                                            setFormats(currentFormat);
                                                                                        }, 50);
                                                                                    }
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </DragDropContext>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Link Modal */}
            <LinkModal
                isOpen={linkModalOpen}
                onClose={handleCloseLinkModal}
                selectedText={selectedText}
                linkUrl={linkUrl}
                setLinkUrl={setLinkUrl}
                onApplyLink={handleApplyLink}
                onRemoveLink={handleRemoveLink}
            />
        </div>
    );
}