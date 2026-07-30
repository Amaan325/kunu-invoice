// src/pages/PDFConverter.jsx
import React, { useState, useRef } from 'react';
import { pdf } from '@react-pdf/renderer';
import VeristonePDF from './VeristonePDF';
import * as pdfjsLib from 'pdfjs-dist';

// Set the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString();

class InvoiceParser {
    constructor(text, pageData) {
        this.text = this.cleanText(text);
        this.pageData = pageData;
        this.lines = this.text.split('\n').filter(line => line.trim());
        this.data = this.initializeDataStructure();
        this.debug = {
            itemAttempts: [],
            tableFound: false,
            rawTableData: []
        };
    }

    cleanText(text) {
        return text
            .replace(/ /g, ' ')
            .replace(/€/g, '€')
            .trim();
    }

    initializeDataStructure() {
        return {
            documentNumber: '',
            issueDate: '',
            dueDate: '',
            fulfillmentDate: '',
            customerName: '',
            customerAddress: '',
            customerVat: '',
            customerEmail: '',
            customerPhone: '',
            customerCountry: '',
            items: [],
            netTotal: 0,
            vat: 0,
            grossTotal: 0,
            vatRate: 0,
            exchangeRate: 355.84,
            paymentMethod: '',
            comment: '',
            sellerName: '',
            sellerAddress: '',
            sellerVat: '',
            sellerRegistration: '',
            sellerEuVat: '',
            sellerIban: '',
            sellerBank: '',
            sellerBic: '',
            currency: 'EUR'
        };
    }

    parse() {
        this.extractDocumentNumber();
        this.extractSellerInfo();
        this.extractDates();
        this.extractPaymentMethod();
        this.extractExchangeRate();
        this.extractComment();
        this.extractCurrency(); // Added currency extraction
        this.extractCustomerInfo();
        this.extractItemsWithCoordinates();
        this.extractTotals();
        this.cleanCustomerData();
        console.log('Debug info:', this.debug);
        return this.data;
    }

    // NEW: Extract currency from the invoice
    extractCurrency() {
        console.log('Extracting currency...');

        // First check for explicit currency declaration
        const explicitMatch = this.text.match(/Currency\s*[:.]\s*([A-Z]{3})/i);
        if (explicitMatch) {
            const currency = explicitMatch[1].toUpperCase();
            if (['EUR', 'USD', 'GBP', 'HUF'].includes(currency)) {
                this.data.currency = currency;
                console.log('Extracted currency (explicit):', currency);
                return;
            }
        }

        // Check for currency symbols in the text (most common indicator)
        // Check for Euro
        if (this.text.includes('€') || this.text.match(/EUR/i)) {
            this.data.currency = 'EUR';
            console.log('Extracted currency (symbol): EUR');
            return;
        }

        // Check for Dollar
        if (this.text.includes('$') || this.text.match(/USD/i)) {
            this.data.currency = 'USD';
            console.log('Extracted currency (symbol): USD');
            return;
        }

        // Check for Pound
        if (this.text.includes('£') || this.text.match(/GBP/i)) {
            this.data.currency = 'GBP';
            console.log('Extracted currency (symbol): GBP');
            return;
        }

        // Check for Hungarian Forint
        if (this.text.includes('Ft') || this.text.match(/HUF|forint/i)) {
            this.data.currency = 'HUF';
            console.log('Extracted currency (symbol): HUF');
            return;
        }

        // Check in totals
        const totalMatch = this.text.match(/TOTAL\s*DUE\s*[:.]?\s*([€$£])/i);
        if (totalMatch) {
            const symbol = totalMatch[1];
            if (symbol === '€') this.data.currency = 'EUR';
            else if (symbol === '$') this.data.currency = 'USD';
            else if (symbol === '£') this.data.currency = 'GBP';
            console.log('Extracted currency from TOTAL DUE:', this.data.currency);
            return;
        }

        // Check in NET TOTAL
        const netMatch = this.text.match(/NET\s*TOTAL\s*[:.]?\s*([€$£])/i);
        if (netMatch) {
            const symbol = netMatch[1];
            if (symbol === '€') this.data.currency = 'EUR';
            else if (symbol === '$') this.data.currency = 'USD';
            else if (symbol === '£') this.data.currency = 'GBP';
            console.log('Extracted currency from NET TOTAL:', this.data.currency);
            return;
        }

        // Check in item prices
        const itemMatch = this.text.match(/(?:€|\$|£|Ft)/);
        if (itemMatch) {
            const symbol = itemMatch[0];
            if (symbol === '€') this.data.currency = 'EUR';
            else if (symbol === '$') this.data.currency = 'USD';
            else if (symbol === '£') this.data.currency = 'GBP';
            else if (symbol === 'Ft') this.data.currency = 'HUF';
            console.log('Extracted currency from items:', this.data.currency);
            return;
        }

        // Default to EUR if no currency detected
        this.data.currency = 'EUR';
        console.log('No currency detected, defaulting to EUR');
    }

    extractDocumentNumber() {
        console.log('Extracting document number...');

        const invoiceMatch = this.text.match(/Invoice\s+([A-Z]{2,4}[0-9]*[-\s]*\d{4}[-\s]*\d+)/i);
        if (invoiceMatch) {
            this.data.documentNumber = invoiceMatch[1].trim();
            console.log('Extracted document number (Invoice):', this.data.documentNumber);
            return;
        }

        const patternMatch = this.text.match(/([A-Z]{2,4}[0-9]*)[-\s]*(\d{4})[-\s]*(\d+)/i);
        if (patternMatch) {
            const prefix = patternMatch[1].toUpperCase();
            const year = patternMatch[2];
            const number = patternMatch[3];
            this.data.documentNumber = `${prefix}-${year}-${number}`;
            console.log('Extracted document number (pattern):', this.data.documentNumber);
            return;
        }

        const fallbackMatch = this.text.match(/Invoice\s*[#:]\s*([A-Za-z0-9\-_]+)/i);
        if (fallbackMatch) {
            this.data.documentNumber = fallbackMatch[1].trim();
            console.log('Extracted document number (fallback):', this.data.documentNumber);
            return;
        }

        console.log('No document number found');
        this.data.documentNumber = '';
    }

    extractSellerInfo() {
        console.log('Extracting seller info...');

        const sellerMatch = this.text.match(/SELLER\s*([\s\S]*?)(?:BUYER|ISSUE|FULFILLMENT|DUE|PAYMENT|TOTAL|€|\$|£|Ft)/i);
        if (!sellerMatch) {
            console.log('No seller section found');
            return;
        }

        const sellerSection = sellerMatch[1].trim();
        console.log('Seller section:', sellerSection);

        const companyMatch = sellerSection.match(/([A-Za-z\s]+(?:Kft\.|GmbH|AG|Ltd|LLC|Inc|Corp|S\.A\.|SRL))/i);
        if (companyMatch) {
            this.data.sellerName = companyMatch[1].trim();
            console.log('Extracted seller name (company):', this.data.sellerName);
        } else {
            const nameMatch = sellerSection.match(/^([A-Za-z\s]+?)\s+(?:Király|VAT|ID)/i);
            if (nameMatch) {
                this.data.sellerName = nameMatch[1].trim();
                console.log('Extracted seller name (fallback):', this.data.sellerName);
            } else {
                const words = sellerSection.split(/\s+/);
                if (words.length >= 3) {
                    this.data.sellerName = words.slice(0, 3).join(' ');
                    console.log('Extracted seller name (words):', this.data.sellerName);
                }
            }
        }

        if (this.pageData && this.pageData.length > 0) {
            const page = this.pageData[0];
            const pageItems = page.items;

            const addressItems = pageItems.filter(item => {
                const text = item.text;
                return text.includes('Király') ||
                    text.includes('utca') ||
                    text.match(/\d{4}\s+Budapest/) ||
                    text.includes('Budapest') ||
                    text.includes('Hungary');
            });

            console.log('Address items found:', addressItems.map(i => i.text));

            if (addressItems.length > 0) {
                const lines = this.groupByY(addressItems);
                console.log('Address lines from coordinates:', lines);
                this.data.sellerAddress = lines.join('\n');
                console.log('Extracted seller address (coordinates):', this.data.sellerAddress);
            }
        }

        if (!this.data.sellerAddress) {
            const addressMatch = sellerSection.match(/(Király utca[\s\S]*?)(?=\s+VAT\s*ID:)/i);
            if (addressMatch) {
                let address = addressMatch[1].trim().replace(/\s+/g, ' ');
                const parts = address.match(/(Király utca \d+\.)\s*(\d+\.\s*em\.\s*\d+\.\s*ajtó)\s*(\d{4}\s*Budapest)\s*(Hungary)/i);
                if (parts) {
                    this.data.sellerAddress = `${parts[1]}\n${parts[2]}\n${parts[3]}\n${parts[4]}`;
                } else {
                    this.data.sellerAddress = address;
                }
                console.log('Extracted seller address (regex fallback):', this.data.sellerAddress);
            }
        }

        const vatMatch = sellerSection.match(/VAT\s*ID:?\s*([A-Za-z0-9\-\.]+)/i);
        if (vatMatch) this.data.sellerVat = vatMatch[1].trim();

        const euVatMatch = sellerSection.match(/EU\s*VAT\s*ID:?\s*([A-Za-z0-9\-\.]+)/i);
        if (euVatMatch) this.data.sellerEuVat = euVatMatch[1].trim();

        const regMatch = sellerSection.match(/COMPANY\s*REGISTRATION\s*(?:NUMBER|NO\.?)?:?\s*([A-Za-z0-9\-\.]+)/i);
        if (regMatch) this.data.sellerRegistration = regMatch[1].trim();

        const ibanMatch = sellerSection.match(/IBAN:?\s*([A-Za-z0-9]+)/i);
        if (ibanMatch) this.data.sellerIban = ibanMatch[1].trim();

        const bankMatch = sellerSection.match(/BANK:?\s*([A-Za-z\s]+?)(?:\s|$)/i);
        if (bankMatch) this.data.sellerBank = bankMatch[1].trim();

        const bicMatch = sellerSection.match(/SWIFT\/BIC:?\s*([A-Za-z0-9]+)/i);
        if (bicMatch) this.data.sellerBic = bicMatch[1].trim();

        console.log('Extracted seller info:', {
            name: this.data.sellerName,
            address: this.data.sellerAddress,
            vat: this.data.sellerVat,
            registration: this.data.sellerRegistration,
            euVat: this.data.sellerEuVat,
            iban: this.data.sellerIban,
            bank: this.data.sellerBank,
            bic: this.data.sellerBic
        });
    }

    groupByY(items, tolerance = 5) {
        const groups = [];

        for (const item of items) {
            let added = false;
            for (const group of groups) {
                const avgY = group.reduce((sum, i) => sum + i.y, 0) / group.length;
                if (Math.abs(item.y - avgY) <= tolerance) {
                    group.push(item);
                    added = true;
                    break;
                }
            }
            if (!added) {
                groups.push([item]);
            }
        }

        groups.sort((a, b) => {
            const avgY1 = a.reduce((sum, i) => sum + i.y, 0) / a.length;
            const avgY2 = b.reduce((sum, i) => sum + i.y, 0) / b.length;
            return avgY1 - avgY2;
        });

        return groups.map(group => {
            group.sort((a, b) => a.x - b.x);
            return group.map(item => item.text).join(' ');
        });
    }

    extractItemsWithPatterns() {
        console.log('Extracting items with patterns...');
        const items = [];
        const text = this.text;

        // Get currency symbol for pattern matching
        const currencySymbol = this.getCurrencySymbol();
        console.log('Using currency symbol for item extraction:', currencySymbol);

        const headerIndex = text.indexOf('DESCRIPTION QUANTITY NET UNIT PRICE NET LINE TOTAL VAT GROSS LINE TOTAL');
        let tableText = text;

        if (headerIndex !== -1) {
            const headerEnd = headerIndex + 'DESCRIPTION QUANTITY NET UNIT PRICE NET LINE TOTAL VAT GROSS LINE TOTAL'.length;
            tableText = text.substring(headerEnd);
            console.log('Found header, extracting items from after header');
        }

        // Dynamic pattern based on currency
        const itemPattern = new RegExp(`(\\d+)\\s+([A-Za-z][A-Za-z0-9\\s&\\-()]+?)\\s+(\\d+)\\s+db\\s+${currencySymbol}([\\d,\\.]+)\\s+${currencySymbol}([\\d,\\.]+)\\s+ÁTHK\\s+${currencySymbol}([\\d,\\.]+)`, 'gi');

        const matches = [...tableText.matchAll(itemPattern)];
        console.log(`Found ${matches.length} item matches`);

        for (const match of matches) {
            const sno = parseInt(match[1]);
            const name = match[2].trim();
            const quantity = parseInt(match[3]);
            const price = parseFloat(match[4].replace(/,/g, ''));
            const netTotal = parseFloat(match[5].replace(/,/g, ''));

            const isValidName = name &&
                !name.match(/^DESCRIPTION|^QUANTITY|^NET\s*UNIT|^NET\s*LINE|^VAT|^GROSS|^TOTAL|^SUBTOTAL|^ITEM|^NO\./i) &&
                !name.includes('DESCRIPTION') &&
                !name.includes('QUANTITY') &&
                !name.includes('NET UNIT') &&
                !name.includes('NET LINE') &&
                !name.includes('GROSS LINE');

            if (isValidName && quantity > 0 && price > 0) {
                items.push({
                    sno: sno,
                    name: name.replace(/&amp;/g, '&'),
                    quantity: quantity,
                    price: price,
                    total: netTotal || (quantity * price)
                });
                console.log('✅ Added item:', items[items.length - 1]);
            } else {
                console.log('⏭️ Skipped item (invalid name):', { sno, name, quantity, price });
            }
        }

        if (items.length === 0) {
            console.log('Trying line-by-line extraction...');
            const lines = this.text.split('\n');
            let inTable = false;

            for (const line of lines) {
                if (line.match(/DESCRIPTION\s+QUANTITY\s+NET\s+UNIT\s+PRICE\s+NET\s+LINE\s+TOTAL\s+VAT\s+GROSS\s+LINE\s+TOTAL/i)) {
                    inTable = true;
                    continue;
                }

                if (!inTable) continue;

                if (line.match(/NET\s*TOTAL|TOTAL\s*DUE|ÁTHK\s*VAT|Exchange\s*rate|COMMENT|Invoice|Page/i)) {
                    continue;
                }

                if (line.match(/\d+\s+db/) && line.includes('ÁTHK')) {
                    const match = line.match(itemPattern);
                    if (match) {
                        const sno = parseInt(match[1]);
                        const name = match[2].trim();
                        const quantity = parseInt(match[3]);
                        const price = parseFloat(match[4].replace(/,/g, ''));
                        const total = parseFloat(match[5].replace(/,/g, ''));

                        if (name && quantity > 0 && price > 0 &&
                            !name.match(/DESCRIPTION|QUANTITY|NET\s*UNIT|NET\s*LINE|VAT|GROSS|TOTAL|SUBTOTAL|ITEM|NO\./i)) {
                            items.push({
                                sno: sno,
                                name: name.replace(/&amp;/g, '&'),
                                quantity: quantity,
                                price: price,
                                total: total
                            });
                            console.log('✅ Added item from line:', items[items.length - 1]);
                        }
                    }
                }
            }
        }

        console.log(`Total found ${items.length} items:`, items);
        return items;
    }

    // Helper method to get currency symbol for pattern matching
    getCurrencySymbol() {
        const currency = this.data.currency || 'EUR';
        const symbols = {
            'EUR': '€',
            'USD': '\\$', // Escaped for regex
            'GBP': '£',
            'HUF': 'Ft'
        };
        return symbols[currency] || '€';
    }

    extractItemsWithCoordinates() {
        console.log('Extracting items with coordinates...');

        const textItems = this.extractItemsWithPatterns();
        if (textItems.length > 0) {
            console.log('Found items via text patterns:', textItems);
            this.data.items = textItems;
            return;
        }

        if (this.data.items.length === 0) {
            console.log('No items found with any method');
            this.data.items = [];
        }
    }

    extractCustomerInfo() {
        console.log('Extracting customer info...');
        let customerSection = this.findCustomerSection();
        if (customerSection) {
            this.parseCustomerSection(customerSection);
        }
        if (!this.data.customerName) {
            this.identifyCustomerFromText();
        }
        this.cleanCustomerData();
    }

    cleanCustomerData() {
        console.log('Cleaning customer data...');
        console.log('Raw customerName:', this.data.customerName);
        console.log('Raw customerAddress:', this.data.customerAddress);
        if (this.data.customerName) {
            const hasAddressIndicators = this.data.customerName.match(/\d+/) ||
                this.data.customerName.match(/strasse|street|road|avenue|platz|gasse/i) ||
                this.data.customerName.match(/Switzerland|Hungary|Austria|Germany|Portugal|Lisbon/i);
            if (hasAddressIndicators) {
                const companyMatch = this.data.customerName.match(/^([A-Za-z\s]+(?:GmbH|AG|Ltd|LLC|Inc|Corp|S\.A\.|SRL|Kft\.))/i);
                if (companyMatch) {
                    const name = companyMatch[1].trim();
                    const address = this.data.customerName.replace(companyMatch[1], '').trim();
                    let addressLines = address.split(/[,;]\s*/).filter(line => line.trim()).map(line => line.trim());
                    this.data.customerName = name;
                    if (this.data.customerAddress) {
                        this.data.customerAddress = addressLines.join('\n') + '\n' + this.data.customerAddress;
                    } else {
                        this.data.customerAddress = addressLines.join('\n');
                    }
                    console.log('Split customerName into name and address');
                }
            }
        }
        if (this.data.customerAddress) {
            this.data.customerAddress = this.data.customerAddress.replace(/VAT\s*ID:?\s*[A-Za-z0-9\-\.]+/gi, '').trim();
            if (this.data.customerName) {
                const namePattern = this.data.customerName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const nameRegex = new RegExp(`^${namePattern}\\s*$`, 'i');
                let addressLines = this.data.customerAddress.split('\n').filter(line => !line.match(nameRegex) && line.trim());
                this.data.customerAddress = addressLines.join('\n');
            }
        }
        console.log('Cleaned customerName:', this.data.customerName);
        console.log('Cleaned customerAddress:', this.data.customerAddress);
    }

    findCustomerSection() {
        const markers = [
            /BUYER\s*([\s\S]*?)(?:SELLER|ISSUE|FULFILLMENT|DUE|PAYMENT|TOTAL|€|\$|£|Ft)/i,
            /CUSTOMER\s*([\s\S]*?)(?:SELLER|ISSUE|FULFILLMENT|DUE|PAYMENT|TOTAL|€|\$|£|Ft)/i,
            /BILL\s*TO\s*([\s\S]*?)(?:SELLER|ISSUE|FULFILLMENT|DUE|PAYMENT|TOTAL|€|\$|£|Ft)/i,
            /CLIENT\s*([\s\S]*?)(?:SELLER|ISSUE|FULFILLMENT|DUE|PAYMENT|TOTAL|€|\$|£|Ft)/i
        ];
        for (const pattern of markers) {
            const match = this.text.match(pattern);
            if (match) {
                const section = match[1].trim();
                console.log('Found customer section:', section);
                return section;
            }
        }
        return null;
    }

    parseCustomerSection(section) {
        console.log('Parsing customer section...');
        let vatMatch = section.match(/VAT\s*ID:?\s*([A-Za-z0-9\-\.]+)/i);
        if (vatMatch) {
            this.data.customerVat = vatMatch[1].trim();
            section = section.replace(/VAT\s*ID:?\s*[A-Za-z0-9\-\.]+/i, '').trim();
        }

        const patterns = [
            /^([A-Za-z\s]+(?:GmbH|AG|Ltd|LLC|Inc|Corp|S\.A\.|SRL|Kft\.))\s+(.+)$/i,
            /^([A-Za-z]+\s+[A-Za-z]+)\s+(.+)$/i,
            /^([A-Za-z\s]+(?:GmbH|AG|Ltd|LLC|Inc|Corp|S\.A\.|SRL|Kft\.)),\s*(.+)$/i,
        ];

        let nameFound = false;
        let addressPart = '';

        for (const pattern of patterns) {
            const match = section.match(pattern);
            if (match) {
                this.data.customerName = match[1].trim();
                addressPart = match[2].trim();
                nameFound = true;
                console.log('Found customer name:', this.data.customerName);
                console.log('Address part:', addressPart);
                break;
            }
        }

        if (!nameFound) {
            let parts = section.split(/VAT/i);
            if (parts.length > 0) {
                const cleanPart = parts[0].trim();
                let nameMatch = cleanPart.match(/^([A-Za-z\s]+(?:GmbH|AG|Ltd|LLC|Inc|Corp|S\.A\.|SRL|Kft\.))/i);
                if (!nameMatch) {
                    nameMatch = cleanPart.match(/^([A-Za-z]+\s+[A-Za-z]+)/);
                }
                if (nameMatch) {
                    this.data.customerName = nameMatch[1].trim();
                    addressPart = cleanPart.replace(nameMatch[1], '').trim();
                    nameFound = true;
                    console.log('Found customer name (fallback):', this.data.customerName);
                    console.log('Address part (fallback):', addressPart);
                }
            }
        }

        if (addressPart) {
            addressPart = addressPart.replace(/VAT\s*ID:?\s*[A-Za-z0-9\-\.]+/i, '').trim();
            let formattedAddress = '';
            const parts = addressPart.split(',').map(p => p.trim()).filter(p => p);

            if (parts.length >= 3) {
                const street = parts[0];
                const postalCity = parts[1];
                const country = parts[2];
                const postalMatch = postalCity.match(/^(\d+)\s+(.+)$/);
                if (postalMatch) {
                    const postalCode = postalMatch[1];
                    const cityName = postalMatch[2];
                    formattedAddress = `${street}, ${postalCode}\n${cityName}\n${country}`;
                } else {
                    formattedAddress = `${street}\n${postalCity}\n${country}`;
                }
            } else if (parts.length === 2) {
                const street = parts[0];
                const rest = parts[1];

                const postalMatch = rest.match(/^([A-Za-z]?\d[\dA-Za-z\-]*)\s+(.+)$/);

                if (postalMatch) {
                    const postalCode = postalMatch[1];
                    const cityCountry = postalMatch[2].trim();

                    const countries = [
                        "Portugal", "Switzerland", "Hungary", "Germany", "Austria",
                        "Belgium", "France", "Italy", "Spain", "Netherlands",
                        "Luxembourg", "Poland", "Romania", "Croatia", "Slovakia",
                        "Slovenia", "Czech Republic", "United Kingdom", "Ireland",
                        "Denmark", "Sweden", "Norway", "Finland", "Estonia",
                        "Latvia", "Lithuania", "Bosnia and Herzegovina", "Serbia",
                        "Montenegro", "North Macedonia", "Albania", "Bulgaria",
                        "Greece", "Cyprus", "Malta", "Turkey", "United States",
                        "Canada", "Australia", "New Zealand", "South Africa",
                        "United Arab Emirates", "Saudi Arabia", "India", "China",
                        "Japan", "South Korea", "Singapore", "Malaysia", "Thailand"
                    ];

                    const sortedCountries = countries.sort((a, b) => b.length - a.length);

                    let country = "";
                    let city = cityCountry;

                    for (const c of sortedCountries) {
                        if (cityCountry.toLowerCase().endsWith(c.toLowerCase())) {
                            country = c;
                            city = cityCountry.substring(0, cityCountry.length - c.length).trim();
                            break;
                        }
                    }

                    if (country) {
                        formattedAddress = `${street},\n${postalCode} ${city}\n${country}`;
                    } else {
                        formattedAddress = `${street}\n${postalCode} ${cityCountry}`;
                    }
                } else {
                    formattedAddress = `${street}\n${rest}`;
                }
            } else {
                formattedAddress = addressPart;
            }

            this.data.customerAddress = formattedAddress;
            console.log('Formatted customer address:', this.data.customerAddress);
        }

        if (!this.data.customerAddress && !nameFound) {
            const lines = section.split('\n').filter(line => line.trim());
            if (lines.length > 0) {
                this.data.customerName = lines[0].trim();
                if (lines.length > 1) {
                    this.data.customerAddress = lines.slice(1).join('\n');
                }
            }
        }
    }

    identifyCustomerFromText() {
        console.log('Identifying customer from text...');
        const lines = this.lines;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.match(/(?:GmbH|AG|Ltd|LLC|Inc|Corp|S\.A\.|SRL|Kft\.)/i) &&
                !line.match(/All Things Studio|Király|32950997|HU32950997/)) {
                this.data.customerName = line;
                console.log('Identified customer name:', this.data.customerName);
                const addressLines = [];
                for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
                    const nextLine = lines[j].trim();
                    if (nextLine.match(/VAT|EMAIL|PHONE|TEL|FAX|IBAN|SWIFT|BIC/i)) {
                        const vatMatch = nextLine.match(/VAT\s*[:.]?\s*([A-Za-z0-9\-\.]+)/i);
                        if (vatMatch) {
                            this.data.customerVat = vatMatch[1].trim();
                        }
                        break;
                    }
                    if (nextLine && !nextLine.match(/All Things Studio|Király|32950997|HU32950997/)) {
                        addressLines.push(nextLine);
                    }
                }
                if (addressLines.length > 0) {
                    this.data.customerAddress = addressLines.join('\n');
                    console.log('Identified customer address:', this.data.customerAddress);
                }
                break;
            }
        }
    }

    extractTotals() {
        const currencySymbol = this.getCurrencySymbol();

        const netPatterns = [
            new RegExp(`NET\\s*TOTAL\\s*[:.]?\\s*(?:${currencySymbol})?([\\d,\\.]+)`, 'i'),
            /Subtotal\s*[:.]?\s*(?:€|\$|£|Ft)?([\d,\.]+)/i,
            /Sub\s*Total\s*[:.]?\s*(?:€|\$|£|Ft)?([\d,\.]+)/i
        ];
        const netMatch = this.findPattern(netPatterns);
        if (netMatch) {
            this.data.netTotal = parseFloat(netMatch[1].replace(/,/g, ''));
        } else if (this.data.items.length > 0) {
            this.data.netTotal = this.data.items.reduce((sum, item) => sum + (item.total || item.quantity * item.price), 0);
        }

        const vatPatterns = [
            new RegExp(`ÁTHK\\s*VAT\\s*[:.]?\\s*(?:${currencySymbol})?([\\d,\\.]+)`, 'i'),
            /VAT\s*[:.]?\s*(?:€|\$|£|Ft)?([\d,\.]+)/i,
            /Tax\s*[:.]?\s*(?:€|\$|£|Ft)?([\d,\.]+)/i
        ];
        const vatMatch = this.findPattern(vatPatterns);
        if (vatMatch) {
            this.data.vat = parseFloat(vatMatch[1].replace(/,/g, ''));
        }

        const grossPatterns = [
            new RegExp(`TOTAL\\s*DUE\\s*[:.]?\\s*(?:${currencySymbol})?([\\d,\\.]+)`, 'i'),
            /GRAND\s*TOTAL\s*[:.]?\s*(?:€|\$|£|Ft)?([\d,\.]+)/i,
            /Total\s*\(incl\.\s*VAT\)\s*[:.]?\s*(?:€|\$|£|Ft)?([\d,\.]+)/i
        ];
        const grossMatch = this.findPattern(grossPatterns);
        if (grossMatch) {
            this.data.grossTotal = parseFloat(grossMatch[1].replace(/,/g, ''));
        } else if (this.data.netTotal > 0) {
            this.data.grossTotal = this.data.netTotal + this.data.vat;
        }
        if (this.data.netTotal > 0 && this.data.vat > 0) {
            this.data.vatRate = (this.data.vat / this.data.netTotal) * 100;
        }
    }

    findPattern(patterns, text = this.text) {
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) return match;
        }
        return null;
    }

    extractDates() {
        const extractDate = (patternSet) => {
            const match = this.findPattern(patternSet);
            if (match) {
                const dateStr = match[1] || match[0];
                return this.formatDate(dateStr.trim());
            }
            return null;
        };
        const issuePatterns = [
            /ISSUE\s*DATE\s*[:.]\s*([^\n,]+)/i,
            /Issue\s*Date\s*[:.]\s*([^\n,]+)/i,
            /Date\s*[:.]\s*([^\n,]+)/i,
            /Created\s*[:.]\s*([^\n,]+)/i
        ];
        const duePatterns = [
            /DUE\s*DATE\s*[:.]\s*([^\n,]+)/i,
            /Due\s*Date\s*[:.]\s*([^\n,]+)/i,
            /Payment\s*Due\s*[:.]\s*([^\n,]+)/i
        ];
        const fulfillmentPatterns = [
            /FULFILLMENT\s*DATE\s*[:.]\s*([^\n,]+)/i,
            /Fulfillment\s*Date\s*[:.]\s*([^\n,]+)/i,
            /Delivery\s*Date\s*[:.]\s*([^\n,]+)/i
        ];
        this.data.issueDate = extractDate(issuePatterns);
        this.data.dueDate = extractDate(duePatterns);
        this.data.fulfillmentDate = extractDate(fulfillmentPatterns);
    }

    formatDate(dateStr) {
        const formats = [
            { regex: /(\d{2})\/(\d{2})\/(\d{4})/, order: [1, 2, 3] },
            { regex: /(\d{4})-(\d{2})-(\d{2})/, order: [3, 2, 1] },
            { regex: /(\d{2})\.(\d{2})\.(\d{4})/, order: [1, 2, 3] }
        ];
        for (const format of formats) {
            const match = dateStr.match(format.regex);
            if (match) {
                const day = match[format.order[0]];
                const month = match[format.order[1]];
                const year = match[format.order[2]];
                return `${day}/${month}/${year}`;
            }
        }
        return dateStr;
    }

    extractPaymentMethod() {
        const patterns = [
            /PAYMENT\s*METHOD\s*[:.]\s*([^\n,]+)/i,
            /Payment\s*Method\s*[:.]\s*([^\n,]+)/i,
            /Payment\s*[:.]\s*([^\n,]+)/i
        ];
        const match = this.findPattern(patterns);
        if (match) {
            this.data.paymentMethod = match[1].trim();
        }
    }

    extractExchangeRate() {
        const patterns = [
            /Exchange\s*rate\s*[:.]\s*[A-Z]+\s*([\d,\.]+)/i,
            /1\s*EUR\s*=\s*([\d,\.]+)\s*HUF/i,
            /EUR\/HUF\s*[:.]\s*([\d,\.]+)/i
        ];
        const match = this.findPattern(patterns);
        if (match) {
            this.data.exchangeRate = parseFloat(match[1].replace(/,/g, ''));
        }
    }

    extractComment() {
        const patterns = [
            /COMMENT\s*[:.]\s*([^\n]+)/i,
            /COMMENTS\s*[:.]\s*([^\n]+)/i,
            /Notes\s*[:.]\s*([^\n]+)/i
        ];
        const match = this.findPattern(patterns);
        if (match) {
            this.data.comment = match[1].trim();
        }
    }

    // UNUSED METHODS (kept for compatibility)
    extractItems() {
        console.log('Starting item extraction (fallback)...');
        const items = this.extractItemsWithPatterns();
        this.data.items = items;
    }

    extractTableData() {
        console.log('Extracting table data...');
        return [];
    }

    parseTableRows(rows) {
        return [];
    }

    parseSingleRow(row) {
        return null;
    }

    extractItemsFromText() {
        return [];
    }

    extractItemFromColumns(columns) {
        return null;
    }

    groupItemsByRow(items) {
        return [];
    }

    parseRowToItem(row, allItems) {
        return null;
    }

    debugText() {
        // Debug method
    }
}

// ============ PDFConverter Component ============
const PDFConverter = ({ onDataExtracted, onClose }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [extractedData, setExtractedData] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [conversionResult, setConversionResult] = useState(null);
    const [parsingError, setParsingError] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsProcessing(true);
        setSelectedFile(file);
        setExtractedData(null);
        setConversionResult(null);
        setParsingError(null);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const { textContent, pageData } = await extractTextAndCoordinatesFromPDF(arrayBuffer);
            console.log('Raw extracted text:', textContent);
            console.log('Page data with coordinates:', pageData);

            const parser = new InvoiceParser(textContent, pageData);
            const parsedData = parser.parse();
            console.log('Parsed data:', parsedData);

            setExtractedData(parsedData);
            await generateNewPDF(parsedData);
        } catch (error) {
            console.error('Error processing PDF:', error);
            setParsingError(error.message);
            alert(`Failed to process the PDF: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const extractTextAndCoordinatesFromPDF = async (arrayBuffer) => {
        try {
            const loadingTask = pdfjsLib.getDocument({
                data: arrayBuffer,
                useSystemFonts: true,
                standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/standard_fonts/'
            });
            const pdfDocument = await loadingTask.promise;
            let fullText = '';
            const pageData = [];

            for (let i = 1; i <= pdfDocument.numPages; i++) {
                const page = await pdfDocument.getPage(i);
                const viewport = page.getViewport({ scale: 1 });
                const textContent = await page.getTextContent();

                const pageItems = textContent.items.map(item => ({
                    text: item.str,
                    x: item.transform[4],
                    y: viewport.height - item.transform[5],
                    width: item.width,
                    height: item.height,
                    font: item.fontName,
                    fontSize: item.fontSize
                }));

                const pageText = textContent.items
                    .map(item => item.str)
                    .join(' ')
                    .replace(/\s+/g, ' ')
                    .trim();

                fullText += pageText + '\n';
                pageData.push({
                    pageNumber: i,
                    width: viewport.width,
                    height: viewport.height,
                    items: pageItems
                });
            }

            return { textContent: fullText, pageData };
        } catch (error) {
            console.error('Error in extractTextAndCoordinatesFromPDF:', error);
            throw new Error('Could not extract text from PDF. Please make sure it\'s a valid PDF file.');
        }
    };

    const generateNewPDF = async (data) => {
        try {
            const pdfComponent = <VeristonePDF data={data} />;
            const blob = await pdf(pdfComponent).toBlob();
            setConversionResult(URL.createObjectURL(blob));
        } catch (error) {
            console.error('Error generating new PDF:', error);
            throw new Error(`Failed to generate PDF: ${error.message}`);
        }
    };

    // In PDFConverter.jsx, find and replace the downloadConvertedPDF function

    const downloadConvertedPDF = () => {
        if (conversionResult) {
            const link = document.createElement('a');
            link.href = conversionResult;
            // Get the original file name without extension
            const originalFileName = selectedFile?.name ? selectedFile.name.replace(/\.[^/.]+$/, '') : 'converted';
            // Use lowercase "kunu_labs_" prefix
            link.download = `kunu_labs_${originalFileName}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const resetConverter = () => {
        setSelectedFile(null);
        setExtractedData(null);
        setConversionResult(null);
        setParsingError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-4 text-center">PDF Invoice Converter</h2>
                <p className="text-gray-600 mb-6 text-center">
                    Upload an existing invoice PDF to convert it to the new format
                </p>

                {selectedFile && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center justify-between">
                        <span className="text-blue-700">📄 {selectedFile.name}</span>
                        <button
                            onClick={resetConverter}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                            Change File
                        </button>
                    </div>
                )}

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6 hover:border-blue-400 transition-colors">
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        ref={fileInputRef}
                        className="hidden"
                        id="pdf-upload"
                    />
                    <label htmlFor="pdf-upload" className="cursor-pointer block">
                        <div className="text-4xl mb-2">📄</div>
                        <p className="text-gray-600">Click to upload a PDF or drag and drop</p>
                        <p className="text-sm text-gray-400 mt-1">Supported format: .pdf</p>
                    </label>
                </div>

                {isProcessing && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                            <span className="text-blue-700">Processing PDF...</span>
                        </div>
                    </div>
                )}

                {parsingError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <p className="text-red-700 text-sm">Error: {parsingError}</p>
                    </div>
                )}

                {extractedData && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-green-700">✅ Data Extracted Successfully!</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><span className="text-gray-500">Document:</span> <span className="font-medium">{extractedData.documentNumber || 'N/A'}</span></div>
                            <div><span className="text-gray-500">Customer:</span> <span className="font-medium">{extractedData.customerName || 'N/A'}</span></div>
                            <div><span className="text-gray-500">Items:</span> <span className="font-medium">{extractedData.items.length}</span></div>
                            <div><span className="text-gray-500">Currency:</span> <span className="font-medium">{extractedData.currency || 'EUR'}</span></div>
                            <div><span className="text-gray-500">Net Total:</span> <span className="font-medium">{extractedData.currency === 'HUF' ? 'Ft' : '€'}{extractedData.netTotal?.toFixed(extractedData.currency === 'HUF' ? 0 : 2) || '0.00'}</span></div>
                        </div>
                        <div className="mt-3">
                            {conversionResult && (
                                <button
                                    onClick={downloadConvertedPDF}
                                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Download New PDF
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {conversionResult && !extractedData && (
                    <button
                        onClick={downloadConvertedPDF}
                        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download Converted PDF
                    </button>
                )}
            </div>
        </div>
    );
};

export default PDFConverter;