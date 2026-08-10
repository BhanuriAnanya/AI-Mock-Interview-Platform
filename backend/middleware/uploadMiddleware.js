const multer = require("multer");
const path = require("path");

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/resumes");
    },

    filename: (req, file, cb) => {
        const uniqueName = Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {

    console.log("Uploaded file type:", file.mimetype);

    if (
        file.mimetype === "application/pdf" ||
        file.originalname.toLowerCase().endsWith(".pdf")
    ) {
        cb(null, true);
    } else {
        cb(new Error("Only PDF files are allowed!"), false);
    }

};

const upload = multer({
    storage,
    fileFilter
});

module.exports = upload;