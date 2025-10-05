import mongoose, { Schema, Document } from 'mongoose';

export interface ITree extends Document {
  treeId: string;
  species: {
    scientificName: string;
    commonName: string;
    category: 'indigenous' | 'exotic' | 'fruit' | 'bamboo';
  };
  location: {
    type: string;
    coordinates: [number, number];
    altitude?: number;
  };
  plantedBy: mongoose.Types.ObjectId;
  nurseryId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  plantingDate: Date;
  status: 'planted' | 'growing' | 'mature' | 'dead' | 'verified';
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
  measurements: Array<{
    date: Date;
    height: number;
    diameter: number;
    photos: string[];
    validatorId: mongoose.Types.ObjectId;
    notes?: string;
  }>;
  verification: {
    isVerified: boolean;
    verifiedBy: mongoose.Types.ObjectId[];
    verificationDate?: Date;
    hederaTopicId?: string;
    hederaTxId?: string;
    guardianVCId?: string;
    dataHash: string;
  };
  carbonOffset: {
    estimatedAnnual: number;
    totalSequestered: number;
  };
  janiTokensMinted: number;
}

const TreeSchema = new Schema<ITree>({
  treeId: { type: String, required: true, unique: true },
  species: {
    scientificName: { type: String, required: true },
    commonName: { type: String, required: true },
    category: {
      type: String,
      enum: ['indigenous', 'exotic', 'fruit', 'bamboo'],
      required: true
    }
  },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(v: number[]) {
          return v.length === 2 &&
                 v[0] >= -180 && v[0] <= 180 &&
                 v[1] >= -90 && v[1] <= 90;
        },
        message: 'Invalid coordinates'
      }
    },
    altitude: Number
  },
  plantedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  nurseryId: { type: Schema.Types.ObjectId, ref: 'Nursery' },
  projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
  plantingDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['planted', 'growing', 'mature', 'dead', 'verified'],
    default: 'planted'
  },
  healthStatus: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    default: 'good'
  },
  measurements: [{
    date: { type: Date, default: Date.now },
    height: Number,
    diameter: Number,
    photos: [String],
    validatorId: { type: Schema.Types.ObjectId, ref: 'User' },
    notes: String
  }],
  verification: {
    isVerified: { type: Boolean, default: false },
    verifiedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    verificationDate: Date,
    hederaTopicId: String,
    hederaTxId: String,
    guardianVCId: String,
    dataHash: { type: String, required: true }
  },
  carbonOffset: {
    estimatedAnnual: { type: Number, default: 0 },
    totalSequestered: { type: Number, default: 0 }
  },
  janiTokensMinted: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Create geospatial index
TreeSchema.index({ location: '2dsphere' });

export default mongoose.model<ITree>('Tree', TreeSchema);