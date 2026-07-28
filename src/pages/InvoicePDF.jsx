// InvoicePDF.jsx - Footer on every page, 8 items per page
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
        padding: 30,
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
        borderBottom: `1 solid #D7C6A8`,
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
    invoiceNo: {
        fontSize: 24,
        fontWeight: 300,
        color: '#AF663F',
        marginBottom: 4
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
    attentionSection: {
        marginTop: 10,
        marginBottom: 0
    },
    attentionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 3
    },
    attentionLabel: {
        fontSize: 9,
        fontWeight: 600,
        color: '#212D41',
        marginRight: 8
    },
    attentionPerson: {
        fontSize: 9,
        fontWeight: 400,
        color: '#212D41'
    },
    contactRowInline: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    contactText: {
        fontSize: 9,
        fontWeight: 400,
        color: '#212D41'
    },
    verticalLine: {
        width: 1,
        height: 10,
        backgroundColor: '#444444',
        marginHorizontal: 8
    },
    invoiceDetailsBox: {
        width: 238,
        alignItems: 'flex-start'
    },
    invoiceDetailsTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        justifyContent: 'flex-start'
    },
    invoiceDetailsTitle: {
        fontSize: 10,
        fontWeight: 700,
        color: '#AF663F',
        letterSpacing: 0,
        fontFamily: 'Cormorant',
        marginRight: 5
    },
    invoiceDetailsLine: {
        width: 29,
        borderBottom: `1 solid #AF663F`,
        height: 1
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 3,
        justifyContent: 'flex-start'
    },
    detailLabel: {
        fontSize: 9,
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
    separatorLine: {
        width: 238,
        borderBottomWidth: 1,
        borderBottomColor: '#D7C6A8',
        borderBottomStyle: 'solid',
        height: 1,
        marginVertical: 3,
        opacity: 0.2
    },
    tableContainer: {
        borderTop: `1 solid #D7C6A8`,
        borderLeft: `1 solid #D7C6A8`,
        borderRight: `1 solid #D7C6A8`,
        marginBottom: 10
    },
    tableContainerWithBottomBorder: {
        borderTop: `1 solid #D7C6A8`,
        borderLeft: `1 solid #D7C6A8`,
        borderRight: `1 solid #D7C6A8`,
        borderBottom: `1 solid #D7C6A8`,
        marginBottom: 10
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#212D41',
        height: 22,
        width: '100%'
    },
    tableHeaderNo: {
        width: '8%',
        fontSize: 9,
        fontWeight: 700,
        color: '#FFFFFF',
        textAlign: 'left',
        paddingLeft: 6,
        paddingVertical: 3,
        borderRight: `1 solid #D7C6A8`,
        fontFamily: 'Cormorant'
    },
    tableHeaderDescription: {
        width: '62%',
        fontSize: 9,
        fontWeight: 700,
        color: '#FFFFFF',
        paddingLeft: 6,
        paddingVertical: 3,
        borderRight: `1 solid #D7C6A8`,
        fontFamily: 'Cormorant'
    },
    tableHeaderQty: {
        width: '15%',
        fontSize: 9,
        fontWeight: 700,
        color: '#FFFFFF',
        textAlign: 'left',
        paddingLeft: 6,
        paddingVertical: 3,
        borderRight: `1 solid #D7C6A8`,
        fontFamily: 'Cormorant'
    },
    tableHeaderPrice: {
        width: '15%',
        fontSize: 9,
        fontWeight: 700,
        color: '#FFFFFF',
        textAlign: 'left',
        paddingLeft: 6,
        paddingVertical: 3,
        fontFamily: 'Cormorant'
    },
    tableRow: {
        flexDirection: 'row',
        borderBottom: `1 solid #D7C6A8`,
        width: '100%'
    },
    tableRowLast: {
        flexDirection: 'row',
        width: '100%'
    },
    tableRowNo: {
        width: '8%',
        fontSize: 8,
        fontWeight: 400,
        color: '#111827',
        textAlign: 'center',
        paddingTop: 4,
        paddingBottom: 4,
        paddingHorizontal: 2,
        borderRight: `1 solid #D7C6A8`
    },
    tableRowDescription: {
        width: '62%',
        paddingTop: 4,
        paddingBottom: 4,
        paddingLeft: 6,
        paddingRight: 2,
        borderRight: `1 solid #D7C6A8`
    },
    itemName: {
        fontSize: 8,
        fontWeight: 500,
        color: '#212D41',
        marginBottom: 1
    },
    itemDetailsRow1: {
        fontSize: 7,
        fontWeight: 400,
        color: '#212D41',
        lineHeight: 1.2,
        marginBottom: 1
    },
    itemDetailsRow2: {
        fontSize: 7,
        fontWeight: 400,
        fontStyle: 'italic',
        color: '#212D41',
        lineHeight: 1.2
    },
    tableRowQty: {
        width: '15%',
        fontSize: 8,
        fontWeight: 400,
        color: '#111827',
        textAlign: 'center',
        paddingTop: 4,
        paddingBottom: 4,
        paddingHorizontal: 2,
        borderRight: `1 solid #D7C6A8`
    },
    tableRowPrice: {
        width: '15%',
        fontSize: 8,
        fontWeight: 400,
        color: '#111827',
        textAlign: 'right',
        paddingTop: 4,
        paddingBottom: 4,
        paddingRight: 6
    },
    totalsSection: {
        marginTop: 6,
        alignItems: 'flex-end',
        marginBottom: 0
    },
    totalsSectionFor10Items: {
        marginTop: 30,
        alignItems: 'flex-end',
        marginBottom: -30
    },
    totalsBox: {
        width: 240,
        backgroundColor: '#E8E4DF',
        padding: 8,
        borderRadius: 4
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
        paddingVertical: 0
    },
    totalLabel: {
        fontSize: 8,
        fontWeight: 400,
        color: '#6b7280'
    },
    totalValue: {
        fontSize: 8,
        fontWeight: 700,
        color: '#111827'
    },
    grandTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 2,
        paddingTop: 2,
        borderTop: `1 solid #D7C6A8`
    },
    grandTotalLabel: {
        fontSize: 9,
        fontWeight: 700,
        color: '#111827'
    },
    grandTotalValue: {
        fontSize: 9,
        fontWeight: 700,
        color: '#111827'
    },
    // Footer Styles - Only on last page, fixed at bottom
    footerFixed: {
        position: 'absolute',
        bottom: 20,
        left: 30,
        right: 30
    },
    footerSeparator: {
        borderTop: `1 solid #D7C6A8`,
        marginBottom: 8
    },
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
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
    },
    // Content wrapper to ensure footer doesn't overlap
    contentContainer: {
        flex: 1,
        marginBottom: 140
    }
});

// Helper function to format description text
const formatDescription = (description) => {
    if (!description) return { firstPart: '', secondPart: '' };
    const parts = description.split('|').map(part => part.trim());
    const firstPart = parts.slice(0, 4).join(' | ');
    const secondPart = parts.slice(4).join(' | ');
    return { firstPart, secondPart };
};

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
                    Payment is due within 30 days of invoice date. Title to goods remains with Veristone e.U. until full payment is received.
                </Text>
            </View>
        </View>
    </View>
);

// Table row component
const TableRow = ({ item, index, isLastItem }) => (
    <View style={isLastItem ? styles.tableRowLast : styles.tableRow}>
        <Text style={styles.tableRowNo}>{item.sno || index + 1}</Text>
        <View style={styles.tableRowDescription}>
            <Text style={styles.itemName}>{item.name}</Text>
            {formatDescription(item.description).firstPart && (
                <Text style={styles.itemDetailsRow1}>{formatDescription(item.description).firstPart}</Text>
            )}
            {formatDescription(item.description).secondPart && (
                <Text style={styles.itemDetailsRow2}>{formatDescription(item.description).secondPart}</Text>
            )}
        </View>
        <Text style={styles.tableRowQty}>{item.quantity}</Text>
        <Text style={styles.tableRowPrice}>
            {item.price.toLocaleString('en-US', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}
        </Text>
    </View>
);

// Totals component - Updated to accept vatRate
const TotalsSection = ({ netTotal, vat, grossTotal, isFor10Items = false, vatRate = 6.5 }) => (
    <View style={isFor10Items ? styles.totalsSectionFor10Items : styles.totalsSection}>
        <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Net Total</Text>
                <Text style={styles.totalValue}>
                    {netTotal.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'EUR',
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })}
                </Text>
            </View>
            <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>VAT ({vatRate}%)</Text>
                <Text style={styles.totalValue}>
                    {vat.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'EUR',
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })}
                </Text>
            </View>
            <View style={styles.grandTotalRow}>
                <Text style={styles.grandTotalLabel}>Gross Total</Text>
                <Text style={styles.grandTotalValue}>
                    {grossTotal.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'EUR',
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })}
                </Text>
            </View>
        </View>
    </View>
);

// Header component - Pass orderNo as prop
const HeaderSection = ({ orderNo }) => (
    <View style={styles.header}>
        <View style={styles.leftHeader}>
            {LogoSvg && (
                <View style={styles.logoContainer}>
                    <Image src={LogoSvg} style={styles.logo} cache={true} />
                </View>
            )}
        </View>
        <View style={styles.rightHeader}>
            <Text style={styles.invoiceNo}>{orderNo}</Text>
        </View>
    </View>
);

// Bill To Section component
const BillToSection = ({ customerName, address, attention, email, phoneNumber, date, orderNo, dueDate }) => (
    <View style={styles.billToSection}>
        <View style={styles.billToBox}>
            <View style={styles.billToTitleContainer}>
                <Text style={styles.billToTitle}>BILL TO</Text>
                <View style={styles.billToLine} />
            </View>
            <Text style={styles.customerName}>{customerName}</Text>
            {address && address.split('\n').map((line, i) => (
                <Text key={i} style={styles.billToAddress}>{line}</Text>
            ))}
            {(attention || email || phoneNumber) && (
                <View style={styles.attentionSection}>
                    <View style={styles.attentionRow}>
                        <Text style={styles.attentionLabel}>Attention:</Text>
                        <Text style={styles.attentionPerson}>{attention}</Text>
                    </View>
                    {(email || phoneNumber) && (
                        <View style={styles.contactRowInline}>
                            {email && <Text style={styles.contactText}>{email}</Text>}
                            {email && phoneNumber && <View style={styles.verticalLine} />}
                            {phoneNumber && <Text style={styles.contactText}>{phoneNumber}</Text>}
                        </View>
                    )}
                </View>
            )}
        </View>
        <View style={styles.invoiceDetailsBox}>
            <View style={styles.invoiceDetailsTitleContainer}>
                <Text style={styles.invoiceDetailsTitle}>INVOICE DETAILS</Text>
                <View style={styles.invoiceDetailsLine} />
            </View>
            <View style={styles.detailRowContainer}>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Date</Text>
                    <Text style={styles.detailValue}>{date}</Text>
                </View>
                <View style={styles.separatorLine} />
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Order Number</Text>
                    <Text style={styles.detailValue}>{orderNo}</Text>
                </View>
                <View style={styles.separatorLine} />
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Due Date:</Text>
                    <Text style={styles.detailValue}>{dueDate}</Text>
                </View>
            </View>
        </View>
    </View>
);

const InvoicePDF = ({ data }) => {
    const {
        orderNo,
        customerName,
        phoneNumber,
        address,
        items,
        date,
        dueDate,
        attention,
        email,
        netTotal,
        vat,
        grossTotal,
        vatRate = 6.5
    } = data;

    const calculatedNetTotal = netTotal || items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const calculatedVat = vat || calculatedNetTotal * (vatRate / 100);
    const calculatedGrossTotal = grossTotal || calculatedNetTotal + calculatedVat;

    const ITEMS_PER_PAGE = 8; // Changed from 10 to 8
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const isExactly8Items = totalItems === 8;

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

    return (
        <Document>
            {pages.map((page) => (
                <Page key={page.pageNumber} size="LETTER" style={styles.page}>
                    <View style={styles.contentContainer}>
                        {/* Header - Only on first page */}
                        {page.pageNumber === 1 ? (
                            <>
                                <HeaderSection orderNo={orderNo} />
                                <BillToSection
                                    customerName={customerName}
                                    address={address}
                                    attention={attention}
                                    email={email}
                                    phoneNumber={phoneNumber}
                                    date={date}
                                    orderNo={orderNo}
                                    dueDate={dueDate}
                                />
                            </>
                        ) : (
                            // For subsequent pages, show a simpler header with just the logo and order number
                            <View style={styles.header}>
                                <View style={styles.leftHeader}>
                                    {LogoSvg && (
                                        <View style={styles.logoContainer}>
                                            <Image src={LogoSvg} style={styles.logo} cache={true} />
                                        </View>
                                    )}
                                </View>
                                <View style={styles.rightHeader}>
                                    <Text style={styles.invoiceNo}>{orderNo}</Text>
                                </View>
                            </View>
                        )}

                        {/* Items Table */}
                        <View style={page.isLastPage ? styles.tableContainerWithBottomBorder : styles.tableContainer}>
                            <View style={styles.tableHeader}>
                                <Text style={styles.tableHeaderNo}>NO.</Text>
                                <Text style={styles.tableHeaderDescription}>ITEM DESCRIPTION</Text>
                                <Text style={styles.tableHeaderQty}>QTY</Text>
                                <Text style={styles.tableHeaderPrice}>PRICE</Text>
                            </View>

                            {page.items.map((item, index) => {
                                const isLastItem = page.isLastPage && index === page.items.length - 1;
                                return (
                                    <TableRow
                                        key={index}
                                        item={item}
                                        index={page.startIndex + index}
                                        isLastItem={isLastItem}
                                    />
                                );
                            })}
                        </View>

                        {/* Totals - Only on last page */}
                        {page.isLastPage && (
                            <TotalsSection
                                netTotal={calculatedNetTotal}
                                vat={calculatedVat}
                                grossTotal={calculatedGrossTotal}
                                isFor10Items={false}
                                vatRate={vatRate}
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

export default InvoicePDF;