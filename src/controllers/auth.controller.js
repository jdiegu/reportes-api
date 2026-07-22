import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

function sanitizeUser(user) {
  return {
    _id: user._id,
    username: user.username,
    role: user.role,
    phone: user.phone,
    balance: user.balance,
    active: user.active,
    createdAt: user.createdAt,
  };
}

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username y password son obligatorios",
      });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({
        message: "Credenciales inválidas",
      });
    }

    if (!user.active) {
      return res.status(403).json({
        message: "Usuario deshabilitado",
      });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({
        message: "Credenciales inválidas",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    );

    res.json({ token, user: sanitizeUser(user) });
  } catch (error) {
    res.status(500).json({
      message: "Error en login",
    });
  }
};

export const register = async (req, res) => {
  try {
    const { username, password, phone } = req.body;

    if (!username || !password || !phone) {
      return res.status(400).json({
        message: "Todos los campos obligatorios deben enviarse",
      });
    }

    const exists = await User.findOne({ username });
    if (exists) {
      return res.status(409).json({
        message: "El username ya existe",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      username,
      password: hashedPassword,
      role: "user",
      phone,
    });

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    );

    res.status(201).json({
      message: "Usuario registrado correctamente",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al registrar usuario",
    });
  }
};
