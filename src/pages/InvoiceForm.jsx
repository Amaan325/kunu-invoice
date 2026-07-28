import React, { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import InvoicePDF from './InvoicePDF';
import OrderConfirmationPDF from './OrderConfirmationPDF';
import VeristonePDF from './VeristonePDF';
import logo1 from "../assets/icons/Logo.svg";
import logo2 from "../assets/icons/logo1.svg";
import total_item_icon from "../assets/icons/total_item_icon.svg";
import gross_icon from "../assets/icons/gross_total.png";
import vat_icon from "../assets/icons/VAT_icon.png";
import net_total_icon from "../assets/icons/net_total_icon.png";
import invoice_info_icon from "../assets/icons/invoice_icon.png";
import hash_icon from "../assets/icons/hash_icon.png";
import profile_icon from "../assets/icons/customer_icon.png";
import address_icon from "../assets/icons/address_icon.png";
import attention_icon from "../assets/icons/attention_icon.png";
import mail from "../assets/icons/mail_icon.png";
import vat_icon2 from "../assets/icons/vat_icon2.png";
import calender from "../assets/icons/calender_icon.png";
import item_section_icon from "../assets/icons/item_section_icon.png";

// Helper function to get today's date in DD/MM/YYYY format
const getTodayDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
};

// Helper function to get future date in DD/MM/YYYY format
const getFutureDate = (days = 30) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

// Helper function to get date in "May 22, 2026" format
const getDateDisplayFormat = (dateString) => {
    if (!dateString) return '';
    if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const parts = dateString.split('/');
        const date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    return dateString;
};

// Get placeholder based on active tab
const getDatePlaceholder = (tab) => {
    if (tab === 'veristone') {
        return 'DD/MM/YYYY';
    }
    return 'Month DD, YYYY';
};

const InvoiceForm = () => {
    // All fields start EMPTY on refresh
    const [orderNo, setOrderNo] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [vatRate, setVatRate] = useState('');
    const [address, setAddress] = useState('');
    const [attention, setAttention] = useState('');
    const [email, setEmail] = useState('');
    const [date, setDate] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [activeTab, setActiveTab] = useState('invoice');
    const [items, setItems] = useState([
        { id: 1, name: '', description: '', quantity: 1, price: 0 }
    ]);
    const [nextId, setNextId] = useState(2);
    const [isGenerating, setIsGenerating] = useState(false);

    const addItem = () => {
        setItems([...items, { id: nextId, name: '', description: '', quantity: 1, price: 0 }]);
        setNextId(nextId + 1);
    };

    const removeItem = (id) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id));
        }
    };

    const updateItem = (id, field, value) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    };

    const handleExportPDF = async () => {
        if (!orderNo || !customerName) {
            alert('Please fill in Order No and Customer Name');
            return;
        }

        if (items.some(item => !item.name || item.quantity <= 0 || item.price < 0)) {
            alert('Please fill in all item details correctly');
            return;
        }

        setIsGenerating(true);
        try {
            const netTotal = calculateTotal();
            const vatRateValue = parseFloat(vatRate) || 0;
            const vat = netTotal * (vatRateValue / 100);
            const grossTotal = netTotal + vat;

            const invoiceData = {
                orderNo: orderNo,
                customerName: customerName,
                vatRate: vatRateValue,
                address: address,
                date: date,
                dueDate: dueDate,
                attention: attention,
                email: email,
                items: items.filter(item => item.name).map((item, index) => ({
                    sno: index + 1,
                    name: item.name,
                    description: item.description || "Premium quality gemstone",
                    quantity: item.quantity,
                    price: item.price
                })),
                netTotal: netTotal,
                vat: vat,
                grossTotal: grossTotal,
                verifiedBy: "*Verified by: 75% gold Vetted on Worthserse, Austria",
                contactPhone: "+43 664 1488753",
                contactEmail: "info@veristone.eu",
                website: "www.veristone.eu"
            };

            let blob;
            if (activeTab === 'invoice') {
                blob = await pdf(<InvoicePDF data={invoiceData} />).toBlob();
            } else if (activeTab === 'confirmation') {
                blob = await pdf(<OrderConfirmationPDF data={invoiceData} />).toBlob();
            } else if (activeTab === 'veristone') {
                console.log('Generating Veristone PDF with form data...');

                const veristoneData = {
                    orderNo: orderNo || 'VerI000-2026-1',
                    items: invoiceData.items.length > 0 ? invoiceData.items : [
                        {
                            sno: 1,
                            name: 'Website Administration & Coming Soon',
                            description: 'Premium quality gemstone',
                            quantity: 1,
                            price: 30.00
                        },
                        {
                            sno: 2,
                            name: 'Professional Managed Hosting (EU) May',
                            description: 'Premium quality gemstone',
                            quantity: 1,
                            price: 25.00
                        },
                        {
                            sno: 3,
                            name: 'SSL Certificate Installation',
                            description: 'Premium quality gemstone',
                            quantity: 2,
                            price: 15.00
                        },
                        {
                            sno: 4,
                            name: 'Domain Registration & Management',
                            description: 'Premium quality gemstone',
                            quantity: 1,
                            price: 12.00
                        }
                    ],
                    netTotal: invoiceData.items.length > 0 ? netTotal : 122.00,
                    vat: invoiceData.items.length > 0 ? vat : 0.00,
                    grossTotal: invoiceData.items.length > 0 ? grossTotal : 122.00,
                    date: date || getTodayDate(),
                    dueDate: dueDate || getFutureDate(30),
                    customerName: customerName || 'The Hamilton Family Office',
                    address: address || '25 Berkeley Square\nMayfair, London W1J 6QF\nUnited Kingdom',
                    attention: attention || 'Mr. Edward Hamilton',
                    email: email || 'ehamilton@hamiltonfq.com',
                    vatRate: vatRateValue || 6.5,
                    verifiedBy: "*Verified by: 75% gold Vetted on Worthserse, Austria",
                    contactPhone: "+43 664 1488753",
                    contactEmail: "info@veristone.eu",
                    website: "www.veristone.eu"
                };

                console.log('Veristone Data being sent:', veristoneData);

                try {
                    const pdfInstance = pdf(<VeristonePDF data={veristoneData} />);
                    blob = await pdfInstance.toBlob();
                    console.log('Veristone PDF generated successfully');
                } catch (error) {
                    console.error('Veristone PDF generation failed:', error);
                    throw error;
                }
            }

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const fileName = activeTab === 'invoice' ? 'Invoice' : activeTab === 'confirmation' ? 'Order_Confirmation' : 'Veristone';
            link.download = `${fileName}_${orderNo.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert(`Failed to generate PDF: ${error.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    // Helper function to format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    // Reset to demo data based on active tab
    const resetToDemo = () => {
        const todayStr = getTodayDate();
        const futureStr = getFutureDate(30);
        const todayDisplay = getDateDisplayFormat(todayStr);
        const futureDisplay = getDateDisplayFormat(futureStr);

        if (activeTab === 'invoice') {
            setOrderNo('INV-2026-0522-017');
            setCustomerName('The Hamilton Family Office');
            setVatRate('6.5');
            setAddress('25 Berkeley Square\nMayfair, London W1J 6QF\nUnited Kingdom');
            setAttention('Mr. Edward Hamilton');
            setEmail('ehamilton@hamiltonfq.com');
            setDate(todayDisplay);
            setDueDate(futureDisplay);
            setItems([
                {
                    id: 1,
                    name: 'Round Brilliant Cut Diamond',
                    description: '3.02 ct | D Color | VVS2 Clarity | Excellent Cut | GIA Certificate No. 2487136210 | Origin: Botswana',
                    quantity: 1,
                    price: 210000
                },
                {
                    id: 2,
                    name: 'Cushion Cut Diamond',
                    description: '2.01 ct | F Color | VS1 Clarity | Ideal Cut | GIA Certificate No. 5298473921 | Origin: Lesotho',
                    quantity: 3,
                    price: 125000
                },
                {
                    id: 3,
                    name: 'Emerald Cut Diamond',
                    description: '4.50 ct | H Color | VVS1 Clarity | Excellent Cut | GIA Certificate No. 9876543210 | Origin: Namibia',
                    quantity: 1,
                    price: 195000
                },
                {
                    id: 4,
                    name: 'Princess Cut Diamond',
                    description: '2.75 ct | E Color | VS2 Clarity | Very Good Cut | GIA Certificate No. 1234567890 | Origin: Canada',
                    quantity: 1,
                    price: 89000
                },
                {
                    id: 5,
                    name: 'Oval Cut Diamond',
                    description: '5.10 ct | G Color | IF Clarity | Excellent Cut | GIA Certificate No. 3456789012 | Origin: South Africa',
                    quantity: 1,
                    price: 310000
                }
            ]);
            setNextId(6);
        } else if (activeTab === 'confirmation') {
            setOrderNo('OC-2026-0522-017');
            setCustomerName('The Hamilton Family Office');
            setVatRate('6.5');
            setAddress('25 Berkeley Square\nMayfair, London W1J 6QF\nUnited Kingdom');
            setAttention('REF-HFO-2026-001');
            setEmail('ehamilton@hamiltonfq.com');
            setDate(todayDisplay);
            setDueDate(futureDisplay);
            setItems([
                {
                    id: 1,
                    name: 'Round Brilliant Cut Diamond',
                    description: '3.02 ct | D Color | VVS2 Clarity | Excellent Cut | GIA Certificate No. 2487136210 | Origin: Botswana',
                    quantity: 1,
                    price: 210000
                },
                {
                    id: 2,
                    name: 'Cushion Cut Diamond',
                    description: '2.01 ct | F Color | VS1 Clarity | Ideal Cut | GIA Certificate No. 5298473921 | Origin: Lesotho',
                    quantity: 3,
                    price: 125000
                },
                {
                    id: 3,
                    name: 'Emerald Cut Diamond',
                    description: '4.50 ct | H Color | VVS1 Clarity | Excellent Cut | GIA Certificate No. 9876543210 | Origin: Namibia',
                    quantity: 1,
                    price: 195000
                }
            ]);
            setNextId(4);
        } else if (activeTab === 'veristone') {
            setOrderNo('VerI000-2026-1');
            setCustomerName('The Hamilton Family Office');
            setVatRate('6.5');
            setAddress('Király utca 93. 2. 20.\n1077 Budapest\nHungary');
            setAttention('Mr. Edward Hamilton');
            setEmail('ehamilton@hamiltonfq.com');
            setDate(todayStr);
            setDueDate(futureStr);
            setItems([
                {
                    id: 1,
                    name: 'Round Brilliant Cut Diamond',
                    description: '3.02 ct | D Color | VVS2 Clarity | Excellent Cut | GIA Certificate No. 2487136210 | Origin: Botswana',
                    quantity: 1,
                    price: 210000
                },
                {
                    id: 2,
                    name: 'Cushion Cut Diamond',
                    description: '2.01 ct | F Color | VS1 Clarity | Ideal Cut | GIA Certificate No. 5298473921 | Origin: Lesotho',
                    quantity: 3,
                    price: 125000
                },
                {
                    id: 3,
                    name: 'Emerald Cut Diamond',
                    description: '4.50 ct | H Color | VVS1 Clarity | Excellent Cut | GIA Certificate No. 9876543210 | Origin: Namibia',
                    quantity: 1,
                    price: 195000
                },
                {
                    id: 4,
                    name: 'Princess Cut Diamond',
                    description: '2.75 ct | E Color | VS2 Clarity | Very Good Cut | GIA Certificate No. 1234567890 | Origin: Canada',
                    quantity: 1,
                    price: 89000
                },
                {
                    id: 5,
                    name: 'Oval Cut Diamond',
                    description: '5.10 ct | G Color | IF Clarity | Excellent Cut | GIA Certificate No. 3456789012 | Origin: South Africa',
                    quantity: 1,
                    price: 310000
                }
            ]);
            setNextId(6);
        }
    };

    // Clear form
    const clearForm = () => {
        setOrderNo('');
        setCustomerName('');
        setVatRate('');
        setAddress('');
        setAttention('');
        setEmail('');
        setDate('');
        setDueDate('');
        setItems([{ id: 1, name: '', description: '', quantity: 1, price: 0 }]);
        setNextId(2);
    };

    // Get label text based on active tab
    const getLabel = (field) => {
        if (activeTab === 'invoice') {
            return field;
        }
        if (activeTab === 'confirmation') {
            const labelMap = {
                'Invoice Number': 'Order Number',
                'Attention (Person Name)': 'Client Reference',
                'Invoice Date': 'Confirmation Date',
                'Due Date': 'Estimated Dispatch',
                'Generate Invoice PDF': 'Generate Order Confirmation PDF'
            };
            return labelMap[field] || field;
        }
        if (activeTab === 'veristone') {
            const labelMap = {
                'Invoice Number': 'Document Number',
                'Attention (Person Name)': 'Attention',
                'Invoice Date': 'Date',
                'Due Date': 'Due Date',
                'Generate Invoice PDF': 'Generate Veristone PDF'
            };
            return labelMap[field] || field;
        }
        return field;
    };

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
                        <img src={logo2} alt="Veristone" className="h-[49px] w-[62px]" />
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="mt-6 bg-white overflow-hidden">

                    {/* Tab Navigation */}
                    <div className="flex items-start px-[100px] mt-6 p-6 gap-8 border-gray-100">
                        <div className="flex-1">
                            <h1 className="font-['Merriweather'] font-bold text-[46px] leading-[42px] tracking-[-0.8px] text-[#12141D]">
                                PDF Generator for Veristone
                            </h1>
                            <p className="font-['Epilogue'] font-light text-[18px] leading-[24px] text-[#131313] mt-2">
                                Powered by kunu labs
                            </p>
                        </div>

                        {/* Tab Switcher */}
                        <div className="flex rounded-full border border-[rgba(19,19,19,0.2)] overflow-hidden bg-white h-[48px]">
                            <button
                                onClick={() => setActiveTab('invoice')}
                                className={`px-5 py-2 text-[16px] font-medium transition-all duration-300 ${activeTab === 'invoice'
                                    ? 'bg-[#131313] text-white rounded-[60px] px-6'
                                    : 'bg-transparent text-[#131313] font-light px-6'
                                    }`}
                            >
                                Invoice Generator
                            </button>
                            <button
                                onClick={() => setActiveTab('confirmation')}
                                className={`px-5 py-2 text-[16px] font-light transition-all duration-300 ${activeTab === 'confirmation'
                                    ? 'bg-[#131313] text-white rounded-[60px] px-6'
                                    : 'bg-transparent text-[#131313] font-light px-6'
                                    }`}
                            >
                                Order Confirmation
                            </button>
                            <button
                                onClick={() => setActiveTab('veristone')}
                                className={`px-5 py-2 text-[16px] font-light transition-all duration-300 ${activeTab === 'veristone'
                                    ? 'bg-[#131313] text-white rounded-[60px] px-6'
                                    : 'bg-transparent text-[#131313] font-light px-6'
                                    }`}
                            >
                                Veristone PDF
                            </button>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="py-6">
                        <div className="flex flex-wrap gap-4 mb-6 px-[100px]">
                            {/* Total Items */}
                            <div className="flex-1 min-w-[200px] bg-[#EFEEF1] rounded-xl p-4" style={{ height: '110px' }}>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                                        <img src={total_item_icon} alt="Total Items" className="w-[48px] h-[48px]" />
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <p className="font-['Epilogue'] font-light text-[16px] leading-[24px] text-[#131313]">Total Items</p>
                                        <p className="font-['Epilogue'] font-semibold text-[20px] leading-[24px] tracking-[-0.5px] text-[#12141D]">
                                            {items.length}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Net Total */}
                            <div className="flex-1 min-w-[200px] bg-[#EFEEF1] rounded-xl p-4" style={{ height: '110px' }}>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                                        <img src={net_total_icon} alt="Net Total" className="w-[48px] h-[48px]" />
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <p className="font-['Epilogue'] font-light text-[16px] leading-[24px] text-[#131313]">Net Total</p>
                                        <p className="font-['Epilogue'] font-semibold text-[20px] leading-[24px] tracking-[-0.5px] text-[#12141D]">
                                            €{formatCurrency(calculateTotal())}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* VAT */}
                            <div className="flex-1 min-w-[200px] bg-[#EFEEF1] rounded-xl p-4" style={{ height: '110px' }}>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                                        <img src={vat_icon} alt="VAT" className="w-[48px] h-[48px]" />
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <p className="font-['Epilogue'] font-light text-[16px] leading-[24px] text-[#131313]">VAT ({vatRate || 0}%)</p>
                                        <p className="font-['Epilogue'] font-semibold text-[20px] leading-[24px] tracking-[-0.5px] text-[#12141D]">
                                            €{formatCurrency(calculateTotal() * ((parseFloat(vatRate) || 0) / 100))}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Gross Total */}
                            <div className="flex-1 min-w-[200px] bg-[#EFEEF1] rounded-xl p-4" style={{ height: '110px' }}>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                                        <img src={gross_icon} alt="Gross Total" className="w-[48px] h-[48px]" />
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <p className="font-['Epilogue'] font-light text-[16px] leading-[24px] text-[#131313]">Gross Total</p>
                                        <p className="font-['Epilogue'] font-semibold text-[20px] leading-[24px] tracking-[-0.5px] text-[#12141D]">
                                            €{formatCurrency(calculateTotal() * (1 + (parseFloat(vatRate) || 0) / 100))}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Fields - Invoice Information Section */}
                        <div className="mb-6 px-[100px] pt-0">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-14 h-14 bg-[#131313] rounded-full flex items-center justify-center flex-shrink-0">
                                    <img src={invoice_info_icon} alt="Invoice Information" className="w-[56px] h-[56px]" />
                                </div>
                                <h2 className="font-['Lora'] font-medium text-[18px] leading-[24px] text-[#131313]">
                                    {activeTab === 'invoice' ? 'Invoice Information' :
                                        activeTab === 'confirmation' ? 'Order Confirmation Information' :
                                            'Veristone Document Information'}
                                </h2>
                            </div>

                            {/* Row 1: Invoice Number and Customer Name */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="font-['Epilogue'] font-normal text-[16px] leading-[24px] text-[#131313] block mb-2">
                                        {getLabel('Invoice Number')}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                            <img src={hash_icon} alt="Order Number" className="w-6 h-6" />
                                        </div>
                                        <input
                                            type="text"
                                            value={orderNo}
                                            onChange={(e) => setOrderNo(e.target.value)}
                                            className="w-full pl-11 pr-3 py-3 border border-[rgba(19,19,19,0.3)] rounded-xl focus:ring-2 focus:ring-[#131313] focus:border-transparent outline-none transition-all bg-white text-[16px] font-['Epilogue']"
                                            placeholder={activeTab === 'invoice' ? 'INV-2026-0522-017' :
                                                activeTab === 'confirmation' ? 'OC-2026-0522-017' :
                                                    'VerI000-2026-1'}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="font-['Epilogue'] font-normal text-[16px] leading-[24px] text-[#131313] block mb-2">
                                        Customer Name
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                            <img src={profile_icon} alt="Customer Name" className="w-6 h-6" />
                                        </div>
                                        <input
                                            type="text"
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                            className="w-full pl-11 pr-3 py-3 border border-[rgba(19,19,19,0.3)] rounded-xl focus:ring-2 focus:ring-[#131313] focus:border-transparent outline-none transition-all bg-white text-[16px] font-['Epilogue']"
                                            placeholder="The Hamilton Family Office"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Row 2: Address (Full Width) */}
                            <div className="mb-4">
                                <label className="font-['Epilogue'] font-normal text-[16px] leading-[24px] text-[#131313] block mb-2">
                                    Address
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3 top-3">
                                        <img src={address_icon} alt="Address" className="w-5 h-5" />
                                    </div>
                                    <textarea
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        rows="3"
                                        className="w-full pl-11 pr-3 py-3 border border-[rgba(19,19,19,0.3)] rounded-xl focus:ring-2 focus:ring-[#131313] focus:border-transparent outline-none transition-all bg-white text-[16px] font-['Epilogue'] resize-none"
                                        placeholder={activeTab === 'veristone' ?
                                            "Király utca 93. 2. 20.\n1077 Budapest\nHungary" :
                                            "25 Berkeley Square\nMayfair, London W1J 6QF\nUnited Kingdom"}
                                    />
                                </div>
                            </div>

                            {/* Row 3: Attention and Email */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="font-['Epilogue'] font-normal text-[16px] leading-[24px] text-[#131313] block mb-2">
                                        {getLabel('Attention (Person Name)')}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                            <img src={attention_icon} alt="Attention" className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="text"
                                            value={attention}
                                            onChange={(e) => setAttention(e.target.value)}
                                            className="w-full pl-11 pr-3 py-3 border border-[rgba(19,19,19,0.3)] rounded-xl focus:ring-2 focus:ring-[#131313] focus:border-transparent outline-none transition-all bg-white text-[16px] font-['Epilogue']"
                                            placeholder={activeTab === 'invoice' ? 'Mr. Edward Hamilton' :
                                                activeTab === 'confirmation' ? 'REF-HFO-2026-001' :
                                                    'Mr. Edward Hamilton'}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="font-['Epilogue'] font-normal text-[16px] leading-[24px] text-[#131313] block mb-2">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                            <img src={mail} alt="Email" className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-11 pr-3 py-3 border border-[rgba(19,19,19,0.3)] rounded-xl focus:ring-2 focus:ring-[#131313] focus:border-transparent outline-none transition-all bg-white text-[16px] font-['Epilogue']"
                                            placeholder="ehamilton@hamiltonfq.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Row 4: VAT Rate, Invoice Date, Due Date */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="font-['Epilogue'] font-normal text-[16px] leading-[24px] text-[#131313] block mb-2">
                                        VAT Rate (%)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.1"
                                            value={vatRate}
                                            onChange={(e) => setVatRate(e.target.value)}
                                            className="w-full pl-3 pr-11 py-3 border border-[rgba(19,19,19,0.3)] rounded-xl focus:ring-2 focus:ring-[#131313] focus:border-transparent outline-none transition-all bg-white text-[16px] font-['Epilogue']"
                                            placeholder="6.5"
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <img src={vat_icon2} alt="VAT Rate" className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="font-['Epilogue'] font-normal text-[16px] leading-[24px] text-[#131313] block mb-2">
                                        {getLabel('Invoice Date')}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="w-full pl-3 pr-11 py-3 border border-[rgba(19,19,19,0.3)] rounded-xl focus:ring-2 focus:ring-[#131313] focus:border-transparent outline-none transition-all bg-white text-[16px] font-['Epilogue']"
                                            placeholder={activeTab === 'veristone' ? 'DD/MM/YYYY' : 'Month DD, YYYY'}
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <img src={calender} alt="Date" className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="font-['Epilogue'] font-normal text-[16px] leading-[24px] text-[#131313] block mb-2">
                                        {getLabel('Due Date')}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={dueDate}
                                            onChange={(e) => setDueDate(e.target.value)}
                                            className="w-full pl-3 pr-11 py-3 border border-[rgba(19,19,19,0.3)] rounded-xl focus:ring-2 focus:ring-[#131313] focus:border-transparent outline-none transition-all bg-white text-[16px] font-['Epilogue']"
                                            placeholder={activeTab === 'veristone' ? 'DD/MM/YYYY' : 'Month DD, YYYY'}
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <img src={calender} alt="Due Date" className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Items Section */}
                        <div className="mb-6 px-[100px]">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-14 h-14 bg-[#131313] rounded-full flex items-center justify-center flex-shrink-0">
                                        <img src={item_section_icon} alt="Items Information" className="w-[56px] h-[56px]" />
                                    </div>
                                    <h2 className="font-['Lora'] font-medium text-[18px] leading-[24px] text-[#131313]">
                                        Items Information
                                    </h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-[#131313] text-[#BDFD66] rounded-lg hover:bg-[#2a2a2a] transition-all font-['Epilogue'] font-medium text-[14px]"
                                >
                                    <svg className="w-4 h-4 text-[#BDFD66]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Item
                                </button>
                            </div>

                            {/* Items Table */}
                            <div className="bg-[#F8F8F8] rounded-xl border border-[rgba(19,19,19,0.15)] overflow-hidden">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-[#F0F0F0] border-b border-[rgba(19,19,19,0.1)]">
                                            <th className="text-left px-4 py-4 font-['Epilogue'] font-semibold text-[11px] tracking-[0.12em] uppercase text-[#131313] w-[25%]">ITEM NAME</th>
                                            <th className="text-left px-4 py-4 font-['Epilogue'] font-medium text-[11px] tracking-[0.12em] uppercase text-[#131313] w-[55%]">DESCRIPTION</th>
                                            <th className="text-left px-4 py-4 font-['Epilogue'] font-medium text-[11px] tracking-[0.12em] uppercase text-[#131313] w-[10%]">QUANTITY</th>
                                            <th className="text-left px-4 py-4 font-['Epilogue'] font-medium text-[11px] tracking-[0.12em] uppercase text-[#131313] w-[15%]">UNIT PRICE</th>
                                            <th className="text-left px-4 py-4 font-['Epilogue'] font-medium text-[11px] tracking-[0.12em] uppercase text-[#131313] w-[15%]">TOTAL</th>
                                            <th className="text-center px-4 py-4 font-['Epilogue'] font-medium text-[11px] tracking-[0.12em] uppercase text-[#131313] w-[10%]">ACTION</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item) => (
                                            <tr key={item.id} className="bg-[#F0F0F0] border-b border-[rgba(19,19,19,0.06)] hover:bg-gray-50/80 transition-colors">
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="text"
                                                        value={item.name}
                                                        onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                                        className="w-full px-3 py-2.5 bg-white border border-[rgba(19,19,19,0.2)] rounded-lg focus:ring-2 focus:ring-[#131313] focus:border-transparent outline-none text-[14px] font-['Epilogue'] text-[#131313] placeholder:text-[#9CA3AF] transition-all"
                                                        placeholder="Round Brilliant Cut Diamond"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="text"
                                                        value={item.description}
                                                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                                        className="w-full px-3 py-2.5 bg-white border border-[rgba(19,19,19,0.2)] rounded-lg focus:ring-2 focus:ring-[#131313] focus:border-transparent outline-none text-[14px] font-['Epilogue'] text-[#131313] placeholder:text-[#9CA3AF] transition-all"
                                                        placeholder="3.02 ct | D Color | VVS2 Clarity | Excellent Cut"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                                        className="w-full px-3 py-2.5 bg-white border border-[rgba(19,19,19,0.2)] rounded-lg focus:ring-2 focus:ring-[#131313] focus:border-transparent outline-none text-[14px] font-['Epilogue'] text-[#131313] transition-all"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={item.price}
                                                        onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                                                        className="w-full px-3 py-2.5 bg-white border border-[rgba(19,19,19,0.2)] rounded-lg focus:ring-2 focus:ring-[#131313] focus:border-transparent outline-none text-[14px] font-['Epilogue'] text-[#131313] transition-all"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="font-['Epilogue'] font-semibold text-[15px] text-[#131313]">
                                                        €{formatCurrency(item.quantity * item.price)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(item.id)}
                                                        disabled={items.length === 1}
                                                        className="text-[#DB504A] hover:text-[#b8433a] transition-colors disabled:opacity-30 disabled:cursor-not-allowed p-1.5 rounded-lg hover:bg-red-50"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex px-[100px] flex-wrap items-center mb-3 justify-end gap-4 pt-4">
                            <div className="flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={resetToDemo}
                                    className="flex items-center gap-2 px-4 py-2.5 border border-[#131313] hover:bg-gray-50 transition-all font-['Epilogue'] font-medium text-[14px] text-[#131313]"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Reset to Demo
                                </button>
                                <button
                                    type="button"
                                    onClick={clearForm}
                                    className="flex items-center gap-2 px-4 py-2.5 border border-[#131313] hover:bg-gray-50 transition-all font-['Epilogue'] font-medium text-[14px] text-[#131313]"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                    </svg>
                                    Clear Form
                                </button>
                                <button
                                    type="button"
                                    onClick={handleExportPDF}
                                    disabled={!orderNo || !customerName || isGenerating || items.some(item => !item.name || item.quantity <= 0 || item.price < 0)}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-[#BDFD66] text-[#131313] hover:bg-[#a8e85a] transition-all font-['Epilogue'] font-medium text-[14px] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isGenerating ? (
                                        <>
                                            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            {activeTab === 'invoice' ? 'Generate Invoice PDF' :
                                                activeTab === 'confirmation' ? 'Generate Order Confirmation PDF' :
                                                    'Generate Veristone PDF'}
                                        </>
                                    )}
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
            </div>
        </div>
    );
};

export default InvoiceForm;