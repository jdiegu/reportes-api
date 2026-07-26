import Platform from "../models/Platform.js";

export const getPlatforms = async (req, res) => {
  try {
    const platforms = await Platform.find({ active: true }).sort({ name: 1 });
    res.json(platforms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllPlatforms = async (req, res) => {
  try {
    const platforms = await Platform.find().sort({ name: 1 });
    res.json(platforms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPlatform = async (req, res) => {
  try {
    const { name, icon, icon_id, default_credit } = req.body;
    if (!name) return res.status(400).json({ message: "Nombre requerido" });

    const exists = await Platform.findOne({ name: name.trim() });
    if (exists) return res.status(409).json({ message: "La plataforma ya existe" });

    const platform = await Platform.create({
      name: name.trim(),
      icon: icon || "",
      icon_id: icon_id || "",
      default_credit: default_credit || 0,
    });

    res.status(201).json(platform);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePlatform = async (req, res) => {
  try {
    const { name, icon, icon_id, default_credit, active } = req.body;
    const update = {};
    if (name !== undefined) update.name = name.trim();
    if (icon !== undefined) update.icon = icon;
    if (icon_id !== undefined) update.icon_id = icon_id;
    if (default_credit !== undefined) update.default_credit = default_credit;
    if (active !== undefined) update.active = active;

    const platform = await Platform.findByIdAndUpdate(req.params.id, update, { returnDocument: 'after' });
    if (!platform) return res.status(404).json({ message: "No encontrada" });

    res.json(platform);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePlatform = async (req, res) => {
  try {
    const platform = await Platform.findByIdAndDelete(req.params.id);
    if (!platform) return res.status(404).json({ message: "No encontrada" });
    res.json({ message: "Plataforma eliminada" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
