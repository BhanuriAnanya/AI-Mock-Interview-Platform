import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaCloudUploadAlt,
    FaFilePdf,
    FaArrowLeft
} from "react-icons/fa";
import api from "../services/api";
import "../index.css";

function ResumeUpload() {

    const navigate = useNavigate();

    const [resume, setResume] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {

        if (e.target.files.length > 0) {

            setResume(e.target.files[0]);

        }

    };

    const handleUpload = async () => {

        if (!resume) {

            alert("Please select a PDF resume.");

            return;

        }

        const formData = new FormData();

        formData.append("resume", resume);

        try {

            setLoading(true);

            const response = await api.post(

                "/resume/upload",

                formData,

                {

                    headers: {

                        "Content-Type": "multipart/form-data",

                    },

                }

            );

            alert("Resume uploaded successfully!");

            // Navigate using interviewId
            navigate(

                `/interview/${response.data.interviewId}`,

                {

                    state: {

                        questions: response.data.questions,

                        interviewId: response.data.interviewId,

                    },

                }

            );

        }

        catch (error) {

            console.log(error);

            alert(

                error.response?.data?.message ||

                "Resume upload failed."

            );

        }

        finally {

            setLoading(false);

        }

    };

    return (

        <div className="upload-page">

            <div className="upload-card fade-up">

                <button

                    className="back-btn"

                    onClick={() => navigate("/dashboard")}

                >

                    <FaArrowLeft />

                    &nbsp; Dashboard

                </button>

                <FaCloudUploadAlt

                    size={90}

                    color="#3b82f6"

                    style={{ marginBottom: "20px" }}

                />

                <h1>

                    Upload Your Resume

                </h1>

                <p>

                    Upload your latest resume in PDF format.

                    Our AI will analyze your skills and

                    generate personalized interview questions.

                </p>

                <label className="custom-upload">

                    <input

                        type="file"

                        accept=".pdf"

                        onChange={handleFileChange}

                    />

                    Choose Resume

                </label>

                {

                    resume && (

                        <div className="selected-file">

                            <FaFilePdf

                                color="#ef4444"

                                size={24}

                            />

                            <span>

                                {resume.name}

                            </span>

                        </div>

                    )

                }

                <button

                    className="upload-btn"

                    onClick={handleUpload}

                    disabled={loading}

                >

                    {

                        loading

                            ? "🤖 AI is Analyzing Resume..."

                            : "Generate Interview"

                    }

                </button>

            </div>

        </div>

    );

}

export default ResumeUpload;