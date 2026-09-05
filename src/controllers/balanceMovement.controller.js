import BalanceMovement from "../models/BalanceMovement.js";

export const getMovementsByUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const isAdmin = req.user.role === "admin" || req.user.role === "boss";

    if (!isAdmin && req.user.id !== userId) {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    const movements = await BalanceMovement.find({ user: userId })
      .populate("user", "username name")
      .populate("admin", "username name")
      .sort({ createdAt: -1 });

    res.json(movements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyMovements = async (req, res) => {
  try {
    const movements = await BalanceMovement.find({ user: req.user.id })
      .populate("user", "username name")
      .populate("admin", "username name")
      .sort({ createdAt: -1 });

    res.json(movements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
