import React, { useState, useEffect } from 'react';
import { MdClose, MdCloudUpload } from 'react-icons/md';
import CustomSelect from '../common/CustomSelect';

const CategoryModal = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        status: '',
        description: '',
        image: null,
        previewImage: null
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                slug: initialData.slug || '',
                status: initialData.status || '',
                description: initialData.description || '',
                image: null, // Keep file null initially in edit mode, unless user changes it
                previewImage: initialData.image || null
            });
        } else {
            setFormData({
                name: '',
                slug: '',
                status: '',
                description: '',
                image: null,
                previewImage: null
            });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'image') {
            const file = files[0];
            if (file) {
                setFormData(prev => ({
                    ...prev,
                    image: file,
                    previewImage: URL.createObjectURL(file)
                }));
            }
        } else if (name === 'name') {
            const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            setFormData(prev => ({ ...prev, name: value, slug: slug }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Return all form data including the file object
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all animate-scale-in">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800">
                        {initialData ? 'Edit Category' : 'Add New Category'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <MdClose size={24} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Category Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. Electronics"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
                                required
                            />
                        </div>
                        {/* Slug */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Slug</label>
                            <input
                                type="text"
                                name="slug"
                                value={formData.slug}
                                readOnly
                                placeholder="e.g. electronics"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Image */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Category Image</label>
                        <div className="flex items-center gap-4">
                            {formData.previewImage && (
                                <img src={formData.previewImage} alt="Preview" className="w-16 h-16 object-cover rounded-md border border-gray-200" />
                            )}
                            <div className="flex-1">
                                <label className="flex flex-col items-center justify-center w-full h-16 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <MdCloudUpload size={20} />
                                        <span className="text-sm">
                                            {formData.image ? formData.image.name : 'Choose file'}
                                        </span>
                                    </div>
                                    <input
                                        type="file"
                                        name="image"
                                        onChange={handleChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Status</label>
                        <CustomSelect
                            value={formData.status}
                            onChange={(val) => setFormData(prev => ({ ...prev, status: val }))}
                            options={[
                                { label: 'Active', value: 'Active' },
                                { label: 'Inactive', value: 'Inactive' }
                            ]}
                            placeholder="Select Status"
                            className="w-full"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Description (Optional)</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Brief description of the category..."
                            rows="4"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors resize-none"
                        ></textarea>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 transition-colors shadow-sm"
                        >
                            {initialData ? 'Update Category' : 'Add Category'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryModal;
