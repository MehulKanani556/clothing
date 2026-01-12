import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiX, FiUpload, FiImage } from 'react-icons/fi';
import { createBanner, updateBanner } from '../../../redux/slice/banner.slice';

export default function BannerModal({ isOpen, onClose, editBanner }) {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        link: '',
        buttonText: '',
        textPosition: 'left',
        order: 0,
        image: null,
        preview: null,
        textColor: '#000000',
        highlightColor: '#DC2626',
        buttonColor: '#000000',
        backgroundColor: '#F3F4F6'
    });

    useEffect(() => {
        if (isOpen) {
            if (editBanner) {
                setFormData({
                    title: editBanner.title,
                    subtitle: editBanner.subtitle || '',
                    link: editBanner.link || '',
                    buttonText: editBanner.buttonText || '',
                    textPosition: editBanner.textPosition || 'left',
                    order: editBanner.order || 0,
                    image: null,
                    preview: editBanner.image,
                    textColor: editBanner.textColor || '#000000',
                    highlightColor: editBanner.highlightColor || '#DC2626',
                    buttonColor: editBanner.buttonColor || '#000000',
                    backgroundColor: editBanner.backgroundColor || '#F3F4F6'
                });
            } else {
                setFormData({
                    title: '',
                    subtitle: '',
                    link: '',
                    buttonText: 'Shop Now',
                    textPosition: 'left',
                    order: 0,
                    image: null,
                    preview: null,
                    textColor: '#000000',
                    highlightColor: '#DC2626',
                    buttonColor: '#000000',
                    backgroundColor: '#F3F4F6'
                });
            }
        }
    }, [isOpen, editBanner]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                image: file,
                preview: URL.createObjectURL(file)
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('title', formData.title);
        data.append('subtitle', formData.subtitle);
        data.append('link', formData.link);
        data.append('buttonText', formData.buttonText);
        data.append('textPosition', formData.textPosition);
        data.append('order', formData.order);
        data.append('textColor', formData.textColor);
        data.append('highlightColor', formData.highlightColor);
        data.append('buttonColor', formData.buttonColor);
        data.append('backgroundColor', formData.backgroundColor);
        if (formData.image) {
            data.append('image', formData.image);
        }

        if (editBanner) {
            await dispatch(updateBanner({ id: editBanner._id, formData: data }));
        } else {
            await dispatch(createBanner(data));
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative z-10 flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900">
                        {editBanner ? 'Edit Banner' : 'Add New Banner'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <FiX size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Image Upload */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Banner Image</label>
                            <div className="flex items-center gap-4">
                                <div className="h-40 w-full bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                                    {formData.preview ? (
                                        <img
                                            src={formData.preview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="text-center p-4">
                                            <FiImage className="mx-auto h-12 w-12 text-gray-400" />
                                            <p className="mt-1 text-sm text-gray-500">Click to upload image</p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Headline Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                                    placeholder="e.g. Get [Exclusive] Offers"
                                />
                                <p className="text-xs text-gray-500">Note : For text Highlight use [text] format</p>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Subtitle</label>
                                <input
                                    type="text"
                                    name="subtitle"
                                    value={formData.subtitle}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                                    placeholder="e.g. Up to 40% off"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Button Text</label>
                                <input
                                    type="text"
                                    name="buttonText"
                                    value={formData.buttonText}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                                    placeholder="e.g. Shop Now"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Button Link</label>
                                <input
                                    type="text"
                                    name="link"
                                    value={formData.link}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                                    placeholder="e.g. /category/men"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Text Position</label>
                                <select
                                    name="textPosition"
                                    value={formData.textPosition}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                                >
                                    <option value="left">Left</option>
                                    <option value="center">Center</option>
                                    <option value="right">Right</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Sort Order</label>
                                <input
                                    type="number"
                                    name="order"
                                    value={formData.order}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Color Customization */}
                        <div className="border-t border-gray-100 pt-4">
                            <h4 className="text-sm font-semibold text-gray-900 mb-4">Color Customization</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-gray-500">Text Color</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            name="textColor"
                                            value={formData.textColor}
                                            onChange={handleChange}
                                            className="h-8 w-8 rounded cursor-pointer border-0 p-0"
                                        />
                                        <span className="text-xs text-gray-400 uppercase">{formData.textColor}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-gray-500">Highlight Color</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            name="highlightColor"
                                            value={formData.highlightColor}
                                            onChange={handleChange}
                                            className="h-8 w-8 rounded cursor-pointer border-0 p-0"
                                        />
                                        <span className="text-xs text-gray-400 uppercase">{formData.highlightColor}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-gray-500">Button Color</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            name="buttonColor"
                                            value={formData.buttonColor}
                                            onChange={handleChange}
                                            className="h-8 w-8 rounded cursor-pointer border-0 p-0"
                                        />
                                        <span className="text-xs text-gray-400 uppercase">{formData.buttonColor}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-gray-500">Background Color</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            name="backgroundColor"
                                            value={formData.backgroundColor}
                                            onChange={handleChange}
                                            className="h-8 w-8 rounded cursor-pointer border-0 p-0"
                                        />
                                        <span className="text-xs text-gray-400 uppercase">{formData.backgroundColor}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                {editBanner ? 'Update Banner' : 'Create Banner'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
