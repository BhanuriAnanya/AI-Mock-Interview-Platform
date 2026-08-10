const axios = require("axios");
require("dotenv").config();

const generateInterviewQuestions = async (resumeText) => {
    try {

        const prompt = `
You are an experienced HR interviewer.

Analyze the following candidate's resume carefully.

Resume:
${resumeText}

Generate exactly 10 interview questions.

Rules:
1. Ask questions only from the resume.
2. Mix HR and Technical questions.
3. Include project-based questions.
4. Include problem-solving questions.
5. Start numbering from 1.
6. Return ONLY the numbered list.
`;

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "google/gemma-3-27b-it:free",
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:5000",
                    "X-Title": "AI Mock Interview Platform"
                }
            }
        );

        if (
            !response.data ||
            !response.data.choices ||
            response.data.choices.length === 0
        ) {
            throw new Error("No response received from OpenRouter.");
        }

        return response.data.choices[0].message.content;

    } catch (error) {

        console.log("\n========== OPENROUTER ERROR ==========\n");

        if (error.response) {
            console.log("Status:", error.response.status);
            console.log(
                JSON.stringify(error.response.data, null, 2)
            );
        } else {
            console.log(error.message);
        }

        throw new Error(
            error.response?.data?.error?.message ||
            "Failed to generate interview questions."
        );
    }
};

module.exports = {
    generateInterviewQuestions
};