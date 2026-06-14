import bcrypt from "bcryptjs";
import User from "../models/User.js";

export const createUser = async (req, res) => {
  const data = req.body;
  data.password = await bcrypt.hash(data.password, 10);
  const user = await User.create(data);
  res.status(201).json(user);
};

export const getAllUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};

export const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.sendStatus(404);
  res.json(user);
};

export const updateUser = async (req, res) => {
  const data = req.body;
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }
  const user = await User.findByIdAndUpdate(req.params.id, data, { new: true });
  res.json(user);
};

export const deleteUser = async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { active: false });
  res.sendStatus(204);
};

