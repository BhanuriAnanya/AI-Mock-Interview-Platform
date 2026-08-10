import { useEffect, useRef } from "react";
import "../index.css";

function CameraMonitor() {

  const videoRef = useRef(null);

  useEffect(() => {

    let stream;

    const startCamera = async () => {

      try {

        stream =
          await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

      } catch (err) {
        console.log(err);
        alert("Camera access denied.");
      }

    };

    startCamera();

    return () => {

      if (stream) {

        stream.getTracks().forEach(track => track.stop());

      }

    };

  }, []);

  return (

    <div className="camera-container">

      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="camera-video"
      />

    </div>

  );

}

export default CameraMonitor;