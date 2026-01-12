import React, { useEffect, useMemo } from 'react';
import { MdClose, MdCloudUpload } from 'react-icons/md';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { createBanner, updateBanner } from '../../../redux/slice/banner.slice';
import CustomSelect from '../common/CustomSelect';
import { toast } from 'react-hot-toast';

export default function BannerModal({ isOpen, onClose, editBanner }) {
    const dispatch = useDispatch();

    const validationSchema = useMemo(() => {
        return Yup.object({
            title: Yup.string().required('Headline Title is required'),
            subtitle: Yup.string(),
            link: Yup.string(),
            buttonText: Yup.string(),
            textPosition: Yup.string().oneOf(['left', 'center', 'right']),
            // Image is required only if NOT editing (no editBanner)
            image: editBanner
                ? Yup.mixed().nullable().optional()
                : Yup.mixed().required('Banner Image is required')
        });
    }, [editBanner]);

    const formik = useFormik({
        initialValues: {
            title: editBanner?.title || '',
            subtitle: editBanner?.subtitle || '',
            link: editBanner?.link || '',
            buttonText: editBanner?.buttonText || 'Shop Now',
            textPosition: editBanner?.textPosition || 'left',
            image: null,
            previewImage: editBanner?.image || null,
            textColor: editBanner?.textColor || '#000000',
            highlightColor: editBanner?.highlightColor || '#DC2626',
            subtitleHighlightColor: editBanner?.subtitleHighlightColor || '#ECA72C',
            buttonColor: editBanner?.buttonColor || '#000000',
            backgroundColor: editBanner?.backgroundColor || '#F3F4F6',
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            try {
                const data = new FormData();
                data.append('title', values.title);
                data.append('subtitle', values.subtitle);
                data.append('link', values.link);
                data.append('buttonText', values.buttonText);
                data.append('textPosition', values.textPosition);
                data.append('textColor', values.textColor);
                data.append('highlightColor', values.highlightColor);
                data.append('subtitleHighlightColor', values.subtitleHighlightColor);
                data.append('buttonColor', values.buttonColor);
                data.append('backgroundColor', values.backgroundColor);

                if (values.image) {
                    data.append('image', values.image);
                }

                if (editBanner) {
                    await dispatch(updateBanner({ id: editBanner._id, formData: data })).unwrap();
                    toast.success('Banner updated successfully');
                } else {
                    await dispatch(createBanner(data)).unwrap();
                    toast.success('Banner created successfully');
                }
                onClose();
            } catch (error) {
                toast.error(error.message || 'Failed to save banner');
            }
        },
    });

    // Reset form for "Add" mode
    useEffect(() => {
        if (isOpen && !editBanner) {
            formik.resetForm();
            formik.setValues({
                title: '',
                subtitle: '',
                link: '',
                buttonText: 'Shop Now',
                textPosition: 'left',
                image: null,
                previewImage: null,
                textColor: '#000000',
                highlightColor: '#DC2626',
                subtitleHighlightColor: '#ECA72C',
                buttonColor: '#000000',
                backgroundColor: '#F3F4F6',
            });
        }
    }, [isOpen, editBanner]);

    if (!isOpen) return null;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            formik.setFieldValue('image', file);
            formik.setFieldValue('previewImage', URL.createObjectURL(file));
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all animate-scale-in flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800">
                        {editBanner ? 'Edit Banner' : 'Add New Banner'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <MdClose size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <form onSubmit={formik.handleSubmit} className="space-y-6">
                        {/* Image Upload */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Banner Image</label>
                            <div className="flex items-center gap-4">
                                {formik.values.previewImage && (
                                    <img src={formik.values.previewImage} alt="Preview" className="w-32 h-20 object-cover rounded-md border border-gray-200" />
                                )}
                                <div className="flex-1">
                                    <label className={`flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${formik.touched.image && formik.errors.image
                                        ? 'border-red-300 bg-red-50 hover:bg-red-100'
                                        : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                                        }`}>
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <MdCloudUpload size={24} />
                                            <span className="text-sm font-medium">
                                                {formik.values.image ? formik.values.image.name : 'Click to upload banner image'}
                                            </span>
                                        </div>
                                        <input
                                            type="file"
                                            onChange={handleImageChange}
                                            accept="image/*"
                                            className="hidden"
                                            onBlur={() => formik.setFieldTouched('image', true)}
                                        />
                                    </label>
                                    {formik.touched.image && formik.errors.image && (
                                        <p className="text-xs text-red-500 mt-1">{formik.errors.image}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Headline Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formik.values.title}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 transition-colors ${formik.touched.title && formik.errors.title
                                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-300 focus:ring-black focus:border-black'
                                        }`}
                                    placeholder="e.g. Get [Exclusive] Offers"
                                />
                                {formik.touched.title && formik.errors.title ? (
                                    <p className="text-xs text-red-500 mt-1">{formik.errors.title}</p>
                                ) : (
                                    <p className="text-xs text-gray-500">Note: Use [text] to highlight words.</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Subtitle</label>
                                <input
                                    type="text"
                                    name="subtitle"
                                    value={formik.values.subtitle}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
                                    placeholder="e.g. Up to 40% off"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Button Text</label>
                                <input
                                    type="text"
                                    name="buttonText"
                                    value={formik.values.buttonText}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
                                    placeholder="e.g. Shop Now"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Button Link</label>
                                <input
                                    type="text"
                                    name="link"
                                    value={formik.values.link}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
                                    placeholder="e.g. /category/men"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Text Position</label>
                                <CustomSelect
                                    value={formik.values.textPosition}
                                    onChange={(value) => formik.setFieldValue('textPosition', value)}
                                    options={[
                                        { label: 'Left', value: 'left' },
                                        { label: 'Center', value: 'center' },
                                        { label: 'Right', value: 'right' }
                                    ]}
                                    className="w-full"
                                    placeholder="Select position"
                                />
                            </div>
                        </div>

                        {/* Color Customization */}
                        <div className="border-t border-gray-100 pt-6">
                            <h4 className="text-sm font-bold text-gray-800 mb-4">Color Customization</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Text Color</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            name="textColor"
                                            value={formik.values.textColor}
                                            onChange={formik.handleChange}
                                            className="h-10 w-10 rounded shadow-sm cursor-pointer border-0 p-0"
                                        />
                                        <span className="text-xs font-mono text-gray-500">{formik.values.textColor}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Highlight</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            name="highlightColor"
                                            value={formik.values.highlightColor}
                                            onChange={formik.handleChange}
                                            className="h-10 w-10 rounded shadow-sm cursor-pointer border-0 p-0"
                                        />
                                        <span className="text-xs font-mono text-gray-500">{formik.values.highlightColor}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Sub Highlight</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            name="subtitleHighlightColor"
                                            value={formik.values.subtitleHighlightColor}
                                            onChange={formik.handleChange}
                                            className="h-10 w-10 rounded shadow-sm cursor-pointer border-0 p-0"
                                        />
                                        <span className="text-xs font-mono text-gray-500">{formik.values.subtitleHighlightColor}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Button</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            name="buttonColor"
                                            value={formik.values.buttonColor}
                                            onChange={formik.handleChange}
                                            className="h-10 w-10 rounded shadow-sm cursor-pointer border-0 p-0"
                                        />
                                        <span className="text-xs font-mono text-gray-500">{formik.values.buttonColor}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Background</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            name="backgroundColor"
                                            value={formik.values.backgroundColor}
                                            onChange={formik.handleChange}
                                            className="h-10 w-10 rounded shadow-sm cursor-pointer border-0 p-0"
                                        />
                                        <span className="text-xs font-mono text-gray-500">{formik.values.backgroundColor}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-auto">
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
                                {editBanner ? 'Update Banner' : 'Create Banner'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
