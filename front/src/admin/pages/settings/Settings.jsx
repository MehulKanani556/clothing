
import React, { useState } from 'react';
import {
    MdLocationOn, MdSettings, MdShipping, MdPayment,
    MdNotifications, MdSecurity, MdBusiness
} from 'react-icons/md';
import { FiTruck, FiMapPin, FiSettings } from 'react-icons/fi';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import PickupAddresses from './PickupAddresses';

const Settings = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="p-6 space-y-6">
              

                {/* Content */}
                <PickupAddresses />
            </div>
        </div>
    );
};

export default Settings;