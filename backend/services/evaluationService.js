const axios = require("axios");

const evaluateInterview = async (questions, answers) => {

    console.log("\n==============================");
    console.log("AI EVALUATION STARTED");
    console.log("==============================");

    const safeQuestions = Array.isArray(questions)
        ? questions
        : [];

    const safeAnswers = Array.isArray(answers)
        ? answers
        : [];

    console.log("Questions count:", safeQuestions.length);
    console.log("Answers count:", safeAnswers.length);

    console.log("\nQuestions Received:");
    console.log(JSON.stringify(safeQuestions, null, 2));

    console.log("\nAnswers Received:");
    console.log(JSON.stringify(safeAnswers, null, 2));

    let interviewText = "";

    safeQuestions.forEach((question, index) => {

        const cleanQuestion =
            String(question || "").trim();

        const cleanAnswer =
            typeof safeAnswers[index] === "string"
                ? safeAnswers[index].trim()
                : String(safeAnswers[index] || "").trim();

        interviewText += `
Question ${index + 1}:
${cleanQuestion}

Candidate Answer:
${cleanAnswer || "[NO ANSWER PROVIDED]"}

--------------------------------
`;
    });

    console.log(
        "\n=========== INTERVIEW DATA SENT TO AI ==========="
    );

    console.log(interviewText);

    const answeredCount = safeAnswers.filter(
        (answer) =>
            typeof answer === "string" &&
            answer.trim().length > 0
    ).length;

    console.log(
        "Answered questions:",
        answeredCount
    );

    /*
     * If frontend sends no answers,
     * don't waste an AI API call.
     */

    if (answeredCount === 0) {

        console.log(
            "WARNING: No candidate answers were received."
        );

        return `
Overall Score: 0/100

Communication: 0/10

Technical Knowledge: 0/10

Confidence: 0/10

Problem Solving: 0/10

Strengths
• No strengths could be assessed because no spoken answers were received.
• Interview participation could not be evaluated.
• Technical ability could not be assessed.

Areas to Improve
• Provide a spoken answer for every interview question.
• Explain technical concepts with relevant examples.
• Demonstrate problem-solving steps when answering technical questions.

Final Verdict
The interview could not be fairly evaluated because no candidate answers were received.
Please ensure microphone permission and speech recognition are working before attempting the interview again.
`;
    }

    const prompt = `
You are a Senior Software Engineering Interviewer.

Evaluate the COMPLETE interview below.

Your evaluation MUST be based ONLY on the questions and candidate answers provided.

Do NOT invent answers.

Do NOT claim that the candidate was silent if an answer is present.

Do NOT give a high score without evidence.

Do NOT give a zero score merely because an answer is short.

Judge the actual content of the candidate's answers.

INTERVIEW TRANSCRIPT:

${interviewText}

There are ${answeredCount} answered questions out of ${safeQuestions.length} total questions.

Evaluate:

1. Overall Score: 0-100
2. Communication: 0-10
3. Technical Knowledge: 0-10
4. Confidence: 0-10
5. Problem Solving: 0-10

Consider:

- Clarity
- Relevance
- Technical correctness
- Project knowledge
- Programming knowledge
- DSA/problem solving
- Reasoning
- Examples
- Professional communication

Speech-to-text may contain minor grammar mistakes.
Do NOT heavily penalize minor transcription errors.

Return ONLY this format:

Overall Score: XX/100

Communication: X/10

Technical Knowledge: X/10

Confidence: X/10

Problem Solving: X/10

Strengths
• Strength based on the actual answers
• Strength based on the actual answers
• Strength based on the actual answers

Areas to Improve
• Improvement based on the actual answers
• Improvement based on the actual answers
• Improvement based on the actual answers

Final Verdict
Write 3-5 concise lines based on the actual interview performance.
`;

    console.log(
        "\n=========== EVALUATION PROMPT ==========="
    );

    console.log(prompt);

    try {

        console.log(
            "\nSending interview to OpenRouter..."
        );

        const response = await axios.post(

            "https://openrouter.ai/api/v1/chat/completions",

            {
                model: "google/gemma-3-27b-it",

                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ],

                temperature: 0.2,

                max_tokens: 700
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

        console.log(
            "\n=========== RAW AI RESPONSE ==========="
        );

        console.log(
            JSON.stringify(
                response.data,
                null,
                2
            )
        );

        const feedback =
            response.data?.choices?.[0]?.message?.content;

        if (!feedback) {

            throw new Error(
                "OpenRouter returned an empty evaluation."
            );

        }

        console.log(
            "\n=========== FINAL FEEDBACK ==========="
        );

        console.log(feedback);

        return feedback.trim();

    }

    catch (error) {

        console.log(
            "\n=========== OPENROUTER ERROR ==========="
        );

        if (error.response) {

            console.log(
                "Status:",
                error.response.status
            );

            console.log(
                "Response:",
                JSON.stringify(
                    error.response.data,
                    null,
                    2
                )
            );

        } else {

            console.log(
                "Message:",
                error.message
            );

        }

        throw error;
    }
};

module.exports = {
    evaluateInterview
};