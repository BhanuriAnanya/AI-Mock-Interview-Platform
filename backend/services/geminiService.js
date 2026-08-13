const axios = require("axios");

const OPENROUTER_URL =
    "https://openrouter.ai/api/v1/chat/completions";

const MODEL =
    "google/gemma-3-27b-it";

const TOTAL_QUESTIONS = 30;

const generateInterviewQuestions = async (resumeText) => {

    console.log("\n======================================");
    console.log("AI INTERVIEW QUESTION GENERATION");
    console.log("======================================");

    const prompt = `
You are a professional Senior Software Engineering interviewer.

You are conducting a realistic technical mock interview for the candidate whose resume is provided below.

RESUME:
${resumeText}

Generate EXACTLY 30 interview questions.

The interview MUST follow this exact structure:

SECTION 1 — SELF INTRODUCTION

Question 1:
Ask:

"Tell me about yourself and your journey in Computer Science."

This MUST be the first question.

SECTION 2 — RESUME DEEP-DIVE

Questions 2 to 15:
Generate exactly 14 questions based ONLY on information actually present in the resume.

Analyze the ENTIRE resume.

Try to cover the candidate's:

- Education
- Academic background
- Programming languages
- Technical skills
- Frameworks
- Libraries
- Databases
- Tools
- Internships
- Work experience
- Projects
- Project architecture
- Technical implementation
- APIs
- Technologies used
- Challenges
- Solutions
- Technical decisions
- Contributions
- Achievements
- Certifications
- Relevant coursework

Every question MUST be supported by information actually present in the resume.

DO NOT invent projects, companies, internships, technologies, programming languages, certifications, responsibilities, achievements, or experience.

Distribute the 14 questions across different parts of the resume.

Ask progressively deeper questions:
- what the candidate did
- how they implemented it
- why they chose a technology
- challenges
- decisions
- optimization
- improvements

SECTION 3 — MEDIUM DSA AND CODING

Questions 16 to 23:
Generate exactly 8 medium-level DSA/coding questions.

First identify the PRIMARY programming language mentioned in the resume.

Use ONLY that programming language.

Cover different topics such as:

- Arrays
- Strings
- Hashing
- Searching
- Sorting
- Stack
- Queue
- Linked Lists
- Recursion
- Time complexity
- Space complexity
- Problem solving

At least TWO questions must require the candidate to explain or write code using the programming language from the resume.

Difficulty must be MEDIUM.

Do NOT ask advanced competitive programming questions.

Do NOT ask system design questions.

SECTION 4 — SITUATIONAL AND BEHAVIORAL

Questions 24 to 30:
Generate exactly 7 different software-engineering situational or behavioral questions.

Cover different situations such as:

- Disagreement with a teammate
- Debugging a difficult problem
- Working under time pressure
- Difficult deadline
- Failed implementation
- Learning unfamiliar technology
- Receiving critical feedback
- Prioritizing multiple tasks
- Changing requirements
- Team collaboration
- Taking ownership

Do not repeat the same situation.

IMPORTANT OUTPUT RULES:

1. Return EXACTLY 30 questions.
2. Return ONLY a JSON array.
3. The JSON array must contain exactly 30 strings.
4. Do not add markdown.
5. Do not add code fences.
6. Do not add explanations.
7. Do not add section headings.
8. Do not add numbering.
9. Do not use bullet points.
10. Do not provide answers.
11. Do not invent resume information.
12. Use clear professional English.
13. Each array item must be a complete question.
14. The first item MUST be:
"Tell me about yourself and your journey in Computer Science."

The required distribution is:

Question 1 = Self introduction

Questions 2-15 = Resume deep-dive

Questions 16-23 = DSA/coding

Questions 24-30 = Situational/behavioral

Return exactly this structure:

[
"Tell me about yourself and your journey in Computer Science.",
"Resume question",
"Resume question",
"Resume question",
"Resume question",
"Resume question",
"Resume question",
"Resume question",
"Resume question",
"Resume question",
"Resume question",
"Resume question",
"Resume question",
"Resume question",
"Resume question",
"DSA question",
"DSA question",
"DSA question",
"DSA question",
"DSA question",
"DSA question",
"DSA question",
"DSA question",
"Situational question",
"Situational question",
"Situational question",
"Situational question",
"Situational question",
"Situational question",
"Situational question"
]
`;

    const callAI = async () => {

        console.log("\nSending resume to OpenRouter...");

        const response = await axios.post(
            OPENROUTER_URL,
            {
                model: MODEL,

                messages: [
                    {
                        role: "system",
                        content:
                            "You are a professional software engineering interviewer. Return only valid JSON."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],

                temperature: 0.1,

                max_tokens: 5000
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

        const content =
            response.data?.choices?.[0]?.message?.content;

        if (!content) {
            throw new Error(
                "OpenRouter returned an empty response."
            );
        }

        return content;
    };


    const parseQuestions = (rawResponse) => {

        console.log("\n======================================");
        console.log("RAW AI RESPONSE");
        console.log("======================================");

        console.log(rawResponse);

        let cleaned = rawResponse
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();


        const startIndex =
            cleaned.indexOf("[");

        const endIndex =
            cleaned.lastIndexOf("]");


        if (
            startIndex === -1 ||
            endIndex === -1
        ) {

            throw new Error(
                "AI response does not contain a JSON array."
            );
        }


        const jsonText =
            cleaned.substring(
                startIndex,
                endIndex + 1
            );


        let questions;

        try {

            questions =
                JSON.parse(jsonText);

        }

        catch (error) {

            console.log(
                "JSON parsing failed:",
                error.message
            );

            throw new Error(
                "AI returned invalid JSON."
            );
        }


        if (!Array.isArray(questions)) {

            throw new Error(
                "AI response is not an array."
            );
        }


        questions =
            questions
                .filter(
                    (question) =>
                        typeof question === "string" &&
                        question.trim().length > 0
                )
                .map(
                    (question) =>
                        question
                            .replace(
                                /[\u0080-\uFFFF]/g,
                                ""
                            )
                            .replace(
                                /\s+/g,
                                " "
                            )
                            .trim()
                );


        return questions;
    };


    /*
     * Try up to 3 times.
     *
     * Gemma can occasionally return 29 or 31
     * items even when explicitly asked for 30.
     */

    const MAX_ATTEMPTS = 3;

    let questionArray = null;


    for (
        let attempt = 1;
        attempt <= MAX_ATTEMPTS;
        attempt++
    ) {

        try {

            console.log(
                `\nAI generation attempt ${attempt}/${MAX_ATTEMPTS}`
            );


            const rawResponse =
                await callAI();


            const questions =
                parseQuestions(rawResponse);


            console.log(
                `AI returned ${questions.length} questions.`
            );


            if (
                questions.length === TOTAL_QUESTIONS
            ) {

                questionArray =
                    questions;

                break;
            }


            console.log(
                `Invalid question count. Expected ${TOTAL_QUESTIONS}, received ${questions.length}.`
            );


            if (
                attempt === MAX_ATTEMPTS
            ) {

                throw new Error(
                    `AI did not generate exactly ${TOTAL_QUESTIONS} questions after ${MAX_ATTEMPTS} attempts.`
                );
            }

        }

        catch (error) {

            console.log(
                `Attempt ${attempt} failed:`,
                error.message
            );


            if (
                attempt === MAX_ATTEMPTS
            ) {

                throw error;
            }
        }
    }


    if (
        !questionArray ||
        questionArray.length !== TOTAL_QUESTIONS
    ) {

        throw new Error(
            "Unable to generate exactly 30 interview questions."
        );
    }


    console.log("\n======================================");
    console.log("FINAL QUESTIONS");
    console.log("======================================");


    questionArray.forEach(
        (question, index) => {

            console.log(
                `Q${index + 1}: ${question}`
            );

        }
    );


    /*
     * Interview.jsx currently expects newline-separated
     * questions, so keep this format.
     */

    const finalQuestions =
        questionArray.join("\n");


    console.log("\n======================================");
    console.log("30 QUESTIONS GENERATED SUCCESSFULLY");
    console.log("======================================");


    return finalQuestions;
};


module.exports = {
    generateInterviewQuestions
};