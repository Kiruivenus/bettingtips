import mongoose, { Schema, Document } from 'mongoose';

export interface ITip extends Document {
  match: string;
  league: string;
  odds: number;
  prediction: string;
  confidence: number;
  matchDate: Date;
  status: 'pending' | 'won' | 'lost';
  isPremium: boolean;
  planId?: mongoose.Types.ObjectId;
  result?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TipSchema: Schema = new Schema(
  {
    match: { type: String, required: true },
    league: { type: String, required: true },
    odds: { type: Number, required: true },
    prediction: { type: String, required: true },
    confidence: { type: Number, required: true, min: 1, max: 100 },
    matchDate: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'won', 'lost'], default: 'pending' },
    isPremium: { type: Boolean, default: false },
    planId: { type: Schema.Types.ObjectId, ref: 'SubscriptionPlan' },
    result: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model<ITip>('Tip', TipSchema);
