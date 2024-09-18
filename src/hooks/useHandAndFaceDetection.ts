import { drawFaces, drawHands } from "@/utils/drawUtils";
import {
  DrawingUtils,
  FaceLandmarker,
  FaceLandmarkerResult,
  HandLandmarker,
  HandLandmarkerResult,
} from "@mediapipe/tasks-vision";
import { useCallback, useState } from "react";
import Webcam from "react-webcam";

interface HandAndFaceDetectionProps {
  cameraRef: React.RefObject<Webcam>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  lastVideoTime: React.MutableRefObject<number>;
}

function useHandAndFaceDetection({
  cameraRef,
  canvasRef,
  lastVideoTime,
}: HandAndFaceDetectionProps) {
  const [showHandLines, setShowHandLines] = useState(true);
  const [showFaceLines, setShowFaceLines] = useState(true);

  const [handLandmarker, setHandLandmarker] = useState<HandLandmarker | null>(
    null
  );
  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(
    null
  );

  const handAndFaceDetectionsLoop = useCallback(() => {
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
    const canvasWebGl = canvas.getContext("webgl") as WebGL2RenderingContext;

    const drawingUtilsForFace = new DrawingUtils(canvasCtx, canvasWebGl);

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
      drawHands(handDetections, canvasCtx, showHandLines);

      // Draw face landmarks
      drawFaces(faceDetections, drawingUtilsForFace, showFaceLines);
    }
  }, [
    cameraRef,
    canvasRef,
    lastVideoTime,
    showHandLines,
    showFaceLines,
    handLandmarker,
    faceLandmarker,
  ]);

  return {
    handAndFaceDetectionsLoop,
    handLandmarker,
    faceLandmarker,
    setHandLandmarker,
    setFaceLandmarker,
    setShowHandLines,
    setShowFaceLines,
    showHandLines,
    showFaceLines,
  };
}

export default useHandAndFaceDetection;
