const axios = require("axios");

const generateInterviewQuestions = async (resumeText) => {

    console.log("\n======================================");
    console.log("AI INTERVIEW QUESTION GENERATION");
    console.log("======================================");

    try {

        const prompt = `
You are a professional Senior Software Engineering interviewer.

You are conducting a realistic technical interview for the candidate whose resume is provided below.

RESUME:
${resumeText}

YOUR TASK:

Generate exactly 10 interview questions following this EXACT sequence.

SECTION 1 — SELF INTRODUCTION
Question 1:
Ask the candidate to introduce themselves and briefly explain their journey in Computer Science.

SECTION 2 — RESUME-BASED INTERVIEW
Questions 2 to 5:

Ask questions strictly based on information actually present in the resume.

Cover things such as:
- Education
- Internship or work experience
- Projects
- Technologies
- Programming languages
- Databases
- Tools
- Technical implementation
- Challenges faced in projects
- Candidate's contribution

IMPORTANT:
Every question in this section must reference something that actually exists in the resume.

Do NOT invent projects, companies, technologies, internships, or experiences.

SECTION 3 — MEDIUM-LEVEL DSA AND CODING
Questions 6 to 8:

First identify the primary programming language mentioned in the resume.

Use ONLY a programming language that is actually mentioned in the resume.

Ask medium-level DSA/coding interview questions appropriate for that language.

Cover topics such as:
- Arrays
- Strings
- Hashing
- Searching
- Sorting
- Stack or Queue
- Basic problem solving

At least ONE question must ask the candidate to explain or write a solution/code using the programming language identified from the resume.

Do NOT ask advanced competitive programming questions.

Do NOT ask system-design questions in this section.

SECTION 4 — SITUATIONAL / BEHAVIORAL
Questions 9 to 10:

Ask realistic software-engineering workplace situations.

Examples of topics:
- Handling disagreement with a teammate
- Debugging a problem under time pressure
- Meeting a difficult deadline
- Handling a failed implementation
- Working with an unfamiliar technology
- Handling feedback from a senior
- Prioritizing multiple tasks

Make the situations relevant to a software engineering role.

IMPORTANT RULES:

1. Generate EXACTLY 10 questions.
2. Keep the questions in the exact order described above.
3. Questions must be written in clear professional English.
4. Do not use Chinese, Korean, Japanese, Arabic, or any other non-English characters.
5. Use normal English letters, numbers, punctuation, and programming symbols only.
6. Do not add random characters.
7. Do not invent information that is not in the resume.
8. Do not repeat questions.
9. Do not provide answers.
10. Do not provide explanations.
11. Do not add section headings to the questions.
12. Do not number the questions.
13. Do not use bullet points.
14. Return ONLY a valid JSON array containing exactly 10 question strings.

EXPECTED FORMAT:

[
  "Tell me about yourself and your journey in Computer Science.",
  "Question based on the candidate's resume.",
  "Question based on the candidate's resume.",
  "Question based on the candidate's resume.",
  "Question based on the candidate's resume.",
  "Medium-level DSA question using the programming language from the resume.",
  "Medium-level coding question using the programming language from the resume.",
  "Medium-level problem-solving question using the programming language from the resume.",
  "Situational software engineering question.",
  "Situational software engineering question."
]

Generate the questions now.
`;

        console.log("\nSending resume to OpenRouter...");

        const response = await axios.post(

            "https://openrouter.ai/api/v1/chat/completions",

            {
                model: "google/gemma-3-27b-it",

                messages: [
                    {
                        role: "system",
                        content:
                            "You are a professional software engineering interviewer. Follow the requested output format exactly."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],

                temperature: 0.2,

                max_tokens: 2000
            },

            {
                headers: {
                    Authorization:
                        `Bearer ${process.env.OPENROUTER_API_KEY}`,

                    "Content-Type":
                        "application/json"
                }
            }

        );

        if (
            !response.data ||
            !response.data.choices ||
            !response.data.choices[0] ||
            !response.data.choices[0].message
        ) {

            console.log("Invalid AI response:");

            console.log(response.data);

            throw new Error("Invalid AI response");

        }

        let rawQuestions =
            response.data.choices[0].message.content;

        console.log("\n======================================");
        console.log("RAW AI RESPONSE");
        console.log("======================================");

        console.log(rawQuestions);


        // Remove markdown code fences if the model adds them
        rawQuestions = rawQuestions
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();


        let questionArray;


        try {

            /*
             * Find the JSON array even if the AI
             * adds a small amount of extra text.
             */

            const startIndex =
                rawQuestions.indexOf("[");

            const endIndex =
                rawQuestions.lastIndexOf("]");


            if (
                startIndex === -1 ||
                endIndex === -1
            ) {

                throw new Error(
                    "JSON array not found"
                );

            }


            const jsonText =
                rawQuestions.substring(
                    startIndex,
                    endIndex + 1
                );


            questionArray =
                JSON.parse(jsonText);

        }

        catch (parseError) {

            console.log(
                "\nJSON parsing failed:"
            );

            console.log(
                parseError.message
            );

            throw new Error(
                "AI returned invalid question format"
            );

        }


        // Validate that the AI returned an array
        if (!Array.isArray(questionArray)) {

            throw new Error(
                "AI questions are not an array"
            );

        }


        // Remove invalid / empty questions
        questionArray =
            questionArray
                .filter(
                    (question) =>
                        typeof question === "string" &&
                        question.trim().length > 0
                )
                .map((question) =>
                    question
                        .replace(/[\u0080-\uFFFF]/g, "")
                        .replace(/\s+/g, " ")
                        .trim()
                );


        console.log("\n======================================");
        console.log("CLEAN QUESTIONS");
        console.log("======================================");


        questionArray.forEach(
            (question, index) => {

                console.log(
                    `Q${index + 1}: ${question}`
                );

            }
        );


        /*
         * We require exactly 10 questions.
         */

        if (questionArray.length !== 10) {

            console.log(
                `AI returned ${questionArray.length} questions instead of 10.`
            );

            throw new Error(
                "AI did not generate exactly 10 questions"
            );

        }


        /*
         * Convert the array into newline-separated
         * questions because Interview.jsx currently
         * uses split("\\n").
         */

        const finalQuestions =
            questionArray.join("\n");


        console.log("\n======================================");
        console.log("FINAL QUESTIONS SENT TO INTERVIEW");
        console.log("======================================");

        console.log(finalQuestions);


        return finalQuestions;

    }

    catch (error) {

        console.log(
            "\n======================================"
        );

        console.log(
            "QUESTION GENERATION ERROR"
        );

        console.log(
            "======================================"
        );


        if (error.response) {

            console.log(
                "OpenRouter Status:",
                error.response.status
            );

            console.log(
                "OpenRouter Error:",
                error.response.data
            );

        }

        else {

            console.log(
                error.message
            );

        }


        throw error;

    }

};


module.exports = {
    generateInterviewQuestions
};