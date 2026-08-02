import Report from "../models/Report.js";
import User from "../models/User.js";
import AuditLog from "../models/AuditLog.js";
import { createNotification } from "./notification.controller.js";
import fs from "fs";
import path from "path";

function unlinkFile(filePath) {
  const fullPath = path.resolve(filePath);
  return new Promise((resolve) => {
    fs.unlink(fullPath, (err) => {
      if (err && err.code !== "ENOENT") {
        console.warn(`[FILES] No se pudo eliminar: ${filePath}`);
      }
      resolve();
    });
  });
}

async function notifyAdmins(title, message, type = "info", reportId = null) {
  try {
    const admins = await User.find({ role: { $in: ["admin", "boss"] }, active: { $ne: false } }).select("_id");
    for (const admin of admins) {
      await createNotification(admin._id, title, message, type, reportId);
    }
  } catch (e) {
    console.warn("[NOTIFICATION] Error notificando admins:", e.message);
  }
}

export const createReport = async (req, res) => {
  try {
    const { user, mail, password, platform, platform_type, delivery_date, description, account_duration, is_batch, batch_emails } =
      req.body;

    const batch = is_batch === "true" || is_batch === true;
    const parsedEmails = batch
      ? (batch_emails ? (typeof batch_emails === "string" ? JSON.parse(batch_emails) : batch_emails) : [])
      : [];

    const report = await Report.create({
      user: user,
      mail,
      password,
      platform,
      platform_type: platform_type || "account",
      delivery_date,
      description,
      account_duration: account_duration ? Number(account_duration) : 1,
      is_batch: batch,
      batch_emails: parsedEmails,
      fail_evidence: req.files.fail_evidence[0].path,
      delivery_evidence: req.files.delivery_evidence[0].path,
      updatedBy: req.user?.id || null,
    });

    await AuditLog.create({
      user: req.user?.id || user,
      action: "CREATE",
      report: report._id,
    });

    const reporterName = req.user?.username || "Un usuario";
    const emailCount = batch ? parsedEmails.length + 1 : 1;
    const suffix = batch && emailCount > 1 ? ` (${emailCount} cuentas en lote)` : "";
    await notifyAdmins(
      "Nuevo reporte",
      `${reporterName} reporto ${platform}${suffix}.`,
      "info",
      report._id,
    );

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getReports = async (req, res) => {
  try {
    let reports;
    if (req.user.role === "admin" || req.user.role === "boss") {
      reports = await Report.find().populate("user").populate("updatedBy").populate("resolution.resolvedBy");
    } else {
      reports = await Report.find({ user: req.user.id }).populate("user").populate("updatedBy").populate("resolution.resolvedBy");
    }

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate("user")
      .populate("updatedBy")
      .populate("resolution.resolvedBy");

    if (!report) return res.status(404).json({ message: "No encontrado" });

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resolveReport = async (req, res) => {
  try {
    const { text, type, replaced_mail, replaced_password, replaced_mails, credit_amount } = req.body;

    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "No encontrado" });

    const resolutionData = {
      text,
      type,
      replaced_mail: replaced_mail || "",
      replaced_password: replaced_password || "",
      replaced_mails: replaced_mails || [],
      credit_amount: credit_amount || 0,
      resolvedBy: req.user?.id || null,
      resolvedAt: new Date(),
    };

    await Report.updateMany(
      { account_key: report.account_key },
      {
        $set: {
          status: "resolved",
          resolution: resolutionData,
          updatedBy: req.user?.id || null,
        },
      },
    );

    if (type === "credit" && credit_amount > 0) {
      await User.findByIdAndUpdate(report.user, {
        $inc: { balance: credit_amount },
      });
    }

    await AuditLog.create({
      user: req.user?.id,
      action: "RESOLVE",
      report: report._id,
      details: { text, type, credit_amount, replaced_mail },
    });

    const typeLabel = type === "replace" ? "reemplazo de credenciales" : type === "credit" ? `saldo de $${credit_amount}` : "rechazo";
    await createNotification(
      report.user,
      "Reporte resuelto",
      `Tu reporte de ${report.platform} fue resuelto con ${typeLabel}.`,
      "success",
      report._id,
    );

    res.json({ message: "Reportes resueltos en cadena" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "No encontrado" });

    const isAdmin = req.user.role === "admin" || req.user.role === "boss";
    const isOwner = String(report.user) === req.user.id;
    const isPending = report.status === "pending";

    if (!isAdmin && !(isOwner && isPending)) {
      return res.status(403).json({ message: "No tienes permiso para editar este reporte" });
    }

    const allowedFields = ["mail", "password", "platform", "platform_type", "delivery_date", "description", "account_duration", "is_batch", "batch_emails"];
    const update = { updatedBy: req.user.id };

    if (isAdmin && req.body.status) update.status = req.body.status;

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        update[field] = req.body[field];
      }
    }

    let resolutionDelta = 0;
    if (isAdmin && req.body.resolution) {
      const oldRes = report.resolution || {};
      const oldCredit = oldRes.type === "credit" ? Number(oldRes.credit_amount) || 0 : 0;
      const newCredit = req.body.resolution.type === "credit" ? Number(req.body.resolution.credit_amount) || 0 : 0;
      resolutionDelta = newCredit - oldCredit;
      update.resolution = {
        ...req.body.resolution,
        resolvedBy: req.body.resolution.resolvedBy || oldRes.resolvedBy || req.user.id,
        resolvedAt: req.body.resolution.resolvedAt || oldRes.resolvedAt || new Date(),
      };
      update.status = "resolved";
    }

    const updated = await Report.findByIdAndUpdate(req.params.id, update, { returnDocument: 'after' })
      .populate("user")
      .populate("updatedBy")
      .populate("resolution.resolvedBy");

    if (isAdmin && req.body.resolution) {
      await Report.updateMany(
        { _id: { $ne: req.params.id }, account_key: report.account_key },
        { $set: { resolution: update.resolution, status: "resolved", updatedBy: req.user.id } },
      );

      if (resolutionDelta !== 0) {
        const owner = await User.findById(report.user);
        if (owner) {
          owner.balance = Math.max(0, owner.balance + resolutionDelta);
          await owner.save();
        }
      }
    }

    await AuditLog.create({
      user: req.user.id,
      action: req.body.status ? `STATUS_${req.body.status.toUpperCase()}` : "UPDATE",
      report: updated._id,
      details: req.body,
    });

    if (req.body.status && req.body.status !== report.status) {
      const statusLabel = req.body.status === "in_progress" ? "en proceso" : req.body.status === "resolved" ? "resuelto" : req.body.status;
      await createNotification(
        report.user,
        "Actualizacion de reporte",
        `Tu reporte de ${report.platform} ha sido puesto ${statusLabel}.`,
        req.body.status === "resolved" ? "success" : "info",
        report._id,
      );
    }

    if (isAdmin && !req.body.status) {
      await notifyAdmins(
        "Reporte actualizado",
        `${req.user.username} actualizo el reporte de ${report.platform}.`,
        "info",
        report._id,
      );
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) return res.status(404).json({ message: "No encontrado" });

    await Promise.all([
      unlinkFile(report.fail_evidence),
      unlinkFile(report.delivery_evidence),
    ]);

    await report.deleteOne();

    await AuditLog.create({
      user: req.user.id,
      action: "DELETE",
      report: report._id,
    });

    res.json({ message: "Reporte eliminado" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
