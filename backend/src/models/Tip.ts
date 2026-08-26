import mongoose, { Schema, Document } from 'mongoose';

export interface ITip extends Document {
  externalFixtureId?: string;
  homeTeam?: string;
  awayTeam?: string;
  league: string;
  country?: string;
  kickoffTime?: Date;
  matchDate: Date;
  match: string;
  predictionType?: '1X2' | 'BTTS' | 'OVER_UNDER_2_5' | 'CORRECT_SCORE' | 'CUSTOM';
  selection?: string;
  prediction: string;
  probability?: number;
  confidence: number;
  confidenceLevel?: 'VERY HIGH' | 'HIGH' | 'MODERATE' | 'LOW' | 'NO PREDICTION';
  referenceOdds?: number | null;
  odds: number;
  accessLevel?: 'FREE' | 'VIP_BASIC' | 'VIP_PREMIUM' | 'VIP_ELITE' | 'VIP';
  vipTier?: string;
  status: 'UPCOMING' | 'ACTIVE' | 'LOCKED' | 'COMPLETED' | 'VOID' | 'FAILED' | 'pending' | 'won' | 'lost';
  source?: string;
  modelVersion?: string;
  result?: string;
  settledAt?: Date;
  isPremium: boolean;
  planIds?: mongoose.Types.ObjectId[];
  keyFactors?: string[];
  riskFactors?: string[];
  analysisReport?: Record<string, any>;
  qualityGateStatus?: 'PUBLISHED' | 'REJECTED_NO_BET';
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TipSchema: Schema = new Schema(
  {
    externalFixtureId: { type: String, index: true },
    homeTeam: { type: String },
    awayTeam: { type: String },
    league: { type: String, required: true },
    country: { type: String, default: '' },
    kickoffTime: { type: Date },
    matchDate: { type: Date, required: true },
    match: { type: String, required: true },
    predictionType: { 
      type: String, 
      enum: ['1X2', 'BTTS', 'OVER_UNDER_2_5', 'CORRECT_SCORE', 'CUSTOM'],
      default: '1X2' 
    },
    selection: { type: String },
    prediction: { type: String, required: true },
    probability: { type: Number, min: 0, max: 100 },
    confidence: { type: Number, required: true, min: 1, max: 100 },
    confidenceLevel: {
      type: String,
      enum: ['VERY HIGH', 'HIGH', 'MODERATE', 'LOW', 'NO PREDICTION'],
      default: 'HIGH'
    },
    referenceOdds: { type: Number, default: null },
    odds: { type: Number, required: true, default: 0 },
    accessLevel: { 
      type: String, 
      enum: ['FREE', 'VIP_BASIC', 'VIP_PREMIUM', 'VIP_ELITE', 'VIP'],
      default: 'FREE'
    },
    vipTier: { type: String, default: '' },
    status: { 
      type: String, 
      enum: ['UPCOMING', 'ACTIVE', 'LOCKED', 'COMPLETED', 'VOID', 'FAILED', 'pending', 'won', 'lost'], 
      default: 'UPCOMING' 
    },
    source: { type: String, default: 'Multi-Stage Analytics Engine' },
    modelVersion: { type: String, default: 'v2.5-MultiStage' },
    result: { type: String, default: '' },
    settledAt: { type: Date },
    isPremium: { type: Boolean, default: false },
    planIds: [{ type: Schema.Types.ObjectId, ref: 'SubscriptionPlan' }],
    keyFactors: [{ type: String }],
    riskFactors: [{ type: String }],
    analysisReport: { type: Schema.Types.Mixed, default: {} },
    qualityGateStatus: {
      type: String,
      enum: ['PUBLISHED', 'REJECTED_NO_BET'],
      default: 'PUBLISHED'
    },
    rejectionReason: { type: String, default: '' }
  },
  { timestamps: true }
);

// Compound index for preventing duplicate predictions for the same external fixture & prediction type
TipSchema.index({ externalFixtureId: 1, predictionType: 1 }, { unique: true, sparse: true });

export default mongoose.model<ITip>('Tip', TipSchema);
