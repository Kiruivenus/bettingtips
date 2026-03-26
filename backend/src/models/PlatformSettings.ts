import mongoose, { Schema, Document } from 'mongoose';

export interface IPlatformSettings extends Document {
  telegramGroup?: string;
  telegramAgent?: string;
  whatsappAgent?: string;
  supportEmail?: string;
  updatedAt: Date;
}

const PlatformSettingsSchema: Schema = new Schema(
  {
    telegramGroup: { type: String, default: '' },
    telegramAgent: { type: String, default: '' },
    whatsappAgent: { type: String, default: '' },
    supportEmail: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model<IPlatformSettings>('PlatformSettings', PlatformSettingsSchema);
