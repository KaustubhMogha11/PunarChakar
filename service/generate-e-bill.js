import fs from 'fs';
import PDFDocument from 'pdfkit';
import path from 'path';
const __dirname = path.resolve();

function createTableWithBorders(doc, data, startX, startY, columnWidths, rowHeight) {
    let currentY = startY;
    doc.font('Helvetica-Bold').fontSize(10);

    let currentX = startX;
    data.headers.forEach((header, i) => {
        doc.rect(currentX, currentY, columnWidths[i], rowHeight).stroke();
        doc.text(header, currentX + 5, currentY + 5, {
            width: columnWidths[i] - 10,
            align: 'center'
        });
        currentX += columnWidths[i];
    });

    currentY += rowHeight;
    doc.font('Helvetica').fontSize(10);

    data.rows.forEach(row => {
        currentX = startX;
        row.forEach((cell, i) => {
            doc.rect(currentX, currentY, columnWidths[i], rowHeight).stroke();
            doc.text(cell.toString(), currentX + 5, currentY + 5, {
                width: columnWidths[i] - 10,
                align: i === 0 ? 'left' : 'right'
            });
            currentX += columnWidths[i];
        });
        currentY += rowHeight;
    });

    return currentY;
}

export async function generateEBill(data, outputPath) {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    doc.pipe(fs.createWriteStream(outputPath));
    const confirmationNumber = generateConfirmationNumber();
    const currency = 'Rs.';

    const imagePath = path.join(__dirname, 'public', 'punarchakr_logo_white.png');
    doc.image(imagePath, 40, 30, { width: 150 });
    doc.fontSize(16).font('Helvetica-Bold').text('Material Information', 220, 70);
    doc.fontSize(10).font('Helvetica')
       .text(`#: ${confirmationNumber}`, 450, 50)
       .text(`Date: ${new Date().toLocaleDateString()}`, 450, 75);

    doc.moveTo(50, 100).lineTo(550, 100).stroke();

    doc.fontSize(12).font('Helvetica-Bold').text('Customer Information:', 50, 105);
    doc.fontSize(10)
       .text(`Company: ${data.company || 'N/A'}`, 50, 125)
       .text(`Mobile: ${data.mobile}`, 50, 140)
       .text(`Email: ${data.email}`, 50, 155);

    let currentY = 180;

    doc.fontSize(12).text('Material Details:', 50, currentY);
    currentY += 20;
    let materialTypeText = '';

    if (data.material === 'battery_scrap') {
        materialTypeText = `Battery Scrap: ${data.battery_type}`;
        doc.fontSize(10).text(materialTypeText, 50, currentY);
        currentY += 20;

        currentY = createTableWithBorders(doc, {
            headers: ['Battery Scrap Type'],
            rows: [[data.battery_type.toUpperCase()]]
        }, 50, currentY, [450], 20);

    } else if (data.material === 'second_life') {
        materialTypeText = `2nd Life Battery`;
        doc.fontSize(10).text(materialTypeText, 50, currentY);
        currentY += 20;

        currentY = createTableWithBorders(doc, {
            headers: ['Attribute', 'Value'],
            rows: [
                ['Battery Type', data.second_life_type],
                ['Voltage (V)', data.voltage.toString()],
                ['Capacity (Ah)', data.capacity.toString()]
            ]
        }, 50, currentY, [250, 250], 20);

    } else if (data.material === 'blackmass') {
        materialTypeText = `Blackmass Type: ${data.blackmass_type}`;
        doc.fontSize(10).text(materialTypeText, 50, currentY);
        currentY += 20;

        currentY = createTableWithBorders(doc, {
            headers: ['Item', `Price (${currency}/kg)`, 'Percentage (%)'],
            rows: [
                ['Lithium (Li)', '21.30', data.li_percent.toString()],
                ['Cobalt (Co)', '59.00', data.co_percent.toString()],
                ['Nickel (Ni)', '15.30', data.ni_percent.toString()],
                ['Copper (Cu)', '8.50', data.cu_percent.toString()],
                ['Moisture', '0.00', data.moisture.toString()]
            ]
        }, 50, currentY, [200, 150, 100], 20);
    }

    currentY += 30;
    doc.fontSize(12).text('Pricing Summary:', 50, currentY);
    currentY += 20;

    currentY = createTableWithBorders(doc, {
        headers: ['Item Name', 'Quantity', `Price (${currency})`],
        rows: [[
            (data.material === 'battery_scrap' ? `Battery Scrap: ${data.battery_type}` :
            data.material === 'second_life' ? `Battery Scrap Type: ${data.second_life_type}` :
            data.material === 'blackmass' ? `Blackmass: ${data.blackmass_type}` : 'Unknown').toUpperCase(),
            data.quantity.toString(),
            `${currency}${data.totalPrice}`
        ]]
    }, 50, currentY, [200, 100, 150], 20);

    currentY += 30;
    if (data.enquiry) {
        doc.fontSize(12).text('Customer Enquiry:', 50, currentY);
        doc.fontSize(10).text(data.enquiry, 50, currentY + 15, { width: 500 });
        currentY += 40;
    }

    doc.moveTo(50, currentY + 20).lineTo(550, currentY + 20).stroke();
    doc.fontSize(10).fillColor('#666666')
       .text('PunarChakar Battery Recycling Solutions', 50, currentY + 30, { align: 'right', width: 500 })
       .text('New Delhi, 122001, India', 50, currentY + 45, { align: 'right', width: 500 })
       .text('Email: info@punarchakar.com', 50, currentY + 60, { align: 'right', width: 500 })
    //    .text('GSTIN: 22ABCDE1234F1Z2 | CIN: U74999HR2022PTC098765', 50, currentY + 75, { align: 'right', width: 500 });

    doc.end();

    return {
        fileName: path.basename(outputPath),
        filePath: outputPath,
        confirmationNumber: confirmationNumber
    };
}

const generateConfirmationNumber = () => {
  const now = new Date();

  const pad = (num) => num.toString().padStart(2, '0');

  const yy = now.getFullYear().toString().slice(-2);
  const mm = pad(now.getMonth() + 1);     // Months are 0-based
  const dd = pad(now.getDate());
  const hh = pad(now.getHours());
  const min = pad(now.getMinutes());
  const ss = pad(now.getSeconds());

  return `${yy}${mm}${dd}-${hh}${min}${ss}`;
};

// Sample Data for Battery Scrap
const sampleBatteryScrap = {
    company: 'GreenTech Pvt Ltd',
    mobile: '9876543210',
    email: 'user@example.com',
    material: 'battery_scrap',
    battery_type: 'lco-s',
    quantity: 15,
    totalPrice: 1800.00,
    enquiry: 'Please arrange pickup for the battery scrap.'
};

// Sample Data for Second Life Battery
const sampleSecondLife = {
    company: 'EV Solutions Inc.',
    mobile: '8765432109',
    email: 'contact@evsolutions.com',
    material: 'second_life',
    second_life_type: 'nmc-i',
    voltage: 48,
    capacity: 100,
    quantity: 8,
    totalPrice: 640.00,
    enquiry: 'Interested in bulk purchase discounts.'
};

// Sample Data for Blackmass
const sampleBlackmass = {
    company: 'Metal Reclaim Ltd',
    mobile: '7654321098',
    email: 'purchasing@metalreclaim.com',
    material: 'blackmass',
    blackmass_type: 'nmc-b',
    li_percent: 4.2,
    co_percent: 18.5,
    ni_percent: 12.3,
    cu_percent: 2.1,
    moisture: 3.4,
    quantity: 10,
    totalPrice: 187430.50,
    enquiry: 'Need monthly supply contract.'
};

// Generate sample invoices
// generateEBill(sampleBatteryScrap, 'battery_scrap_invoice.pdf');
// generateEBill(sampleSecondLife, 'second_life_invoice.pdf');
// generateEBill(sampleBlackmass, 'blackmass_invoice.pdf');