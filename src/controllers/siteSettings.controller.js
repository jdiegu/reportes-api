import SiteSettings from "../models/SiteSettings.js";

export const getSiteSettings = async (req, res) => {
  try {
    const settings = await SiteSettings.getInstance();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSiteStatus = async (req, res) => {
  try {
    const s = await SiteSettings.getInstance();
    res.json({
      restrictAccess: s.restrictAccess,
      siteClosed: s.siteClosed,
      closureReason: s.closureReason,
      closureMode: s.closureMode,
      scheduledCloseAt: s.scheduledCloseAt,
      scheduledOpenAt: s.scheduledOpenAt,
      recurringDays: s.recurringDays,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSiteSettings = async (req, res) => {
  try {
    const {
      restrictAccess,
      allowedRoles,
      siteClosed,
      closureReason,
      closureMode,
      scheduledCloseAt,
      scheduledOpenAt,
      recurringDays,
    } = req.body;

    const settings = await SiteSettings.getInstance();

    if (restrictAccess !== undefined) settings.restrictAccess = restrictAccess;
    if (allowedRoles !== undefined) settings.allowedRoles = allowedRoles;
    if (siteClosed !== undefined) settings.siteClosed = siteClosed;
    if (closureReason !== undefined) settings.closureReason = closureReason;
    if (closureMode !== undefined) settings.closureMode = closureMode;
    if (scheduledCloseAt !== undefined) settings.scheduledCloseAt = scheduledCloseAt;
    if (scheduledOpenAt !== undefined) settings.scheduledOpenAt = scheduledOpenAt;
    if (recurringDays !== undefined) settings.recurringDays = recurringDays;

    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
