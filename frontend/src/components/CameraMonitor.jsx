import { useEffect, useRef } from "react";
import "../index.css";

function CameraMonitor({ onCameraStatusChange }) {

    const videoRef = useRef(null);
    const streamRef = useRef(null);

    useEffect(() => {

        let mounted = true;

        const updateStatus = (status) => {

            if (
                mounted &&
                typeof onCameraStatusChange === "function"
            ) {
                onCameraStatusChange(status);
            }

        };

        const startCamera = async () => {

            try {

                updateStatus("checking");

                const stream =
                    await navigator.mediaDevices.getUserMedia({
                        video: true,
                        audio: false
                    });

                if (!mounted) {

                    stream
                        .getTracks()
                        .forEach((track) => track.stop());

                    return;
                }

                streamRef.current = stream;

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }

                const videoTrack =
                    stream.getVideoTracks()[0];

                if (!videoTrack) {
                    updateStatus("disabled");
                    return;
                }

                /*
                 * Check whether the camera track is actually live.
                 */

                if (videoTrack.readyState === "live") {

                    updateStatus("enabled");

                } else {

                    updateStatus("disabled");

                }

                /*
                 * Detect if the camera is disabled
                 * while the interview is running.
                 */

                videoTrack.onended = () => {

                    console.log(
                        "Camera track ended."
                    );

                    updateStatus("disabled");

                };

            }

            catch (error) {

                console.log(
                    "Camera access error:",
                    error
                );

                updateStatus("disabled");

            }

        };

        startCamera();

        return () => {

            mounted = false;

            if (streamRef.current) {

                streamRef.current
                    .getTracks()
                    .forEach((track) => {

                        track.stop();

                    });

                streamRef.current = null;
            }

        };

    }, [onCameraStatusChange]);


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