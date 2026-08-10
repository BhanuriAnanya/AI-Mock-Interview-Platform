const {

    evaluateInterview,

} = require("../services/evaluationService");

const evaluateAnswer = async (req, res) => {

    try {

        const {

            questions,

            answers,

        } = req.body;

        console.log("\n==============================");
        console.log("REQUEST RECEIVED");
        console.log("==============================");

        console.log("Questions:");
        console.log(questions);

        console.log("Answers:");
        console.log(answers);

        const feedback = await evaluateInterview(

            questions,

            answers

        );

        res.json({

            feedback,

        });

    }

    catch (error) {

        console.log("\n========== CONTROLLER ERROR ==========");

        console.log(error);

        res.status(500).json({

            message: "Evaluation Failed",

        });

    }

};

module.exports = {

    evaluateAnswer,

};