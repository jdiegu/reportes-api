import Report from "../models/Report.js";
import User from "../models/User.js";
import AuditLog from "../models/AuditLog.js";
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

export const createReport = async (req, res) => {
  try {
    const { user, mail, password, platform, platform_type, delivery_date, description } =
      req.body;

    const report = await Report.create({
      user: user,
      mail,
      password,
      platform,
      platform_type: platform_type || "account",
      delivery_date,
      description,
      fail_evidence: req.files.fail_evidence[0].path,
      delivery_evidence: req.files.delivery_evidence[0].path,
      updatedBy: req.user?.id || null,
    });

    await AuditLog.create({
      user: req.user?.id || user,
      action: "CREATE",
      report: report._id,
    });

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
    const { text, type, replaced_mail, replaced_password, credit_amount } = req.body;

    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "No encontrado" });

    const resolutionData = {
      text,
      type,
      replaced_mail,
      replaced_password,
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

    res.json({ message: "Reportes resueltos en cadena" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateReport = async (req, res) => {
  try {
    const { status } = req.body;
    const update = { ...req.body, updatedBy: req.user?.id || null };

    const report = await Report.findByIdAndUpdate(req.params.id, update, {
      new: true,
    }).populate("user").populate("updatedBy").populate("resolution.resolvedBy");

    if (!report) return res.status(404).json({ message: "No encontrado" });

    await AuditLog.create({
      user: req.user.id,
      action: status ? `STATUS_${status.toUpperCase()}` : "UPDATE",
      report: report._id,
      details: req.body,
    });

    res.json(report);
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
