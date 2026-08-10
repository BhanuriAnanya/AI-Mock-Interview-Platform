const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const pool = require("../config/db");


const registerUser = async (req, res) => {
    try {
        // Get user data from request body
        const { full_name, email, password } = req.body;

        // Check if email already exists
        const existingUser = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                message: "Email already registered!"
            });
        }

      
        const hashedPassword = await bcrypt.hash(password, 10);

    
        await pool.query(
            `INSERT INTO users (full_name, email, password)
             VALUES ($1, $2, $3)`,
            [full_name, email, hashedPassword]
        );

        res.status(201).json({
            message: "User registered successfully!"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};



const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found!"
            });
        }

        const user = result.rows[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid password!"
            });
        }

      // Create JWT Token
const token = jwt.sign(
    {
        id: user.id,
        email: user.email
    },
    process.env.JWT_SECRET,
    {
        expiresIn: "2h"
    }
);

res.status(200).json({
    message: "Login successful!",
    token,
    user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email
    }
});
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};

module.exports = {
    registerUser,
    loginUser
};