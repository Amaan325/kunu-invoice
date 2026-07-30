// src/pages/InvoiceForm.jsx - Simplified with clean design
import React, { useState } from 'react';
import PDFConverter from './PDFConverter.jsx';
import logo1 from "../assets/icons/Logo.svg";

const InvoiceForm = () => {
    const [showConverter, setShowConverter] = useState(false);

    return (
        <div className="min-h-screen bg-white" style={{ fontFamily: "'Epilogue', sans-serif" }}>
            <div>

                {/* Header */}
                <div className="flex justify-between items-center pt-6 px-8 md:px-16 lg:px-24">
                    <div className="flex items-center gap-3">
                        <img src={logo1} alt="Kunu Labs" className="h-[40px] w-auto" />
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
                    <div className="text-center max-w-2xl">
                        <h1 className="font-['Merriweather'] font-bold text-4xl md:text-5xl leading-tight tracking-[-0.8px] text-[#12141D] mb-4">
                            PDF Converter
                        </h1>
                        <p className="font-['Epilogue'] font-light text-lg md:text-xl text-[#131313] mb-8">
                            Upload an old invoice PDF and convert it to the new format
                        </p>

                        <button
                            type="button"
                            onClick={() => setShowConverter(true)}
                            className="flex items-center gap-3 px-8 py-4 bg-[#131313] text-white rounded-xl hover:bg-[#2a2a2a] transition-all font-['Epilogue'] font-medium text-base md:text-lg mx-auto"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Convert PDF
                        </button>
                    </div>
                </div>

                {/* Simple Footer */}
                <div className="absolute bottom-0 left-0 right-0 py-4 text-center border-t border-gray-100">
                    <p className="font-['Epilogue'] text-sm text-gray-400">
                        © 2026 All Things Studio Kft
                    </p>
                </div>

                {/* Converter Modal */}
                {showConverter && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 relative shadow-2xl">
                            <button
                                onClick={() => setShowConverter(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors text-2xl"
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