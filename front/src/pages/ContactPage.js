import React from 'react';
import { MapPinIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

const ContactPage = () => {
    return (
        <div className="bg-white">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl uppercase">Contact Us</h1>
                </div>

                <div className="lg:grid lg:grid-cols-2 lg:gap-8">
                    {/* Image Section */}
                    <div className="relative h-64 w-full sm:h-72 md:h-96 lg:h-full">
                        <img
                            className="absolute inset-0 h-full w-full object-cover rounded-lg shadow-lg"
                            src="https://images.unsplash.com/photo-1596524430615-b46475ddff6e?q=80&w=2940&auto=format&fit=crop"
                            alt="Contact Us"
                        />
                    </div>

                    {/* Form Section */}
                    <div className="mt-10 lg:mt-0 lg:pl-8">
                        <h2 className="text-2xl font-bold text-gray-900">Get in touch</h2>
                        <p className="mt-2 text-sm text-gray-500">
                            Register your account easily enter your email below
                        </p>
                        <form action="#" method="POST" className="mt-8 grid grid-cols-1 gap-y-6">
                            <div>
                                <label htmlFor="full-name" className="block text-sm font-medium text-gray-700">
                                    Full Name
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="text"
                                        name="full-name"
                                        id="full-name"
                                        autoComplete="name"
                                        className="block w-full rounded-md border-gray-300 bg-gray-100 py-3 px-4 shadow-sm focus:border-black focus:ring-black"
                                        placeholder="Your Name"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        autoComplete="email"
                                        className="block w-full rounded-md border-gray-300 bg-gray-100 py-3 px-4 shadow-sm focus:border-black focus:ring-black"
                                        placeholder="Your Email"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                                    Subject
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="text"
                                        name="subject"
                                        id="subject"
                                        className="block w-full rounded-md border-gray-300 bg-gray-100 py-3 px-4 shadow-sm focus:border-black focus:ring-black"
                                        placeholder="Your Subject"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                                    Message
                                </label>
                                <div className="mt-1">
                                    <textarea
                                        id="message"
                                        name="message"
                                        rows={4}
                                        className="block w-full rounded-md border-gray-300 bg-gray-100 py-3 px-4 shadow-sm focus:border-black focus:ring-black"
                                        placeholder="Your Message"
                                        defaultValue={''}
                                    />
                                </div>
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    className="inline-flex justify-center rounded-sm border border-transparent bg-black py-3 px-6 text-base font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Contact info cards */}
                <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="bg-white p-8 shadow-lg text-center rounded-lg">
                        <div className="flex justify-center mb-4">
                            <MapPinIcon className="h-8 w-8 text-gray-900" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Head Office</h3>
                        <p className="mt-2 text-base text-gray-500">
                            4140 Parker Rd. Allentown,<br />
                            New Mexico 31134
                        </p>
                    </div>

                    <div className="bg-white p-8 shadow-lg text-center rounded-lg">
                        <div className="flex justify-center mb-4">
                            <PhoneIcon className="h-8 w-8 text-gray-900" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Call us</h3>
                        <p className="mt-2 text-base text-gray-500">
                            (207) 555-0119<br />
                            (207) 555-0119
                        </p>
                    </div>

                    <div className="bg-white p-8 shadow-lg text-center rounded-lg">
                        <div className="flex justify-center mb-4">
                            <EnvelopeIcon className="h-8 w-8 text-gray-900" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Email us</h3>
                        <p className="mt-2 text-base text-gray-500">
                            example@gmail.com<br />
                            example@gmail.com
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ContactPage;
