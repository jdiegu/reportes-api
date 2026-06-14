import mongoose from "mongoose";

const auditSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    action: { type: String, required: true },
    report: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
    },
    details: { type: Object },
  },
  { timestamps: true },
);

export default mongoose.model("AuditLog", auditSchema);
