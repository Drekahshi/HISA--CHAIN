import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  did: string;
  walletAddress: string;
  email: string;
  phoneNumber?: string;
  passwordHash: string;
  role: 'planter' | 'validator' | 'auditor' | 'admin' | 'cfa_member';
  profile: {
    firstName: string;
    lastName: string;
    organization?: string;
  };
  reputationScore: number;
  isActive: boolean;
  kycVerified: boolean;
}

const UserSchema = new Schema<IUser>({
  did: { type: String, unique: true, sparse: true },
  walletAddress: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phoneNumber: String,
  passwordHash: { type: String, required: true },
  role: {
    type: String,
    enum: ['planter', 'validator', 'auditor', 'admin', 'cfa_member'],
    default: 'planter'
  },
  profile: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    organization: String
  },
  reputationScore: { type: Number, default: 100 },
  isActive: { type: Boolean, default: true },
  kycVerified: { type: Boolean, default: false }
}, {
  timestamps: true
});

export const User = mongoose.model<IUser>('User', UserSchema);