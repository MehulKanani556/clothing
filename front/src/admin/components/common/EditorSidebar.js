import React from 'react';
import {
    MdTextFields, MdImage, MdCheckCircle,
    MdFormatListBulleted, MdLink, MdTitle
} from 'react-icons/md';
import { IoList } from 'react-icons/io5';

const EditorSidebar = ({ onAddBlock, onSave, onLinkClick }) => {
    const widgets = [
        { type: 'title', icon: <MdTitle />, label: 'Title' },
        { type: 'list', icon: <IoList />, label: 'Points' },
        { type: 'image', icon: <MdImage />, label: 'Image' },
        { type: 'text', icon: <MdTextFields />, label: 'Text' },
        { type: 'link', icon: <MdLink />, label: 'Link', isLinkAction: true },
    ];

    return (
        <div className="w-[100px] bg-white m-3 rounded-lg border-gray-200 flex flex-col items-center z-30 shadow-sm overflow-y-auto custom-scrollbar">
            <div className="w-full bg-black py-3 mb-4 flex justify-center items-center rounded-t-lg">
                <span className="font-bold text-[15px] tracking-tight text-white">Velora</span>
            </div>
            <div className='flex-col flex justify-between h-full w-full px-3'>

                <div className="flex flex-col gap-3 w-full">
                    {widgets.map((widget) => (
                        <button
                            key={widget.type}
                            onClick={() => widget.isLinkAction ? onLinkClick?.() : onAddBlock(widget.type)}
                            className="flex flex-col items-center justify-center w-full aspect-square rounded-xl text-gray-600 hover:text-black hover:shadow-sm transition-all group"
                            title={`Add ${widget.label}`}
                        >
                            <div className=" mb-1 text-[35px] text-black group-hover:scale-110 w-full aspect-square flex items-center justify-center transition-transform p-2 bg-gray-50 rounded">{widget.icon}</div>
                            <span className="text-[15px] text-gray-500 font-medium group-hover:text-black">{widget.label}</span>
                        </button>
                    ))}
                </div>

                <button
                    onClick={onSave} // Removed unused hasChanges check as it relied on reverted code
                    className=" w-full mb-5 p-1 drop-shadow-md flex items-center justify-center bg-black text-white rounded  hover:scale-105 hover:-translate-y-1 transition-all duration-300 ease-out z-[100]"
                    title="Update Page"
                >
                    Save <MdCheckCircle size={20} className="ml-1" />
                </button>
            </div>
        </div>
    );
};

export default EditorSidebar;
