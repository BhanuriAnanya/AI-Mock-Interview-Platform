const fs = require("fs");
const pdfParse = require("pdf-parse");

const { generateInterviewQuestions } = require("../services/geminiService");
const pool = require("../config/db");


const uploadResume = async (req, res) => {

    try {

        console.log("========== Resume Upload Started ==========");

        console.log("Logged User:", req.user);


        if (!req.file) {

            return res.status(400).json({
                message: "No resume uploaded."
            });

        }


        console.log("Uploaded File:", req.file);



        // Read uploaded PDF

        const dataBuffer = fs.readFileSync(req.file.path);

        console.log("PDF Read Successfully");



        // Extract text from PDF

        const pdfData = await pdfParse(dataBuffer);


        console.log("PDF Parsed Successfully");


        const resumeText = pdfData.text;


        console.log(
            "Resume Text Length:",
            resumeText.length
        );



        if (!resumeText || resumeText.trim().length === 0) {

            return res.status(400).json({
                message: "Could not extract text from resume."
            });

        }



        // Generate AI interview questions

        const questions = await generateInterviewQuestions(
            resumeText
        );


        console.log(
            "AI Questions Generated Successfully"
        );



        // Save interview data

        const result = await pool.query(

            `
            INSERT INTO interviews
            (
                user_id,
                resume_name,
                questions,
                status,
                interview_date
            )
            VALUES
            ($1,$2,$3,$4,NOW())

            RETURNING id
            `,

            [
                req.user.id,
                req.file.originalname,
                questions,
                "created"
            ]

        );



        console.log(
            "Interview Saved:",
            result.rows[0].id
        );



        res.status(200).json({

            message:
            "Resume analyzed successfully!",

            interviewId:
            result.rows[0].id,

            questions

        });



    } catch(error) {


        console.error(
            "Resume Upload Error:"
        );


        console.error(error);



        res.status(500).json({

            message:
            error.message

        });


    }

};



module.exports = {

    uploadResume

};