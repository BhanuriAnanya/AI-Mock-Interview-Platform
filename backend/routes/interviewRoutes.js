const express = require("express");

const router = express.Router();


const verifyToken = require("../middleware/authMiddleware");


const {
    getInterviewById
} = require("../controllers/interviewController");



router.get(

    "/:id",

    verifyToken,

    getInterviewById

);



module.exports = router;