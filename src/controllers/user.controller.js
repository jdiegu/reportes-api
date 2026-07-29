import bcrypt from "bcryptjs";
import User from "../models/User.js";

export const createUser = async (req, res) => {
  try {
    const { username, password, role, phone, name } = req.body;

    if (!username || !password || !phone) {
      return res.status(400).json({ message: "Username, password y phone son obligatorios" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      username,
      password: hashedPassword,
      name: name || "",
      role: role === "admin" ? "admin" : "user",
      phone,
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      name: user.name,
      role: user.role,
      phone: user.phone,
      balance: user.balance,
      active: user.active,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.sendStatus(404);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { username, phone, role, name } = req.body;
    const update = {};
    if (username) update.username = username;
    if (phone) update.phone = phone;
    if (name !== undefined) update.name = name;

    if (role) {
      const isAdmin = req.user.role === "admin" || req.user.role === "boss";
      if (!isAdmin) {
        return res.status(403).json({ message: "No tienes permiso para cambiar roles" });
      }
      if (req.params.id === req.user.id) {
        return res.status(400).json({ message: "No puedes cambiar tu propio rol" });
      }
      const target = await User.findById(req.params.id);
      if (target && target.role === "boss") {
        return res.status(403).json({ message: "No se puede cambiar el rol de un boss" });
      }
      if (["user", "admin"].includes(role)) update.role = role;
    }

    const user = await User.findByIdAndUpdate(req.params.id, update, { returnDocument: 'after' }).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOwnProfile = async (req, res) => {
  try {
    const { name, phone, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Debes ingresar tu contrasena actual" });
      }
      const ok = await bcrypt.compare(currentPassword, user.password);
      if (!ok) {
        return res.status(401).json({ message: "Contrasena actual incorrecta" });
      }
      user.password = await bcrypt.hash(newPassword, 12);
    }

    if (name !== undefined) user.name = name;
    if (phone) user.phone = phone;

    await user.save();

    res.json({
      _id: user._id,
      username: user.username,
      name: user.name,
      role: user.role,
      phone: user.phone,
      balance: user.balance,
      active: user.active,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const adminUpdateUser = async (req, res) => {
  try {
    const { name, phone, password } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (phone) update.phone = phone;

    let user;
    if (password) {
      user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
      if (name !== undefined) user.name = name;
      if (phone) user.phone = phone;
      user.password = await bcrypt.hash(password, 12);
      await user.save();
      user = user.toObject();
      delete user.password;
    } else {
      user = await User.findByIdAndUpdate(req.params.id, update, { returnDocument: 'after' }).select("-password");
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deactivateUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { active: false });
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const activateUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { active: true });
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const hardDeleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
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

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (req.user.role !== "boss") {
      return res.status(403).json({ message: "Solo el boss puede cambiar roles de administrador" });
    }

    if (!["user", "admin", "boss"].includes(role)) {
      return res.status(400).json({ message: "Rol invalido. Usa 'user', 'admin' o 'boss'" });
    }

    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: "No puedes cambiar tu propio rol" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    user.role = role;
    await user.save();

    res.json({
      _id: user._id,
      username: user.username,
      name: user.name,
      role: user.role,
      phone: user.phone,
      balance: user.balance,
      active: user.active,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
