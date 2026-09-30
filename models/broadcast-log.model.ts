import mongoose, { Document, Model, Schema } from "mongoose";

export interface IBroadcastRecipient {
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string | null;
  type: "commitment" | "interest";
  amount?: number | null;
  emailStatus: "sent" | "failed" | "skipped";
  whatsappStatus: "sent" | "link_generated" | "failed" | "skipped";
  error?: string;
}

export interface IBroadcastLog {
  offeringId: string;
  offeringTitle: string;
  adminUserId: string;
  targetAudience: string;
  thirdPartyUrl?: string;
  subject: string;
  customMessage?: string;
  totalRecipients: number;
  emailsSent: number;
  whatsappProcessed: number;
  recipients: IBroadcastRecipient[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IBroadcastLogDocument extends IBroadcastLog, Document {}

const broadcastRecipientSchema = new Schema<IBroadcastRecipient>(
  {
    userId: { type: String, required: true },
    userName: { type: String, default: "" },
    userEmail: { type: String, required: true },
    userPhone: { type: String, default: null },
    type: { type: String, enum: ["commitment", "interest"], required: true },
    amount: { type: Number, default: null },
    emailStatus: {
      type: String,
      enum: ["sent", "failed", "skipped"],
      default: "skipped",
    },
    whatsappStatus: {
      type: String,
      enum: ["sent", "link_generated", "failed", "skipped"],
      default: "skipped",
    },
    error: { type: String, default: null },
  },
  { _id: false }
);

const broadcastLogSchema = new Schema<IBroadcastLogDocument>(
  {
    offeringId: {
      type: String,
      required: true,
      index: true,
    },
    offeringTitle: {
      type: String,
      required: true,
    },
    adminUserId: {
      type: String,
      required: true,
    },
    targetAudience: {
      type: String,
      required: true,
    },
    thirdPartyUrl: {
      type: String,
      default: "",
    },
    subject: {
      type: String,
      required: true,
    },
    customMessage: {
      type: String,
      default: "",
    },
    totalRecipients: {
      type: Number,
      default: 0,
    },
    emailsSent: {
      type: Number,
      default: 0,
    },
    whatsappProcessed: {
      type: Number,
      default: 0,
    },
    recipients: [broadcastRecipientSchema],
  },
  { timestamps: true }
);

if (mongoose.models && mongoose.models.BroadcastLog) {
  delete (mongoose.models as any).BroadcastLog;
}

export default (mongoose.models.BroadcastLog as Model<IBroadcastLogDocument>) ||
  mongoose.model<IBroadcastLogDocument>("BroadcastLog", broadcastLogSchema);

