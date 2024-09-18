import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { HandLandmarker } from "@mediapipe/tasks-vision";

export async function initializeHandLandmarker() {
  const vision = await FilesetResolver.forVisionTasks(
    // path/to/wasm/root
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );
  const handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "/hand_landmarker.task",
      delegate: "GPU",
    },
    numHands: 2,
    runningMode: "VIDEO",
  });
  return handLandmarker;
}

export async function intializeFaceLandmarker() {
  const vision = await FilesetResolver.forVisionTasks(
    // path/to/wasm/root
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );
  const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "/face_landmarker.task",
      delegate: "GPU",
    },
    outputFaceBlendshapes: true,
    numFaces: 2,
    runningMode: "VIDEO",
  });
  return faceLandmarker;
}