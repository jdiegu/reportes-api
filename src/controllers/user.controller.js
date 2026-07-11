import bcrypt from "bcryptjs";
import User from "../models/User.js";

export const createUser = async (req, res) => {
  const data = req.body;
  data.password = await bcrypt.hash(data.password, 10);
  const user = await User.create(data);
  res.status(201).json(user);
};

export const getAllUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};

export const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.sendStatus(404);
  res.json(user);
};

export const updateUser = async (req, res) => {
  const data = req.body;
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }
  const user = await User.findByIdAndUpdate(req.params.id, data, { new: true }).select("-password");
  res.json(user);
};

export const deleteUser = async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { active: false });
  res.sendStatus(204);
};

export const updateBalance = async (req, res) => {
  try {
    const { amount, operation } = req.body;

    if (typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ message: "El monto debe ser un numero positivo" });
    }

    if (!["add", "subtract"].includes(operation)) {
      return res.status(400).json({ message: "Operacion invalida. Usa 'add' o 'subtract'" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    if (operation === "subtract" && user.balance < amount) {
      return res.status(400).json({ message: "Saldo insuficiente. Saldo actual: $" + user.balance });
    }

    user.balance = operation === "add" ? user.balance + amount : user.balance - amount;
    await user.save();

    res.json({ balance: user.balance, message: `Saldo actualizado: $${user.balance}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
