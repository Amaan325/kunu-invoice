// OrderConfirmationPDF.jsx
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import LogoSvg from "../assets/logo1.svg";
// Import Phosphor icons for PDF
import { MapPin, Phone, Envelope, Globe } from "phosphor-icons-react-pdf";

// Import all Metropolis OTF fonts from your assets folder
import MetropolisBlack from "../assets/Fonts_veristone/metropolis/Metropolis-Black.otf";
import MetropolisBlackItalic from "../assets/Fonts_veristone/metropolis/Metropolis-BlackItalic.otf";
import MetropolisBold from "../assets/Fonts_veristone/metropolis/Metropolis-Bold.otf";
import MetropolisBoldItalic from "../assets/Fonts_veristone/metropolis/Metropolis-BoldItalic.otf";
import MetropolisExtraBold from "../assets/Fonts_veristone/metropolis/Metropolis-ExtraBold.otf";
import MetropolisExtraBoldItalic from "../assets/Fonts_veristone/metropolis/Metropolis-ExtraBoldItalic.otf";
import MetropolisExtraLight from "../assets/Fonts_veristone/metropolis/Metropolis-ExtraLight.otf";
import MetropolisExtraLightItalic from "../assets/Fonts_veristone/metropolis/Metropolis-ExtraLightItalic.otf";
import MetropolisLight from "../assets/Fonts_veristone/metropolis/Metropolis-Light.otf";
import MetropolisLightItalic from "../assets/Fonts_veristone/metropolis/Metropolis-LightItalic.otf";
import MetropolisMedium from "../assets/Fonts_veristone/metropolis/Metropolis-Medium.otf";
import MetropolisMediumItalic from "../assets/Fonts_veristone/metropolis/Metropolis-MediumItalic.otf";
import MetropolisRegular from "../assets/Fonts_veristone/metropolis/Metropolis-Regular.otf";
import MetropolisRegularItalic from "../assets/Fonts_veristone/metropolis/Metropolis-RegularItalic.otf";
import MetropolisSemiBold from "../assets/Fonts_veristone/metropolis/Metropolis-SemiBold.otf";
import MetropolisSemiBoldItalic from "../assets/Fonts_veristone/metropolis/Metropolis-SemiBoldItalic.otf";
import MetropolisThin from "../assets/Fonts_veristone/metropolis/Metropolis-Thin.otf";
import MetropolisThinItalic from "../assets/Fonts_veristone/metropolis/Metropolis-ThinItalic.otf";

// Import Cormorant fonts
import CormorantRegular from "../assets/Fonts_veristone/cormorant/Cormorant-VariableFont_wght.ttf";
import CormorantItalic from "../assets/Fonts_veristone/cormorant/Cormorant-Italic-VariableFont_wght.ttf";
import CormorantBold from "../assets/Fonts_veristone/cormorant/Cormorant-Bold.otf";

// Register Metropolis fonts
Font.register({
    family: 'Metropolis',
    fonts: [
        { src: MetropolisThin, fontWeight: 100 },
        { src: MetropolisThinItalic, fontWeight: 100, fontStyle: 'italic' },
        { src: MetropolisExtraLight, fontWeight: 200 },
        { src: MetropolisExtraLightItalic, fontWeight: 200, fontStyle: 'italic' },
        { src: MetropolisLight, fontWeight: 300 },
        { src: MetropolisLightItalic, fontWeight: 300, fontStyle: 'italic' },
        { src: MetropolisRegular, fontWeight: 400 },
        { src: MetropolisRegularItalic, fontWeight: 400, fontStyle: 'italic' },
        { src: MetropolisMedium, fontWeight: 500 },
        { src: MetropolisMediumItalic, fontWeight: 500, fontStyle: 'italic' },
        { src: MetropolisSemiBold, fontWeight: 600 },
        { src: MetropolisSemiBoldItalic, fontWeight: 600, fontStyle: 'italic' },
        { src: MetropolisBold, fontWeight: 700 },
        { src: MetropolisBoldItalic, fontWeight: 700, fontStyle: 'italic' },
        { src: MetropolisExtraBold, fontWeight: 800 },
        { src: MetropolisExtraBoldItalic, fontWeight: 800, fontStyle: 'italic' },
        { src: MetropolisBlack, fontWeight: 900 },
        { src: MetropolisBlackItalic, fontWeight: 900, fontStyle: 'italic' },
    ]
});

// Register Cormorant fonts
Font.register({
    family: 'Cormorant',
    fonts: [
        { src: CormorantRegular, fontWeight: 400, fontStyle: 'normal' },
        { src: CormorantBold, fontWeight: 700, fontStyle: 'normal' },
        { src: CormorantItalic, fontWeight: 400, fontStyle: 'italic' },
    ]
});

const styles = StyleSheet.create({
    page: {
        padding: 20,
        paddingTop: 20,
        paddingBottom: 20,
        backgroundColor: '#F2EFEC',
        fontFamily: 'Metropolis',
        position: 'relative'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        paddingBottom: 12
    },
    leftHeader: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    logoContainer: {
        width: 82,
        height: 72,
        marginRight: 15
    },
    logo: {
        width: '100%',
        height: '100%',
        objectFit: 'contain'
    },
    rightHeader: {
        alignItems: 'flex-end',
        justifyContent: 'center'
    },
    orderNo: {
        fontSize: 24,
        fontWeight: 300,
        color: '#AF663F',
        marginBottom: 4
    },
    // Separator line style - only for after thank you text
    sectionSeparator: {
        borderBottom: `1 solid #D7C6A8`,
        height: 1,
        opacity: 0.4,
        marginVertical: 16
    },
    billToSection: {
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    billToBox: {
        flex: 1
    },
    billToTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10
    },
    billToTitle: {
        fontSize: 10,
        fontWeight: 700,
        color: '#AF663F',
        letterSpacing: 0,
        fontFamily: 'Cormorant',
        marginRight: 5
    },
    billToLine: {
        width: 29,
        borderBottom: `1 solid #AF663F`,
        height: 1
    },
    customerName: {
        fontSize: 9,
        fontWeight: 600,
        color: '#212D41',
        lineHeight: 1.3,
        marginBottom: 3
    },
    billToAddress: {
        fontSize: 9,
        fontWeight: 400,
        color: '#212D41',
        lineHeight: 1.3,
        marginBottom: 1
    },
    orderDetailsBox: {
        width: 238,
        alignItems: 'flex-start'
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 3,
        justifyContent: 'flex-start'
    },
    detailLabel: {
        fontSize: 8,
        fontWeight: 400,
        color: '#212D41',
        width: 80,
        textAlign: 'left',
        marginRight: 8
    },
    detailValue: {
        fontSize: 9,
        fontWeight: 400,
        color: '#212D41',
        textAlign: 'right',
        flex: 1
    },
    detailRowContainer: {
        width: '100%'
    },
    // Separator line with 8px gap
    detailSeparator: {
        width: 238,
        borderBottomWidth: 1,
        borderBottomColor: '#D7C6A8',
        borderBottomStyle: 'solid',
        height: 1,
        marginVertical: 4,
        opacity: 0.2
    },
    // Thank you text style with 14px line height
    thankYouText: {
        fontFamily: 'Metropolis',
        fontWeight: 400,
        fontSize: 9,
        lineHeight: 1.5,
        color: '#212D41',
        marginTop: 9,
        marginBottom: -2
    },
    // Step description text style with proper word wrapping
    stepDescription: {
        fontFamily: 'Metropolis',
        fontWeight: 400,
        fontSize: 9,
        color: '#212D41',
        marginTop: 4,
        lineHeight: 1.5,
        flexWrap: 'wrap',
        hyphenation: false, // Prevents hyphenation

    },
    // Content wrapper to ensure footer doesn't overlap
    contentContainer: {
        flex: 1,
        marginBottom: 140
    },
    // Footer Styles - Only on last page, fixed at bottom
    footerFixed: {
        position: 'absolute',
        bottom: 20,
        left: 30,
        right: 30,

    },
    footerSeparator: {
        borderTop: `1 solid #D7C6A8`,
        marginBottom: 8
    },
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',

    },
    footerLeftSection: {
        flex: 1,
        paddingTop: 1

    },
    footerVerticalLine: {
        width: 1,
        height: 65,
        backgroundColor: '#D7C6A8',
        marginHorizontal: 15
    },
    footerRightSection: {
        flex: 1,
        alignItems: 'flex-start',
        paddingTop: 10
    },
    footerRightText: {
        fontSize: 9,
        fontWeight: 500,
        color: '#212D41',
        fontFamily: 'Cormorant',
        textAlign: 'left',
        marginBottom: 4,
        lineHeight: 1.2
    },
    footerContactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5
    },
    footerContactText: {
        fontSize: 9,
        fontWeight: 400,
        color: '#212D41',
        fontFamily: 'Cormorant',
        marginLeft: 8
    }
});

// Footer component - Fixed position, shown on every page
const FixedFooter = () => (
    <View style={styles.footerFixed}>
        <View style={styles.footerSeparator} />
        <View style={styles.footerContainer}>
            <View style={styles.footerLeftSection}>
                <View style={styles.footerContactRow}>
                    <MapPin size={8} color="#212D41" />
                    <Text style={styles.footerContactText}>
                        Villacher Str. 75b, 9220 Velden am{'\n'}Wörthersee, Austria
                    </Text>
                </View>
                <View style={styles.footerContactRow}>
                    <Phone size={8} color="#212D41" />
                    <Text style={styles.footerContactText}>+43 664 1482753</Text>
                </View>
                <View style={styles.footerContactRow}>
                    <Envelope size={8} color="#212D41" />
                    <Text style={styles.footerContactText}>info@veristone.eu</Text>
                </View>
                <View style={styles.footerContactRow}>
                    <Globe size={8} color="#212D41" />
                    <Text style={styles.footerContactText}>www.veristone.eu</Text>
                </View>
            </View>
            <View style={styles.footerVerticalLine} />
            <View style={styles.footerRightSection}>
                <Text style={styles.footerRightText}>
                    All gemstones are sold as natural unless otherwise stated. Please refer to the respective laboratory certificates for full details.
                </Text>
                <Text style={[styles.footerRightText, { marginTop: 6 }]}>
                    Payment is due within 14 days of invoice date. Title to goods remains with Veristone e.U. until full payment is received.
                </Text>
            </View>
        </View>
    </View>
);

// Helper function to get address lines
const getAddressLines = (address) => {
    if (!address) return [];
    if (Array.isArray(address)) return address;
    if (typeof address === 'string') return address.split('\n').filter(line => line.trim());
    return [];
};

// Component for the "What happens next" section
const WhatHappensNext = () => (
    <View style={{ marginBottom: 15 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <View style={{ flex: 1, borderBottom: `1 solid #AF663F`, height: 1 }} />
            <Text style={{
                fontFamily: 'Cormorant',
                fontWeight: 700,
                fontSize: 10,
                color: '#AF663F',
                textTransform: 'uppercase',
                paddingHorizontal: 5
            }}>
                What happens next
            </Text>
            <View style={{ flex: 1, borderBottom: `1 solid #AF663F`, height: 1 }} />
        </View>

        <View style={{ flexDirection: 'row', gap: 24 }}>
            {/* Step 1 */}
            <View style={{ flex: 1, flexDirection: 'row', gap: 16 }}>
                <View style={{
                    width: 24,
                    height: 24,
                    border: `1 solid #AF663F`,
                    borderRadius: 42,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                }}>
                    <Text style={{ fontFamily: 'Metropolis', fontWeight: 400, fontSize: 9, color: '#AF663F' }}>1</Text>
                </View>
                <View style={{ flex: 1, minWidth: 100 }}>
                    <Text style={{ fontFamily: 'Cormorant', fontWeight: 700, fontSize: 12, color: '#212D41' }}>
                        Order reviewed by our{'\n'}team
                    </Text>
                    <Text style={styles.stepDescription}>
                        We verify and carefully{'\n'}review your order details
                    </Text>
                </View>
            </View>

            {/* Step 2 */}
            <View style={{ flex: 1, flexDirection: 'row', gap: 16 }}>
                <View style={{
                    width: 24,
                    height: 24,
                    border: `1 solid #AF663F`,
                    borderRadius: 42,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                }}>
                    <Text style={{ fontFamily: 'Metropolis', fontWeight: 400, fontSize: 9, color: '#AF663F' }}>2</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'Cormorant', fontWeight: 700, fontSize: 12, color: '#212D41' }}>
                        Secure preparation and{'\n'}documentation
                    </Text>
                    <Text style={styles.stepDescription}>
                        Our gemstones are prepared with complete certification
                    </Text>
                </View>
            </View>

            {/* Step 3 */}
            <View style={{ flex: 1, flexDirection: 'row', gap: 16 }}>
                <View style={{
                    width: 24,
                    height: 24,
                    border: `1 solid #AF663F`,
                    borderRadius: 42,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                }}>
                    <Text style={{ fontFamily: 'Metropolis', fontWeight: 400, fontSize: 9, color: '#AF663F' }}>3</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'Cormorant', fontWeight: 700, fontSize: 12, color: '#212D41' }}>
                        Insured dispatch with{'\n'}secure delivery
                    </Text>
                    <Text style={styles.stepDescription}>
                        Your order is securely{'\n'}shipped with insurance
                    </Text>
                </View>
            </View>
        </View>
    </View>
);

// Component for the table section
const TableSection = ({ items }) => (
    <View style={{ border: `1 solid #D7C6A8`, marginBottom: 10 }}>
        {/* Table Header */}
        <View style={{ flexDirection: 'row', backgroundColor: '#212D41', height: 22 }}>
            <View style={{ width: '8%', borderRight: `1 solid #D7C6A8`, paddingHorizontal: 6, justifyContent: 'center' }}>
                <Text style={{ fontFamily: 'Cormorant', fontWeight: 700, fontSize: 9, color: '#FFFFFF' }}>NO.</Text>
            </View>
            <View style={{ width: '62%', borderRight: `1 solid #D7C6A8`, paddingHorizontal: 6, justifyContent: 'center' }}>
                <Text style={{ fontFamily: 'Cormorant', fontWeight: 700, fontSize: 9, color: '#FFFFFF' }}>ITEM DESCRIPTION</Text>
            </View>
            <View style={{ width: '15%', borderRight: `1 solid #D7C6A8`, paddingHorizontal: 6, justifyContent: 'center' }}>
                <Text style={{ fontFamily: 'Cormorant', fontWeight: 700, fontSize: 9, color: '#FFFFFF' }}>QTY</Text>
            </View>
            <View style={{ width: '15%', paddingHorizontal: 6, justifyContent: 'center' }}>
                <Text style={{ fontFamily: 'Cormorant', fontWeight: 700, fontSize: 9, color: '#FFFFFF' }}>PRICE</Text>
            </View>
        </View>

        {/* Table Rows */}
        {items.map((item, index) => (
            <View key={index} style={{
                flexDirection: 'row',
                borderBottom: index === items.length - 1 ? undefined : `1 solid #D7C6A8`
            }}>
                <View style={{
                    width: '8%',
                    borderRight: `1 solid #D7C6A8`,
                    paddingHorizontal: 6,
                    paddingVertical: 4,
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Text style={{ fontFamily: 'Metropolis', fontWeight: 400, fontSize: 8, color: '#111827' }}>{item.sno || index + 1}</Text>
                </View>
                <View style={{
                    width: '62%',
                    borderRight: `1 solid #D7C6A8`,
                    paddingHorizontal: 6,
                    paddingVertical: 4
                }}>
                    <Text style={{ fontFamily: 'Metropolis', fontWeight: 500, fontSize: 8, color: '#212D41' }}>{item.name}</Text>
                    {item.description && (
                        <Text style={{ fontFamily: 'Metropolis', fontWeight: 400, fontSize: 7, color: '#212D41', marginTop: 1 }}>
                            {item.description}
                        </Text>
                    )}
                </View>
                <View style={{
                    width: '15%',
                    borderRight: `1 solid #D7C6A8`,
                    paddingHorizontal: 6,
                    paddingVertical: 4,
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Text style={{ fontFamily: 'Metropolis', fontWeight: 400, fontSize: 8, color: '#111827' }}>{item.quantity}</Text>
                </View>
                <View style={{
                    width: '15%',
                    paddingHorizontal: 6,
                    paddingVertical: 4,
                    alignItems: 'flex-end',
                    justifyContent: 'center'
                }}>
                    <Text style={{ fontFamily: 'Metropolis', fontWeight: 400, fontSize: 8, color: '#111827' }}>
                        €{item.price.toLocaleString()}
                    </Text>
                </View>
            </View>
        ))}
    </View>
);

// Component for the totals section
const TotalsSection = ({ netTotal, vatRate, vat, grossTotal }) => (
    <View style={{ alignItems: 'flex-end', marginTop: 6 }}>
        <View style={{ width: 240, backgroundColor: '#E8E4DF', padding: 8, borderRadius: 4 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                <Text style={{ fontFamily: 'Metropolis', fontWeight: 400, fontSize: 8, color: '#6b7280' }}>Net Total</Text>
                <Text style={{ fontFamily: 'Metropolis', fontWeight: 700, fontSize: 8, color: '#111827' }}>
                    €{netTotal.toLocaleString()}
                </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                <Text style={{ fontFamily: 'Metropolis', fontWeight: 400, fontSize: 8, color: '#6b7280' }}>VAT ({vatRate}%)</Text>
                <Text style={{ fontFamily: 'Metropolis', fontWeight: 700, fontSize: 8, color: '#111827' }}>
                    €{vat.toLocaleString()}
                </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2, paddingTop: 2, borderTop: `1 solid #D7C6A8` }}>
                <Text style={{ fontFamily: 'Metropolis', fontWeight: 700, fontSize: 9, color: '#111827' }}>Gross Total</Text>
                <Text style={{ fontFamily: 'Metropolis', fontWeight: 700, fontSize: 9, color: '#111827' }}>
                    €{grossTotal.toLocaleString()}
                </Text>
            </View>
        </View>
    </View>
);

// Header component
const HeaderSection = () => (
    <View style={styles.header}>
        <View style={styles.leftHeader}>
            {LogoSvg && (
                <View style={styles.logoContainer}>
                    <Image src={LogoSvg} style={styles.logo} cache={true} />
                </View>
            )}
        </View>
    </View>
);

// Bill To Section component
const BillToSection = ({ customerName, addressLines }) => (
    <View style={styles.billToSection}>
        <View style={styles.billToBox}>
            <View style={styles.billToTitleContainer}>
                <Text style={styles.billToTitle}>SHIP TO</Text>
                <View style={styles.billToLine} />
            </View>
            <Text style={styles.customerName}>{customerName}</Text>
            {addressLines.map((line, i) => (
                <Text key={i} style={styles.billToAddress}>{line}</Text>
            ))}
        </View>
        <View style={styles.orderDetailsBox}>
            <View style={styles.detailRowContainer}>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Order No.</Text>
                    <Text style={styles.detailValue}>{data.orderNo}</Text>
                </View>
                <View style={styles.detailSeparator} />
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Confirmation Date</Text>
                    <Text style={styles.detailValue}>{data.date}</Text>
                </View>
                <View style={styles.detailSeparator} />
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Client Reference</Text>
                    <Text style={styles.detailValue}>{data.attention}</Text>
                </View>
                <View style={styles.detailSeparator} />
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Estimated Dispatch</Text>
                    <Text style={styles.detailValue}>{data.dueDate}</Text>
                </View>
            </View>
        </View>
    </View>
);

const OrderConfirmationPDF = ({ data }) => {
    const {
        orderNo,
        customerName,
        phoneNumber,
        address,
        date,
        dueDate,
        attention,
        email,
    } = data;

    const addressLines = getAddressLines(address);

    // For the table - using items from data or default
    const items = data.items || [];

    // Calculate totals
    const calculatedNetTotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const vatRate = data.vatRate || 6.5;
    const calculatedVat = calculatedNetTotal * (vatRate / 100);
    const calculatedGrossTotal = calculatedNetTotal + calculatedVat;

    const ITEMS_PER_PAGE = 4; // Changed from all items to 4 per page
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const isExactly4Items = totalItems === 4;

    // Create pages array
    const pages = [];
    for (let i = 0; i < totalPages; i++) {
        const start = i * ITEMS_PER_PAGE;
        const end = Math.min(start + ITEMS_PER_PAGE, totalItems);
        pages.push({
            pageNumber: i + 1,
            items: items.slice(start, end),
            isLastPage: i === totalPages - 1,
            startIndex: start
        });
    }

    // If no items, create a single page with empty items
    if (pages.length === 0) {
        pages.push({
            pageNumber: 1,
            items: [],
            isLastPage: true,
            startIndex: 0
        });
    }

    return (
        <Document>
            {pages.map((page) => (
                <Page key={page.pageNumber} size="LETTER" style={styles.page}>
                    <View style={styles.contentContainer}>
                        {/* Header - Logo only */}
                        <View style={styles.header}>
                            <View style={styles.leftHeader}>
                                {LogoSvg && (
                                    <View style={styles.logoContainer}>
                                        <Image src={LogoSvg} style={styles.logo} cache={true} />
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Order Confirmed Title - Only on first page */}
                        {page.pageNumber === 1 && (
                            <>
                                <Text style={{ fontFamily: 'Cormorant', fontWeight: 400, fontSize: 36, color: '#212D41', marginBottom: 8 }}>
                                    Order Confirmed
                                </Text>

                                {/* Underline for Order Confirmed */}
                                <View style={{ width: 29, borderBottom: '1 solid #AF663F', height: 1 }} />

                                {/* Thank you text with 14px line height and 8px gap from underline */}
                                <Text style={styles.thankYouText}>
                                    Thank you for your order. Your purchase has been successfully received and is now being prepared by our team. We appreciate your trust in Veristone.
                                </Text>

                                {/* ===== SEPARATOR LINE - ONLY HERE, RIGHT AFTER THE THANK YOU TEXT ===== */}
                                <View style={styles.sectionSeparator} />

                                {/* Bill To Section - Order Confirmation version */}
                                <View style={styles.billToSection}>
                                    <View style={styles.billToBox}>
                                        <View style={styles.billToTitleContainer}>
                                            <Text style={styles.billToTitle}>SHIP TO</Text>
                                            <View style={styles.billToLine} />
                                        </View>
                                        <Text style={styles.customerName}>{customerName}</Text>
                                        {addressLines.map((line, i) => (
                                            <Text key={i} style={styles.billToAddress}>{line}</Text>
                                        ))}
                                    </View>
                                    <View style={styles.orderDetailsBox}>
                                        {/* Order Details - NO HEADING, just rows with 8px gap */}
                                        <View style={styles.detailRowContainer}>
                                            {/* Row 1: Order No. */}
                                            <View style={styles.detailRow}>
                                                <Text style={styles.detailLabel}>Order No.</Text>
                                                <Text style={styles.detailValue}>{orderNo}</Text>
                                            </View>
                                            <View style={styles.detailSeparator} />

                                            {/* Row 2: Confirmation Date */}
                                            <View style={styles.detailRow}>
                                                <Text style={styles.detailLabel}>Confirmation Date</Text>
                                                <Text style={styles.detailValue}>{date}</Text>
                                            </View>
                                            <View style={styles.detailSeparator} />

                                            {/* Row 3: Client Reference */}
                                            <View style={styles.detailRow}>
                                                <Text style={styles.detailLabel}>Client Reference</Text>
                                                <Text style={styles.detailValue}>{attention}</Text>
                                            </View>
                                            <View style={styles.detailSeparator} />

                                            {/* Row 4: Estimated Dispatch */}
                                            <View style={styles.detailRow}>
                                                <Text style={styles.detailLabel}>Estimated Dispatch</Text>
                                                <Text style={styles.detailValue}>{dueDate}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>

                                {/* Order Confirmation specific content - "What happens next" */}
                                <WhatHappensNext />

                                <View style={{ borderBottom: `1 solid #AF663F`, marginBottom: 15 }} />
                            </>
                        )}

                        {/* Table Section */}
                        <TableSection items={page.items} />

                        {/* Totals - Only on last page */}
                        {page.isLastPage && (
                            <TotalsSection
                                netTotal={calculatedNetTotal}
                                vatRate={vatRate}
                                vat={calculatedVat}
                                grossTotal={calculatedGrossTotal}
                            />
                        )}
                    </View>

                    {/* Footer - On every page */}
                    <FixedFooter />
                </Page>
            ))}
        </Document>
    );
};

export default OrderConfirmationPDF;