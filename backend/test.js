const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function test() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash"
        });

        const result = await model.generateContent("Say hello.");

        console.log(result.response.text());

    } catch (err) {
        console.error(err);
    }
}

test();