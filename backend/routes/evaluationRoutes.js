const express = require("express");
const router = express.Router();

const { evaluateAnswer } = require("../controllers/evaluationController");


router.post(
    "/evaluate",
    evaluateAnswer
);


module.exports = router;