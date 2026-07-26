import mongoose from "mongoose";

const platformSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    icon: {
      type: String,
      default: "",
    },
    icon_id: {
      type: String,
      default: "",
    },
    default_credit: {
      type: Number,
      default: 0,
      min: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Platform", platformSchema);
