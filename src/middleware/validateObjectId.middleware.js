import mongoose from "mongoose";

export const validateObjectId = (req, res, next) => {
  const id = req.params.id;
  if (!id || !mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "ID invalido" });
  }
  next();
};
