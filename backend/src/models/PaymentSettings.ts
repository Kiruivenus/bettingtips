import mongoose, { Schema, Document } from 'mongoose';

export interface IPaymentSettings extends Document {
  method: string;
  isEnabled: boolean;
  settings: Map<string, string>;
  updatedAt: Date;
}

const PaymentSettingsSchema: Schema = new Schema(
  {
    method: { type: String, required: true, unique: true },
    isEnabled: { type: Boolean, default: false },
    settings: { type: Map, of: String, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model<IPaymentSettings>('PaymentSettings', PaymentSettingsSchema);
