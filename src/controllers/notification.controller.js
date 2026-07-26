import Notification from "../models/Notification.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("report", "platform mail status");
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ user: req.user.id, read: false });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ message: "Marcada como leida" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.id, read: false }, { read: true });
    res.json({ message: "Todas marcadas como leidas" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export async function createNotification(userId, title, message, type = "info", reportId = null) {
  try {
    await Notification.create({
      user: userId,
      title,
      message,
      type,
      report: reportId,
    });
  } catch (e) {
    console.warn("[NOTIFICATION] Error creando notificacion:", e.message);
  }
}
