import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSettings, updateSetting } from '../../../redux/slice/settings.slice';
import { MdSave } from 'react-icons/md';
import { Formik, Form, Field } from 'formik';

const PricingRules = () => {
    const dispatch = useDispatch();
    const { settings, loading } = useSelector(state => state.settings);

    useEffect(() => {
        dispatch(fetchSettings());
    }, [dispatch]);

    const getSettingValue = (key, defaultValue) => {
        const setting = settings.find(s => s.key === key);
        return setting ? setting.value : defaultValue;
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Pricing & Configuration Rules</h2>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-4 border-b pb-2">Shipping Rules</h3>
                <Formik
                    enableReinitialize
                    initialValues={{
                        shipping_standard: getSettingValue('shipping_standard', 50),
                        shipping_free_threshold: getSettingValue('shipping_free_threshold', 1000)
                    }}
                    onSubmit={(values) => {
                        dispatch(updateSetting({ key: 'shipping_standard', value: values.shipping_standard, description: 'Standard Shipping Cost' }));
                        dispatch(updateSetting({ key: 'shipping_free_threshold', value: values.shipping_free_threshold, description: 'Free Shipping Order Value' }));
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Standard Shipping Cost (₹)</label>
                                    <Field name="shipping_standard" type="number" className="w-full border p-2 rounded" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Free Shipping Threshold (₹)</label>
                                    <Field name="shipping_free_threshold" type="number" className="w-full border p-2 rounded" />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                                    <MdSave /> Save Shipping Rules
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-4 border-b pb-2">Tax Rules (Defaults)</h3>
                <Formik
                    enableReinitialize
                    initialValues={{
                        tax_default_gst: getSettingValue('tax_default_gst', 18)
                    }}
                    onSubmit={(values) => {
                        dispatch(updateSetting({ key: 'tax_default_gst', value: values.tax_default_gst, description: 'Default GST Percentage' }));
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Default GST Percentage (%)</label>
                                <Field name="tax_default_gst" type="number" className="w-full border p-2 rounded" />
                                <p className="text-xs text-gray-500 mt-1">This value is used as fallback if Product GST is not specified.</p>
                            </div>
                            <div className="flex justify-end">
                                <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                                    <MdSave /> Save Tax Rules
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default PricingRules;
