import React, { useState } from 'react';
import { Disclosure } from '@headlessui/react';
import { FaPlus, FaMinus } from 'react-icons/fa';

const faqCategories = [
    {
        id: 'general',
        title: 'General Merchandise Queries',
        faqs: [
            {
                question: 'Where can I find size charts?',
                answer: 'You can find size charts on every product page next to the size selection options. We provide detailed measurements to help you find the perfect fit.'
            },
            {
                question: 'Do you offer gift wrapping?',
                answer: 'Yes, we offer premium gift wrapping services for a small additional fee. You can select this option during checkout.'
            },
            {
                question: 'Are your products authentic?',
                answer: 'Absolutely. We guarantee 100% authenticity on all our products. We source directly from authorized manufacturers and suppliers.'
            }
        ]
    },
    {
        id: 'account',
        title: 'My Account & Registration',
        faqs: [
            {
                question: 'Can I reactivate my inactive account?',
                answer: 'Lorem ipsum dolor sit amet consectetur. Bibendum tellus quis eget gravida sit laoreet neque habitant nulla. Ligula vestibulum fames pharetra integer tincidunt. Sit massa vitae ut vitae vitae ipsum congue eros in. Vel nam morbi faucibus nullam nunc sit at bibendum orci.'
            },
            {
                question: 'How do I reset my password?',
                answer: 'To reset your password, go to the login page and click on "Forgot Password". Follow the instructions sent to your registered email address.'
            },
            {
                question: 'Can I change my email address?',
                answer: 'Yes, you can update your email address in the "Profile" section of your account settings.'
            },
            {
                question: 'Is my personal information safe?',
                answer: 'We take data privacy seriously. All your personal information is encrypted and stored securely according to global data protection standards.'
            },
            {
                question: 'How do I delete my account?',
                answer: 'If you wish to delete your account, please contact our support team or look for the "Delete Account" option in your profile settings.'
            }
        ]
    },
    {
        id: 'delivery',
        title: 'Delivery & Shipment',
        faqs: [
            {
                question: 'How long does shipping take?',
                answer: 'Standard shipping usually takes 3-5 business days. Express shipping options are available for 1-2 day delivery.'
            },
            {
                question: 'Do you ship internationally?',
                answer: 'Yes, we ship to most countries worldwide. International shipping times and costs vary by location.'
            },
            {
                question: 'Can I track my order?',
                answer: 'Yes, once your order is shipped, you will receive a tracking number via email to monitor your package\'s journey.'
            }
        ]
    },
    {
        id: 'purchase',
        title: 'Online Purchase Related',
        faqs: [
            {
                question: 'Can I cancel my order?',
                answer: 'You can cancel your order within 1 hour of placing it. After that, it may have already been processed.'
            },
            {
                question: 'How do I use a promo code?',
                answer: 'Enter your promo code in the designated box at checkout and click "Apply" to see the discount reflected in your total.'
            }
        ]
    },
    {
        id: 'payments',
        title: 'Payments',
        faqs: [
            {
                question: 'What payment methods do you accept?',
                answer: 'We accept Visa, MasterCard, American Express, PayPal, and various other local payment methods.'
            },
            {
                question: 'Is it safe to use my credit card?',
                answer: 'Yes, our checkout process is secured with SSL encryption to ensure your payment details are protected.'
            }
        ]
    },
    {
        id: 'sizing',
        title: 'Product Sizing',
        faqs: [
            {
                question: 'Are sizes true to fit?',
                answer: 'Our sizes generally run true to fit. However, we recommend checking the size guide for each specific product.'
            },
            {
                question: 'Do you have plus sizes?',
                answer: 'Yes, we offer a wide range of sizes including plus sizes for many of our collections.'
            }
        ]
    },
    {
        id: 'returns',
        title: 'Return & Exchange',
        faqs: [
            {
                question: 'What is your return policy?',
                answer: 'We accept returns within 30 days of purchase for items in their original condition with tags attached.'
            },
            {
                question: 'How do I initiate a return?',
                answer: 'Visit our Returns Center online, enter your order number, and follow the steps to print your return label.'
            }
        ]
    }
];

export default function FAQPage() {
    const [activeCategory, setActiveCategory] = useState(faqCategories[1]);

    return (
        <div className="bg-white min-h-screen py-20 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <h1 className="text-center text-3xl md:text-4xl font-semibold text-gray-900 mb-20 uppercase tracking-widest">
                    Frequently Asked Questions
                </h1>

                <div className="flex flex-col md:flex-row gap-8 lg:gap-24 items-start">
                    {/* Sidebar Navigation */}
                    <div className="w-full md:w-80 flex flex-col space-y-4 shrink-0">
                        {faqCategories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setActiveCategory(category)}
                                className={`text-left px-6 py-4 text-sm font-medium transition-all duration-200 border rounded-sm shadow-sm
                    ${activeCategory.id === category.id
                                        ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                                        : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'
                                    }`}
                            >
                                {category.title}
                            </button>
                        ))}
                    </div>

                    {/* Main Content */}
                    <div className="w-full grow">
                        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-widest mb-8">
                            {activeCategory.title}
                        </h2>

                        <div className="space-y-2 bg-white shadow-md p-3">
                            {activeCategory.faqs.map((faq, index) => (
                                <Disclosure key={index} defaultOpen={index === 0}>
                                    {({ open }) => (
                                        <div className={`${index !== activeCategory.faqs.length - 1 ? 'border-b' : ''} rounded-sm bg-white transition-all duration-200 ${open ? 'border-[#141414]/30' : 'border-[#141414]/30'}`}>
                                            <Disclosure.Button className="flex w-full justify-between items-center px-6 py-6 text-left focus:outline-none">
                                                <span className="text-sm font-medium text-gray-900">{faq.question}</span>
                                                <span className="ml-6 flex items-center shrink-0">
                                                    {open ? (
                                                        <FaMinus className="h-2.5 w-2.5 text-gray-900" />
                                                    ) : (
                                                        <FaPlus className="h-2.5 w-2.5 text-gray-900" />
                                                    )}
                                                </span>
                                            </Disclosure.Button>
                                            <Disclosure.Panel className="px-6 pb-6 pt-0 text-xs md:text-sm text-gray-500 leading-7 font-light relative -mt-2">
                                                <div className="border-t border-transparent pt-2">
                                                    {faq.answer}
                                                </div>
                                            </Disclosure.Panel>
                                        </div>
                                    )}
                                </Disclosure>
                            ))}
                        </div>
                    </div>
                </div> 
            </div>
        </div>
    );
}
