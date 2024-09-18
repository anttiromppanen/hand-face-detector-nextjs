'use client';

import {
  CameraIcon,
  FaceSmileIcon,
  HandRaisedIcon,
} from '@heroicons/react/24/solid';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { HAND_CONNECTIONS } from '@mediapipe/hands';
import {
  FilesetResolver,
  HandLandmarker,
  HandLandmarkerResult,
} from '@mediapipe/tasks-vision';
import { useCallback, useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import styles from './page.module.css';

const cameraModeSelector = {
  user: 'user',
  environment: { exact: 'environment' },
};

export default function Home() {
  const [showHandLines, setShowHandLines] = useState(true);
  const [showFaceLines, setShowFaceLines] = useState(true);
  const [handLandmarker, setHandLandmarker] = useState<HandLandmarker | null>(
    null
  );
  const [cameraFacingMode, setCameraFacingMode] = useState<
    'user' | 'environment'
  >('user');
  const cameraRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastVideoTime = useRef(-1);

  async function initializeHandLandmarker() {
    const vision = await FilesetResolver.forVisionTasks(
      // path/to/wasm/root
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
    );
    const handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: '/hand_landmarker.task',
        delegate: 'GPU',
      },
      numHands: 2,
    });
    return handLandmarker;
  }

  const handDetectionsLoop = useCallback(() => {
    if (
      !handLandmarker ||
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

    let detections: HandLandmarkerResult | null = null;
    const canvasCtx = canvas.getContext('2d') as CanvasRenderingContext2D;

    if (videoHeight && videoWidth && video.readyState >= 2) {
      const startTimeMs = performance.now();

      if (lastVideoTime.current !== video.currentTime) {
        lastVideoTime.current = video.currentTime;
        detections = handLandmarker.detectForVideo(video, startTimeMs);
      }

      // Mirror the canvas horizontally
      canvasCtx.scale(-1, 1);
      canvasCtx.translate(-videoWidth, 0);

      if (detections?.landmarks) {
        for (const landmarks of detections.landmarks) {
          drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
            color: '#00FF00',
            lineWidth: 5,
            visibilityMin: -1,
          });
          drawLandmarks(canvasCtx, landmarks, {
            color: '#FF0000',
            lineWidth: 2,
            visibilityMin: -1,
          });
        }
      }
    }
  }, [handLandmarker]);

  useEffect(() => {
    // Initialize Hand and Face landmarkers
    if (!handLandmarker) {
      (async () => {
        const handLandmarker = await initializeHandLandmarker();
        setHandLandmarker(handLandmarker);
        await handLandmarker.setOptions({ runningMode: 'VIDEO' });
        console.log('Hand Landmarker initialized');
      })();
    }
  }, [handLandmarker, handDetectionsLoop]);

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
                mode === 'user' ? 'environment' : 'user'
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
