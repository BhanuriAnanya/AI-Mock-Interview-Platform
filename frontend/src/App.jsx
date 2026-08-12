import { BrowserRouter, Routes, Route } from "react-router-dom";
import Result from "./pages/result";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ResumeUpload from "./pages/ResumeUpload";
import Interview from "./pages/Interview";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login */}
        <Route
          path="/"
          element={<Login />}
        />

        {/* Register */}
        <Route
          path="/register"
          element={<Register />}
        />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* Resume Upload */}
        <Route
          path="/upload-resume"
          element={<ResumeUpload />}
        />

        {/* Interview */}
        <Route
          path="/interview/:id"
          element={<Interview />}
        />
        <Route
    path="/results"
    element={<Result />}
/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;