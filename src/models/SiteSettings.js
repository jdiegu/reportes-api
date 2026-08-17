import mongoose from "mongoose";

const siteSettingsSchema = new mongoose.Schema(
  {
    restrictAccess: {
      type: Boolean,
      default: false,
    },
    allowedRoles: {
      type: [String],
      default: ["admin", "boss"],
    },
    siteClosed: {
      type: Boolean,
      default: false,
    },
    closureReason: {
      type: String,
      default: "",
    },
    closureMode: {
      type: String,
      enum: ["manual", "scheduled", "recurring"],
      default: "manual",
    },
    scheduledCloseAt: {
      type: Date,
      default: null,
    },
    scheduledOpenAt: {
      type: Date,
      default: null,
    },
    recurringDays: {
      type: [Number],
      default: [],
      validate: {
        validator: (v) => v.every((d) => d >= 0 && d <= 6),
        message: "Los dias deben estar entre 0 (domingo) y 6 (sabado)",
      },
    },
  },
  { timestamps: true }
);

siteSettingsSchema.statics.getInstance = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

export default mongoose.model("SiteSettings", siteSettingsSchema);
