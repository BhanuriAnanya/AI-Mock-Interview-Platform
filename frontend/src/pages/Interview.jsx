import {
    useEffect,
    useState,
    useRef,
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

import CameraMonitor
    from "../components/CameraMonitor";

import "../index.css";


function Interview() {

    const navigate = useNavigate();
    const location = useLocation();


    // =========================================================
    // QUESTIONS
    // =========================================================

    const questionData =
        location.state?.questions || "";


    const questionList =
        questionData
            .split("\n")
            .map((q) =>
                q
                    .replace(/^\s*[-*•]\s*/, "")
                    .replace(/^\s*\d+[\.\)]\s*/, "")
                    .trim()
            )
            .filter((q) => q.length > 0);


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
        isRecording,
        setIsRecording
    ] = useState(false);


    const [
        seconds,
        setSeconds
    ] = useState(0);


    const [
        interviewStarted,
        setInterviewStarted
    ] = useState(false);


    // =========================================================
    // CAMERA STATE
    // =========================================================

    const [
        cameraStatus,
        setCameraStatus
    ] = useState("checking");


    // =========================================================
    // SPEECH STATE
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
    // VIOLATIONS
    // =========================================================

    const [
        violations,
        setViolations
    ] = useState(0);


    // =========================================================
    // REFS
    // =========================================================

    const cameraWasDisabled =
        useRef(false);


    const interviewInitialized =
        useRef(false);


    const previousCameraStatus =
        useRef("checking");


    const speechQuestionRef =
        useRef(null);


    const mountedRef =
        useRef(true);


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
    // CLEANUP MOUNT
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
    // CAMERA CALLBACK
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
    // REDIRECT IF NO QUESTIONS
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
        navigate,
        questionList.length
    ]);


    // =========================================================
    // RECORDING STATE
    // =========================================================

    useEffect(() => {

        setIsRecording(listening);

    }, [listening]);


    // =========================================================
    // SPEECH → ANSWER
    // =========================================================

    useEffect(() => {

        if (listening || transcript) {

            setAnswer(transcript);

        }

    }, [
        transcript,
        listening
    ]);


    // =========================================================
    // INTERVIEW TIMER
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


        return () =>
            clearInterval(timer);

    }, [interviewStarted]);


    // =========================================================
    // SPEAK QUESTION
    // =========================================================

    const speakQuestion =
        useCallback(
            (questionText = null) => {

                const text =
                    questionText ||
                    questionList[currentQuestion];


                if (!text) {
                    return;
                }


                if (
                    cameraStatus !==
                    "enabled"
                ) {

                    return;

                }


                if (!mountedRef.current) {
                    return;
                }


                // Prevent speaking same question repeatedly
                if (
                    speechQuestionRef.current ===
                    `${currentQuestion}-${text}`
                ) {

                    return;

                }


                speechQuestionRef.current =
                    `${currentQuestion}-${text}`;


                // Stop previous speech
                window.speechSynthesis.cancel();


                setSpeechError(false);
                setIsSpeaking(true);


                const speech =
                    new SpeechSynthesisUtterance(
                        text
                    );


                speech.lang = "en-US";

                speech.rate = 0.9;

                speech.pitch = 1;

                speech.volume = 1;


                // -------------------------------------------------
                // Find best available English voice
                // -------------------------------------------------

                const selectVoice = () => {

                    const voices =
                        window
                            .speechSynthesis
                            .getVoices();


                    if (!voices.length) {
                        return null;
                    }


                    return (
                        voices.find(
                            (voice) =>
                                voice.lang
                                    .toLowerCase() ===
                                    "en-us" &&
                                /Google|Microsoft|Samantha|Natural/i
                                    .test(
                                        voice.name
                                    )
                        ) ||

                        voices.find(
                            (voice) =>
                                voice.lang
                                    .toLowerCase()
                                    .startsWith("en")
                        ) ||

                        voices[0]
                    );

                };


                const voice =
                    selectVoice();


                if (voice) {

                    speech.voice = voice;

                }


                // -------------------------------------------------
                // Speech starts
                // -------------------------------------------------

                speech.onstart = () => {

                    if (!mountedRef.current) {
                        return;
                    }

                    console.log(
                        "🔊 Sophia started speaking:"
                    );

                    console.log(text);

                    setIsSpeaking(true);

                };


                // -------------------------------------------------
                // Speech finished
                // -------------------------------------------------

                speech.onend = () => {

                    if (!mountedRef.current) {
                        return;
                    }

                    console.log(
                        "🔊 Sophia finished speaking"
                    );

                    setIsSpeaking(false);

                };


                // -------------------------------------------------
                // Speech error
                // -------------------------------------------------

                speech.onerror = (event) => {

                    console.error(
                        "Speech synthesis error:",
                        event
                    );

                    if (!mountedRef.current) {
                        return;
                    }

                    setIsSpeaking(false);

                    setSpeechError(true);

                };


                // -------------------------------------------------
                // Speak when browser voices are available
                // -------------------------------------------------

                const voices =
                    window
                        .speechSynthesis
                        .getVoices();


                if (voices.length > 0) {

                    // Voice already available
                    window.speechSynthesis.speak(
                        speech
                    );

                } else {

                    // Browser hasn't loaded voices yet
                    const handleVoicesChanged =
                        () => {

                            window
                                .speechSynthesis
                                .removeEventListener(
                                    "voiceschanged",
                                    handleVoicesChanged
                                );


                            const availableVoices =
                                window
                                    .speechSynthesis
                                    .getVoices();


                            const selectedVoice =
                                availableVoices.find(
                                    (voice) =>
                                        voice.lang
                                            .toLowerCase()
                                            .startsWith(
                                                "en"
                                            )
                                );


                            if (
                                selectedVoice
                            ) {

                                speech.voice =
                                    selectedVoice;

                            }


                            window
                                .speechSynthesis
                                .speak(
                                    speech
                                );

                        };


                    window
                        .speechSynthesis
                        .addEventListener(
                            "voiceschanged",
                            handleVoicesChanged
                        );


                    // Fallback in case voiceschanged
                    // does not fire
                    setTimeout(() => {

                        window
                            .speechSynthesis
                            .removeEventListener(
                                "voiceschanged",
                                handleVoicesChanged
                            );


                        if (
                            !window
                                .speechSynthesis
                                .speaking
                        ) {

                            window
                                .speechSynthesis
                                .speak(
                                    speech
                                );

                        }

                    }, 1000);

                }

            },
            [
                currentQuestion,
                cameraStatus,
                questionList
            ]
        );


    // =========================================================
    // CAMERA STATE HANDLING
    // =========================================================

    useEffect(() => {

        const previousStatus =
            previousCameraStatus.current;


        // -------------------------------------------------
        // Camera checking
        // -------------------------------------------------

        if (
            cameraStatus ===
            "checking"
        ) {

            previousCameraStatus.current =
                cameraStatus;

            return;

        }


        // -------------------------------------------------
        // Camera disabled
        // -------------------------------------------------

        if (
            cameraStatus ===
            "disabled"
        ) {

            // Stop Sophia
            window
                .speechSynthesis
                .cancel();


            setIsSpeaking(false);


            // Stop candidate recording
            SpeechRecognition
                .stopListening();


            setIsRecording(false);


            if (interviewStarted) {

                cameraWasDisabled.current =
                    true;

            }


            previousCameraStatus.current =
                cameraStatus;

            return;

        }


        // -------------------------------------------------
        // Camera enabled
        // -------------------------------------------------

        if (
            cameraStatus ===
            "enabled"
        ) {

            // First time camera is enabled
            if (
                !interviewInitialized.current
            ) {

                interviewInitialized.current =
                    true;


                setInterviewStarted(true);


                const timer =
                    setTimeout(() => {

                        speechQuestionRef.current =
                            null;

                        speakQuestion();

                    }, 1000);


                previousCameraStatus.current =
                    cameraStatus;


                return () =>
                    clearTimeout(timer);

            }


            // Camera was disabled during interview
            if (
                previousStatus ===
                    "disabled" &&
                cameraWasDisabled.current
            ) {

                cameraWasDisabled.current =
                    false;


                const timer =
                    setTimeout(() => {

                        speechQuestionRef.current =
                            null;

                        speakQuestion();

                    }, 800);


                previousCameraStatus.current =
                    cameraStatus;


                return () =>
                    clearTimeout(timer);

            }

        }


        previousCameraStatus.current =
            cameraStatus;

    }, [
        cameraStatus,
        interviewStarted,
        speakQuestion
    ]);


    // =========================================================
    // QUESTION CHANGE
    // =========================================================

    useEffect(() => {

        // First question is handled
        // when camera becomes enabled
        if (
            currentQuestion === 0
        ) {

            return;

        }


        if (
            cameraStatus !==
            "enabled"
        ) {

            return;

        }


        if (
            !interviewStarted
        ) {

            return;

        }


        setAnswer("");

        setSubmitted(false);

        resetTranscript();


        window
            .speechSynthesis
            .cancel();


        setIsSpeaking(false);


        // Allow the new question to speak
        speechQuestionRef.current =
            null;


        const timer =
            setTimeout(() => {

                speakQuestion();

            }, 700);


        return () => {

            clearTimeout(timer);

            window
                .speechSynthesis
                .cancel();

        };

    }, [
        currentQuestion
    ]);


    // =========================================================
    // START RECORDING
    // =========================================================

    const startListening = () => {

        if (
            cameraStatus !==
            "enabled"
        ) {

            alert(
                "⚠️ Camera access is required to continue the interview."
            );

            return;

        }


        if (submitted) {
            return;
        }


        // Stop Sophia if she is still speaking
        window
            .speechSynthesis
            .cancel();


        setIsSpeaking(false);


        resetTranscript();

        setAnswer("");


        SpeechRecognition.startListening({

            continuous: true,

            language: "en-IN"

        });


        setIsRecording(true);

    };


    // =========================================================
    // STOP RECORDING
    // =========================================================

    const stopListening = () => {

        SpeechRecognition.stopListening();

        setIsRecording(false);

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
                "Please enable your camera first."
            );

            return;

        }


        // Stop candidate recording
        SpeechRecognition.stopListening();

        setIsRecording(false);


        speechQuestionRef.current =
            null;


        speakQuestion();

    };


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


                            setIsRecording(false);


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
        navigate,
        questionList
    ]);


    // =========================================================
    // SUBMIT ANSWER
    // =========================================================

    const handleSubmit = () => {

        if (
            cameraStatus !==
            "enabled"
        ) {

            alert(
                "⚠️ Please enable your camera before continuing."
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


        SpeechRecognition
            .stopListening();


        setIsRecording(false);


        setSubmitted(true);

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
                "⚠️ Camera is required to continue the interview."
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


        setIsRecording(false);


        resetTranscript();


        window
            .speechSynthesis
            .cancel();


        setIsSpeaking(false);


        // -------------------------------------------------
        // More questions
        // -------------------------------------------------

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
    // TIMER
    // =========================================================

    const minutes =
        Math.floor(
            seconds / 60
        );


    const sec =
        seconds % 60;


    // =========================================================
    // SPEECH SUPPORT CHECK
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
                        Please open this interview
                        in Chrome or another
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
                            sec
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


                    {/* SPEECH STATUS */}

                    <p
                        style={{
                            marginTop:
                                "15px",

                            color:
                                "#94a3b8"
                        }}
                    >

                        {cameraStatus ===
                        "enabled" &&

                        interviewStarted &&

                        !submitted

                            ? isSpeaking

                                ? "🔊 Sophia is speaking..."

                                : isRecording

                                    ? "🎙️ Listening to your answer..."

                                    : speechError

                                        ? "⚠️ Unable to play the question. Click Replay Question."

                                        : "🔊 Sophia is ready."

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


                    {/* REPLAY */}

                    {cameraStatus ===
                        "enabled" &&

                        !isRecording &&

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


                {/* ANSWER */}

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
                                "15px"
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
                                : "not-allowed"
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