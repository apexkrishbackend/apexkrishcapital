import mongoose, { Document, Model, Schema } from "mongoose";

export interface IAuditLog {
  adminUserId: string;
  adminEmail?: string;
  action: string; // e.g. 'broadcast_dispatched', 'commitment_status_updated', 'deal_link_updated', 'data_exported'
  targetEntity: string; // e.g. 'offering', 'commitment', 'user', 'founder_application'
  targetId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  createdAt?: Date;
}

export interface IAuditLogDocument extends IAuditLog, Document {}

const auditLogSchema = new Schema<IAuditLogDocument>(
  {
    adminUserId: { type: String, required: true, index: true },
    adminEmail: { type: String, default: null },
    action: { type: String, required: true, index: true },
    targetEntity: { type: String, required: true },
    targetId: { type: String, default: null },
    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null },
    details: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default (mongoose.models.AuditLog as Model<IAuditLogDocument>) ||
  mongoose.model<IAuditLogDocument>("AuditLog", auditLogSchema);
