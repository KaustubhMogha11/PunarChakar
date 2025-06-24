import { validateMaterial } from "../validations/battery-type-validator.js";
import PriceInfo from '../models/PriceInfo.js';
import { StatusCodes as HTTP_STATUS } from 'http-status-codes';
import { generateEBill } from "../service/generate-e-bill.js";
import { sendInvoiceEmail, sendSelfConfirmationMail } from "../service/node-mailer.js";

export async function confirmDetails(req, res){
    try {
        // Validate the form inputs and all the material fields using Joi
        const { error, value } = validateMaterial(req.body);
        
        // If validation fails return the error with bad request
        if (error) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: error.details[0].message });
        }
    
        const calculatePrice = await calculatePricing(value);
        let data = { ...value, totalPrice: Number(calculatePrice.toFixed(2))}
    
        // Generate the e-bill PDF
        let confirmationDetails = await generateEBill(data, "MaterialInfo_confirmation_punarchakar.pdf")
        // Send confirmation details to the self
        await sendSelfConfirmationMail(data, confirmationDetails);
        // send the invoice email
        await sendInvoiceEmail(data, confirmationDetails)
    
        return res.status(HTTP_STATUS.OK).json({
            message: 'Material submitted successfully.',
            data: { ...value, totalPrice: calculatePrice.toFixed(2)}
        });
    } catch (error) {
        console.log(error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            message : "Something went wrong"
        })
        
    }
}

const calculatePricing = async (data) => {
  try {
    const { material, quantity, battery_type, second_life_type, blackmass_type, co_percent, ni_percent } = data;

    const qty = parseFloat(quantity) || 0;

    // Fetch latest price info
    const priceInfo = await PriceInfo.findOne().sort({ createdAt: -1 });
    if (!priceInfo) {
        throw new Error('Price information not found. Please ensure prices are set up correctly.');
    }

    // Destructure required prices
    const {
      lcoSPrice,
      nmcSPrice,
      lfpSPrice,
      secondLifePrice,
      CoMarketPrice,
      CoPayable,
      NiMarketPrice,
      NiPayable
    } = priceInfo;

    let pricing = 0;

    if (material === 'battery_scrap') {
      if (battery_type === 'LCO-S') pricing = lcoSPrice * qty;
      else if (battery_type === 'NMC-S') pricing = nmcSPrice * qty;
      else if (battery_type === 'LFP-S') pricing = lfpSPrice * qty;
    } else if (material === 'second_life') {
      pricing = secondLifePrice * qty;
    } else if (material === 'blackmass') {
      const coPct = parseFloat(co_percent) / 100 || 0;
      const niPct = parseFloat(ni_percent) / 100 || 0;

      if (blackmass_type === 'LCO-B' || blackmass_type === 'NMC-B') {
        pricing = (coPct * CoMarketPrice * CoPayable + niPct * NiMarketPrice * NiPayable) * qty;
      }
    }

    return pricing;

  } catch (error) {
    console.error('Error calculating pricing:', error);
    throw new Error('Failed to calculate pricing. Please try again later.');
  }
};
