const express = require("express");

const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const verifyToken = require("../middleware/authMiddleware");

const {
    uploadResume
} = require("../controllers/resumeController");


router.post(
    "/upload",
    verifyToken,
    upload.single("resume"),
    uploadResume
);


module.exports = router;