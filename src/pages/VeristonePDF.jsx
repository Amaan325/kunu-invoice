// VeristonePDF.jsx
import { Document, Page, Text, View, StyleSheet, Image, Font, Link } from '@react-pdf/renderer';
import LogoSvg from "../assets/icons/Logo.svg";
import MerriweatherRegular from "../assets/Fonts_veristone/Merriweather-Full-Version/Desktop Fonts/Merriweather/Merriweather-Regular.ttf";
import MerriweatherBold from "../assets/Fonts_veristone/Merriweather-Full-Version/Desktop Fonts/Merriweather/Merriweather-Bold.ttf";
import MerriweatherItalic from "../assets/Fonts_veristone/Merriweather-Full-Version/Desktop Fonts/Merriweather/Merriweather-Italic.ttf";
import MerriweatherBoldItalic from "../assets/Fonts_veristone/Merriweather-Full-Version/Desktop Fonts/Merriweather/Merriweather-BoldItalic.ttf";
import building from "../assets/icons/building_png.png";
import commentIcon from "../assets/icons/comment.png";
import footer from "../assets/icons/footer.png";
import EpilogueRegular from "../assets/Fonts_veristone/Epilogue/Epilogue-Regular.ttf";
import EpilogueSemiBold from "../assets/Fonts_veristone/Epilogue/Epilogue-SemiBold.ttf";
import EpilogueBold from "../assets/Fonts_veristone/Epilogue/Epilogue-Bold.ttf";
import Group from "../assets/icons/Group_png.png";

// Register Merriweather font
Font.register({
    family: 'Merriweather',
    fonts: [
        { src: MerriweatherRegular, fontWeight: 400, fontStyle: 'normal' },
        { src: MerriweatherItalic, fontWeight: 400, fontStyle: 'italic' },
        { src: MerriweatherBold, fontWeight: 700, fontStyle: 'normal' },
        { src: MerriweatherBoldItalic, fontWeight: 700, fontStyle: 'italic' },
    ]
});

// Register Epilogue font
Font.register({
    family: 'Epilogue',
    fonts: [
        { src: EpilogueRegular, fontWeight: 400, fontStyle: 'normal' },
        { src: EpilogueSemiBold, fontWeight: 600, fontStyle: 'normal' },
        { src: EpilogueBold, fontWeight: 700, fontStyle: 'normal' },
    ]
});

// Helper function to format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

// Helper function to format date - handles multiple formats
const formatDate = (dateString) => {
    if (!dateString || dateString === '') return '';

    // If it's already in DD/MM/YYYY format, return as is
    if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        return dateString;
    }

    // Try to parse and format
    try {
        // Try parsing as "May 22, 2026" format
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        }
    } catch (e) {
        // If parsing fails, try splitting by common separators
        const separators = ['/', '-', ' '];
        for (const sep of separators) {
            if (dateString.includes(sep)) {
                const parts = dateString.split(sep);
                if (parts.length === 3) {
                    // Try to determine if it's DD/MM/YYYY or MM/DD/YYYY
                    // If first part > 12, it's likely DD/MM/YYYY
                    if (parseInt(parts[0]) > 12) {
                        return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[2]}`;
                    }
                    // Otherwise assume MM/DD/YYYY -> convert to DD/MM/YYYY
                    return `${parts[1].padStart(2, '0')}/${parts[0].padStart(2, '0')}/${parts[2]}`;
                }
            }
        }
    }

    // If all fails, return the original string
    return dateString;
};

// Helper function to determine font size based on number length
const getDynamicFontSize = (value, baseSize = 16, minSize = 6) => {
    const numStr = value.toString();
    const length = numStr.length;
    const maxChars = 14;
    if (length <= maxChars) {
        return baseSize;
    }
    const reduction = Math.min((length - maxChars) * 0.8, baseSize - minSize);
    return Math.max(minSize, baseSize - reduction);
};

// Dummy data for testing
const dummyData = {
    orderNo: 'VerI000-2026-1',
    items: [
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
    netTotal: 122.00,
    vat: 0.00,
    grossTotal: 122.00,
    date: '10/06/2026',
    dueDate: '18/06/2026',
    customerName: 'The Hamilton Family Office',
    address: '25 Berkeley Square\nMayfair, London W1J 6QF\nUnited Kingdom',
    attention: 'Mr. Edward Hamilton',
    email: 'ehamilton@hamiltonfq.com',
    vatRate: 6.5,
    verifiedBy: '*Verified by: 75% gold Vetted on Worthserse, Austria',
    contactPhone: '+43 664 1488753',
    contactEmail: 'info@veristone.eu',
    website: 'www.veristone.eu'
};

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        alignItems: 'center',
        padding: '4px 24px',
        paddingBottom: 80,
        gap: 20,
        width: 595,
        height: 842,
        backgroundColor: '#FEFEFE',
        fontFamily: 'Helvetica',
        position: 'relative',
    },
    container: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: 0,
        gap: 20,
        width: 547,
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 0,
        gap: 24,
        width: 547,
        height: 74,
    },
    logoContainer: {
        width: 64.36,
        height: 48,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    logo: {
        width: 64.36,
        height: 48,
        objectFit: 'contain',
    },
    rightHeader: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: 0,
        gap: 4,
        width: 168,
        height: 74,
    },
    invoiceTitle: {
        width: 168,
        height: 58,
        fontFamily: 'Merriweather',
        fontWeight: 400,
        fontSize: 46,
        lineHeight: 1,
        color: '#131313',
    },
    invoiceNumber: {
        width: 101,
        height: 12,
        fontFamily: 'Epilogue',
        fontWeight: 600,
        fontSize: 12,
        lineHeight: 1,
        textTransform: 'uppercase',
        color: '#85BA39',
    },
    addressSection: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 0,
        gap: 24,
        width: 547,
        minHeight: 180,
    },
    cardsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 0,
        gap: 24,
        width: 412,
        minHeight: 180,
    },
    card: {
        flexDirection: 'column',
        alignItems: 'center',
        padding: 12,
        gap: 8,
        width: 194,
        minHeight: 180,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderTopWidth: 0,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#E5E5E5',
        borderBottomColor: '#D0D0D0',
        borderBottomWidth: 2,
    },
    cardVeristone: {
        flexDirection: 'column',
        alignItems: 'center',
        padding: 12,
        gap: 8,
        width: 194,
        minHeight: 180,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderTopWidth: 0,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#E5E5E5',
        borderBottomColor: '#D0D0D0',
        borderBottomWidth: 2,
    },
    cardContent: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: 0,
        gap: 6,
        width: 170,
        minHeight: 160,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 0,
        gap: 8,
        width: 170,
        height: 24,
    },
    iconBox: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 0,
        width: 24,
        height: 24,
        backgroundColor: '#131313',
        borderRadius: 36.75,
        overflow: 'hidden',
    },
    cardTitle: {
        fontFamily: 'Merriweather',
        fontWeight: 700,
        fontSize: 8,
        color: '#131313',
    },
    cardBody: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: 0,
        gap: 0,
        width: 170,
    },
    addressText: {
        fontFamily: 'Epilogue',
        fontWeight: 400,
        fontSize: 6.5,
        color: '#131313',
        lineHeight: 1.2,
    },
    line: {
        width: 25,
        borderBottomWidth: 1,
        borderBottomColor: '#85BA39',
        marginVertical: 3,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 0,
        gap: 4,
        width: 170,
    },
    infoLabel: {
        fontFamily: 'Epilogue',
        fontWeight: 400,
        fontSize: 6.5,
        color: '#131313',
        opacity: 0.6,
    },
    infoValue: {
        fontFamily: 'Epilogue',
        fontWeight: 400,
        fontSize: 6.5,
        color: '#131313',
    },
    sidebar: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        gap: 8,
        width: 111,
        minHeight: 180,
        backgroundColor: '#131313',
        borderRadius: 8,
        overflow: 'hidden',
    },
    sidebarContent: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: 0,
        gap: 6,
        width: 87,
    },
    sidebarItem: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: 0,
        gap: 3,
        width: 87,
        minHeight: 18,
    },
    sidebarLabel: {
        width: 87,
        fontFamily: 'Merriweather',
        fontWeight: 700,
        fontSize: 7,
        color: '#FFFFFF',
        lineHeight: 1,
        marginBottom: 1,
    },
    sidebarValue: {
        width: 87,
        fontFamily: 'Epilogue',
        fontWeight: 400,
        fontSize: 6.5,
        color: '#FFFFFF',
        lineHeight: 1,
    },
    sidebarTotalContainer: {
        width: 87,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        flexWrap: 'wrap',
    },
    sidebarTotalLabel: {
        fontFamily: 'Merriweather',
        fontWeight: 700,
        fontSize: 7,
        color: '#FFFFFF',
        lineHeight: 1,
        marginRight: 3,
    },
    sidebarTotalValue: {
        fontFamily: 'Merriweather',
        fontWeight: 700,
        color: '#BDFD66',
        lineHeight: 1,
    },
    sidebarLine: {
        width: 87,
        opacity: 0.4,
        borderBottomWidth: 0.2,
        borderBottomColor: '#FFFFFF',
        marginVertical: 3,
    },
    tableSection: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        padding: 0,
        width: 547,
        alignSelf: 'stretch',
        gap: 0,
        flex: 1,
    },
    table: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 0,
        width: 547,
        borderWidth: 0.5,
        borderColor: '#D9D9D9',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        overflow: 'hidden',
    },
    tableCol: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: 0,
    },
    tableHead: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '3px 10px',
        gap: 8,
        height: 22,
        backgroundColor: '#131313',
        alignSelf: 'stretch',
        borderBottomWidth: 0.5,
        borderBottomColor: '#D9D9D9',
    },
    tableHeadFirst: {
        borderTopLeftRadius: 8,
    },
    tableHeadLast: {
        borderTopRightRadius: 8,
    },
    tableHeadStart: {
        alignItems: 'flex-start',
    },
    tableHeadText: {
        fontFamily: 'Merriweather',
        fontWeight: 700,
        fontSize: 6.5,
        color: '#FFFFFF',
        alignSelf: 'stretch',
        textAlign: 'center',
    },
    tableHeadTextStart: {
        textAlign: 'left',
    },
    tableHeadTextGreen: {
        color: '#85BA39',
    },
    tableCell: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '5px 10px',
        gap: 8,
        height: 22,
        borderBottomWidth: 0.5,
        borderBottomColor: '#D9D9D9',
        alignSelf: 'stretch',
    },
    tableCellStart: {
        alignItems: 'flex-start',
    },
    tableCellText: {
        fontFamily: 'Epilogue',
        fontWeight: 400,
        fontSize: 6.5,
        color: '#131313',
        alignSelf: 'stretch',
        textAlign: 'center',
    },
    tableCellTextStart: {
        textAlign: 'left',
    },
    totalsWrapper: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: 0,
        width: 200,
        backgroundColor: '#FFFFFF',
        borderWidth: 0.5,
        borderColor: '#D9D9D9',
        borderTopWidth: 0.5,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        alignSelf: 'flex-end',
        marginTop: 0,
    },
    totalsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 0,
        width: 200,
        minHeight: 20,
        borderBottomWidth: 0.5,
        borderBottomColor: '#D9D9D9',
    },
    totalsLabel: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '5px 10px',
        width: 80,
        minHeight: 20,
        borderRightWidth: 0.5,
        borderRightColor: '#D9D9D9',
    },
    totalsValue: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '5px 10px',
        flex: 1,
        minHeight: 20,
        overflow: 'hidden',
    },
    totalsGrand: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 0,
        width: 200,
        minHeight: 28,
        backgroundColor: '#F5F5F5',
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
    },
    totalsGrandLabel: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '5px 10px',
        width: 80,
        minHeight: 28,
        borderRightWidth: 0.5,
        borderRightColor: '#D9D9D9',
    },
    totalsGrandValue: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '5px 10px',
        flex: 1,
        minHeight: 28,
        overflow: 'hidden',
    },
    totalsTextLabel: {
        fontFamily: 'Epilogue',
        fontWeight: 600,
        fontSize: 7,
        color: '#000000',
    },
    totalsTextValue: {
        fontFamily: 'Epilogue',
        fontWeight: 400,
        fontSize: 7,
        color: '#000000',
    },
    totalsTextGrandValue: {
        fontFamily: 'Epilogue',
        fontWeight: 700,
        color: '#85BA39',
        fontSize: 14,
    },
    totalsTextTotalDue: {
        fontFamily: 'Epilogue',
        fontWeight: 700,
        fontSize: 7,
        color: '#000000',
    },
    commentsSection: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '12px 8px 6px',
        width: 547,
        minHeight: 50,
        backgroundColor: '#F1F5EC',
        borderRadius: 8,
        position: 'relative',
        marginTop: 8,
        marginBottom: 6,
    },
    commentsHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        width: '100%',
        paddingLeft: 0,
    },
    quoteIcon: {
        position: 'absolute',
        left: 8,
        top: -10,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#131313',
        justifyContent: 'center',
        alignItems: 'center',
    },
    commentsTitle: {
        fontFamily: 'Epilogue',
        fontWeight: 700,
        fontSize: 9,
        color: '#85BA39',
        paddingLeft: 0,
    },
    commentsLine: {
        width: '100%',
        borderBottomWidth: 0.4,
        borderBottomColor: '#85BA39',
        marginBottom: 3,
    },
    exchangeRate: {
        fontFamily: 'Epilogue',
        fontWeight: 400,
        fontSize: 6.5,
        color: '#131313',
        marginBottom: 1,
        width: '100%',
        paddingLeft: 0,
        marginTop: 1
    },
    commentsText: {
        width: '100%',
        minHeight: 22,
        fontFamily: 'Epilogue',
        fontWeight: 400,
        fontSize: 7,
        color: '#131313',
        lineHeight: 1.5,
        paddingLeft: 0,
        marginBottom: 4,
    },
    greenText: {
        color: '#85BA39',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: 595,
        height: 70,
        backgroundColor: '#131313',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    footerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerLogoContainer: {
        width: 30,
        height: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    footerLogo: {
        width: 38,
        height: 28,
        objectFit: 'contain',
    },
    footerDesignText: {
        fontFamily: 'Merriweather',
        fontStyle: 'italic',
        fontWeight: 300,
        fontSize: 9,
        lineHeight: 1,
        marginLeft: 8,
        color: '#FFFFFF',
        width: 130,
    },
    footerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerLink: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    groupIconContainer: {
        width: 14,
        height: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    groupIcon: {
        width: 14,
        height: 14,
        objectFit: 'contain',
    },
    footerKunuText: {
        fontFamily: 'Epilogue',
        fontWeight: 300,
        fontSize: 10,
        lineHeight: 1,
        color: '#BDFD66',
        textAlign: 'right',
    },
});

const VeristonePDF = ({ data }) => {
    const actualData = data || dummyData;

    const {
        orderNo = 'VerI000-2026-1',
        items = [],
        netTotal = 122.00,
        vat = 0.00,
        grossTotal = 122.00,
        date = '',
        dueDate = '',
        customerName = 'The Hamilton Family Office',
        address = '25 Berkeley Square\nMayfair, London W1J 6QF\nUnited Kingdom',
        attention = 'Mr. Edward Hamilton',
        email = 'ehamilton@hamiltonfq.com',
        vatRate = 6.5,
        verifiedBy = '*Verified by: 75% gold Vetted on Worthserse, Austria',
        contactPhone = '+43 664 1488753',
        contactEmail = 'info@veristone.eu',
        website = 'www.veristone.eu',
    } = actualData;

    // Format dates - if empty string, use the formatted date from the data
    let formattedDate = date ? formatDate(date) : '';
    let formattedDueDate = dueDate ? formatDate(dueDate) : '';

    // If still empty, try using the data directly if it looks like a date
    if (!formattedDate && date && date.includes('/')) {
        formattedDate = date;
    }
    if (!formattedDueDate && dueDate && dueDate.includes('/')) {
        formattedDueDate = dueDate;
    }

    const displayItems = (items && items.length > 0) ? items : dummyData.items;

    const calculatedNetTotal = displayItems.reduce((sum, item) => sum + ((item.quantity || 0) * (item.price || 0)), 0);
    const finalNetTotal = (netTotal || calculatedNetTotal);
    const finalGrossTotal = (grossTotal || finalNetTotal);

    const formattedTotal = `€${formatCurrency(finalGrossTotal)}`;
    const sidebarTotalFontSize = getDynamicFontSize(formattedTotal, 13, 6);
    const netTotalFontSize = getDynamicFontSize(`€${formatCurrency(finalNetTotal)}`, 7, 6);
    const vatValueFontSize = getDynamicFontSize(`€${formatCurrency(finalNetTotal * (vatRate || 0) / 100)}`, 7, 6);
    const grandTotalFontSize = getDynamicFontSize(`€${formatCurrency(finalGrossTotal)}`, 14, 8);

    const colWidths = {
        number: 35,
        description: 162,
        qty: 41,
        netUnitPrice: 83,
        netLineTotal: 83,
        vat: 60,
        grossLineTotal: 83,
    };

    return (
        <Document>
            <Page style={styles.page}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Image src={LogoSvg} style={styles.logo} cache={true} />
                        </View>
                        <View style={styles.rightHeader}>
                            <Text style={styles.invoiceTitle}>Invoice</Text>
                            <Text style={styles.invoiceNumber}>{orderNo}</Text>
                        </View>
                    </View>

                    {/* Address Section */}
                    <View style={styles.addressSection}>
                        <View style={styles.cardsContainer}>
                            <View style={styles.card}>
                                <View style={styles.cardContent}>
                                    <View style={styles.cardHeader}>
                                        <View style={styles.iconBox}>
                                            <Image src={building} style={{ width: 22, height: 22 }} />
                                        </View>
                                        <Text style={styles.cardTitle}>All Things Studio Kft.</Text>
                                    </View>
                                    <View style={styles.cardBody}>
                                        <View style={{ gap: 6 }}>
                                            <Text style={styles.addressText}>Király utca 93. 2. 20.</Text>
                                            <Text style={styles.addressText}>1077 Budapest</Text>
                                            <Text style={styles.addressText}>Hungary</Text>
                                        </View>
                                        <View style={styles.line} />
                                        <View style={{ gap: 6 }}>
                                            <View style={styles.infoRow}>
                                                <Text style={styles.infoLabel}>VAT ID:</Text>
                                                <Text style={styles.infoValue}>32950997-1-42</Text>
                                            </View>
                                            <View style={styles.infoRow}>
                                                <Text style={styles.infoLabel}>CRN</Text>
                                                <Text style={styles.infoValue}>01-09-451087</Text>
                                            </View>
                                            <View style={styles.infoRow}>
                                                <Text style={styles.infoLabel}>EU VAT ID:</Text>
                                                <Text style={styles.infoValue}>HU32950997</Text>
                                            </View>
                                        </View>
                                        <View style={styles.line} />
                                        <View style={{ gap: 6 }}>
                                            <View style={styles.infoRow}>
                                                <Text style={styles.infoLabel}>IBAN:</Text>
                                                <Text style={styles.infoValue}>BE78967859820086</Text>
                                            </View>
                                            <View style={styles.infoRow}>
                                                <Text style={styles.infoLabel}>BANK:</Text>
                                                <Text style={styles.infoValue}>Wise</Text>
                                            </View>
                                            <View style={styles.infoRow}>
                                                <Text style={styles.infoLabel}>SWIFT/BIC:</Text>
                                                <Text style={styles.infoValue}>TRWIBEB1XXX</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.cardVeristone}>
                                <View style={styles.cardContent}>
                                    <View style={styles.cardHeader}>
                                        <View style={styles.iconBox}>
                                            <Image src={building} style={{ width: 22, height: 22 }} />
                                        </View>
                                        <Text style={styles.cardTitle}>Veristone</Text>
                                    </View>
                                    <View style={styles.cardBody}>
                                        <View style={{ gap: 6 }}>
                                            <Text style={styles.addressText}>Villacher Str. 75b</Text>
                                            <Text style={styles.addressText}>Velden am Wörthersee</Text>
                                            <Text style={styles.addressText}>Austria</Text>
                                        </View>
                                        <View style={styles.line} />
                                        <View style={styles.infoRow}>
                                            <Text style={styles.infoLabel}>VAT ID:</Text>
                                            <Text style={styles.infoValue}>ATU83098167</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View style={styles.sidebar}>
                            <View style={styles.sidebarContent}>
                                <View style={styles.sidebarItem}>
                                    <Text style={styles.sidebarLabel}>Issue Date</Text>
                                    <Text style={styles.sidebarValue}>{formattedDate || 'N/A'}</Text>
                                </View>
                                <View style={styles.sidebarLine} />
                                <View style={styles.sidebarItem}>
                                    <Text style={styles.sidebarLabel}>Fulfillment Date</Text>
                                    <Text style={styles.sidebarValue}>{formattedDate || 'N/A'}</Text>
                                </View>
                                <View style={styles.sidebarLine} />
                                <View style={styles.sidebarItem}>
                                    <Text style={styles.sidebarLabel}>Due Date</Text>
                                    <Text style={styles.sidebarValue}>{formattedDueDate || 'N/A'}</Text>
                                </View>
                                <View style={styles.sidebarLine} />
                                <View style={styles.sidebarItem}>
                                    <Text style={styles.sidebarLabel}>Payment Method</Text>
                                    <Text style={styles.sidebarValue}>Wire Transfer</Text>
                                </View>
                                <View style={styles.sidebarLine} />
                                <View style={styles.sidebarItem}>
                                    <View style={styles.sidebarTotalContainer}>
                                        <Text style={styles.sidebarTotalLabel}>Total Due</Text>
                                        <Text style={[styles.sidebarTotalValue, { fontSize: sidebarTotalFontSize }]}>
                                            {formattedTotal}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Table Section */}
                    <View style={styles.tableSection}>
                        <View style={styles.table}>
                            <View style={{ ...styles.tableCol, width: colWidths.number }}>
                                <View style={[styles.tableHead, styles.tableHeadFirst]}>
                                    <Text style={styles.tableHeadText}>#</Text>
                                </View>
                                {displayItems.map((_, i) => (
                                    <View key={i} style={styles.tableCell}>
                                        <Text style={styles.tableCellText}>{i + 1}.</Text>
                                    </View>
                                ))}
                            </View>

                            <View style={{ ...styles.tableCol, width: colWidths.description }}>
                                <View style={[styles.tableHead, styles.tableHeadStart]}>
                                    <Text style={[styles.tableHeadText, styles.tableHeadTextStart, styles.tableHeadTextGreen]}>Description</Text>
                                </View>
                                {displayItems.map((item, i) => (
                                    <View key={i} style={[styles.tableCell, styles.tableCellStart]}>
                                        <Text style={[styles.tableCellText, styles.tableCellTextStart]}>{item.name || ''}</Text>
                                    </View>
                                ))}
                            </View>

                            <View style={{ ...styles.tableCol, width: colWidths.qty }}>
                                <View style={styles.tableHead}>
                                    <Text style={styles.tableHeadText}>QTY</Text>
                                </View>
                                {displayItems.map((item, i) => (
                                    <View key={i} style={styles.tableCell}>
                                        <Text style={styles.tableCellText}>{item.quantity || 0} db</Text>
                                    </View>
                                ))}
                            </View>

                            <View style={{ ...styles.tableCol, width: colWidths.netUnitPrice }}>
                                <View style={[styles.tableHead, styles.tableHeadStart]}>
                                    <Text style={[styles.tableHeadText, styles.tableHeadTextStart]}>Net Unit Price</Text>
                                </View>
                                {displayItems.map((item, i) => (
                                    <View key={i} style={[styles.tableCell, styles.tableCellStart]}>
                                        <Text style={[styles.tableCellText, styles.tableCellTextStart]}>€{formatCurrency(item.price || 0)}</Text>
                                    </View>
                                ))}
                            </View>

                            <View style={{ ...styles.tableCol, width: colWidths.netLineTotal }}>
                                <View style={[styles.tableHead, styles.tableHeadStart]}>
                                    <Text style={[styles.tableHeadText, styles.tableHeadTextStart]}>Net Line Total</Text>
                                </View>
                                {displayItems.map((item, i) => (
                                    <View key={i} style={[styles.tableCell, styles.tableCellStart]}>
                                        <Text style={[styles.tableCellText, styles.tableCellTextStart]}>€{formatCurrency((item.quantity || 0) * (item.price || 0))}</Text>
                                    </View>
                                ))}
                            </View>

                            <View style={{ ...styles.tableCol, width: colWidths.vat }}>
                                <View style={[styles.tableHead, styles.tableHeadStart]}>
                                    <Text style={[styles.tableHeadText, styles.tableHeadTextStart]}>VAT</Text>
                                </View>
                                {displayItems.map((_, i) => (
                                    <View key={i} style={[styles.tableCell, styles.tableCellStart]}>
                                        <Text style={[styles.tableCellText, styles.tableCellTextStart]}>{vatRate || 0}%</Text>
                                    </View>
                                ))}
                            </View>

                            <View style={{ ...styles.tableCol, width: colWidths.grossLineTotal }}>
                                <View style={[styles.tableHead, styles.tableHeadStart, styles.tableHeadLast]}>
                                    <Text style={[styles.tableHeadText, styles.tableHeadTextStart]}>Gross Line Total</Text>
                                </View>
                                {displayItems.map((item, i) => {
                                    const lineTotal = (item.quantity || 0) * (item.price || 0);
                                    const grossLineTotal = lineTotal * (1 + (vatRate || 0) / 100);
                                    return (
                                        <View key={i} style={[styles.tableCell, styles.tableCellStart]}>
                                            <Text style={[styles.tableCellText, styles.tableCellTextStart]}>€{formatCurrency(grossLineTotal)}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>

                        <View style={styles.totalsWrapper}>
                            <View style={styles.totalsRow}>
                                <View style={styles.totalsLabel}>
                                    <Text style={styles.totalsTextLabel}>NET TOTAL</Text>
                                </View>
                                <View style={styles.totalsValue}>
                                    <Text style={[styles.totalsTextValue, { fontSize: netTotalFontSize }]}>
                                        €{formatCurrency(finalNetTotal)}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.totalsRow}>
                                <View style={styles.totalsLabel}>
                                    <Text style={styles.totalsTextLabel}>ÁTHK VAT </Text>
                                </View>
                                <View style={styles.totalsValue}>
                                    <Text style={[styles.totalsTextValue, { fontSize: vatValueFontSize }]}>
                                        €{formatCurrency(finalNetTotal * (vatRate || 0) / 100)}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.totalsRow}>
                                <View style={styles.totalsLabel}>
                                    <Text style={styles.totalsTextLabel}>ÁTHK VAT</Text>
                                </View>
                                <View style={styles.totalsValue}>
                                    <Text style={styles.totalsTextValue}>EUR</Text>
                                </View>
                            </View>

                            <View style={styles.totalsGrand}>
                                <View style={styles.totalsGrandLabel}>
                                    <Text style={styles.totalsTextTotalDue}>TOTAL DUE:</Text>
                                </View>
                                <View style={styles.totalsGrandValue}>
                                    <Text style={[styles.totalsTextGrandValue, { fontSize: grandTotalFontSize }]}>
                                        €{formatCurrency(finalGrossTotal)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Comments Section */}
                    <View style={styles.commentsSection}>
                        <View style={styles.quoteIcon}>
                            <Image src={commentIcon} style={{ width: 10, height: 10 }} />
                        </View>

                        <View style={styles.commentsHeaderRow}>
                            <Text style={styles.commentsTitle}>COMMENTS</Text>
                        </View>

                        <View style={styles.commentsLine} />

                        <Text style={styles.exchangeRate}>1 EUR = HUF 355.14</Text>
                    </View>

                    <Text style={styles.commentsText}>
                        Thank you for choosing kunu labs. Payment is due by the date stated on this invoice. Please include the invoice number with your transfer reference. If you have any questions about this invoice or the services provided, contact us at{' '}
                        <Text style={styles.greenText}>hello@kunulabs.com</Text>.
                    </Text>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <View style={styles.footerLeft}>
                        <View style={styles.footerLogoContainer}>
                            <Image src={footer} style={styles.footerLogo} cache={true} />
                        </View>
                        <Text style={styles.footerDesignText}>A full stack digital lab</Text>
                    </View>
                    <View style={styles.footerRight}>
                        <Link src="https://kunulabs.com">
                            <View style={styles.footerLink}>
                                <View style={styles.groupIconContainer}>
                                    <Image src={Group} style={styles.groupIcon} cache={true} />
                                </View>
                                <Text style={styles.footerKunuText}>kunulabs.com</Text>
                            </View>
                        </Link>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export default VeristonePDF;