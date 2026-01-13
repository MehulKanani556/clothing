
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MdSave, MdBuild, MdWarning } from 'react-icons/md';
import toast from 'react-hot-toast';
import { fetchSettings, updateSetting } from '../../../redux/slice/settings.slice';

const Maintenance = () => {
    const dispatch = useDispatch();
    const { settings, loading } = useSelector(state => state.settings);
    const [saving, setSaving] = useState(false);
    const [maintenanceSettings, setMaintenanceSettings] = useState({
        isActive: false,
        message: 'The site is currently under maintenance. We will be back shortly.'
    });
    const [originalSettings, setOriginalSettings] = useState({
        isActive: false,
        message: 'The site is currently under maintenance. We will be back shortly.'
    });



    useEffect(() => {
        if (settings && settings.length > 0) {
            const maintenanceSetting = settings.find(s => s.key === 'maintenance_mode');
            if (maintenanceSetting && maintenanceSetting.value) {
                setMaintenanceSettings(maintenanceSetting.value);
                setOriginalSettings(maintenanceSetting.value);
            }
        }
    }, [settings]);

    // Check if settings have changed
    const hasChanges = JSON.stringify(maintenanceSettings) !== JSON.stringify(originalSettings);

    const handleSave = async () => {
        try {
            setSaving(true);
            await dispatch(updateSetting({
                key: 'maintenance_mode',
                value: maintenanceSettings,
                description: 'Maintenance mode configuration'
            })).unwrap();

            setOriginalSettings(maintenanceSettings);
            toast.success('Maintenance settings updated successfully');
        } catch (error) {
            console.error('Failed to save settings:', error);
            toast.error('Failed to update maintenance settings');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setMaintenanceSettings(originalSettings);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setMaintenanceSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="p-6">
                {/* Alert Banner for Active Maintenance */}
                {maintenanceSettings.isActive && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <MdWarning className="w-5 h-5 text-red-600 mr-3" />
                            <div>
                                <h3 className="text-sm font-medium text-red-800">
                                    Website is currently in maintenance mode
                                </h3>
                                <p className="text-sm text-red-700 mt-1">
                                    Visitors will see the maintenance message instead of your website.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Maintenance Mode</h1>
                            <p className="text-gray-600 mt-2">Configure maintenance mode settings for your website</p>
                        </div>

                        {/* Status Badge */}
                        <div className={`px-4 py-2 rounded-full font-semibold text-sm flex items-center space-x-2 ${maintenanceSettings.isActive
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : 'bg-green-100 text-green-800 border border-green-200'
                            }`}>
                            <div className={`w-2 h-2 rounded-full ${maintenanceSettings.isActive ? 'bg-red-500' : 'bg-green-500'
                                }`}></div>
                            <span>
                                {maintenanceSettings.isActive ? 'MAINTENANCE ON' : 'SITE LIVE'}
                            </span>
                        </div>
                    </div>
                </div>


                <div className=" mx-auto">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-indigo-50 rounded-lg">
                                    <MdBuild className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Maintenance Configuration</h2>
                                    <p className="text-sm text-gray-500">Manage your website's maintenance status and message</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Status Toggle */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${maintenanceSettings.isActive ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                        <MdWarning className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <h3 className="font-medium text-gray-900">Maintenance Status</h3>
                                            {hasChanges && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    Unsaved changes
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            {maintenanceSettings.isActive ? 'Your website is currently offline' : 'Your website is currently live'}
                                        </p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={maintenanceSettings.isActive}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>

                            {/* Message Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Maintenance Message
                                </label>
                                <textarea
                                    name="message"
                                    value={maintenanceSettings.message}
                                    onChange={handleChange}
                                    rows="4"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                    placeholder="Enter the message to display to visitors..."
                                />
                                <p className="mt-2 text-xs text-gray-500">
                                    This message will be displayed to all users when they visit your site while maintenance mode is active.
                                </p>
                            </div>

                            {/* Submit Button - Only show when changes are made */}
                            {hasChanges && (
                                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                    <button
                                        onClick={handleReset}
                                        disabled={saving}
                                        className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Reset Changes
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="inline-flex items-center px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <MdSave className="w-4 h-4 mr-2" />
                                        {saving ? 'Saving Changes...' : 'Save Settings'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Maintenance;
