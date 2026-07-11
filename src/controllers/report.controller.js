import Report from "../models/Report.js";
import User from "../models/User.js";
import AuditLog from "../models/AuditLog.js";
import fs from "fs";

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
    });

    await AuditLog.create({
      user: user,
      action: "CREATE",
      report: report._id,
    });

    res.status(201).json(report);
  } catch (error) {
    console.log(error, error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getReports = async (req, res) => {
  try {
    let reports;
    const { userid, role } = req.body;
    if (role === "admin" || role === "boss") {
      reports = await Report.find().populate("user");
    } else {
      reports = await Report.find({ user: userid });
    }

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate("user");

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
    const report = await Report.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    await AuditLog.create({
      user: req.user.id,
      action: "UPDATE",
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

    if (fs.existsSync(report.fail_evidence)) {
      fs.unlinkSync(report.fail_evidence);
    }
    if (fs.existsSync(report.delivery_evidence)) {
      fs.unlinkSync(report.delivery_evidence);
    }

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
