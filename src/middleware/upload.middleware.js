import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";

// CREAR CARPETA SI NO EXISTE

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);

    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Solo imágenes JPG, PNG o WEBP"), false);
  }
};

export const upload = multer({
  storage,

  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});
