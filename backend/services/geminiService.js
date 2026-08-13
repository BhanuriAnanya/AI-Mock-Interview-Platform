const axios = require("axios");

const generateInterviewQuestions = async (resumeText) => {

    console.log("\n======================================");
    console.log("AI INTERVIEW QUESTION GENERATION");
    console.log("======================================");

    try {

        const prompt = `
You are a professional Senior Software Engineering interviewer.

You are conducting a realistic technical mock interview for the candidate whose resume is provided below.

RESUME:
${resumeText}

YOUR TASK:

Generate EXACTLY 30 interview questions.

The questions MUST follow this exact structure and order.

==================================================
SECTION 1 — SELF INTRODUCTION
==================================================

Question 1:

Ask the candidate:

"Tell me about yourself and your journey in Computer Science."

This must be the first question.

==================================================
SECTION 2 — RESUME DEEP-DIVE
==================================================

Questions 2 to 15:

Generate 14 questions based STRICTLY on the information actually present in the resume.

The goal is to cover the candidate's resume as comprehensively as possible.

Analyze the ENTIRE resume before generating these questions.

Try to cover relevant information such as:

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
- Candidate's responsibilities
- Technical implementation
- Technologies used in projects
- APIs
- Databases used in projects
- Challenges faced
- Solutions implemented
- Important technical decisions
- Contributions
- Achievements
- Certifications
- Relevant coursework

IMPORTANT:

Every resume question MUST be based on something that actually exists in the resume.

Do NOT invent:

- Projects
- Companies
- Internships
- Technologies
- Programming languages
- Certifications
- Responsibilities
- Achievements
- Experience

If something does not exist in the resume, DO NOT ask about it.

Try to distribute the 14 questions across different parts of the resume instead of asking many questions about the same project or skill.

The questions should progressively become deeper.

For example:

First ask what the candidate did.

Then ask how they implemented it.

Then ask why they selected a particular technology.

Then ask about challenges, decisions, optimization, or improvements.

==================================================
SECTION 3 — MEDIUM-LEVEL DSA AND CODING
==================================================

Questions 16 to 23:

First identify the PRIMARY programming language mentioned in the resume.

Use ONLY a programming language that actually appears in the resume.

Generate 8 medium-level DSA and coding questions using that programming language.

Cover topics such as:

- Arrays
- Strings
- Hashing
- Searching
- Sorting
- Stack
- Queue
- Linked lists
- Basic recursion
- Time and space complexity
- Problem solving

At least TWO questions must require the candidate to explain or write a solution/code using the programming language identified from the resume.

Questions should be appropriate for a software engineering interview.

Difficulty must be MEDIUM.

Do NOT ask advanced competitive programming questions.

Do NOT ask system-design questions.

Do NOT use a programming language that is not present in the resume.

==================================================
SECTION 4 — SITUATIONAL / BEHAVIORAL
==================================================

Questions 24 to 30:

Generate 7 realistic software-engineering situational and behavioral questions.

Cover different situations such as:

- Disagreement with a teammate
- Debugging a difficult problem
- Working under time pressure
- Meeting a difficult deadline
- Handling a failed implementation
- Learning an unfamiliar technology
- Receiving critical feedback
- Prioritizing multiple tasks
- Handling changing requirements
- Working in a team
- Taking ownership of a problem

Do not repeat the same situation.

Questions should be relevant to a software engineering role.

==================================================
IMPORTANT OUTPUT RULES
==================================================

1. Generate EXACTLY 30 questions.

2. Question 1 MUST be the self-introduction question.

3. Questions 2-15 MUST be resume-based.

4. Questions 16-23 MUST be medium-level DSA/coding questions.

5. Questions 24-30 MUST be situational/behavioral questions.

6. Analyze the ENTIRE resume before creating resume questions.

7. Cover the resume as comprehensively as possible.

8. Do NOT invent information that is not in the resume.

9. Do NOT repeat questions.

10. Do NOT provide answers.

11. Do NOT provide explanations.

12. Do NOT add section headings.

13. Do NOT add numbering.

14. Do NOT use bullet points.

15. Use clear professional English.

16. Do NOT use Chinese, Korean, Japanese, Arabic, or other non-English characters.

17. Return ONLY a valid JSON array.

18. The JSON array MUST contain exactly 30 strings.

EXPECTED FORMAT:

[
  "Tell me about yourself and your journey in Computer Science.",
  "Resume-based question...",
  "Resume-based question...",
  "Resume-based question...",
  "Resume-based question...",
  "Resume-based question...",
  "Resume-based question...",
  "Resume-based question...",
  "Resume-based question...",
  "Resume-based question...",
  "Resume-based question...",
  "Resume-based question...",
  "Resume-based question...",
  "Resume-based question...",
  "Resume-based question...",
  "Medium-level DSA question...",
  "Medium-level coding question...",
  "Medium-level DSA question...",
  "Medium-level coding question...",
  "Medium-level DSA question...",
  "Medium-level DSA question...",
  "Medium-level coding question...",
  "Medium-level problem-solving question...",
  "Situational software engineering question...",
  "Situational software engineering question...",
  "Situational software engineering question...",
  "Situational software engineering question...",
  "Situational software engineering question...",
  "Situational software engineering question...",
  "Situational software engineering question..."
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

                max_tokens: 4000
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
         * We require exactly 30 questions.
         */

        if (questionArray.length !== 30) {

            console.log(
                `AI returned ${questionArray.length} questions instead of 30.`
            );

            throw new Error(
                "AI did not generate exactly 30 questions"
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