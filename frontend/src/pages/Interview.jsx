
import Webcam from "react-webcam";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SpeechRecognition, {
    useSpeechRecognition,
} from "react-speech-recognition";
import hr from "../assets/hr.svg";
import "../index.css";

function Interview() {
    const navigate = useNavigate();
    const location = useLocation();

    const questionData = location.state?.questions || "";

    // Clean AI output so bullets/numbers do not become part of questions.
    const questionList = questionData
        .split("\n")
        .map((q) =>
            q
                .replace(/^\s*[-*•]\s*/, "")
                .replace(/^\s*\d+[\.\)]\s*/, "")
                .trim()
        )
        .filter((q) => q.length > 0);

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answer, setAnswer] = useState("");
    const [answers, setAnswers] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [violations, setViolations] = useState(0);
    const [interviewStarted, setInterviewStarted] = useState(false);

    const {
        transcript,
        resetTranscript,
        browserSupportsSpeechRecognition,
        listening,
    } = useSpeechRecognition();

    /*
     * Redirect if Interview was opened without questions.
     */
    useEffect(() => {
        if (!location.state || questionList.length === 0) {
            navigate("/dashboard");
        }
    }, [location.state, navigate, questionList.length]);

    /*
     * Keep recording state synchronized with the speech-recognition library.
     */
    useEffect(() => {
        setIsRecording(listening);
    }, [listening]);

    /*
     * Put the recognized speech into the answer box.
     * The textarea is read-only, so the candidate cannot type an answer.
     */
    useEffect(() => {
        if (listening || transcript) {
            setAnswer(transcript);
        }
    }, [transcript, listening]);

    /*
     * Interview timer.
     */
    useEffect(() => {
        const timer = setInterval(() => {
            setSeconds((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    /*
     * Start speech recognition.
     */
    const startListening = () => {
        if (submitted) return;

        resetTranscript();
        setAnswer("");

        SpeechRecognition.startListening({
            continuous: true,
            language: "en-IN",
        });

        setIsRecording(true);
    };

    /*
     * Stop speech recognition.
     */
    const stopListening = () => {
        SpeechRecognition.stopListening();
        setIsRecording(false);
    };

    /*
     * AI interviewer voice.
     *
     * Browser speech synthesis cannot truly analyze/match a person's
     * vocal tone. We select a natural English voice when available and
     * use a moderate pitch/rate for a more natural HR-interviewer sound.
     */
    const speakQuestion = () => {
        if (!questionList[currentQuestion]) return;

        window.speechSynthesis.cancel();

        const speech = new SpeechSynthesisUtterance(
            questionList[currentQuestion]
        );

        const voices = window.speechSynthesis.getVoices();

        const preferredVoice =
            voices.find(
                (voice) =>
                    voice.lang === "en-US" &&
                    /Google|Microsoft|Samantha|Natural/i.test(voice.name)
            ) ||
            voices.find((voice) =>
                voice.lang.toLowerCase().startsWith("en")
            );

        if (preferredVoice) {
            speech.voice = preferredVoice;
        }

        speech.lang = "en-US";
        speech.rate = 0.95;
        speech.pitch = 1.0;
        speech.volume = 1;

        /*
         * Automatically start recording after Sophia finishes asking
         * the question.
         */
        speech.onend = () => {
            if (!submitted) {
                startListening();
            }
        };

        window.speechSynthesis.speak(speech);
    };

    /*
     * Ask the current question when the question changes.
     */
    useEffect(() => {
        if (
            questionList.length > 0 &&
            currentQuestion < questionList.length
        ) {
            setAnswer("");
            setSubmitted(false);
            resetTranscript();

            const timer = setTimeout(() => {
                speakQuestion();
                setInterviewStarted(true);
            }, 500);

            return () => {
                clearTimeout(timer);
                window.speechSynthesis.cancel();
            };
        }
    }, [currentQuestion]);

    /*
     * Tab-switch detection.
     *
     * Reality check:
     * Browser tab detection is not a perfect anti-cheating system.
     * It only detects visibility changes that the browser exposes.
     */
    useEffect(() => {
        const handleVisibility = () => {
            if (!document.hidden) return;

            setViolations((previous) => {
                const count = previous + 1;

                if (count < 2) {
                    alert(
                        `Warning! Please stay on the interview page. (${count}/2)`
                    );
                }

                if (count >= 2) {
                    window.speechSynthesis.cancel();
                    SpeechRecognition.stopListening();
                    setIsRecording(false);

                    alert(
                        "Interview terminated due to multiple tab switches."
                    );

                    navigate("/results", {
                        state: {
                            terminated: true,
                            questions: questionList,
                            answers,
                        },
                    });
                }

                return count;
            });
        };

        document.addEventListener(
            "visibilitychange",
            handleVisibility
        );

        return () => {
            document.removeEventListener(
                "visibilitychange",
                handleVisibility
            );
        };
    }, [answers, navigate, questionList]);

    /*
     * Submit the spoken answer.
     *
     * This is intentionally separate from Next Question.
     * The candidate must submit the recorded answer first.
     */
    const handleSubmit = () => {
        if (submitted) return;

        const finalAnswer = answer.trim();

        if (!finalAnswer) {
            alert(
                "No answer was detected. Please click Start Recording and speak your answer."
            );
            return;
        }

        SpeechRecognition.stopListening();
        setIsRecording(false);
        setSubmitted(true);

        console.log(
            `Answer submitted for Question ${currentQuestion + 1}:`,
            finalAnswer
        );
    };

    /*
     * Move to the next question only after the answer is submitted.
     */
    const handleNext = () => {
        if (!submitted) {
            alert("Please submit your recorded answer first.");
            return;
        }

        const finalAnswer = answer.trim();

        const updatedAnswers = [
            ...answers,
            finalAnswer,
        ];

        setAnswers(updatedAnswers);

        SpeechRecognition.stopListening();
        setIsRecording(false);
        resetTranscript();
        window.speechSynthesis.cancel();

        /*
         * More questions remain.
         */
        if (currentQuestion < questionList.length - 1) {
            setCurrentQuestion((previous) => previous + 1);
            setAnswer("");
            setSubmitted(false);
            return;
        }

        /*
         * Interview is complete.
         *
         * IMPORTANT:
         * No evaluation is performed here.
         * The Results page sends ALL questions + ALL answers
         * to the backend for one final AI evaluation.
         */
        console.log("========== INTERVIEW FINISHED ==========");
        console.log("Questions:", questionList);
        console.log("Answers:", updatedAnswers);

        navigate("/results", {
            state: {
                questions: questionList,
                answers: updatedAnswers,
                terminated: false,
            },
        });
    };

    /*
     * Stop everything if the component is left.
     */
    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
            SpeechRecognition.stopListening();
        };
    }, []);

    const minutes = Math.floor(seconds / 60);
    const sec = seconds % 60;

    if (!browserSupportsSpeechRecognition) {
        return (
            <div className="results-page">
                <div className="result-card">
                    <h2>Speech Recognition Not Supported</h2>
                    <p>
                        Please open this interview in a browser that
                        supports speech recognition, such as Chrome.
                    </p>

                    <button
                        className="upload-btn"
                        onClick={() => navigate("/dashboard")}
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (questionList.length === 0) {
        return (
            <div className="results-page">
                <div className="result-card">
                    <h2>No Interview Questions Found</h2>

                    <button
                        className="upload-btn"
                        onClick={() => navigate("/dashboard")}
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="interview-page">

            {/* ================= LEFT PANEL ================= */}

            <div className="left-panel">

                {/* AI HR */}

                <div className="panel fade-up">

                    <div className="hr-avatar">
                        <img
                            src={hr}
                            alt="AI HR"
                        />
                    </div>

                    <h2
                        style={{
                            textAlign: "center",
                            marginTop: "15px",
                        }}
                    >
                        Sophia AI HR
                    </h2>

                    <p
                        style={{
                            textAlign: "center",
                            color: "#94a3b8",
                            marginTop: "10px",
                        }}
                    >
                        Your Virtual Interviewer
                    </p>

                </div>

                {/* TIMER */}

                <div className="panel fade-up">

                    <h3>Interview Timer</h3>

                    <div className="timer">

                        {String(minutes).padStart(2, "0")} :
                        {String(sec).padStart(2, "0")}

                    </div>

                </div>

                {/* PROGRESS */}

                <div className="panel fade-up">

                    <h3>Progress</h3>

                    <p>
                        Question {currentQuestion + 1} of{" "}
                        {questionList.length}
                    </p>

                    <div className="progress-bar">

                        <div
                            className="progress-fill"
                            style={{
                                width: `${
                                    ((currentQuestion + 1) /
                                        questionList.length) *
                                    100
                                }%`,
                            }}
                        />

                    </div>

                    <br />

                    <h3>Tab Warnings</h3>

                    <p>
                        {violations} / 2
                    </p>

                </div>

                {/* CAMERA */}

                <div className="panel fade-up">

                    <h3>Camera Monitor</h3>

                    <div className="camera-container">

                        <Webcam
                            audio={false}
                            mirrored={true}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{
                                width: 300,
                                height: 220,
                                facingMode: "user",
                            }}
                        />

                    </div>

                </div>

            </div>

            {/* ================= RIGHT PANEL ================= */}

            <div className="right-panel">

                {/* QUESTION */}

                <div className="panel fade-up">

                    <h2>
                        AI Mock Interview
                    </h2>

                    <br />

                    <div className="question-box">

                        {questionList[currentQuestion]}

                    </div>

                    <p
                        style={{
                            marginTop: "15px",
                            color: "#94a3b8",
                        }}
                    >
                        {interviewStarted && !submitted
                            ? isRecording
                                ? "🎙️ Listening to your answer..."
                                : "🔊 Sophia is asking the question..."
                            : submitted
                                ? "✅ Answer submitted"
                                : ""}
                    </p>

                </div>

                {/* ANSWER */}

                <div className="panel answer-box fade-up">

                    <h3>
                        Your Recorded Answer
                    </h3>

                    <br />

                    <textarea
                        value={answer}
                        readOnly
                        placeholder="Your spoken answer will appear here..."
                    />

                    <div
                        className="speech-buttons"
                        style={{
                            display: "flex",
                            gap: "12px",
                            flexWrap: "wrap",
                            marginTop: "15px",
                        }}
                    >

                        <button
                            onClick={startListening}
                            disabled={
                                isRecording ||
                                submitted
                            }
                        >
                            🎤 Start Recording
                        </button>

                        <button
                            onClick={stopListening}
                            disabled={!isRecording}
                        >
                            ⏹ Stop Recording
                        </button>

                        <button
                            onClick={handleSubmit}
                            disabled={
                                submitted ||
                                !answer.trim()
                            }
                        >
                            {submitted
                                ? "✅ Answer Submitted"
                                : "✅ Submit Answer"}
                        </button>

                    </div>

                </div>

                {/* NEXT */}

                <button
                    className="next-btn"
                    onClick={handleNext}
                    disabled={!submitted}
                    style={{
                        opacity: submitted ? 1 : 0.5,
                        cursor: submitted
                            ? "pointer"
                            : "not-allowed",
                    }}
                >
                    {currentQuestion ===
                    questionList.length - 1
                        ? "Finish Interview"
                        : "Next Question"}
                </button>

            </div>

        </div>
    );
}

export default Interview;