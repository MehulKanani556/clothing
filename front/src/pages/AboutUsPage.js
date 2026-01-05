import React from 'react';
import { FaUserShield, FaMedal, FaHandHoldingUsd, FaShoppingBag, FaBoxOpen, FaCreditCard, FaUsers, FaHeadset } from 'react-icons/fa';

const AboutUsPage = () => {
    return (
        <div className="bg-white text-gray-800 font-sans">

            {/* Top Section: Image Left, Text Right (Overlapping) */}
            <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
                <div className="relative flex flex-col md:flex-row items-center">
                    {/* Image */}
                    <div className="w-full md:w-3/5 h-[400px] md:h-[500px]">
                        <img
                            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop"
                            alt="Clothing Rack"
                            className="w-full h-full object-cover rounded-sm shadow-sm"
                        />
                    </div>

                    {/* Text Card - Overlapping on Desktop */}
                    <div className="w-full md:w-1/2 bg-white p-8 md:p-12 shadow-lg relative md:-ml-20 mt-6 md:mt-0 z-10 rounded-sm">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">About us</h2>
                        <p className="text-gray-500 mb-6 leading-relaxed">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Massa facilisis scelerisque iaculis habitant congue est blandit amet. Tortor in vulputate nulla vitae quam Lorem ipsum dolor sit amet consectetur. Massa facilisis scelerisque.
                        </p>
                        <p className="text-gray-500 leading-relaxed">
                            Lorem ipsum dolor sit amet consectetur. Massa facilisis scelerisque iaculis habitant congue est blandit amet. Tortor in vulputate nulla vitae quam Lorem ipsum dolor sit amet consectetur. Massa facilisis scelerisque.
                        </p>
                    </div>
                </div>
            </section>

            {/* Why Choose Us Section */}
            <div className="bg-gray-100 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 uppercase tracking-wide mb-2">Why Choose Us</h2>
                    <p className="text-gray-500 text-sm uppercase tracking-wider mb-16">Your Satisfaction Is Our Mission</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                        {/* Item 1 */}
                        <div className="flex flex-col items-center group">
                            <div className="w-16 h-16 bg-gray-200 text-gray-800 rounded flex items-center justify-center text-3xl mb-6 transition-colors group-hover:bg-gray-300">
                                <FaUserShield />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-3">Safe for All Users</h3>
                            <p className="text-gray-500 text-sm leading-relaxed px-4">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.
                            </p>
                        </div>

                        {/* Item 2 */}
                        <div className="flex flex-col items-center group">
                            <div className="w-16 h-16 bg-gray-200 text-gray-800 rounded flex items-center justify-center text-3xl mb-6 transition-colors group-hover:bg-gray-300">
                                <FaMedal />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-3">High-Quality Products</h3>
                            <p className="text-gray-500 text-sm leading-relaxed px-4">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.
                            </p>
                        </div>

                        {/* Item 3 */}
                        <div className="flex flex-col items-center group">
                            <div className="w-16 h-16 bg-gray-200 text-gray-800 rounded flex items-center justify-center text-3xl mb-6 transition-colors group-hover:bg-gray-300">
                                <FaHandHoldingUsd />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-3">Affordable & Great Value</h3>
                            <p className="text-gray-500 text-sm leading-relaxed px-4">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.
                            </p>
                        </div>

                        {/* Item 4 */}
                        <div className="flex flex-col items-center group">
                            <div className="w-16 h-16 bg-gray-200 text-gray-800 rounded flex items-center justify-center text-3xl mb-6 transition-colors group-hover:bg-gray-300">
                                <FaShoppingBag />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-3">Quick & Easy Shopping</h3>
                            <p className="text-gray-500 text-sm leading-relaxed px-4">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Our Goal Section: Text Left, Image Right (Overlapping) */}
            <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
                <div className="relative flex flex-col-reverse md:flex-row items-center justify-end">
                    {/* Text Card - Overlapping on Desktop */}
                    <div className="w-full md:w-1/2 bg-white p-8 md:p-12 shadow-lg relative md:-mr-20 mt-6 md:mt-0 z-10 rounded-sm">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Goal</h2>
                        <p className="text-gray-500 mb-6 leading-relaxed">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Massa facilisis scelerisque iaculis habitant congue est blandit amet. Tortor in vulputate nulla vitae quam Lorem ipsum dolor sit amet consectetur. Massa facilisis scelerisque.
                        </p>
                        <p className="text-gray-500 leading-relaxed">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Massa facilisis scelerisque iaculis habitant congue est blandit amet. Tortor in vulputate nulla vitae quam Lorem ipsum dolor sit amet consectetur. Massa facilisis scelerisque.
                        </p>
                    </div>

                    {/* Image */}
                    <div className="w-full md:w-3/5 h-[400px] md:h-[500px]">
                        <img
                            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2684&auto=format&fit=crop"
                            alt="Hoodies Rack"
                            className="w-full h-full object-cover rounded-sm shadow-sm"
                        />
                    </div>
                </div>
            </section>

            {/* Bottom Icons Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="flex items-center space-x-4 justify-center sm:justify-start">
                        <FaBoxOpen className="text-3xl text-gray-800" />
                        <div>
                            <h4 className="font-bold text-gray-900">10 Days</h4>
                            <p className="text-xs text-gray-500">Free return policy</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4 justify-center sm:justify-start">
                        <FaCreditCard className="text-3xl text-gray-800" />
                        <div>
                            <h4 className="font-bold text-gray-900">Payment</h4>
                            <p className="text-xs text-gray-500">Secure System</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4 justify-center sm:justify-start">
                        <FaUsers className="text-3xl text-gray-800" />
                        <div>
                            <h4 className="font-bold text-gray-900">99% Customer</h4>
                            <p className="text-xs text-gray-500">Feedback</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4 justify-center sm:justify-start">
                        <FaHeadset className="text-3xl text-gray-800" />
                        <div>
                            <h4 className="font-bold text-gray-900">24/7*</h4>
                            <p className="text-xs text-gray-500">Online Supports</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutUsPage;
