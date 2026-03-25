import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  user: mongoose.Types.ObjectId;
  plan: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  method: 'stripe' | 'paypal' | 'mpesa' | 'manual' | 'skrill' | 'neteller' | 'crypto' | 'revolut' | 'wise' | 'mpesa_manual' | 'paypal_ff' | 'till' | 'airtel';
  status: 'pending' | 'approved' | 'rejected';
  transactionId?: string;
  proofImage?: string; // For manual/M-PESA payments
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    plan: { type: Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    method: { type: String, enum: ['stripe', 'paypal', 'mpesa', 'manual', 'skrill', 'neteller', 'crypto', 'revolut', 'wise', 'mpesa_manual', 'paypal_ff', 'till', 'airtel'], required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    transactionId: { type: String },
    proofImage: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IPayment>('Payment', PaymentSchema);
