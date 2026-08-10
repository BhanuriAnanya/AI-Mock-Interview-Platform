const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const evaluationRoutes = require("./routes/evaluationRoutes");

const verifyToken = require("./middleware/authMiddleware");


const app = express();



app.use(cors());

app.use(express.json());



// Routes

app.use(
    "/api/auth",
    authRoutes
);


app.use(
    "/api/resume",
    resumeRoutes
);


app.use(
    "/api/evaluation",
    evaluationRoutes
);




// Database test route

app.get("/", async(req,res)=>{


    try{


        const result = await pool.query(
            "SELECT NOW()"
        );


        res.json({

            message:
            "Backend is running!",

            databaseTime:
            result.rows[0].now

        });


    }
    catch(error){


        console.log(error);


        res.status(500).json({

            message:
            "Database connection failed"

        });


    }


});





// Protected profile test route

app.get(
    "/api/profile",
    verifyToken,
    (req,res)=>{


        res.json({

            message:
            "Protected Route Accessed Successfully",

            user:
            req.user

        });


    }

);





const PORT =
process.env.PORT || 5000;



app.listen(
    PORT,
    ()=>{


        console.log(
            `Server is running on port ${PORT}`
        );


    }
);