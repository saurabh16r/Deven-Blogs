import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  discountPercentage: number;
  expiryDate: Date;
  maxRedemptions: number;
  redemptionsCount: number;
  isActive: boolean;
  createdAt: Date;
}

const CouponSchema: Schema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountPercentage: { type: Number, required: true, min: 0, max: 100 },
    expiryDate: { type: Date, required: true },
    maxRedemptions: { type: Number, default: 100 },
    redemptionsCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema);
