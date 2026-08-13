import { useEffect, useRef } from "react";
import "../index.css";

function CameraMonitor({ onCameraStatusChange }) {

    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const callbackRef = useRef(onCameraStatusChange);

    /*
     * Keep the latest callback without restarting
     * the camera whenever the parent re-renders.
     */
    useEffect(() => {

        callbackRef.current =
            onCameraStatusChange;

    }, [onCameraStatusChange]);


    useEffect(() => {

        let mounted = true;

        const updateStatus = (status) => {

            if (
                mounted &&
                typeof callbackRef.current === "function"
            ) {

                callbackRef.current(status);

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
                        .forEach((track) =>
                            track.stop()
                        );

                    return;

                }


                streamRef.current = stream;


                if (videoRef.current) {

                    videoRef.current.srcObject =
                        stream;

                }


                const videoTrack =
                    stream.getVideoTracks()[0];


                if (!videoTrack) {

                    updateStatus("disabled");

                    return;

                }


                /*
                 * Camera is available.
                 */

                if (
                    videoTrack.readyState === "live"
                ) {

                    updateStatus("enabled");

                } else {

                    updateStatus("disabled");

                }


                /*
                 * Detect when the camera track
                 * is stopped or disabled.
                 */

                const handleTrackEnded = () => {

                    console.log(
                        "Camera track ended."
                    );

                    updateStatus("disabled");

                };


                const handleTrackMute = () => {

                    console.log(
                        "Camera track muted."
                    );

                    updateStatus("disabled");

                };


                const handleTrackUnmute = () => {

                    console.log(
                        "Camera track unmuted."
                    );

                    if (
                        videoTrack.readyState ===
                        "live"
                    ) {

                        updateStatus("enabled");

                    }

                };


                videoTrack.addEventListener(
                    "ended",
                    handleTrackEnded
                );


                videoTrack.addEventListener(
                    "mute",
                    handleTrackMute
                );


                videoTrack.addEventListener(
                    "unmute",
                    handleTrackUnmute
                );


                /*
                 * Cleanup listeners when component
                 * is actually unmounted.
                 */

                return () => {

                    videoTrack.removeEventListener(
                        "ended",
                        handleTrackEnded
                    );

                    videoTrack.removeEventListener(
                        "mute",
                        handleTrackMute
                    );

                    videoTrack.removeEventListener(
                        "unmute",
                        handleTrackUnmute
                    );

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


        /*
         * IMPORTANT:
         * Only stop the camera when the component
         * itself is unmounted.
         *
         * It must NOT restart every time
         * Interview.jsx re-renders.
         */

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