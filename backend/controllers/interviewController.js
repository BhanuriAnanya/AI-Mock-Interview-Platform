const pool = require("../config/db");


// Get interview questions by ID

const getInterviewById = async (req, res) => {

    try {

        const { id } = req.params;


        const result = await pool.query(

            `
            SELECT 
                id,
                user_id,
                resume_name,
                questions,
                status,
                interview_date

            FROM interviews

            WHERE id = $1
            `,

            [id]

        );


        if (result.rows.length === 0) {

            return res.status(404).json({

                message: "Interview not found"

            });

        }


        res.status(200).json({

            interview: result.rows[0]

        });



    } catch(error) {


        console.error(
            "Get Interview Error:",
            error
        );


        res.status(500).json({

            message:
            "Failed to fetch interview"

        });


    }

};



module.exports = {

    getInterviewById

};