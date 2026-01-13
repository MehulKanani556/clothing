import React, { useState, useRef, useEffect } from 'react';
import {
    MdImage,
    MdFormatBold, MdFormatItalic, MdFormatUnderlined,
    MdFormatStrikethrough, MdFormatListNumbered,
    MdFormatListBulleted, MdLink,
    MdFormatAlignLeft, MdFormatAlignCenter, MdFormatAlignRight, MdFormatAlignJustify,
    MdFormatColorText, MdFormatColorFill,
    MdFormatIndentDecrease, MdFormatIndentIncrease,
    MdOutlineEmojiEmotions, MdUndo, MdRedo, MdTitle, MdSubject,
    MdOutlineFormatLineSpacing
} from 'react-icons/md';
import { AiOutlineFontSize } from "react-icons/ai";
import { ChromePicker } from 'react-color';
import { FaCaretDown } from "react-icons/fa";

// Custom Picker Component with Pop-up Design
const ToolbarPicker = ({ type, options, value, onChange, title, icon, layout = 'vertical' }) => {
    const [expanded, setExpanded] = useState(false);
    const [customColor, setCustomColor] = useState(type === 'color' ? value : '#000000');
    const [showColorPicker, setShowColorPicker] = useState(false);
    const pickerRef = useRef(null);
    console.log(value, "value", type);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                event.stopPropagation();
                setExpanded(false);
                setShowColorPicker(false)
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (val) => {
        onChange(val);
        setExpanded(false);
    };

    const applyCustomColor = () => {
        if (customColor) {
            onChange(customColor);
            setExpanded(false);
        }
    };

    return (
        <div ref={pickerRef} className={`relative flex items-center justify-center`}>
            {/* Trigger Button */}
            <button
                className={`flex items-center text-black gap-0.5 px-1.5 py-1 rounded hover:bg-gray-100 hover:scale-105 transition-all ${expanded || (value && value !== '#000000' && value !== '' && value !== false)
                    ? ' opacity-100'
                    : 'opacity-70 hover:opacity-100'
                    }`}
                onClick={() => setExpanded(!expanded)}
                title={title}
                onMouseDown={(e) => e.preventDefault()}
                type="button"
            >
                {(type === "size" && value) ? (
                    <span className="text-sm font-medium whitespace-nowrap">
                        {value.includes("px") ? value?.replace("px", "") : value || '14'}
                    </span>
                ) : icon ? icon : (
                    <span className="text-sm font-medium whitespace-nowrap">
                        {type === 'size' ? (value || '14px') : (options.find(o => o.value === value)?.label || type)}
                    </span>
                )}
                <FaCaretDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                {/* <svg className={`w-3 h-3 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg> */}
            </button>

            {/* Pop-up Menu */}
            {expanded && (
                <div
                    className={`absolute top-full  left-1/2 -translate-x-1/2 mt-3 bg-white border border-gray-100 shadow-xl rounded-xl z-[60] p-3 animate-in fade-in  duration-100
                    ${layout === 'horizontal' ? 'flex gap-2' : ''}
                    ${layout === 'color-row' ? 'flex gap-3 px-4 py-3' : ''}
                    ${layout === 'grid' ? 'grid grid-cols-5 gap-2 min-w-[160px]' : ''}
                    ${layout === 'list-grid' ? 'grid grid-cols-2 gap-2 w-[220px]' : ''}
                    ${layout === 'vertical' ? 'flex flex-col min-w-[60px] max-h-[300px] overflow-y-auto' : ''}
                    ${layout === 'spacing-control' ? 'flex flex-col gap-3 w-[180px] p-4' : ''}
                    `}
                >
                    {/* Spacing Control Layout */}
                    {layout === 'spacing-control' && (
                        <>
                            <div className="flex gap-2">
                                <label className="text-xs font-medium text-gray-600 flex items-center gap-2">
                                    <span>Before</span>
                                </label>
                                <div className="flex items-center gap-2">:
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="1"
                                        value={parseInt(value?.before || '0px')}
                                        onChange={(e) => {
                                            const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                                            const newValue = {
                                                before: `${val}px`,
                                                after: value?.after || '0px'
                                            };
                                            onChange(newValue);
                                        }}
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-16 px-2 py-1.5 border border-gray-200 rounded-md text-sm focus:border-black focus:outline-none"
                                    />
                                    <span className="text-xs text-gray-500">px</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <label className="text-xs font-medium text-gray-600 flex items-center gap-2 mr-2">
                                    <span>After</span>
                                </label>
                                <div className="flex items-center gap-2">:
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="1"
                                        value={parseInt(value?.after || '0px')}
                                        onChange={(e) => {
                                            const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                                            const newValue = {
                                                before: value?.before || '0px',
                                                after: `${val}px`
                                            };
                                            onChange(newValue);
                                        }}
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-16 px-2 py-1.5 border border-gray-200 rounded-md text-sm focus:border-black focus:outline-none"
                                    />
                                    <span className="text-xs text-gray-500">px</span>
                                </div>
                            </div>
                        </>
                    )}

                    {layout === 'color-row' && (
                        <>
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleSelect(option.value)}
                                    onMouseDown={(e) => e.preventDefault()}
                                    className={`w-8 h-8 rounded-full border border-gray-100 hover:scale-110 transition-transform ${value === option.value ? 'ring-2 ring-offset-2 ring-black' : ''}`}
                                    style={{ backgroundColor: option.value }}
                                    title={option.value}
                                />
                            ))}
                            <div className="relative">
                                <div className="flex items-center gap-1 p-1 border border-gray-200 rounded-full bg-white">
                                    <button
                                        onClick={() => {
                                            setCustomColor(value);
                                            setShowColorPicker(!showColorPicker);
                                        }}
                                        className={`w-7 h-7 rounded-full hover:scale-105 transition-transform flex items-center justify-center ${'bg-[conic-gradient(at_center,_red,_orange,_yellow,_green,_blue,_purple,_red)]'}`}
                                        title="Pick Custom Color"
                                    />
                                </div>

                                {/* ChromePicker Popup */}
                                {showColorPicker && (
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-[100] p-0 bg-white shadow-2xl rounded-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                                        <div
                                            className="fixed inset-0 z-[-1]"
                                            onClick={() => setShowColorPicker(false)}
                                        />
                                        <style>{`
                                            .minimal-chrome-picker {
                                                width: 240px !important;
                                                font-family: inherit !important;
                                                border-radius: 0 !important; /* Managed by container */
                                            }
                                            .minimal-chrome-picker > div:last-child > div:last-child {
                                                display: none !important;
                                            }
                                            .minimal-chrome-picker > div:last-child {
                                                padding-bottom: 12px !important;
                                            }
                                        `}</style>

                                        <div className="bg-white">
                                            <ChromePicker
                                                color={customColor || '#000000'}
                                                onChange={(color) => setCustomColor(color.hex)}
                                                disableAlpha
                                                className="minimal-chrome-picker"
                                                styles={{
                                                    default: {
                                                        picker: { boxShadow: 'none', borderRadius: '0px' },
                                                        body: { padding: '12px 12px 0 12px' }
                                                    }
                                                }}
                                            />
                                        </div>

                                        <div className="px-3 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/80 gap-4">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-6 h-6 rounded-full border border-gray-200 shadow-sm ring-1 ring-white"
                                                    style={{ backgroundColor: customColor || '#000000' }}
                                                    title="Selected Color"
                                                />
                                                <input
                                                    type="text"
                                                    maxLength={7}
                                                    value={customColor || '#000000'}
                                                    onChange={(e) => setCustomColor(e.target.value)}
                                                    onFocus={(e) => e.target.select()}
                                                    className="text-xs font-mono font-medium text-gray-500 uppercase tracking-wider w-20 bg-transparent border-b border-gray-200 focus:border-black outline-none text-center"
                                                />
                                            </div>
                                            <button
                                                onClick={() => {
                                                    applyCustomColor();
                                                    setShowColorPicker(false);
                                                }}
                                                className="px-4 py-1.5 bg-black text-white text-[11px] font-bold uppercase tracking-wide rounded-md transition-all shadow-sm whitespace-nowrap hover:bg-gray-900"
                                            >
                                                Select
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {layout === 'list-grid' && options.map((option) => (
                        <button
                            key={option.label}
                            onClick={() => handleSelect(option.value)}
                            onMouseDown={(e) => e.preventDefault()}
                            className={`flex flex-col gap-1 p-2 border border-gray-100 rounded-lg hover:border-black hover:bg-gray-50 transition-all text-left group ${value === option.value ? 'border-black bg-gray-50' : ''}`}
                        >
                            {option.visual}
                        </button>
                    ))}

                    {/* Standard Options (text/icon) */}
                    {layout !== 'color-row' && layout !== 'list-grid' && layout !== 'spacing-control' && options.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => handleSelect(option.value)}
                            onMouseDown={(e) => e.preventDefault()}
                            className={`
                                flex items-center justify-center transition-all
                                ${layout === 'grid'
                                    ? `w-5 h-5  hover:scale-110 border border-black/5 ${value === option.value ? 'ring-2 ring-offset-1 ring-black' : ''}`
                                    : 'p-1 px-2 rounded hover:bg-gray-100 text-gray-600 hover:text-black text-sm'
                                }
                                ${layout !== 'grid' && value === option.value ? 'bg-black text-white hover:text-white' : ''}
                            `}
                            style={layout === 'grid' ? { backgroundColor: option.value } : {}}
                            title={option.label}
                        >
                            {layout !== 'grid' && option.icon ? option.icon : (layout !== 'grid' ? option.label : '')}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const CustomToolbar = React.memo(({ activeQuill, formats, setFormats, onAddBlock, onToggleEmoji, onLinkClick }) => {
    const handleMouseDown = (e) => e.preventDefault();
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    // Check undo/redo availability whenever formats change
    React.useEffect(() => {
        if (activeQuill && activeQuill.history) {
            const history = activeQuill.history;
            setCanUndo(history.stack.undo.length > 0);
            setCanRedo(history.stack.redo.length > 0);
        }
    }, [activeQuill, formats]);

    const format = (format, value) => {
        if (activeQuill) {
            activeQuill.focus();

            // Special handling for line spacing - apply to current line/paragraph
            if (format === 'spacing-before' || format === 'spacing-after') {
                const range = activeQuill.getSelection();
                if (range) {
                    // Get the current line
                    const [line] = activeQuill.getLine(range.index);
                    if (line) {
                        // Apply format to the entire line
                        const lineStart = activeQuill.getIndex(line);
                        const lineLength = line.length();
                        activeQuill.formatLine(lineStart, lineLength, format, value, 'user');

                        // Update formats state
                        setFormats((prev) => ({ ...prev, [format]: value }));
                    }
                }
            } else {
                // Normal formatting for other attributes
                activeQuill.format(format, value, 'user');
                setFormats((prev) => ({ ...prev, [format]: value }));
            }
        }
    };

    const toggleFormat = (fmt) => {
        if (activeQuill) {
            activeQuill.focus();
            const current = activeQuill.getFormat();
            activeQuill.format(fmt, !current[fmt], 'user');
            setFormats((prev) => ({ ...prev, [fmt]: !current[fmt] }));
        }
    };

    const handleUndo = () => {
        if (activeQuill?.history) {
            activeQuill.history.undo();
            // Update undo/redo availability after action
            setTimeout(() => {
                setCanUndo(activeQuill.history.stack.undo.length > 0);
                setCanRedo(activeQuill.history.stack.redo.length > 0);
            }, 0);
        }
    };

    const handleRedo = () => {
        if (activeQuill?.history) {
            activeQuill.history.redo();
            // Update undo/redo availability after action
            setTimeout(() => {
                setCanUndo(activeQuill.history.stack.undo.length > 0);
                setCanRedo(activeQuill.history.stack.redo.length > 0);
            }, 0);
        }
    };

    const Divider = () => <div className="w-px h-5 bg-gray-200 mx-1 self-center" />;

    const ToolButton = ({ onClick, active, icon, title }) => (
        <button
            className={`p-2 rounded-lg transition-all hover:scale-110 ${active ? ' text-black opacity-100' : 'text-black opacity-70 hover:opacity-100'}`}
            onMouseDown={handleMouseDown}
            onClick={onClick}
            title={title}
        >
            {icon}
        </button>
    );

    return (
        <div className="flex items-center  gap-1 bg-white text-black p-1.5 rounded-xl shadow-lg border border-gray-200 mx-auto w-fit flex-wrap justify-center px-4">

            {/* 1. Style */}
            <ToolbarPicker
                type="weight"
                title="Font Weight"
                icon={<MdFormatBold size={20} />}
                layout="vertical"
                value={formats.bold}
                options={['100', '200', '300', '400', '500', '600', '700', '800', '900'].map(w => ({ value: w, label: w }))}
                onChange={(val) => format('bold', val)}
            />
            <ToolButton onClick={() => toggleFormat('italic')} active={formats.italic} icon={<MdFormatItalic size={20} />} title="Italic" />
            <ToolButton onClick={() => toggleFormat('underline')} active={formats.underline} icon={<MdFormatUnderlined size={20} />} title="Underline" />
            <ToolButton onClick={() => toggleFormat('strike')} active={formats.strike} icon={<MdFormatStrikethrough size={20} />} title="Strikethrough" />
            <Divider />

            {/* 2. Color */}
            <div className="flex items-center gap-1">
                <ToolbarPicker
                    type="color"
                    title="Text Color"
                    icon={
                        <div className="flex flex-col items-center">
                            <MdFormatColorText size={20} style={{ color: 'black' }} />
                            <div className="w-5 h-1 -mt-1" style={{ backgroundColor: formats.color || 'black' }} />
                        </div>
                    }
                    layout="color-row"
                    value={formats.color}
                    options={[
                        { value: '#000000' }, { value: '#e60000' }, { value: '#ff9900' }, { value: '#ffff00' },
                        { value: '#008a00' }, { value: '#0066cc' }
                    ]}
                    onChange={(val) => format('color', val)}
                />
                <ToolbarPicker
                    type="background"
                    title="Highlight"
                    icon={
                        <div className="flex flex-col items-center">
                            <MdFormatColorFill size={20} style={{ color: 'black' }} />
                            <div className="w-5 h-1 -mt-1" style={{ backgroundColor: formats.background || 'black' }} />
                        </div>
                    }
                    layout="color-row"
                    value={formats.background}
                    options={[
                        { value: '#ffff0000' }, { value: '#00ff00' }, { value: '#00ffff' }, { value: '#ff00ff' },
                        { value: '#facccc' }, { value: '#ffebcc' }
                    ]}
                    onChange={(val) => format('background', val)}
                />
            </div>

            <Divider />

            {/* 3. Extras */}
            <ToolButton onClick={onToggleEmoji} icon={<MdOutlineEmojiEmotions size={20} />} title="Emoji" />

            <ToolbarPicker
                type="size"
                title="Font Size"
                icon={<AiOutlineFontSize size={20} color="black" className='font-extrabold' />}
                layout="vertical"
                value={formats.size}
                options={['10', '12', '14', '16', '18', '20', '24', '30', '36', '48', '60', '72'].map(s => ({ value: s + 'px', label: s }))}
                onChange={(val) => format('size', val)}
            />

            <Divider />

            {/* 4. Line Spacing */}
            <ToolbarPicker
                type="spacing"
                title="Line Spacing"
                icon={<MdOutlineFormatLineSpacing size={20} />}
                layout="spacing-control"
                value={{ before: formats['spacing-before'] || '0pt', after: formats['spacing-after'] || '0pt' }}
                options={[]}
                onChange={(val) => {
                    // Apply both spacing values
                    if (val.before) format('spacing-before', val.before);
                    if (val.after) format('spacing-after', val.after);
                }}
            />

            <Divider />

            {/* 5. Alignment & List */}
            <ToolbarPicker
                type="align"
                title="Alignment"
                icon={<MdFormatAlignLeft size={20} />}
                layout="horizontal"
                value={formats.align || ''}
                options={[
                    { value: '', label: 'Left', icon: <MdFormatAlignLeft size={20} /> },
                    { value: 'center', label: 'Center', icon: <MdFormatAlignCenter size={20} /> },
                    { value: 'right', label: 'Right', icon: <MdFormatAlignRight size={20} /> },
                    { value: 'justify', label: 'Justify', icon: <MdFormatAlignJustify size={20} /> }
                ]}
                onChange={(val) => format('align', val)}
            />

            <ToolbarPicker
                type="list"
                title="List Style"
                icon={<MdFormatListBulleted size={20} />}
                layout="horizontal"
                value={formats.list || ''}
                options={[
                    { value: 'ordered', label: 'Numbered', icon: <MdFormatListNumbered size={24} /> },
                    { value: 'bullet', label: 'Bulleted', icon: <MdFormatListBulleted size={24} /> },
                    { value: false, label: 'None', icon: <MdSubject size={24} /> }
                ]}
                onChange={(val) => format('list', val)}
            />

            <div className="flex items-center gap-0.5 ml-1">
                <ToolButton onClick={() => format('indent', '0')} icon={<MdFormatIndentDecrease size={20} />} title="Outdent" />
                <ToolButton onClick={() => format('indent', '+1')} icon={<MdFormatIndentIncrease size={20} />} title="Indent" />
            </div>

            <Divider />

            {/* 5. Media */}
            <ToolButton onClick={() => onAddBlock && onAddBlock('image')} icon={<MdImage size={20} />} title="Insert Image" />
            <ToolButton onClick={() => onLinkClick && onLinkClick()} icon={<MdLink size={20} />} title="Insert Link" />

            <Divider />

            {/* 6. History */}
            <ToolButton onClick={handleUndo} active={canUndo} icon={<MdUndo size={20} />} title="Undo" />
            <ToolButton onClick={handleRedo} active={canRedo} icon={<MdRedo size={20} />} title="Redo" />
        </div>
    );
});

export default CustomToolbar;