import { useEffect, useState } from "react";

function Timer() {

  const [seconds, setSeconds] = useState(0);

  useEffect(() => {

    const interval = setInterval(() => {

      setSeconds(prev => prev + 1);

    }, 1000);

    return () => clearInterval(interval);

  }, []);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (

    <div className="timer-box">

      ⏱ {String(minutes).padStart(2, "0")}:
      {String(secs).padStart(2, "0")}

    </div>

  );

}

export default Timer;