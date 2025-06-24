import mongoose from 'mongoose';

const priceInfoSchema = new mongoose.Schema({
  lcoSPrice: Number,
  nmcSPrice: Number,
  lfpSPrice: Number,
  secondLifePrice: Number,
  CoMarketPrice: Number,
  CoPayable: Number,
  NiMarketPrice: Number,
  NiPayable: Number,
  batteryScrapPrice: Number,
  blackMassPrice: Number,
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('PriceInfo', priceInfoSchema);
