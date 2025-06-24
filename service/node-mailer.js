import nodemailer from 'nodemailer';
import path from 'path';
import PriceInfo from '../models/PriceInfo.js';

const __dirname = path.resolve();

// Email configuration

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "punarchakar@gmail.com",
    pass: "ogvk sswg vgen mjcn",
  },
  tls: {
    rejectUnauthorized: false
}

});

export async function sendInvoiceEmail(customerData, confirmationDetails) {
    try {
        let material = '';
        let batteryType = '';
        if(customerData.material === 'battery_scrap') {
            material = 'Battery Scrap';
            batteryType = customerData.battery_type;
        }else if(customerData.material === 'second_life') {
            material = '2nd Life Battery';
            batteryType = customerData.second_life_type;
        }else if(customerData.material === 'blackmass') {
            material = 'Blackmass';
            batteryType = customerData.blackmass_type;
        }

        const mailOptions = {
            from: '"PunarChakar" <punarchakar@gmail.com>',
            to: customerData.email,
            subject: `Your Order #${confirmationDetails?.confirmationNumber} - Order Confirmation`,
            text: `Dear Valued Customer,\n\nThank you for your order! Your order has been successfully placed.\n\nPlease find attached order details for reference.\n\nOrder Details:\nMaterial Type: ${customerData.material}\nQuantity: ${customerData.quantity}\nTotal Amount: Rs.${customerData?.totalPrice?.toFixed(2)}\n\nIf you have any questions, please contact our support team.\n\nBest regards,\nPunarChakar Team`,
            html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                        <h2 style="color: #2e7d32;">Order Successfully Placed!</h2>
                        <p>Dear Valued Customer,</p>
                        <p>Thank you for your order! Your order has been successfully placed.</p>
                        <p>Please find attached your invoice for reference.</p>
                        
                        <h3 style="margin-top: 20px;">Order Summary</h3>
                        <ul>
                            <li><strong>Material Type:</strong> ${material}</li>
                            <li><strong>Battery Type:</strong> ${batteryType}</li>
                            <li><strong>Quantity:</strong> ${customerData?.quantity}</li>
                            <li><strong>Total Amount:</strong> Rs.${customerData?.totalPrice?.toFixed(2)}</li>
                            <li><strong>Order Number:</strong> ${confirmationDetails?.confirmationNumber}</li>
                        </ul>
                        
                        <p>If you have any questions, please contact our support team.</p>
                        
                        <p style="margin-top: 30px;">Thanks & Regards,<br>
                        <strong>PunarChakar Team</strong></p>
                        
                        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
                            <img src="cid:punarchakarlogo" alt="PunarChakar Logo" style="width: 120px; height: auto; margin-top: 10px;">
                            <p>PunarChakar Battery Recycling Solutions</p>
                            <p>New Delhi, 122001, India</p>
                            <p>Email: info@punarchakar.com</p>
                        </div>
                    </div>
                `,
            attachments: [
                {
                    filename: confirmationDetails.fileName,
                    path: confirmationDetails.filePath,
                    contentType: 'application/pdf'
                },
                {
                    filename: 'punarchakr_logo_white.png',
                    path: './public/punarchakr_logo_white.png',
                    cid: 'punarchakarlogo' // Must match `cid:` in HTML
                }
            ]
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${customerData.email} with Order info: ${confirmationDetails.fileName}`);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

export async function sendSelfConfirmationMail(customerData, confirmationDetails) {
    try {
        let material = '';
        let batteryType = '';
        if(customerData.material === 'battery_scrap') {
            material = 'Battery Scrap';
            batteryType = customerData.battery_type;
        }else if(customerData.material === 'second_life') {
            material = '2nd Life Battery';
            batteryType = customerData.second_life_type;
        }else if(customerData.material === 'blackmass') {
            material = 'Blackmass';
            batteryType = customerData.blackmass_type;
        }
        // Fetch latest price info
        const priceInfo = await PriceInfo.findOne().sort({ createdAt: -1 });
        if (!priceInfo) {
            throw new Error('Price information not found. Please ensure prices are set up correctly.');
        }

        const textBody = `Order Confirmation - Order #${confirmationDetails?.confirmationNumber}

                        Customer Details:
                        ------------------
                        Company: ${customerData.company || 'N/A'}
                        Mobile: ${customerData.mobile}
                        Email: ${customerData.email}
                        Material: ${material}
                        Battery Type: ${batteryType}
                        Quantity: ${customerData.quantity}
                        Enquiry: ${customerData.enquiry || 'N/A'}

                        Price Information:
                        ------------------
                        Battery Scrap Price: ₹${priceInfo.batteryScrapPrice}/kg
                        Blackmass Price: ₹${priceInfo.blackMassPrice}/kg
                        Second Life Battery Price: ₹${priceInfo.secondLifePrice}/kg

                        LCO-S Price: ₹${priceInfo.lcoSPrice}
                        NMC-S Price: ₹${priceInfo.nmcSPrice}
                        LFP-S Price: ₹${priceInfo.lfpSPrice}

                        Co Market Price: ₹${priceInfo.CoMarketPrice} | Payable: ₹${priceInfo.CoPayable}
                        Ni Market Price: ₹${priceInfo.NiMarketPrice} | Payable: ₹${priceInfo.NiPayable}

                        Please find the attached PDF for your reference.

                        - Team PunarChakar
                        `;
        
        // HTML body for the email
        const htmlBody = `
            <h2>Order Confirmation - Order #${confirmationDetails?.confirmationNumber}</h2>

            <h3>Customer Details</h3>
            <table border="1" cellpadding="6" cellspacing="0">
            <tr><th>Company</th><td>${customerData.company || 'N/A'}</td></tr>
            <tr><th>Mobile</th><td>${customerData.mobile}</td></tr>
            <tr><th>Email</th><td>${customerData.email}</td></tr>
            <tr><th>Material</th><td>${material}</td></tr>
            <tr><th>Battery Type</th><td>${batteryType}</td></tr>
            <tr><th>Quantity</th><td>${customerData.quantity}</td></tr>
            <tr><th>Enquiry</th><td>${customerData.enquiry || 'N/A'}</td></tr>
            </table>

            <h3>Price Information</h3>
            <table border="1" cellpadding="6" cellspacing="0">
            <tr><th>Battery Scrap Price</th><td>₹${priceInfo.batteryScrapPrice}/kg</td></tr>
            <tr><th>Blackmass Price</th><td>₹${priceInfo.blackMassPrice}/kg</td></tr>
            <tr><th>Second Life Battery Price</th><td>₹${priceInfo.secondLifePrice}/kg</td></tr>
            <tr><th>LCO-S Price</th><td>₹${priceInfo.lcoSPrice}</td></tr>
            <tr><th>NMC-S Price</th><td>₹${priceInfo.nmcSPrice}</td></tr>
            <tr><th>LFP-S Price</th><td>₹${priceInfo.lfpSPrice}</td></tr>
            <tr><th>Co Market Price</th><td>₹${priceInfo.CoMarketPrice}</td></tr>
            <tr><th>Co Payable</th><td>₹${priceInfo.CoPayable}</td></tr>
            <tr><th>Ni Market Price</th><td>₹${priceInfo.NiMarketPrice}</td></tr>
            <tr><th>Ni Payable</th><td>₹${priceInfo.NiPayable}</td></tr>
            </table>

            <p>Please find the attached PDF for your reference.</p>
            <p>- Team PunarChakar</p>
            `;


        const mailOptions = {
            from: '"PunarChakar" <punarchakar@gmail.com>',
            to: 'punarchakar@gmail.com',
            subject: `Order #${confirmationDetails?.confirmationNumber} - Order Confirmation`,
            text: textBody,
             html:htmlBody,
            attachments: [
                {
                    filename: confirmationDetails.fileName,
                    path: confirmationDetails.filePath,
                    contentType: 'application/pdf'
                }
            ]
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to self ${customerData.email} with Order info: ${confirmationDetails.fileName}`);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

let customerData = {
    company: "PunarChakar Pvt Ltd",
    mobile: "9876543210",
    email: "ashunegi880@gmail.com",
    material: "battery_scrap",
    battery_type: "lco-s",
    quantity: 15,
    totalPrice: 1800.00,
    enquiry: "Please arrange pickup for the battery scrap."
}

let confirmationDetails = {
    fileName: "MaterialInfo.pdf",
    filePath: "MaterialInfo.pdf",
    confirmationNumber: "240920-123456"
}

// sendSelfConfirmationMail(customerData, confirmationDetails)
