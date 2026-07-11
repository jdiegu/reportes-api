import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    mail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    password: {
      type: String,
      default: "",
    },

    platform: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    platform_type: {
      type: String,
      enum: ["account", "profile"],
      default: "account",
    },

    delivery_date: {
      type: Date,
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    fail_evidence: {
      type: String,
      required: true,
    },

    delivery_evidence: {
      type: String,
      required: true,
    },
    status: {
      type: String,

      enum: ["pending", "in_progress", "resolved"],

      default: "pending",
    },

    resolution: {
      text: {
        type: String,
        default: "",
      },

      type: {
        type: String,
        enum: ["replace", "credit", "reject"],
      },

      replaced_mail: {
        type: String,
        default: "",
      },

      replaced_password: {
        type: String,
        default: "",
      },

      credit_amount: {
        type: Number,
        default: 0,
      },

      resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },

      resolvedAt: {
        type: Date,
      },
    },

    account_key: {
      type: String,
      index: true,
    },
  },

  {
    timestamps: true,
  },
);

reportSchema.pre("save", async function () {
  this.account_key = `${this.mail}_${this.platform}`
    .toLowerCase()
    .replace(/\s+/g, "_");
});

export default mongoose.model("Report", reportSchema);
