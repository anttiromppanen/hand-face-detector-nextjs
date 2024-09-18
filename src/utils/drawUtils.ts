import {
  LEFT_SIDE_COLOR,
  RIGHT_SIDE_COLOR,
  TESSELATION_COLOR,
} from "@/const/colors";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { HAND_CONNECTIONS } from "@mediapipe/hands";
import { HandLandmarkerResult } from "@mediapipe/tasks-vision";

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
