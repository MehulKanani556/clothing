
import React, { useState, useEffect } from 'react';
import { MdConstruction } from 'react-icons/md';
import { FiSettings } from 'react-icons/fi';
import axiosInstance from '../utils/axiosInstance';
import { BASE_URL } from '../utils/BASE_URL';

const MaintenancePage = () => {
    const [message, setMessage] = useState('We are currently performing scheduled maintenance. We will be back shortly.');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await axiosInstance.get(`${BASE_URL}/settings`);
                if (response.data.success) {
                    const maintenanceSetting = response.data.data.find(s => s.key === 'maintenance_mode');
                    if (maintenanceSetting && maintenanceSetting.value?.message) {
                        setMessage(maintenanceSetting.value.message);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch maintenance message:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

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
                </div>
            </div>
        </div>
    );
};

export default MaintenancePage;
