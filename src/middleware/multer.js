import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

export const singleUpload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2 MB file size limit
  },
  fileFilter: (req, file, cb) => {
    // Allowed file types
    const filetypes = /doc|docx|rtf|pdf|png|jpg|jpeg/;
    // Check the mimetype and the file extension
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(
      new Error(
        "Unsupported file type. Only doc, docx, rtf, pdf, png, jpg, jpeg files are allowed."
      )
    );
  },
}).single("file");
