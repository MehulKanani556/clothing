import React, { useState } from 'react';
import { 
    MdLocationOn, MdSettings, MdShipping, MdPayment, 
    MdNotifications, MdSecurity, MdBusiness 
} from 'react-icons/md';
import { FiTruck, FiMapPin, FiSettings } from 'react-icons/fi';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import PickupAddresses from './PickupAddresses';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('pickup-addresses');

    const tabs = [
        {
            id: 'pickup-addresses',
            label: 'Pickup Addresses',
            icon: <MdLocationOn className="w-5 h-5" />,
            description: 'Manage Shiprocket pickup locations'
        },
        {
            id: 'shipping',
            label: 'Shipping Settings',
            icon: <FiTruck className="w-5 h-5" />,
            description: 'Configure shipping preferences'
        },
        {
            id: 'general',
            label: 'General Settings',
            icon: <FiSettings className="w-5 h-5" />,
            description: 'Basic application settings'
        }
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'pickup-addresses':
                return <PickupAddresses />;
            case 'shipping':
                return (
                    <div className="min-h-screen bg-gray-50">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                                <div className="text-center py-12">
                                    <FiTruck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Shipping Settings</h3>
                                    <p className="text-gray-600">Shipping configuration options coming soon...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'general':
                return (
                    <div className="min-h-screen bg-gray-50">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                                <div className="text-center py-12">
                                    <FiSettings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">General Settings</h3>
                                    <p className="text-gray-600">General configuration options coming soon...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className=" p-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-600 mt-2">Manage your application settings and configurations</p>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6" aria-label="Tabs">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`${
                                        activeTab === tab.id
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}
                                >
                                    {tab.icon}
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                {renderTabContent()}
            </div>
        </div>
    );
};

export default Settings;