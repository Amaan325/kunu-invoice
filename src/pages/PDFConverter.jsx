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
        this.extractCurrency();
        this.extractCustomerInfo();
        this.extractItemsWithPatterns();
        this.extractTotals();
        this.cleanCustomerData();
        console.log('Debug info:', this.debug);
        console.log('Final extracted data:', this.data);
        return this.data;
    }

    extractCurrency() {
        console.log('Extracting currency...');

        const explicitMatch = this.text.match(/Currency\s*[:.]\s*([A-Z]{3})/i);
        if (explicitMatch) {
            const currency = explicitMatch[1].toUpperCase();
            if (['EUR', 'USD', 'GBP', 'HUF'].includes(currency)) {
                this.data.currency = currency;
                console.log('Extracted currency (explicit):', currency);
                return;
            }
        }

        const cleanedText = this.text
            .replace(/Exchange\s*rate:[^\n]*/gi, '')
            .replace(/Gross\s*amount:[^\n]*/gi, '')
            .replace(/1\s*[A-Z]{3}\s*=\s*HUF[^\n]*/gi, '')
            .replace(/HUF\s*[\d,\.]+/gi, '');

        const totalDueMatch = cleanedText.match(/TOTAL\s*DUE\s*[:.]?\s*([€$£])|TOTAL\s*DUE\s*[:.]?\s*(EUR|USD|GBP|HUF)/i);
        if (totalDueMatch) {
            const match = totalDueMatch[1] || totalDueMatch[2];
            if (match) {
                const cur = match.toUpperCase();
                if (cur === '€' || cur === 'EUR') {
                    this.data.currency = 'EUR';
                    console.log('Extracted currency from TOTAL DUE: EUR');
                    return;
                } else if (cur === '$' || cur === 'USD') {
                    this.data.currency = 'USD';
                    console.log('Extracted currency from TOTAL DUE: USD');
                    return;
                } else if (cur === '£' || cur === 'GBP') {
                    this.data.currency = 'GBP';
                    console.log('Extracted currency from TOTAL DUE: GBP');
                    return;
                } else if (cur === 'HUF') {
                    this.data.currency = 'HUF';
                    console.log('Extracted currency from TOTAL DUE: HUF');
                    return;
                }
            }
        }

        if (cleanedText.includes('€')) {
            this.data.currency = 'EUR';
            console.log('Extracted currency (symbol): EUR');
            return;
        }
        if (cleanedText.includes('$')) {
            this.data.currency = 'USD';
            console.log('Extracted currency (symbol): USD');
            return;
        }
        if (cleanedText.includes('£')) {
            this.data.currency = 'GBP';
            console.log('Extracted currency (symbol): GBP');
            return;
        }

        if (cleanedText.match(/GBP/i) && !cleanedText.match(/EUR/i) && !cleanedText.match(/USD/i)) {
            this.data.currency = 'GBP';
            console.log('Extracted currency (code): GBP');
            return;
        }
        if (cleanedText.match(/USD/i) && !cleanedText.match(/EUR/i) && !cleanedText.match(/GBP/i)) {
            this.data.currency = 'USD';
            console.log('Extracted currency (code): USD');
            return;
        }
        if (cleanedText.match(/EUR/i) && !cleanedText.match(/GBP/i) && !cleanedText.match(/USD/i)) {
            this.data.currency = 'EUR';
            console.log('Extracted currency (code): EUR');
            return;
        }

        if (cleanedText.match(/HUF|forint/i) &&
            !cleanedText.match(/EUR|USD|GBP|€|\$|£/i)) {
            this.data.currency = 'HUF';
            console.log('Extracted currency (code): HUF');
            return;
        }

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

    // FIXED: Updated to handle decimal quantities like 28.5
    extractItemsWithPatterns() {
        console.log('Extracting items with patterns...');
        const items = [];
        const text = this.text;

        // Create a flexible currency pattern that matches both symbols and codes
        const currencyPattern = '(?:€|EUR|\\$|USD|£|GBP|Ft|HUF)';
        console.log('Using currency pattern:', currencyPattern);

        // FIXED: Changed \\d+ to [\\d.]+ for quantity to handle decimals like 28.5
        // Also changed to use a simpler, more robust regex
        const itemRegex = new RegExp(
            `(\\d+)\\s+(.+?)\\s+([\\d.]+)\\s+db\\s+${currencyPattern}\\s*([\\d,]+(?:\\.\\d{2})?)\\s+${currencyPattern}\\s*([\\d,]+(?:\\.\\d{2})?)(?:\\s+ÁTHK\\s+${currencyPattern}\\s*([\\d,]+(?:\\.\\d{2})?))?`,
            'i'
        );

        // Try to find and use the table section
        const headerPatterns = [
            /DIGITAL\s+ITEM\s+DESCRIPTION.*?QUANTITY.*?NET\s+UNIT\s+PRICE/i,
            /DESCRIPTION.*?QUANTITY.*?NET\s+UNIT\s+PRICE/i,
            /ITEM\s+DESCRIPTION.*?QUANTITY.*?PRICE/i
        ];

        let searchText = text;
        for (const headerPattern of headerPatterns) {
            const headerMatch = text.match(headerPattern);
            if (headerMatch) {
                const headerEnd = text.indexOf(headerMatch[0]) + headerMatch[0].length;
                searchText = text.substring(headerEnd);
                console.log('Found header, extracting items from after header');
                break;
            }
        }

        let foundItems = 0;
        let lastItemNumber = 0;
        const regex = new RegExp(itemRegex.source, 'gi');
        let match;

        while ((match = regex.exec(searchText)) !== null) {
            try {
                const sno = parseInt(match[1]);
                const name = match[2].trim();
                // FIXED: Parse as float to handle decimals
                const quantity = parseFloat(match[3]);

                // Find the price and total
                let priceMatch = match[4];
                let totalMatch = match[5];

                const price = parseFloat(priceMatch.replace(/,/g, ''));
                const total = totalMatch ? parseFloat(totalMatch.replace(/,/g, '')) : quantity * price;

                // Skip if it looks like a header or label
                const skipTerms = ['DESCRIPTION', 'QUANTITY', 'NET', 'UNIT', 'PRICE', 'LINE', 'TOTAL', 'ÁTHK', 'VAT', 'GROSS', 'SUBTOTAL', 'GRAND', 'DIGITAL', 'ITEM'];
                const isSkipTerm = skipTerms.some(term =>
                    name.toUpperCase().includes(term) || name.match(new RegExp(`^${term}$`, 'i'))
                );

                // Only add if valid and not a duplicate
                if (!isSkipTerm && name.length > 2 && quantity > 0 && price > 0 && sno > lastItemNumber) {
                    items.push({
                        sno: sno,
                        name: name.replace(/&amp;/g, '&'),
                        quantity: quantity,
                        price: price,
                        total: total || quantity * price
                    });
                    foundItems++;
                    lastItemNumber = sno;
                    console.log('✅ Added item:', items[items.length - 1]);
                }
            } catch (e) {
                console.log('Error parsing match:', e);
            }
        }

        // If still no items, try line-by-line parsing
        if (items.length === 0) {
            console.log('Trying line-by-line extraction...');
            const lines = searchText.split('\n');

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;

                // Simpler pattern for line-by-line
                const simpleRegex = new RegExp(
                    `(\\d+)\\s+(.+?)\\s+([\\d.]+)\\s+db\\s+${currencyPattern}\\s*([\\d,]+(?:\\.\\d{2})?)`,
                    'i'
                );
                const match = trimmed.match(simpleRegex);
                if (match) {
                    try {
                        const sno = parseInt(match[1]);
                        const name = match[2].trim();
                        // FIXED: Parse as float to handle decimals
                        const quantity = parseFloat(match[3]);
                        const price = parseFloat(match[4].replace(/,/g, ''));

                        const skipTerms = ['DESCRIPTION', 'QUANTITY', 'NET', 'UNIT', 'PRICE', 'LINE', 'TOTAL', 'ÁTHK', 'VAT', 'GROSS', 'SUBTOTAL', 'GRAND', 'DIGITAL', 'ITEM'];
                        const isSkipTerm = skipTerms.some(term =>
                            name.toUpperCase().includes(term) || name.match(new RegExp(`^${term}$`, 'i'))
                        );

                        if (!isSkipTerm && name.length > 2 && quantity > 0 && price > 0) {
                            items.push({
                                sno: sno,
                                name: name.replace(/&amp;/g, '&'),
                                quantity: quantity,
                                price: price,
                                total: quantity * price
                            });
                            console.log('✅ Added item (line-by-line):', items[items.length - 1]);
                        }
                    } catch (e) {
                        console.log('Error parsing line:', e);
                    }
                }
            }
        }

        console.log(`Total found ${items.length} items:`, items);
        this.data.items = items;
        return items;
    }

    getCurrencySymbol() {
        const currency = this.data.currency || 'EUR';
        const patterns = {
            'EUR': '(?:€|EUR)',
            'USD': '(?:\\$|USD)',
            'GBP': '(?:£|GBP)',
            'HUF': '(?:Ft|HUF)'
        };
        return patterns[currency] || '(?:€|EUR)';
    }

    extractCustomerInfo() {
        console.log('Extracting customer info...');

        if (this.pageData && this.pageData.length > 0) {
            const page = this.pageData[0];
            const pageItems = page.items;
            const pageWidth = page.width;

            const customerItems = pageItems.filter(item => {
                return item.x > pageWidth * 0.45 && item.y > 50 && item.y < 250;
            });

            console.log('Customer items found:', customerItems.map(i => ({ text: i.text, x: i.x, y: i.y })));

            if (customerItems.length > 0) {
                const lines = this.groupByY(customerItems);
                console.log('Customer lines from coordinates:', lines);

                let companyName = '';
                let addressLines = [];
                let vatNumber = '';

                for (const line of lines) {
                    const trimmed = line.trim();

                    const vatMatch = trimmed.match(/VAT\s*ID:?\s*([A-Za-z0-9\-\.]+)/i);
                    if (vatMatch) {
                        vatNumber = vatMatch[1].trim();
                        const cleanedLine = trimmed.replace(/VAT\s*ID:?\s*[A-Za-z0-9\-\.]+/i, '').trim();
                        if (cleanedLine) {
                            addressLines.push(cleanedLine);
                        }
                        continue;
                    }

                    if (!trimmed || trimmed === 'BUYER') continue;

                    if (trimmed.match(/SELLER|ISSUE|FULFILLMENT|DUE|PAYMENT|TOTAL|DESCRIPTION|QUANTITY|NET UNIT|GROSS LINE|ÁTHK|COMMENT|Invoice|Page/i)) {
                        continue;
                    }

                    if (!companyName && trimmed.match(/[A-Za-z]+\s+[A-Za-z]+/) && trimmed.length > 3) {
                        if (trimmed.match(/Ltd|Limited|GmbH|AG|Kft|LLC|Inc|Corp|S\.A\.|SRL/i) || !trimmed.match(/^\d+/)) {
                            companyName = trimmed;
                            continue;
                        }
                    }

                    if (companyName) {
                        addressLines.push(trimmed);
                    } else {
                        if (!trimmed.match(/^\d+/) && trimmed.length > 3) {
                            companyName = trimmed;
                        } else {
                            addressLines.push(trimmed);
                        }
                    }
                }

                if (companyName) {
                    this.data.customerName = companyName;
                }
                if (addressLines.length > 0) {
                    this.data.customerAddress = addressLines.join('\n');
                }
                if (vatNumber) {
                    this.data.customerVat = vatNumber;
                }

                console.log('Extracted customer info:', {
                    name: this.data.customerName,
                    address: this.data.customerAddress,
                    vat: this.data.customerVat
                });

                return;
            }
        }

        console.log('Falling back to text-based customer extraction...');
        let customerSection = this.findCustomerSection();
        if (customerSection) {
            this.parseCustomerSection(customerSection);
        }
        if (!this.data.customerName) {
            this.identifyCustomerFromText();
        }
        this.cleanCustomerData();
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
                console.log('Found customer section (fallback):', section);
                return section;
            }
        }
        return null;
    }

    parseCustomerSection(section) {
        console.log('Parsing customer section (fallback)...');
        let vatMatch = section.match(/VAT\s*ID:?\s*([A-Za-z0-9\-\.]+)/i);
        if (vatMatch) {
            this.data.customerVat = vatMatch[1].trim();
            section = section.replace(/VAT\s*ID:?\s*[A-Za-z0-9\-\.]+/i, '').trim();
        }

        const lines = section.split('\n').filter(line => line.trim());
        let nameFound = false;
        let addressLines = [];

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            if (trimmed.match(/SELLER|ISSUE|FULFILLMENT|DUE|PAYMENT|TOTAL|DESCRIPTION|QUANTITY|NET UNIT|GROSS LINE|ÁTHK|COMMENT|Invoice|Page/i)) {
                continue;
            }

            if (!nameFound) {
                if (trimmed.match(/Ltd|Limited|GmbH|AG|Kft|LLC|Inc|Corp|S\.A\.|SRL/i) ||
                    (trimmed.match(/[A-Za-z]+\s+[A-Za-z]+/) && !trimmed.match(/^\d+/))) {
                    this.data.customerName = trimmed;
                    nameFound = true;
                    continue;
                }
            }

            if (nameFound) {
                addressLines.push(trimmed);
            }
        }

        if (addressLines.length > 0) {
            this.data.customerAddress = addressLines.join('\n');
        }

        if (!nameFound && lines.length > 0) {
            const firstLine = lines[0].trim();
            if (firstLine && !firstLine.match(/VAT|ID|:/i)) {
                this.data.customerName = firstLine;
                if (lines.length > 1) {
                    this.data.customerAddress = lines.slice(1).join('\n');
                }
            }
        }

        console.log('Parsed customer (fallback):', {
            name: this.data.customerName,
            address: this.data.customerAddress,
            vat: this.data.customerVat
        });
    }

    identifyCustomerFromText() {
        console.log('Identifying customer from text (fallback)...');
        const lines = this.lines;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.match(/(?:GmbH|AG|Ltd|LLC|Inc|Corp|S\.A\.|SRL|Kft\.|Limited)/i) &&
                !line.match(/All Things Studio|Király|32950997|HU32950997/)) {
                this.data.customerName = line;
                console.log('Identified customer name (fallback):', this.data.customerName);
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
                    console.log('Identified customer address (fallback):', this.data.customerAddress);
                }
                break;
            }
        }
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

    extractTotals() {
        const currencyPattern = this.getCurrencySymbol();

        const netPatterns = [
            new RegExp(`NET\\s*TOTAL\\s*[:.]?\\s*${currencyPattern}\\s*([\\d,\\.]+)`, 'i'),
            /Subtotal\s*[:.]?\s*(?:€|\$|£|Ft|GBP|USD|EUR|HUF)\s*([\d,\.]+)/i,
            /Sub\s*Total\s*[:.]?\s*(?:€|\$|£|Ft|GBP|USD|EUR|HUF)\s*([\d,\.]+)/i
        ];
        const netMatch = this.findPattern(netPatterns);
        if (netMatch) {
            this.data.netTotal = parseFloat(netMatch[1].replace(/,/g, ''));
        } else if (this.data.items.length > 0) {
            this.data.netTotal = this.data.items.reduce((sum, item) => sum + (item.total || item.quantity * item.price), 0);
        }

        const vatPatterns = [
            new RegExp(`ÁTHK\\s*VAT\\s*[:.]?\\s*${currencyPattern}\\s*([\\d,\\.]+)`, 'i'),
            /VAT\s*[:.]?\s*(?:€|\$|£|Ft|GBP|USD|EUR|HUF)\s*([\d,\.]+)/i,
            /Tax\s*[:.]?\s*(?:€|\$|£|Ft|GBP|USD|EUR|HUF)\s*([\d,\.]+)/i
        ];
        const vatMatch = this.findPattern(vatPatterns);
        if (vatMatch) {
            this.data.vat = parseFloat(vatMatch[1].replace(/,/g, ''));
        }

        const grossPatterns = [
            new RegExp(`TOTAL\\s*DUE\\s*[:.]?\\s*${currencyPattern}\\s*([\\d,\\.]+)`, 'i'),
            /GRAND\s*TOTAL\s*[:.]?\s*(?:€|\$|£|Ft|GBP|USD|EUR|HUF)\s*([\d,\.]+)/i,
            /Total\s*\(incl\.\s*VAT\)\s*[:.]?\s*(?:€|\$|£|Ft|GBP|USD|EUR|HUF)\s*([\d,\.]+)/i
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

    // Legacy methods kept for compatibility
    extractItemsWithCoordinates() {
        console.log('Extracting items with coordinates...');
        this.extractItemsWithPatterns();
    }

    extractItemsFromCoordinates() {
        console.log('Extracting items from coordinates...');
        return [];
    }

    findTableStartY(pageItems, keywords) {
        return null;
    }

    groupItemsByRow(pageItems, startY = 0, tolerance = 3) {
        return [];
    }

    parseRowToItem(rowItems, itemNumber) {
        return null;
    }

    extractItems() {
        console.log('Starting item extraction...');
        this.extractItemsWithPatterns();
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

    // Helper function to get currency symbol for preview
    const getCurrencySymbol = (currencyCode) => {
        const symbols = {
            'EUR': '€',
            'USD': '$',
            'GBP': '£',
            'HUF': 'Ft'
        };
        return symbols[currencyCode] || '€';
    };

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

                // Group items by Y position (rows)
                const rows = new Map();
                const tolerance = 3;

                textContent.items.forEach(item => {
                    const y = Math.round(viewport.height - item.transform[5]);
                    let foundRow = null;

                    for (const [rowY, _] of rows) {
                        if (Math.abs(rowY - y) <= tolerance) {
                            foundRow = rowY;
                            break;
                        }
                    }

                    if (foundRow !== null) {
                        rows.get(foundRow).push({
                            text: item.str,
                            x: item.transform[4],
                            y: foundRow,
                            width: item.width,
                            height: item.height,
                            font: item.fontName,
                            fontSize: item.fontSize
                        });
                    } else {
                        rows.set(y, [{
                            text: item.str,
                            x: item.transform[4],
                            y: y,
                            width: item.width,
                            height: item.height,
                            font: item.fontName,
                            fontSize: item.fontSize
                        }]);
                    }
                });

                const sortedRows = Array.from(rows.entries()).sort((a, b) => a[0] - b[0]);

                let pageText = '';
                const allItems = [];

                sortedRows.forEach(([y, rowItems]) => {
                    rowItems.sort((a, b) => a.x - b.x);

                    let rowText = '';
                    let lastX = 0;

                    rowItems.forEach(item => {
                        const gap = item.x - lastX;
                        if (lastX > 0 && gap > 15) {
                            rowText += '    ';
                        } else if (lastX > 0) {
                            rowText += ' ';
                        }
                        rowText += item.text;
                        lastX = item.x + item.width;

                        allItems.push(item);
                    });

                    if (rowText.trim()) {
                        pageText += rowText + '\n';
                    }
                });

                fullText += pageText + '\n';
                pageData.push({
                    pageNumber: i,
                    width: viewport.width,
                    height: viewport.height,
                    items: allItems
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

    const downloadConvertedPDF = () => {
        if (conversionResult) {
            const link = document.createElement('a');
            link.href = conversionResult;
            const originalFileName = selectedFile?.name ? selectedFile.name.replace(/\.[^/.]+$/, '') : 'converted';
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
                            <div>
                                <span className="text-gray-500">Net Total:</span>
                                <span className="font-medium">
                                    {getCurrencySymbol(extractedData.currency || 'EUR')}
                                    {extractedData.netTotal?.toFixed(extractedData.currency === 'HUF' ? 0 : 2) || '0.00'}
                                </span>
                            </div>
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