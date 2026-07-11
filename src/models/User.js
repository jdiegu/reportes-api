import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["user", "admin", "boss"],
      default: "user",
    },

    active: { type: Boolean, default: true },

    phone: {
      type: String,
      required: true,
    },

    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
