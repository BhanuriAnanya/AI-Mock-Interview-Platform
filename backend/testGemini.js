const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function testGemini() {
    try {
        console.log("API Loaded:", process.env.GEMINI_API_KEY);

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash"
        });

        const result = await model.generateContent("Say Hello");

        console.log(result.response.text());

    } catch (error) {
        console.error(error);
    }
}

testGemini();