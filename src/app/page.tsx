"use client";

import useHandAndFaceDetection from "@/hooks/useHandAndFaceDetection";
import {
  initializeHandLandmarker,
  intializeFaceLandmarker,
} from "@/utils/initializeLandmarkers";
import {
  CameraIcon,
  FaceSmileIcon,
  HandRaisedIcon,
} from "@heroicons/react/24/solid";
import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import styles from "./page.module.css";

const cameraModeSelector = {
  user: "user",
  environment: { exact: "environment" },
};

export default function Home() {
  const [cameraFacingMode, setCameraFacingMode] = useState<
    "user" | "environment"
  >("user");
  const cameraRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastVideoTime = useRef(-1);

  const {
    handAndFaceDetectionsLoop,
    handLandmarker,
    faceLandmarker,
    setFaceLandmarker,
    setHandLandmarker,
    setShowFaceLines,
    setShowHandLines,
    showFaceLines,
    showHandLines,
  } = useHandAndFaceDetection({ cameraRef, canvasRef, lastVideoTime });

  useEffect(() => {
    // Initialize Hand landmarker
    if (!handLandmarker) {
      (async () => {
        const handLandmarker = await initializeHandLandmarker();
        setHandLandmarker(handLandmarker);
        console.log("Hand Landmarker initialized");
      })();
    }
  }, [handLandmarker, setHandLandmarker]);

  useEffect(() => {
    // Initialize Face landmarker
    if (!faceLandmarker) {
      (async () => {
        const faceLandmarker = await intializeFaceLandmarker();
        setFaceLandmarker(faceLandmarker);
        console.log("Face Landmarker initialized");
      })();
    }
  }, [faceLandmarker, setFaceLandmarker]);

  useEffect(() => {
    const interval = setInterval(() => {
      handAndFaceDetectionsLoop();
    }, 10);

    return () => clearInterval(interval);
  }, [handAndFaceDetectionsLoop]);

  return (
    <main className={styles.container}>
      <div className={styles.camera__container}>
        <Webcam
          audio={false}
          mirrored
          ref={cameraRef}
          videoConstraints={{
            width: 1280,
            height: 720,
            facingMode: cameraModeSelector[cameraFacingMode],
          }}
          className={styles.camera}
        />
        <canvas ref={canvasRef} className={styles.canvas} />
        <div className={styles.buttons_container}>
          <button
            type="button"
            title="Toggle hand lines visibility"
            onClick={() => setShowHandLines((state) => !state)}
            className={styles.toggle_lines_button}
          >
            <HandRaisedIcon
              className={
                showHandLines ? styles.icon_selected : styles.icon_not_selected
              }
            />
          </button>
          <button
            type="button"
            title="Toggle face lines visibility"
            onClick={() => setShowFaceLines((state) => !state)}
            className={styles.toggle_lines_button}
          >
            <FaceSmileIcon
              className={
                showFaceLines ? styles.icon_selected : styles.icon_not_selected
              }
            />
          </button>
          <button
            type="button"
            title="Toggle camera facing mode"
            onClick={() =>
              setCameraFacingMode((mode) =>
                mode === "user" ? "environment" : "user"
              )
            }
            className={styles.toggle_lines_button}
          >
            <CameraIcon className={styles.camera_icon} />
          </button>
        </div>
      </div>
    </main>
  );
}
