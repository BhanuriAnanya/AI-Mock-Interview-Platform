import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../index.css";

function Result() {
    const navigate = useNavigate();
    const location = useLocation();

    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState("");
    const [error, setError] = useState("");
    const [score, setScore] = useState(null);

    const [questions, setQuestions] =
        useState([]);

    const [answers, setAnswers] =
        useState([]);

    const [terminated, setTerminated] =
        useState(false);


    /*
    =====================================================
    LOAD INTERVIEW DATA
    =====================================================
    */

    useEffect(() => {
        const interviewData =
            location.state;

        /*
        -------------------------------------------------
        CASE 1:
        User has just completed an interview.
        -------------------------------------------------
        */

        if (interviewData) {
            const {
                questions: receivedQuestions = [],
                answers: receivedAnswers = [],
                terminated: receivedTerminated = false,
            } = interviewData;

            setQuestions(receivedQuestions);
            setAnswers(receivedAnswers);
            setTerminated(receivedTerminated);

            evaluateInterview(
                receivedQuestions,
                receivedAnswers,
                receivedTerminated
            );

            return;
        }


        /*
        -------------------------------------------------
        CASE 2:
        User opened Results from Dashboard.

        Load the previously saved report.
        -------------------------------------------------
        */

        const savedReport =
            localStorage.getItem(
                "latestInterviewResult"
            );

        if (savedReport) {
            try {
                const report =
                    JSON.parse(savedReport);

                setQuestions(
                    report.questions || []
                );

                setAnswers(
                    report.answers || []
                );

                setTerminated(
                    report.terminated || false
                );

                setFeedback(
                    report.feedback || ""
                );

                setScore(
                    report.score ?? null
                );

                setLoading(false);

            } catch (parseError) {

                console.error(
                    "Unable to load saved report:",
                    parseError
                );

                setError(
                    "Unable to load the previous interview report."
                );

                setLoading(false);
            }

        } else {

            setLoading(false);
        }

    }, [location.state]);


    /*
    =====================================================
    AI EVALUATION
    =====================================================
    */

    const evaluateInterview = async (
        interviewQuestions,
        interviewAnswers,
        interviewTerminated
    ) => {

        console.log(
            "================================="
        );

        console.log(
            "RESULT PAGE LOADED"
        );

        console.log(
            "Questions:",
            interviewQuestions
        );

        console.log(
            "Answers:",
            interviewAnswers
        );

        console.log(
            "Terminated:",
            interviewTerminated
        );

        console.log(
            "================================="
        );


        /*
        -------------------------------------------------
        TERMINATED INTERVIEW
        -------------------------------------------------
        */

        if (interviewTerminated) {

            const terminatedFeedback =
                "Interview was terminated due to multiple tab switches.";

            setFeedback(
                terminatedFeedback
            );

            setScore(0);

            saveInterviewResult({
                questions:
                    interviewQuestions,

                answers:
                    interviewAnswers,

                terminated: true,

                feedback:
                    terminatedFeedback,

                score: 0,
            });

            setLoading(false);

            return;
        }


        /*
        -------------------------------------------------
        NORMAL AI EVALUATION
        -------------------------------------------------
        */

        try {

            console.log(
                "Sending interview to backend..."
            );

            const response =
                await api.post(
                    "/evaluation/evaluate",
                    {
                        questions:
                            interviewQuestions,

                        answers:
                            interviewAnswers,
                    }
                );


            console.log(
                "Backend evaluation response:"
            );

            console.log(
                response.data
            );


            const aiFeedback =
                response.data?.feedback ||
                "No AI feedback was returned.";


            /*
            -------------------------------------------------
            EXTRACT OVERALL SCORE
            -------------------------------------------------
            */

            const scoreMatch =
                aiFeedback.match(
                    /Overall Score\s*:\s*(\d+)\s*\/?\s*100/i
                );


            let extractedScore = null;

            if (scoreMatch) {
                extractedScore =
                    Number(scoreMatch[1]);
            }


            /*
            -------------------------------------------------
            UPDATE UI
            -------------------------------------------------
            */

            setFeedback(
                aiFeedback
            );

            setScore(
                extractedScore
            );


            /*
            -------------------------------------------------
            SAVE FINAL REPORT
            -------------------------------------------------
            */

            saveInterviewResult({

                questions:
                    interviewQuestions,

                answers:
                    interviewAnswers,

                terminated: false,

                feedback:
                    aiFeedback,

                score:
                    extractedScore,

            });


        } catch (err) {

            console.error(
                "Evaluation error:",
                err
            );

            if (err.response) {

                console.error(
                    "Backend response:",
                    err.response.data
                );
            }


            setError(
                "Unable to generate AI feedback. Please check the backend terminal."
            );

        } finally {

            setLoading(false);
        }
    };


    /*
    =====================================================
    SAVE INTERVIEW RESULT
    =====================================================
    */

    const saveInterviewResult = (
        report
    ) => {

        try {

            /*
            ------------------------------------------------
            Save latest report.
            ------------------------------------------------
            */

            const completeReport = {
                ...report,
                evaluatedAt:
                    new Date().toISOString(),
            };

            localStorage.setItem(
                "latestInterviewResult",
                JSON.stringify(
                    completeReport
                )
            );


            /*
            ------------------------------------------------
            Save interview history.
            ------------------------------------------------
            */

            let history = [];

            const existingHistory =
                localStorage.getItem(
                    "mockInterviewHistory"
                );

            if (existingHistory) {

                try {

                    history =
                        JSON.parse(
                            existingHistory
                        );

                    if (
                        !Array.isArray(
                            history
                        )
                    ) {
                        history = [];
                    }

                } catch {
                    history = [];
                }
            }


            /*
            ------------------------------------------------
            Create a unique signature so refreshing
            the Result page doesn't create another
            interview count.
            ------------------------------------------------
            */

            const signature =
                JSON.stringify({
                    questions:
                        report.questions,

                    answers:
                        report.answers,
                });


            const alreadyExists =
                history.some(
                    (item) =>
                        item.signature ===
                        signature
                );


            if (!alreadyExists) {

                history.push({

                    id: Date.now(),

                    signature,

                    score:
                        report.score,

                    terminated:
                        report.terminated,

                    evaluatedAt:
                        completeReport.evaluatedAt,

                });

                localStorage.setItem(
                    "mockInterviewHistory",
                    JSON.stringify(
                        history
                    )
                );
            }


            console.log(
                "Interview result saved successfully."
            );

        } catch (storageError) {

            console.error(
                "Unable to save interview result:",
                storageError
            );
        }
    };


    /*
    =====================================================
    LOADING SCREEN
    =====================================================
    */

    if (loading) {

        return (
            <div className="results-page">

                <div className="result-card">

                    <h1>
                        🤖 Sophia AI
                    </h1>

                    <br />

                    <h2>
                        Evaluating Your Interview...
                    </h2>

                    <br />

                    <p>
                        Please wait while AI
                        analyzes your answers.
                    </p>

                </div>

            </div>
        );
    }


    /*
    =====================================================
    NO REPORT FOUND
    =====================================================
    */

    if (
        !loading &&
        questions.length === 0 &&
        !feedback
    ) {

        return (
            <div className="results-page">

                <div className="result-card">

                    <h1>
                        No Interview Results Yet
                    </h1>

                    <br />

                    <p>
                        Complete a mock interview
                        first to generate your
                        AI evaluation report.
                    </p>

                    <br />

                    <button
                        className="upload-btn"
                        onClick={() =>
                            navigate(
                                "/upload-resume"
                            )
                        }
                    >
                        Start Interview
                    </button>

                </div>

            </div>
        );
    }


    /*
    =====================================================
    FINAL RESULT PAGE
    =====================================================
    */

    return (
        <div className="results-page fade-up">

            {/* TITLE */}

            <div className="results-title">

                <h1>
                    {terminated
                        ? "Interview Terminated"
                        : "Interview Completed"}
                </h1>

                <p>
                    AI Interview Evaluation Report
                </p>

            </div>


            {/* RESULT CARDS */}

            <div className="results-grid">

                {/* SCORE */}

                <div className="result-card">

                    <h2>
                        Overall Score
                    </h2>

                    <div
                        className="score"
                        style={{
                            color:
                                terminated
                                    ? "#ef4444"
                                    : "#22c55e",
                        }}
                    >
                        {terminated
                            ? "0/100"
                            : score !== null
                                ? `${score}/100`
                                : "N/A"}
                    </div>

                </div>


                {/* QUESTIONS */}

                <div className="result-card">

                    <h2>
                        Questions Answered
                    </h2>

                    <div className="score">

                        {answers.length}

                    </div>

                </div>


                {/* STATUS */}

                <div className="result-card">

                    <h2>
                        Status
                    </h2>

                    <div
                        className="score"
                        style={{
                            color:
                                terminated
                                    ? "#ef4444"
                                    : "#22c55e",

                            fontSize:
                                "30px",
                        }}
                    >
                        {terminated
                            ? "Terminated"
                            : "Completed"}
                    </div>

                </div>

            </div>


            <br />


            {/* AI FEEDBACK */}

            <div className="result-card">

                <h2>
                    🤖 Sophia AI Feedback
                </h2>

                <br />

                {error ? (

                    <p
                        style={{
                            color:
                                "#ef4444",

                            lineHeight:
                                "1.8",
                        }}
                    >
                        {error}
                    </p>

                ) : (

                    <pre
                        style={{
                            whiteSpace:
                                "pre-wrap",

                            color:
                                "#cbd5e1",

                            lineHeight:
                                "1.8",

                            fontSize:
                                "15px",

                            fontFamily:
                                "inherit",
                        }}
                    >
                        {feedback}
                    </pre>

                )}

            </div>


            <br />


            {/* INTERVIEW SUMMARY */}

            <div className="result-card">

                <h2>
                    Interview Summary
                </h2>

                <br />

                {questions.map(
                    (question, index) => (

                        <div
                            key={index}
                            style={{
                                marginBottom:
                                    "30px",
                            }}
                        >

                            <strong>
                                Q{index + 1}.{" "}
                                {question}
                            </strong>

                            <p
                                style={{
                                    marginTop:
                                        "10px",

                                    color:
                                        "#cbd5e1",
                                }}
                            >
                                {answers[index] ||
                                    "No answer provided"}
                            </p>

                        </div>

                    )
                )}

            </div>


            <br />


            {/* BACK TO DASHBOARD */}

            <button
                className="upload-btn"
                onClick={() =>
                    navigate(
                        "/dashboard"
                    )
                }
            >
                Back to Dashboard
            </button>

        </div>
    );
}

export default Result;