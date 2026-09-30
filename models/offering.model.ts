import mongoose, { Document, Model, Schema } from "mongoose";

export interface IOffering {
  offeringId: string;
  name: string;
  badge: string;
  roundType: string;
  description: string;
  valuation: string;
  valuationSub: string;
  fundingGoal: string;
  goalSub: string;
  minCheck: string;
  minCheckSub: string;
  minCheckNum: number;
  eligibility: string;
  eligibilitySub: string;
  closingDate: string;
  status: "active" | "closed";
  pastStatusText?: string;
  pastBadge?: string;
  displayOrder?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOfferingDocument extends IOffering, Document {}

const offeringSchema = new Schema<IOfferingDocument>(
  {
    offeringId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    badge: {
      type: String,
      default: "Active SPV Allocation",
      trim: true,
    },
    roundType: {
      type: String,
      default: "Direct Equity SPV",
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    valuation: {
      type: String,
      required: true,
      trim: true,
    },
    valuationSub: {
      type: String,
      default: "Pre-money round",
      trim: true,
    },
    fundingGoal: {
      type: String,
      default: "$125K",
      trim: true,
    },
    goalSub: {
      type: String,
      default: "Allocation cap",
      trim: true,
    },
    minCheck: {
      type: String,
      default: "$5K",
      trim: true,
    },
    minCheckSub: {
      type: String,
      default: "USD accredited entry",
      trim: true,
    },
    minCheckNum: {
      type: Number,
      default: 5000,
    },
    eligibility: {
      type: String,
      default: "Accredited",
      trim: true,
    },
    eligibilitySub: {
      type: String,
      default: "SEC 506(c)",
      trim: true,
    },
    closingDate: {
      type: String,
      default: "Oct 8, 2026",
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
      index: true,
    },
    pastStatusText: {
      type: String,
      default: "Funded & Closed",
      trim: true,
    },
    pastBadge: {
      type: String,
      default: "Direct SPV",
      trim: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default (mongoose.models.Offering as Model<IOfferingDocument>) ||
  mongoose.model<IOfferingDocument>("Offering", offeringSchema);
