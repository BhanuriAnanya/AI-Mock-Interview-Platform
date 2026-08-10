import hr from "../assets/hr.svg";
import "../index.css";

function HRAvatar({ question }) {
  return (
    <div className="hr-container">

      <div className="hr-avatar-box">
        <img
          src={hr}
          alt="AI HR"
          className="hr-avatar"
        />
      </div>

      <h2 className="hr-title">
        AI Interviewer
      </h2>

      <div className="speech-box">
        {question || "Welcome! Let's begin the interview."}
      </div>

    </div>
  );
}

export default HRAvatar;