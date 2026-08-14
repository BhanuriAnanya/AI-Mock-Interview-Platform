import {
    useEffect,
    useMemo,
    useRef,
    useState,
    useCallback
} from "react";

import {
    useLocation,
    useNavigate
} from "react-router-dom";

import SpeechRecognition, {
    useSpeechRecognition
} from "react-speech-recognition";

import hr from "../assets/hr.svg";
import CameraMonitor from "../components/CameraMonitor";

import "../index.css";


function Interview() {

    const navigate = useNavigate();
    const location = useLocation();


    // =========================================================
    // QUESTIONS
    // =========================================================

    const questionData =
        location.state?.questions || "";


    const questionList = useMemo(() => {

        return questionData
            .split("\n")
            .map((question) =>
                question
                    .replace(/^\s*[-*•]\s*/, "")
                    .replace(/^\s*\d+[\.\)]\s*/, "")
                    .trim()
            )
            .filter(
                (question) =>
                    question.length > 0
            );

    }, [questionData]);


    // =========================================================
    // INTERVIEW STATE
    // =========================================================

    const [
        currentQuestion,
        setCurrentQuestion
    ] = useState(0);


    const [
        answer,
        setAnswer
    ] = useState("");


    const [
        answers,
        setAnswers
    ] = useState([]);


    const [
        submitted,
        setSubmitted
    ] = useState(false);


    const [
        interviewStarted,
        setInterviewStarted
    ] = useState(false);


    // =========================================================
    // CAMERA
    // =========================================================

    const [
        cameraStatus,
        setCameraStatus
    ] = useState("checking");


    // =========================================================
    // SPEECH
    // =========================================================

    const [
        isSpeaking,
        setIsSpeaking
    ] = useState(false);


    const [
        speechError,
        setSpeechError
    ] = useState(false);


    // =========================================================
    // RECORDING
    // =========================================================

    const [
        isRecording,
        setIsRecording
    ] = useState(false);


    // =========================================================
    // TIMER
    // =========================================================

    const [
        seconds,
        setSeconds
    ] = useState(0);


    // =========================================================
    // TAB VIOLATIONS
    // =========================================================

    const [
        violations,
        setViolations
    ] = useState(0);


    // =========================================================
    // REFS
    // =========================================================

    const mountedRef =
        useRef(true);


    const speechQuestionRef =
        useRef(null);


    const previousCameraStatus =
        useRef("checking");


    const cameraWasDisabled =
        useRef(false);


    // =========================================================
    // SPEECH RECOGNITION
    // =========================================================

    const {
        transcript,
        resetTranscript,
        browserSupportsSpeechRecognition,
        listening
    } = useSpeechRecognition();


    // =========================================================
    // COMPONENT CLEANUP
    // =========================================================

    useEffect(() => {

        mountedRef.current = true;

        return () => {

            mountedRef.current = false;

            window.speechSynthesis.cancel();

            SpeechRecognition.stopListening();

        };

    }, []);


    // =========================================================
    // CHECK QUESTIONS
    // =========================================================

    useEffect(() => {

        if (
            !location.state ||
            questionList.length === 0
        ) {

            navigate("/dashboard");

        }

    }, [
        location.state,
        questionList.length,
        navigate
    ]);


    // =========================================================
    // CAMERA STATUS
    // =========================================================

    const handleCameraStatusChange =
        useCallback((status) => {

            console.log(
                "Camera status:",
                status
            );

            setCameraStatus(status);

        }, []);


    // =========================================================
    // RECORDING STATUS
    // =========================================================

    useEffect(() => {

        setIsRecording(listening);

    }, [listening]);


    // =========================================================
    // TRANSCRIPT → ANSWER
    // =========================================================

    useEffect(() => {

        if (
            transcript ||
            listening
        ) {

            setAnswer(transcript);

        }

    }, [
        transcript,
        listening
    ]);


    // =========================================================
    // TIMER
    // =========================================================

    useEffect(() => {

        if (!interviewStarted) {
            return;
        }


        const timer =
            setInterval(() => {

                setSeconds(
                    (previous) =>
                        previous + 1
                );

            }, 1000);


        return () => {

            clearInterval(timer);

        };

    }, [
        interviewStarted
    ]);


    // =========================================================
    // SPEAK QUESTION
    // =========================================================

    const speakQuestion =
        useCallback(
            (questionText) => {

                if (!questionText) {

                    console.log(
                        "No question to speak."
                    );

                    return;

                }


                if (
                    cameraStatus !==
                    "enabled"
                ) {

                    console.log(
                        "Camera is not enabled. Speech cancelled."
                    );

                    return;

                }


                console.log(
                    "Attempting to speak:",
                    questionText
                );


                // Stop anything already speaking
                window
                    .speechSynthesis
                    .cancel();


                setIsSpeaking(true);

                setSpeechError(false);


                speechQuestionRef.current =
                    questionText;


                const utterance =
                    new SpeechSynthesisUtterance(
                        questionText
                    );


                utterance.lang =
                    "en-US";


                utterance.rate =
                    0.9;


                utterance.pitch =
                    1;


                utterance.volume =
                    1;


                // -------------------------------------------------
                // Get browser voices
                // -------------------------------------------------

                const voices =
                    window
                        .speechSynthesis
                        .getVoices();


                console.log(
                    "Available voices:",
                    voices
                );


                const englishVoice =
                    voices.find(
                        (voice) =>
                            voice.lang
                                .toLowerCase() ===
                            "en-us"
                    ) ||

                    voices.find(
                        (voice) =>
                            voice.lang
                                .toLowerCase()
                                .startsWith("en")
                    );


                if (englishVoice) {

                    utterance.voice =
                        englishVoice;

                }


                // -------------------------------------------------
                // Speech events
                // -------------------------------------------------

                utterance.onstart = () => {

                    console.log(
                        "🔊 Sophia started speaking"
                    );

                    if (
                        mountedRef.current
                    ) {

                        setIsSpeaking(
                            true
                        );

                    }

                };


                utterance.onend = () => {

                    console.log(
                        "🔊 Sophia finished speaking"
                    );

                    if (
                        mountedRef.current
                    ) {

                        setIsSpeaking(
                            false
                        );

                    }

                };


                utterance.onerror = (
                    event
                ) => {

                    console.error(
                        "❌ Speech synthesis error:",
                        event
                    );

                    if (
                        mountedRef.current
                    ) {

                        setIsSpeaking(
                            false
                        );

                        setSpeechError(
                            true
                        );

                    }

                };


                // -------------------------------------------------
                // Speak
                // -------------------------------------------------

                window
                    .speechSynthesis
                    .speak(
                        utterance
                    );

            },
            [
                cameraStatus
            ]
        );


    // =========================================================
    // START INTERVIEW
    // IMPORTANT:
    // This is called DIRECTLY from button click.
    // This allows browser speech synthesis to work.
    // =========================================================

    const startInterview = () => {

        if (
            cameraStatus !==
            "enabled"
        ) {

            alert(
                "⚠️ Please enable your camera before starting the interview."
            );

            return;

        }


        if (
            questionList.length === 0
        ) {

            alert(
                "No interview questions found."
            );

            return;

        }


        console.log(
            "Starting interview..."
        );


        setInterviewStarted(
            true
        );


        setSubmitted(false);

        setAnswer("");

        resetTranscript();


        speechQuestionRef.current =
            null;


        // IMPORTANT:
        // Speak directly after the button click.
        // No useEffect here.

        speakQuestion(
            questionList[0]
        );

    };


    // =========================================================
    // START RECORDING
    // =========================================================

    const startListening = () => {

        if (
            cameraStatus !==
            "enabled"
        ) {

            alert(
                "⚠️ Camera access is required."
            );

            return;

        }


        if (
            !interviewStarted
        ) {

            alert(
                "Please start the interview first."
            );

            return;

        }


        if (
            submitted
        ) {

            return;

        }


        // Stop Sophia
        window
            .speechSynthesis
            .cancel();


        setIsSpeaking(false);


        resetTranscript();

        setAnswer("");


        SpeechRecognition.startListening({

            continuous:
                true,

            language:
                "en-IN"

        });


        setIsRecording(
            true
        );

    };


    // =========================================================
    // STOP RECORDING
    // =========================================================

    const stopListening = () => {

        SpeechRecognition
            .stopListening();


        setIsRecording(
            false
        );

    };


    // =========================================================
    // SUBMIT ANSWER
    // =========================================================

    const handleSubmit = () => {

        if (
            cameraStatus !==
            "enabled"
        ) {

            alert(
                "⚠️ Please enable your camera."
            );

            return;

        }


        if (
            !interviewStarted
        ) {

            alert(
                "Please start the interview first."
            );

            return;

        }


        if (
            submitted
        ) {

            return;

        }


        const finalAnswer =
            answer.trim();


        if (
            !finalAnswer
        ) {

            alert(
                "No answer detected. Please record your answer first."
            );

            return;

        }


        SpeechRecognition
            .stopListening();


        setIsRecording(
            false
        );


        setSubmitted(
            true
        );


        console.log(
            "Answer submitted:",
            finalAnswer
        );

    };


    // =========================================================
    // REPLAY QUESTION
    // =========================================================

    const replayQuestion = () => {

        if (
            cameraStatus !==
            "enabled"
        ) {

            alert(
                "⚠️ Please enable your camera first."
            );

            return;

        }


        if (
            !interviewStarted
        ) {

            return;

        }


        if (
            isRecording
        ) {

            SpeechRecognition
                .stopListening();

            setIsRecording(
                false
            );

        }


        const question =
            questionList[
                currentQuestion
            ];


        speechQuestionRef.current =
            null;


        speakQuestion(
            question
        );

    };


    // =========================================================
    // NEXT QUESTION
    // =========================================================

    const handleNext = () => {

        if (
            cameraStatus !==
            "enabled"
        ) {

            alert(
                "⚠️ Camera is required to continue."
            );

            return;

        }


        if (
            !submitted
        ) {

            alert(
                "Please submit your answer first."
            );

            return;

        }


        const finalAnswer =
            answer.trim();


        const updatedAnswers =
            [
                ...answers,
                finalAnswer
            ];


        setAnswers(
            updatedAnswers
        );


        SpeechRecognition
            .stopListening();


        setIsRecording(
            false
        );


        window
            .speechSynthesis
            .cancel();


        setIsSpeaking(
            false
        );


        resetTranscript();


        // -------------------------------------------------
        // More questions
        // -------------------------------------------------

        if (
            currentQuestion <
            questionList.length - 1
        ) {

            const nextQuestionIndex =
                currentQuestion + 1;


            const nextQuestion =
                questionList[
                    nextQuestionIndex
                ];


            setCurrentQuestion(
                nextQuestionIndex
            );


            setAnswer("");

            setSubmitted(false);


            // Give React a tiny amount of time
            // to update the UI, then speak.
            setTimeout(() => {

                speechQuestionRef.current =
                    null;

                speakQuestion(
                    nextQuestion
                );

            }, 200);


            return;

        }


        // -------------------------------------------------
        // Interview finished
        // -------------------------------------------------

        navigate(
            "/results",
            {
                state: {

                    questions:
                        questionList,

                    answers:
                        updatedAnswers,

                    terminated:
                        false

                }
            }
        );

    };


    // =========================================================
    // CAMERA DISABLE HANDLING
    // =========================================================

    useEffect(() => {

        const previousStatus =
            previousCameraStatus.current;


        // Camera disabled during interview
        if (
            cameraStatus ===
                "disabled" &&
            interviewStarted
        ) {

            console.log(
                "Camera disabled during interview."
            );


            cameraWasDisabled.current =
                true;


            window
                .speechSynthesis
                .cancel();


            setIsSpeaking(
                false
            );


            SpeechRecognition
                .stopListening();


            setIsRecording(
                false
            );

        }


        // Camera enabled again
        if (
            cameraStatus ===
                "enabled" &&
            previousStatus ===
                "disabled" &&
            cameraWasDisabled.current
        ) {

            cameraWasDisabled.current =
                false;


            alert(
                "✅ Camera enabled again. You can continue the interview."
            );

        }


        previousCameraStatus.current =
            cameraStatus;

    }, [
        cameraStatus,
        interviewStarted
    ]);


    // =========================================================
    // TAB SWITCH DETECTION
    // =========================================================

    useEffect(() => {

        const handleVisibility =
            () => {

                if (
                    !document.hidden
                ) {

                    return;

                }


                if (
                    !interviewStarted
                ) {

                    return;

                }


                setViolations(
                    (previous) => {

                        const count =
                            previous + 1;


                        if (
                            count < 2
                        ) {

                            alert(
                                `⚠️ Warning! Please stay on the interview page. (${count}/2)`
                            );

                        }


                        if (
                            count >= 2
                        ) {

                            window
                                .speechSynthesis
                                .cancel();


                            SpeechRecognition
                                .stopListening();


                            setIsRecording(
                                false
                            );


                            alert(
                                "Interview terminated due to multiple tab switches."
                            );


                            navigate(
                                "/results",
                                {
                                    state: {

                                        terminated:
                                            true,

                                        questions:
                                            questionList,

                                        answers:
                                            answers

                                    }
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
        interviewStarted,
        answers,
        questionList,
        navigate
    ]);


    // =========================================================
    // TIMER
    // =========================================================

    const minutes =
        Math.floor(
            seconds / 60
        );


    const remainingSeconds =
        seconds % 60;


    // =========================================================
    // SPEECH SUPPORT
    // =========================================================

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
                        Please use Chrome or another
                        supported browser.
                    </p>


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

            </div>

        );

    }


    // =========================================================
    // NO QUESTIONS
    // =========================================================

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
                            navigate(
                                "/dashboard"
                            )
                        }
                    >
                        Back to Dashboard
                    </button>

                </div>

            </div>

        );

    }


    // =========================================================
    // UI
    // =========================================================

    return (

        <div className="interview-page">


            {/* =================================================
                LEFT PANEL
            ================================================= */}

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
                                "15px"
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
                                "10px"
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

                        {String(
                            minutes
                        ).padStart(
                            2,
                            "0"
                        )}

                        {" : "}

                        {String(
                            remainingSeconds
                        ).padStart(
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
                                width:
                                    `${
                                        (
                                            (
                                                currentQuestion +
                                                1
                                            ) /
                                            questionList.length
                                        ) *
                                        100
                                    }%`
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


                    <div
                        style={{
                            marginTop:
                                "10px",

                            textAlign:
                                "center",

                            fontWeight:
                                "600"
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
                                        "#22c55e"
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
                                        "#ef4444"
                                }}
                            >
                                🔴 Camera Disabled
                            </span>

                        )}

                    </div>

                </div>

            </div>


            {/* =================================================
                RIGHT PANEL
            ================================================= */}

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
                                "center"
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
                                    "#cbd5e1"
                            }}
                        >

                            {cameraStatus ===
                            "checking"

                                ? "Please allow camera access to start the interview."

                                : "Your camera must be enabled to continue the interview."}

                        </p>

                    </div>

                )}


                {/* =================================================
                    START INTERVIEW
                ================================================= */}

                {!interviewStarted ? (

                    <div
                        className="panel fade-up"
                        style={{
                            textAlign:
                                "center",

                            padding:
                                "45px 30px"
                        }}
                    >

                        <h2>
                            Ready to Start?
                        </h2>


                        <p
                            style={{
                                color:
                                    "#94a3b8",

                                marginTop:
                                    "15px",

                                marginBottom:
                                    "25px"
                            }}
                        >
                            Make sure your camera is enabled.
                            Once you start, Sophia will ask
                            the first interview question aloud.
                        </p>


                        <button
                            className="next-btn"
                            onClick={
                                startInterview
                            }

                            disabled={
                                cameraStatus !==
                                "enabled"
                            }

                            style={{
                                opacity:
                                    cameraStatus ===
                                    "enabled"
                                        ? 1
                                        : 0.5,

                                cursor:
                                    cameraStatus ===
                                    "enabled"
                                        ? "pointer"
                                        : "not-allowed"
                            }}
                        >
                            🎤 Start Interview
                        </button>

                    </div>

                ) : (

                    <>

                        {/* =================================================
                            QUESTION
                        ================================================= */}

                        <div className="panel fade-up">

                            <h2>
                                AI Mock Interview
                            </h2>


                            <br />


                            <div className="question-box">

                                {questionList[
                                    currentQuestion
                                ]}

                            </div>


                            {/* SPEECH STATUS */}

                            <p
                                style={{
                                    marginTop:
                                        "15px",

                                    color:
                                        "#94a3b8"
                                }}
                            >

                                {isSpeaking

                                    ? "🔊 Sophia is asking the question..."

                                    : speechError

                                        ? "⚠️ Sophia could not speak the question. Click Replay Question."

                                        : isRecording

                                            ? "🎙️ Listening to your answer..."

                                            : submitted

                                                ? "✅ Answer submitted"

                                                : "🔊 Sophia has finished asking the question."}

                            </p>


                            {/* REPLAY */}

                            {!isRecording &&
                                !submitted && (

                                <button
                                    type="button"
                                    onClick={
                                        replayQuestion
                                    }

                                    style={{
                                        marginTop:
                                            "10px",

                                        padding:
                                            "8px 14px",

                                        borderRadius:
                                            "8px",

                                        border:
                                            "none",

                                        cursor:
                                            "pointer"
                                    }}
                                >
                                    🔊 Replay Question
                                </button>

                            )}

                        </div>


                        {/* =================================================
                            ANSWER
                        ================================================= */}

                        <div className="panel answer-box fade-up">

                            <h3>
                                Your Recorded Answer
                            </h3>


                            <br />


                            <textarea
                                value={
                                    answer
                                }
                                readOnly
                                placeholder="Your spoken answer will appear here..."
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
                                        "15px"
                                }}
                            >

                                <button
                                    onClick={
                                        startListening
                                    }

                                    disabled={
                                        isRecording ||
                                        submitted ||
                                        isSpeaking
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


                        {/* =================================================
                            NEXT
                        ================================================= */}

                        <button
                            className="next-btn"
                            onClick={
                                handleNext
                            }

                            disabled={
                                !submitted
                            }

                            style={{
                                opacity:
                                    submitted
                                        ? 1
                                        : 0.5,

                                cursor:
                                    submitted
                                        ? "pointer"
                                        : "not-allowed"
                            }}
                        >

                            {currentQuestion ===
                            questionList.length - 1

                                ? "Finish Interview"

                                : "Next Question"}

                        </button>

                    </>

                )}

            </div>

        </div>

    );

}


export default Interview;