import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube } from 'react-icons/fa';

export default function Footer() {
    return (
        <footer className="bg-[#1a1a1a] text-gray-400 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Column 1: Logo & Vision */}
                    <div className="col-span-1 md:col-span-1">
                        <h3 className="text-white text-2xl font-bold mb-6">LOGO</h3>
                        <p className="text-sm leading-relaxed mb-6">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        </p>
                    </div>

                    {/* Column 2: Solutions */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Info</h4>
                        <ul className="space-y-4 text-sm">
                            <li><a href="#" className="hover:text-white transition">About Us</a></li>
                            <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
                            <li><a href="#" className="hover:text-white transition">Terms & Conditions</a></li>
                            <li><a href="#" className="hover:text-white transition">Returns & Exchange</a></li>
                            <li><a href="#" className="hover:text-white transition">Shipping Policy</a></li>
                        </ul>
                    </div>

                    {/* Column 3: Contact */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Contact Us</h4>
                        <ul className="space-y-4 text-sm">
                            <li><span className="block text-gray-500">Address:</span> 123 Street Name, City, Country</li>
                            <li><span className="block text-gray-500">Phone:</span> +123 456 7890</li>
                            <li><span className="block text-gray-500">Email:</span> email@example.com</li>
                        </ul>
                    </div>

                    {/* Column 4: Newsletter */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Follow Us</h4>
                        <div className="flex space-x-4 mb-6">
                            <a href="#" className="bg-white text-black p-2 rounded-full hover:bg-gray-200 transition"><FaFacebookF size={14} /></a>
                            <a href="#" className="bg-white text-black p-2 rounded-full hover:bg-gray-200 transition"><FaTwitter size={14} /></a>
                            <a href="#" className="bg-white text-black p-2 rounded-full hover:bg-gray-200 transition"><FaInstagram size={14} /></a>
                            <a href="#" className="bg-white text-black p-2 rounded-full hover:bg-gray-200 transition"><FaYoutube size={14} /></a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs">
                    <p>&copy; 2025 Clothing Co. All rights reserved.</p>
                    <div className="mt-4 md:mt-0">
                        <span className="mr-4">Privacy Policy</span>
                        <span>Terms of Use</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
