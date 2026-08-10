import { useNavigate } from "react-router-dom";
import {
    FaRobot,
    FaFileUpload,
    FaChartBar,
    FaUserCircle,
} from "react-icons/fa";
import "../index.css";

function Dashboard() {

    const navigate = useNavigate();

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/");
    };

    return (

        <div className="dashboard">

            {/* ================= SIDEBAR ================= */}

            <div className="sidebar">

                <div className="logo">

                    <FaRobot className="logo-icon" />

                    <h2>
                        AI Interview
                    </h2>

                </div>


                <button
                    onClick={() =>
                        navigate("/dashboard")
                    }
                >
                    🏠 Dashboard
                </button>


                <button
                    onClick={() =>
                        navigate("/upload-resume")
                    }
                >
                    📄 Upload Resume
                </button>


                <button
                    onClick={() =>
                        navigate("/results")
                    }
                >
                    📊 Results
                </button>


                <button
                    className="logout-btn"
                    onClick={handleLogout}
                >
                    🚪 Logout
                </button>

            </div>


            {/* ================= MAIN CONTENT ================= */}

            <div className="main-content">

                {/* TOP BAR */}

                <div className="topbar">

                    <div>

                        <h1>
                            Welcome Back 👋
                        </h1>

                        <p>
                            Prepare yourself with AI-powered mock interviews.
                        </p>

                    </div>


                    <div className="profile">

                        <FaUserCircle size={45} />

                        <span>
                            {user?.full_name || "Candidate"}
                        </span>

                    </div>

                </div>


                {/* ================= STATS ================= */}

                <div className="stats">

                    <div className="card">

                        <h2>
                            0
                        </h2>

                        <p>
                            Mock Interviews
                        </p>

                    </div>


                    <div className="card">

                        <h2>
                            --
                        </h2>

                        <p>
                            Interview Evaluation
                        </p>

                    </div>


                    <div className="card">

                        <h2>
                            AI
                        </h2>

                        <p>
                            Resume Analysis
                        </p>

                    </div>

                </div>


                {/* ================= ACTION CARDS ================= */}

                <div className="action-section">

                    {/* UPLOAD */}

                    <div className="action-card">

                        <FaFileUpload size={45} />

                        <h2>
                            Upload Resume
                        </h2>

                        <p>
                            Upload your latest resume and let AI
                            generate personalized interview questions.
                        </p>

                        <button
                            onClick={() =>
                                navigate("/upload-resume")
                            }
                        >
                            Upload Now
                        </button>

                    </div>


                    {/* RESULTS */}

                    <div className="action-card">

                        <FaChartBar size={45} />

                        <h2>
                            Interview Results
                        </h2>

                        <p>
                            View your interview performance
                            and AI evaluation.
                        </p>

                        <button
                            onClick={() =>
                                navigate("/results")
                            }
                        >
                            View Results
                        </button>

                    </div>

                </div>

            </div>

        </div>

    );
}

export default Dashboard;