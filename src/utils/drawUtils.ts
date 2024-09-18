import {
  CONNECTION_COLOR,
  LEFT_SIDE_COLOR,
  RIGHT_SIDE_COLOR,
  TESSELATION_COLOR,
} from "@/const/colors";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { HAND_CONNECTIONS } from "@mediapipe/hands";
import {
  DrawingUtils,
  FaceLandmarker,
  FaceLandmarkerResult,
  HandLandmarkerResult,
} from "@mediapipe/tasks-vision";

export function drawHands(
  handDetections: HandLandmarkerResult | null,
  canvasCtx: CanvasRenderingContext2D,
  showHandLines: boolean
) {
  if (handDetections?.landmarks && showHandLines) {
    const handedness = handDetections.handedness;

    for (let i = 0; i < handDetections.landmarks.length; i++) {
      const landmarks = handDetections.landmarks[i];

      // selects color for hand side, might fail for more than 2 hands
      const handColor =
        handedness[i][0].categoryName === "Right"
          ? RIGHT_SIDE_COLOR
          : LEFT_SIDE_COLOR;

      drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
        color: TESSELATION_COLOR,
        lineWidth: 3,
        visibilityMin: -1,
      });
      drawLandmarks(canvasCtx, landmarks, {
        color: handColor,
        lineWidth: 1,
        visibilityMin: -1,
      });
    }
  }
}

export function drawFaces(
  faceDetections: FaceLandmarkerResult | null,
  drawingUtilsForFace: DrawingUtils,
  showFaceLines: boolean
) {
  if (faceDetections?.faceLandmarks && showFaceLines) {
    for (const landmarks of faceDetections.faceLandmarks) {
      drawingUtilsForFace.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_TESSELATION,
        { color: TESSELATION_COLOR, lineWidth: 1 }
      );
      drawingUtilsForFace.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
        { color: RIGHT_SIDE_COLOR }
      );
      drawingUtilsForFace.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
        { color: RIGHT_SIDE_COLOR }
      );
      drawingUtilsForFace.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
        { color: LEFT_SIDE_COLOR }
      );
      drawingUtilsForFace.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
        { color: LEFT_SIDE_COLOR }
      );
      drawingUtilsForFace.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
        { color: CONNECTION_COLOR }
      );
      drawingUtilsForFace.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LIPS,
        { color: CONNECTION_COLOR }
      );
      drawingUtilsForFace.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
        { color: RIGHT_SIDE_COLOR }
      );
      drawingUtilsForFace.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
        { color: LEFT_SIDE_COLOR }
      );
    }
  }
}
