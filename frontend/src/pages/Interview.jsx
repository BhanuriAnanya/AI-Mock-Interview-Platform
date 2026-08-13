import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SpeechRecognition, {
    useSpeechRecognition,
} from "react-speech-recognition";

import hr from "../assets/hr.svg";
import CameraMonitor from "../components/CameraMonitor";

import "../index.css";

function Interview() {

    const navigate = useNavigate();
    const location = useLocation();

    const questionData = location.state?.questions || "";

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

    const [interviewStarted, setInterviewStarted] =
        useState(false);

    /*
     * Camera states:
     *
     * checking
     * enabled
     * disabled
     */

    const [cameraStatus, setCameraStatus] =
        useState("checking");

    const cameraWasDisabled =
        useRef(false);

    const interviewInitialized =
        useRef(false);


    const {
        transcript,
        resetTranscript,
        browserSupportsSpeechRecognition,
        listening,
    } = useSpeechRecognition();


    /*
     * Redirect if interview was opened
     * without questions.
     */

    useEffect(() => {

        if (
            !location.state ||
            questionList.length === 0
        ) {

            navigate("/dashboard");

        }

    }, [
        location.state,
        navigate,
        questionList.length
    ]);


    /*
     * Keep recording state synchronized
     * with speech recognition.
     */

    useEffect(() => {

        setIsRecording(listening);

    }, [listening]);


    /*
     * Put recognized speech into answer box.
     */

    useEffect(() => {

        if (listening || transcript) {

            setAnswer(transcript);

        }

    }, [transcript, listening]);


    /*
     * Interview timer.
     *
     * IMPORTANT:
     * Timer only runs after interview starts.
     */

    useEffect(() => {

        if (!interviewStarted) {
            return;
        }

        const timer = setInterval(() => {

            setSeconds((prev) => prev + 1);

        }, 1000);

        return () => clearInterval(timer);

    }, [interviewStarted]);


    /*
     * Start speech recognition.
     */

    const startListening = () => {

        if (
            submitted ||
            cameraStatus !== "enabled"
        ) {

            if (cameraStatus !== "enabled") {

                alert(
                    "Camera access is required to continue the interview."
                );

            }

            return;
        }


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
     */

    const speakQuestion = () => {

        if (
            !questionList[currentQuestion] ||
            cameraStatus !== "enabled"
        ) {

            return;

        }


        window.speechSynthesis.cancel();


        const speech =
            new SpeechSynthesisUtterance(
                questionList[currentQuestion]
            );


        const voices =
            window.speechSynthesis.getVoices();


        const preferredVoice =
            voices.find(
                (voice) =>
                    voice.lang === "en-US" &&
                    /Google|Microsoft|Samantha|Natural/i.test(
                        voice.name
                    )
            ) ||
            voices.find(
                (voice) =>
                    voice.lang
                        .toLowerCase()
                        .startsWith("en")
            );


        if (preferredVoice) {

            speech.voice =
                preferredVoice;

        }


        speech.lang = "en-US";

        speech.rate = 0.95;

        speech.pitch = 1.0;

        speech.volume = 1;


        /*
         * Automatically start recording
         * after Sophia finishes asking.
         */

        speech.onend = () => {

            if (
                !submitted &&
                cameraStatus === "enabled"
            ) {

                startListening();

            }

        };


        window.speechSynthesis.speak(
            speech
        );

    };


    /*
     * CAMERA STATUS
     *
     * This is the important connection between
     * CameraMonitor and Interview.
     */

    const handleCameraStatusChange =
        (status) => {

            console.log(
                "Camera status:",
                status
            );


            setCameraStatus(status);

        };


    /*
     * Start / pause interview depending
     * on camera status.
     */

    useEffect(() => {

        /*
         * Camera still checking.
         */

        if (
            cameraStatus === "checking"
        ) {

            return;

        }


        /*
         * CAMERA DISABLED
         */

        if (
            cameraStatus === "disabled"
        ) {

            /*
             * Stop speech immediately.
             */

            window.speechSynthesis.cancel();

            SpeechRecognition.stopListening();

            setIsRecording(false);


            /*
             * Only mark this if interview
             * had already started.
             */

            if (interviewStarted) {

                cameraWasDisabled.current =
                    true;

            }


            return;

        }


        /*
         * CAMERA ENABLED
         */

        if (
            cameraStatus === "enabled"
        ) {

            /*
             * First time camera becomes enabled.
             *
             * Start the interview.
             */

            if (
                !interviewInitialized.current
            ) {

                interviewInitialized.current =
                    true;

                const timer =
                    setTimeout(() => {

                        setInterviewStarted(
                            true
                        );

                        speakQuestion();

                    }, 500);


                return () =>
                    clearTimeout(timer);

            }


            /*
             * Camera was previously disabled.
             *
             * Resume the current question.
             */

            if (
                cameraWasDisabled.current
            ) {

                cameraWasDisabled.current =
                    false;


                const timer =
                    setTimeout(() => {

                        if (
                            cameraStatus ===
                            "enabled"
                        ) {

                            speakQuestion();

                        }

                    }, 500);


                return () =>
                    clearTimeout(timer);

            }

        }

    }, [cameraStatus]);


    /*
     * Ask the next question when the question
     * changes.
     *
     * Only works when camera is enabled.
     */

    useEffect(() => {

        if (
            !interviewInitialized.current ||
            cameraStatus !== "enabled" ||
            !questionList[currentQuestion]
        ) {

            return;

        }


        /*
         * Don't speak the first question again.
         *
         * First question is already started
         * by the camera-status effect.
         */

        if (currentQuestion === 0) {

            return;

        }


        setAnswer("");

        setSubmitted(false);

        resetTranscript();


        const timer =
            setTimeout(() => {

                speakQuestion();

            }, 500);


        return () => {

            clearTimeout(timer);

            window.speechSynthesis.cancel();

        };

    }, [currentQuestion]);


    /*
     * TAB SWITCH DETECTION
     */

    useEffect(() => {

        const handleVisibility =
            () => {

                if (!document.hidden) {

                    return;

                }


                setViolations(
                    (previous) => {

                        const count =
                            previous + 1;


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


                            navigate(
                                "/results",
                                {
                                    state: {
                                        terminated: true,
                                        questions:
                                            questionList,
                                        answers,
                                    },
                                }
                            );

                        }


                        return count;

                    }
                );

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

    }, [
        answers,
        navigate,
        questionList
    ]);


    /*
     * Submit spoken answer.
     */

    const handleSubmit = () => {

        /*
         * Camera must be enabled.
         */

        if (
            cameraStatus !== "enabled"
        ) {

            alert(
                "Please enable your camera before continuing."
            );

            return;

        }


        if (submitted) {

            return;

        }


        const finalAnswer =
            answer.trim();


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
            `Answer submitted for Question ${
                currentQuestion + 1
            }:`,
            finalAnswer
        );

    };


    /*
     * Move to next question.
     */

    const handleNext = () => {

        /*
         * Camera check.
         */

        if (
            cameraStatus !== "enabled"
        ) {

            alert(
                "⚠️ Camera is required to continue the interview. Please enable your camera."
            );

            return;

        }


        if (!submitted) {

            alert(
                "Please submit your recorded answer first."
            );

            return;

        }


        const finalAnswer =
            answer.trim();


        const updatedAnswers = [
            ...answers,
            finalAnswer
        ];


        setAnswers(
            updatedAnswers
        );


        SpeechRecognition.stopListening();

        setIsRecording(false);

        resetTranscript();

        window.speechSynthesis.cancel();


        /*
         * More questions remain.
         */

        if (
            currentQuestion <
            questionList.length - 1
        ) {

            setCurrentQuestion(
                (previous) =>
                    previous + 1
            );

            setAnswer("");

            setSubmitted(false);

            return;

        }


        /*
         * Interview complete.
         */

        console.log(
            "========== INTERVIEW FINISHED =========="
        );

        console.log(
            "Questions:",
            questionList
        );

        console.log(
            "Answers:",
            updatedAnswers
        );


        navigate(
            "/results",
            {
                state: {
                    questions:
                        questionList,

                    answers:
                        updatedAnswers,

                    terminated: false,
                },
            }
        );

    };


    /*
     * Stop everything when component leaves.
     */

    useEffect(() => {

        return () => {

            window.speechSynthesis.cancel();

            SpeechRecognition.stopListening();

        };

    }, []);


    const minutes =
        Math.floor(seconds / 60);

    const sec =
        seconds % 60;


    /*
     * Speech recognition browser check.
     */

    if (
        !browserSupportsSpeechRecognition
    ) {

        return (

            <div className="results-page">

                <div className="result-card">

                    <h2>
                        Speech Recognition Not Supported
                    </h2>

                    <p>
                        Please open this interview in a
                        browser that supports speech
                        recognition, such as Chrome.
                    </p>


                    <button
                        className="upload-btn"
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >
                        Back to Dashboard
                    </button>

                </div>

            </div>

        );

    }


    /*
     * No questions.
     */

    if (
        questionList.length === 0
    ) {

        return (

            <div className="results-page">

                <div className="result-card">

                    <h2>
                        No Interview Questions Found
                    </h2>


                    <button
                        className="upload-btn"
                        onClick={() =>
                            navigate("/dashboard")
                        }
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
                            textAlign:
                                "center",
                            marginTop:
                                "15px",
                        }}
                    >
                        Sophia AI HR
                    </h2>


                    <p
                        style={{
                            textAlign:
                                "center",
                            color:
                                "#94a3b8",
                            marginTop:
                                "10px",
                        }}
                    >
                        Your Virtual Interviewer
                    </p>

                </div>


                {/* TIMER */}

                <div className="panel fade-up">

                    <h3>
                        Interview Timer
                    </h3>


                    <div className="timer">

                        {String(minutes).padStart(
                            2,
                            "0"
                        )}

                        {" : "}

                        {String(sec).padStart(
                            2,
                            "0"
                        )}

                    </div>

                </div>


                {/* PROGRESS */}

                <div className="panel fade-up">

                    <h3>
                        Progress
                    </h3>


                    <p>

                        Question{" "}

                        {currentQuestion + 1}

                        {" "}of{" "}

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


                    <h3>
                        Tab Warnings
                    </h3>


                    <p>
                        {violations} / 2
                    </p>

                </div>


                {/* CAMERA */}

                <div className="panel fade-up">

                    <h3>
                        Camera Monitor
                    </h3>


                    <CameraMonitor
                        onCameraStatusChange={
                            handleCameraStatusChange
                        }
                    />


                    /*
                     * Camera status indicator
                     */

                    <div
                        style={{
                            marginTop:
                                "10px",
                            textAlign:
                                "center",
                            fontWeight:
                                "600",
                        }}
                    >

                        {cameraStatus ===
                            "checking" && (

                            <span>
                                🔍 Checking camera...
                            </span>

                        )}


                        {cameraStatus ===
                            "enabled" && (

                            <span
                                style={{
                                    color:
                                        "#22c55e",
                                }}
                            >
                                🟢 Camera Enabled
                            </span>

                        )}


                        {cameraStatus ===
                            "disabled" && (

                            <span
                                style={{
                                    color:
                                        "#ef4444",
                                }}
                            >
                                🔴 Camera Disabled
                            </span>

                        )}

                    </div>

                </div>

            </div>


            {/* ================= RIGHT PANEL ================= */}

            <div className="right-panel">


                {/* CAMERA WARNING */}

                {cameraStatus !==
                    "enabled" && (

                    <div
                        className="panel fade-up"
                        style={{
                            border:
                                "1px solid #ef4444",
                            background:
                                "rgba(239, 68, 68, 0.08)",
                            marginBottom:
                                "15px",
                            textAlign:
                                "center",
                        }}
                    >

                        <h3>

                            {cameraStatus ===
                            "checking"
                                ? "🔍 Checking Camera"
                                : "⚠️ Camera Required"}

                        </h3>


                        <p
                            style={{
                                marginTop:
                                    "8px",
                                color:
                                    "#cbd5e1",
                            }}
                        >

                            {cameraStatus ===
                            "checking"

                                ? "Please allow camera access to start your interview."

                                : "Your camera must be enabled to continue the interview."}

                        </p>

                    </div>

                )}


                {/* QUESTION */}

                <div className="panel fade-up">

                    <h2>
                        AI Mock Interview
                    </h2>


                    <br />


                    <div className="question-box">

                        {cameraStatus ===
                        "enabled"

                            ? questionList[
                                currentQuestion
                            ]

                            : "Enable your camera to begin the interview."}

                    </div>


                    <p
                        style={{
                            marginTop:
                                "15px",
                            color:
                                "#94a3b8",
                        }}
                    >

                        {cameraStatus ===
                            "enabled" &&

                            interviewStarted &&

                            !submitted

                            ? isRecording

                                ? "🎙️ Listening to your answer..."

                                : "🔊 Sophia is asking the question..."

                            : cameraStatus ===
                                "disabled"

                                ? "⚠️ Interview paused because the camera is disabled."

                                : cameraStatus ===
                                    "checking"

                                    ? "🔍 Waiting for camera permission..."

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
                        placeholder={
                            cameraStatus ===
                            "enabled"

                                ? "Your spoken answer will appear here..."

                                : "Enable your camera before answering."
                        }
                    />


                    <div
                        className="speech-buttons"
                        style={{
                            display:
                                "flex",
                            gap:
                                "12px",
                            flexWrap:
                                "wrap",
                            marginTop:
                                "15px",
                        }}
                    >


                        <button
                            onClick={
                                startListening
                            }
                            disabled={
                                cameraStatus !==
                                    "enabled" ||

                                isRecording ||

                                submitted
                            }
                        >
                            🎤 Start Recording
                        </button>


                        <button
                            onClick={
                                stopListening
                            }
                            disabled={
                                !isRecording
                            }
                        >
                            ⏹ Stop Recording
                        </button>


                        <button
                            onClick={
                                handleSubmit
                            }
                            disabled={
                                cameraStatus !==
                                    "enabled" ||

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
                    onClick={
                        handleNext
                    }
                    disabled={
                        cameraStatus !==
                            "enabled" ||

                        !submitted
                    }
                    style={{
                        opacity:
                            cameraStatus ===
                                "enabled" &&
                            submitted
                                ? 1
                                : 0.5,

                        cursor:
                            cameraStatus ===
                                "enabled" &&
                            submitted
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