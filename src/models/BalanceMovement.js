import mongoose from "mongoose";

const balanceMovementSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    previousBalance: { type: Number, required: true },
    amount: { type: Number, required: true },
    newBalance: { type: Number, required: true },
    type: {
      type: String,
      enum: ["add", "subtract", "credit", "adjustment"],
      default: "add",
    },
    description: { type: String, default: "" },
  },
  { timestamps: true },
);

export default mongoose.model("BalanceMovement", balanceMovementSchema);
