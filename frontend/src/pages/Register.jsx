import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../index.css";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        password: "",
        confirmPassword: "",
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

        if (
            formData.password !==
            formData.confirmPassword
        ) {
            setError("Passwords do not match!");
            return;
        }

        try {
            setLoading(true);

            await api.post(
                "/auth/register",
                {
                    full_name: formData.full_name,
                    email: formData.email,
                    password: formData.password,
                }
            );

            // No popup.
            // Go directly to Login after registration.
            navigate("/");

        } catch (error) {
            console.error(
                "Registration error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Registration failed. Please try again."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">

            <div className="auth-card">

                <h2>Create Account</h2>

                <form onSubmit={handleSubmit}>

                    <input
                        type="text"
                        name="full_name"
                        placeholder="Full Name"
                        value={formData.full_name}
                        onChange={handleChange}
                        required
                    />

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

                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={
                            formData.confirmPassword
                        }
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
                            ? "Creating Account..."
                            : "Register"}
                    </button>

                </form>

                <p>
                    Already have an account?{" "}

                    <Link to="/">
                        Login
                    </Link>
                </p>

            </div>

        </div>
    );
}

export default Register;