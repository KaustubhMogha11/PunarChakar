import PriceInfo from "../models/PriceInfo.js";

// Save or update price information
export const createOrUpdatePriceInfo = async (req, res) => {
  try {
    const {
      lcoSPrice,
      nmcSPrice,
      lfpSPrice,
      secondLifePrice,
      CoMarketPrice,
      CoPayable,
      NiMarketPrice,
      NiPayable,
      batteryScrapPrice,
      blackMassPrice
    } = req.body;

    // Validate required fields
    if (
      lcoSPrice === undefined ||
      nmcSPrice === undefined ||
      lfpSPrice === undefined ||
      secondLifePrice === undefined ||
      CoMarketPrice === undefined ||
      CoPayable === undefined ||
      NiMarketPrice === undefined ||
      NiPayable === undefined ||
      batteryScrapPrice === undefined ||
      blackMassPrice === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: 'All price fields are required'
      });
    }

    // Update the most recent document or insert a new one
    const updatedPriceInfo = await PriceInfo.findOneAndUpdate(
      {}, // Match any document (you can adjust if needed to match certain conditions)
      {
        lcoSPrice,
        nmcSPrice,
        lfpSPrice,
        secondLifePrice,
        CoMarketPrice,
        CoPayable,
        NiMarketPrice,
        NiPayable,
        batteryScrapPrice,
        blackMassPrice,
        updatedAt: new Date()
      },
      {
        new: true,       // return the modified document
        upsert: true,    // insert if not found
        sort: { createdAt: -1 } // find the most recent document
      }
    );

    res.status(200).json({
      success: true,
      message: 'Price information saved or updated successfully',
      data: updatedPriceInfo
    });
  } catch (error) {
    console.error('Error saving/updating price info:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while saving or updating price information',
      error: error.message
    });
  }
};


// Get the latest saved price information
export const getPriceInfo = async (req, res) => {
  try {
    // Fetch the price info
    const priceInfo = await PriceInfo.findOne();

    if (!priceInfo) {
      return res.status(404).json({
        success: false,
        message: 'No price information found'
      });
    }

    res.status(200).json({
      success: true,
      data: priceInfo
    });
  } catch (error) {
    console.error('Error fetching price info:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching price information',
      error: error.message
    });
  }
};
