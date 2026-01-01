import React from 'react';

export default function PromoBanner() {
    return (
        <div className="bg-indigo-600">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
                <div className="mb-6 md:mb-0 text-center md:text-left">
                    <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                        <span className="block">Ready to dive in?</span>
                        <span className="block text-indigo-200">Start your free trial today.</span>
                    </h2>
                    <p className="mt-4 text-lg leading-6 text-indigo-100">
                        Get exclusive access to our premium collection with 50% off for the first month.
                    </p>
                </div>
                <div className="flex space-x-4">
                    <a
                        href="#"
                        className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50"
                    >
                        Get Started
                    </a>
                    <a
                        href="#"
                        className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-500 hover:bg-opacity-75"
                    >
                        Learn More
                    </a>
                </div>
            </div>
        </div>
    );
}
