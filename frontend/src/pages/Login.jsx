import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import "../index.css";

function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });

        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        try {
            setLoading(true);

            const response = await api.post(
                "/auth/login",
                formData
            );

            localStorage.setItem(
                "token",
                response.data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

            // No popup.
            // Directly open dashboard after successful login.
            navigate("/dashboard");

        } catch (error) {
            console.error("Login error:", error);

            setError(
                error.response?.data?.message ||
                "Login failed. Please check your email and password."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">

            <div className="auth-card">

                <h2>AI Mock Interview</h2>

                <form onSubmit={handleSubmit}>

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    {error && (
                        <p
                            style={{
                                color: "#ef4444",
                                marginTop: "10px",
                                marginBottom: "10px",
                                textAlign: "center",
                            }}
                        >
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Logging in..."
                            : "Login"}
                    </button>

                </form>

                <p>
                    Don't have an account?{" "}

                    <Link to="/register">
                        Register
                    </Link>
                </p>

            </div>

        </div>
    );
}

export default Login;