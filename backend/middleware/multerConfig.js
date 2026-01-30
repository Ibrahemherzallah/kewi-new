import multer from "multer";

// Allowed image types
const imageMimeTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

const storage = multer.memoryStorage(); // Store files in memory for Firebase upload

const fileFilter = (req, file, cb) => {
    if (imageMimeTypes.includes(file.mimetype)) {
        cb(null, true); // Accept the file
    } else {
        cb(new Error("Only images are allowed!"), false); // Reject the file
    }
};

const upload = multer({
    storage,
    fileFilter,
});

export default upload;
