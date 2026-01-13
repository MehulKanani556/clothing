
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { MdConstruction } from 'react-icons/md';
import { FiSettings } from 'react-icons/fi';
import { fetchSettings } from '../redux/slice/settings.slice';

const MaintenancePage = () => {
    const dispatch = useDispatch();
    const { settings, loading } = useSelector(state => state.settings);
    const [message, setMessage] = useState('We are currently performing scheduled maintenance. We will be back shortly.');

    useEffect(() => {
        if (settings && settings.length > 0) {
            const maintenanceSetting = settings.find(s => s.key === 'maintenance_mode');
            if (maintenanceSetting && maintenanceSetting.value?.message) {
                setMessage(maintenanceSetting.value.message);
            }
        }
    }, [settings]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-lg mx-auto">
                <div className="relative mb-8 flex justify-center">
                    <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center animate-pulse">
                        <MdConstruction className="w-12 h-12 text-indigo-600" />
                    </div>
                    <div className="absolute -top-2 -right-2">
                        <FiSettings className="w-8 h-8 text-gray-400 animate-spin-slow" />
                    </div>
                </div>

                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-4">
                    Under Maintenance
                </h1>

                <div className="mt-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-lg text-gray-600 leading-relaxed">
                        {message}
                    </p>
                </div>

                <div className="mt-8 text-sm text-gray-500">
                    <p>Thank you for your patience.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MaintenancePage;
