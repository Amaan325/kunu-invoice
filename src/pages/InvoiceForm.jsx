// src/pages/InvoiceForm.jsx - Simplified with only Convert PDF button
import React, { useState } from 'react';
import PDFConverter from './PDFConverter.jsx';
import logo1 from "../assets/icons/Logo.svg";

const InvoiceForm = () => {
    const [showConverter, setShowConverter] = useState(false);

    return (
        <div className="min-h-screen bg-[#EFEEF1]" style={{ fontFamily: "'Epilogue', sans-serif" }}>
            <div className="">

                {/* Header */}
                <div className="flex justify-between items-center pt-3 px-[100px]">
                    <div className="flex items-center gap-3">
                        <img src={logo1} alt="Kunu Labs" className="h-[48px] w-[66px]" />
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="font-semibold text-[16px] tracking-[0.08em] uppercase text-[#222222]">
                            Veristone
                        </span>
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="mt-6 bg-white overflow-hidden">

                    {/* Header Section */}
                    <div className="flex items-start px-[100px] mt-6 p-6 gap-8 border-gray-100">
                        <div className="flex-1">
                            <h1 className="font-['Merriweather'] font-bold text-[46px] leading-[42px] tracking-[-0.8px] text-[#12141D]">
                                PDF Converter
                            </h1>
                            <p className="font-['Epilogue'] font-light text-[18px] leading-[24px] text-[#131313] mt-2">
                                Upload an old invoice PDF and convert it to the new format
                            </p>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="py-6">
                        <div className="flex px-[100px] flex-wrap items-center mb-3 justify-center gap-4 pt-4">
                            <div className="flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowConverter(true)}
                                    className="flex items-center gap-2 px-6 py-3 bg-[#131313] text-white rounded-lg hover:bg-[#2a2a2a] transition-all font-['Epilogue'] font-medium text-[16px]"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                    Convert PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 px-[100px] pt-6 border-t border-gray-200/30">
                    <div className="flex flex-col items-start gap-4">
                        <div className="flex items-center gap-3">
                            <img src={logo1} alt="Kunu Labs" className="h-[36px] w-auto" />
                        </div>

                        <p className="font-['Merriweather'] text-[13px] text-[rgba(0,0,0,0.6)] tracking-[-0.42px]">
                            © 2026 All Things Studio Kft
                        </p>

                        <div className="flex items-center justify-between w-full mb-12">
                            <div className="flex items-center gap-2">
                                <a
                                    href="https://www.linkedin.com/company/kunu-labs/"
                                    className="font-['Epilogue'] text-[14px] text-[#131313] hover:opacity-70 transition-opacity flex items-center gap-2"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                    </svg>
                                </a>
                            </div>

                            <div className="flex items-center gap-5">
                                <a href="#" className="font-['Epilogue'] text-[14px] text-[#131313] underline hover:opacity-70 transition-opacity">
                                    Terms & Conditions
                                </a>
                                <a href="#" className="font-['Epilogue'] text-[14px] text-[#131313] underline hover:opacity-70 transition-opacity">
                                    Privacy Policy
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Converter Modal */}
                {showConverter && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
                            <button
                                onClick={() => setShowConverter(false)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                            <PDFConverter />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvoiceForm;