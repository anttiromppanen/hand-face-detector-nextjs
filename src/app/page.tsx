"use client";

import {
  initializeHandLandmarker,
  intializeFaceLandmarker,
} from "@/utils/initializeLandmarkers";
import {
  CameraIcon,
  FaceSmileIcon,
  HandRaisedIcon,
} from "@heroicons/react/24/solid";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { HAND_CONNECTIONS } from "@mediapipe/hands";
import {
  DrawingUtils,
  FaceLandmarker,
  FaceLandmarkerResult,
  HandLandmarker,
  HandLandmarkerResult,
} from "@mediapipe/tasks-vision";
import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import styles from "./page.module.css";

const cameraModeSelector = {
  user: "user",
  environment: { exact: "environment" },
};

export default function Home() {
  const [showHandLines, setShowHandLines] = useState(true);
  const [showFaceLines, setShowFaceLines] = useState(true);
  const [handLandmarker, setHandLandmarker] = useState<HandLandmarker | null>(
    null
  );
  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(
    null
  );
  const [cameraFacingMode, setCameraFacingMode] = useState<
    "user" | "environment"
  >("user");
  const cameraRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastVideoTime = useRef(-1);

  const handDetectionsLoop = useCallback(() => {
    if (
      !handLandmarker ||
      !faceLandmarker ||
      !cameraRef.current ||
      !cameraRef.current.video ||
      !canvasRef.current
    ) {
      return;
    }
    // video element & dimensions
    const video = cameraRef.current.video;
    const videoHeight = video.videoHeight;
    const videoWidth = video.videoWidth;

    // set canvas dimensions
    const canvas = canvasRef.current;
    canvas.width = videoWidth;
    canvas.height = videoHeight;

    let handDetections: HandLandmarkerResult | null = null;
    let faceDetections: FaceLandmarkerResult | null = null;
    const canvasCtx = canvas.getContext("2d") as CanvasRenderingContext2D;

    const drawingUtilsForFace = new DrawingUtils(canvasCtx);

    if (videoHeight && videoWidth && video.readyState >= 2) {
      const startTimeMs = performance.now();

      if (lastVideoTime.current !== video.currentTime) {
        lastVideoTime.current = video.currentTime;
        handDetections = handLandmarker.detectForVideo(video, startTimeMs);
        faceDetections = faceLandmarker.detectForVideo(video, startTimeMs);
      }

      // Mirror the canvas horizontally
      canvasCtx.scale(-1, 1);
      canvasCtx.translate(-videoWidth, 0);

      // Draw hand landmarks
      if (handDetections?.landmarks) {
        for (const landmarks of handDetections.landmarks) {
          drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
            color: "#00FF00",
            fillColor: "white",
            lineWidth: 5,
            visibilityMin: -1,
          });
          drawLandmarks(canvasCtx, landmarks, {
            color: "#FF0000",
            lineWidth: 2,
            visibilityMin: -1,
          });
        }
      }

      // Draw face landmarks
      if (faceDetections?.faceLandmarks) {
        for (const landmarks of faceDetections.faceLandmarks) {
          drawingUtilsForFace.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_TESSELATION,
            { color: "#C0C0C070", lineWidth: 1 }
          );
          drawingUtilsForFace.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
            { color: "#FF3030" }
          );
          drawingUtilsForFace.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
            { color: "#FF3030" }
          );
          drawingUtilsForFace.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
            { color: "#30FF30" }
          );
          drawingUtilsForFace.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
            { color: "#30FF30" }
          );
          drawingUtilsForFace.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
            { color: "#E0E0E0" }
          );
          drawingUtilsForFace.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_LIPS,
            { color: "#E0E0E0" }
          );
          drawingUtilsForFace.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
            { color: "#FF3030" }
          );
          drawingUtilsForFace.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
            { color: "#30FF30" }
          );
        }
      }
    }
  }, [handLandmarker, faceLandmarker]);

  useEffect(() => {
    // Initialize Hand landmarker
    if (!handLandmarker) {
      (async () => {
        const handLandmarker = await initializeHandLandmarker();
        setHandLandmarker(handLandmarker);
        console.log("Hand Landmarker initialized");
      })();
    }
  }, [handLandmarker]);

  useEffect(() => {
    // Initialize Face landmarker
    if (!faceLandmarker) {
      (async () => {
        const faceLandmarker = await intializeFaceLandmarker();
        setFaceLandmarker(faceLandmarker);
        console.log("Face Landmarker initialized");
      })();
    }
  }, [faceLandmarker]);

  useEffect(() => {
    setInterval(() => {
      handDetectionsLoop();
    }, 100);
  }, [handDetectionsLoop]);

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
                showHandLines ? styles.icon_not_selected : styles.icon_selected
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
                showFaceLines ? styles.icon_not_selected : styles.icon_selected
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
            <CameraIcon
              className={
                showFaceLines ? styles.icon_not_selected : styles.icon_selected
              }
            />
          </button>
        </div>
      </div>
    </main>
  );
}
