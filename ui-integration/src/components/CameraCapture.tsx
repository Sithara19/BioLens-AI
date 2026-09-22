import React, {
  useRef,
  useState,
  useEffect,
} from 'react';

import {
  Camera,
  RefreshCw,
  AlertCircle,
  SwitchCamera,
} from 'lucide-react';

import { ModalityType } from '../types';

interface CameraCaptureProps {
  modality: ModalityType;
  onCapture: (
    imageDataUrl: string
  ) => void;
  onCancel: () => void;
}

export const CameraCapture: React.FC<
  CameraCaptureProps
> = ({
  modality,
  onCapture,
  onCancel,
}) => {
  const videoRef =
    useRef<HTMLVideoElement>(null);

  const streamRef =
    useRef<MediaStream | null>(null);

  const [cameraError, setCameraError] =
    useState<string | null>(null);

  const [facingMode, setFacingMode] =
    useState<
      'user' | 'environment'
    >('environment');

  const [isInitializing, setIsInitializing] =
    useState(true);

  const [isCameraReady, setIsCameraReady] =
    useState(false);

  // =========================================================
  // MODALITY-SPECIFIC CAMERA GUIDES
  //
  // Eye -> Tongue -> Nail -> Palm -> Skin
  // =========================================================

  const modalityGuides: Record<
    ModalityType,
    {
      title: string;
      instruction: string;
      shape: string;
    }
  > = {
    eye: {
      title: 'Align Eye in Center',
      instruction:
        'Position your eye and lower eyelid in good lighting. Keep the eye clearly visible inside the guide.',
      shape:
        'border-2 border-dashed border-teal-400 rounded-[50%]',
    },

    tongue: {
      title: 'Align Tongue in Center',
      instruction:
        'Open your mouth naturally and extend your tongue gently. Keep the tongue surface clearly visible inside the guide.',
      shape:
        'border-2 border-dashed border-rose-400 rounded-[45%]',
    },

    nail: {
      title: 'Align Fingernail in Center',
      instruction:
        'Hold your fingernail steady against a neutral background with the entire nail clearly visible in good lighting.',
      shape:
        'border-2 border-dashed border-sky-400 rounded-2xl',
    },

    palm: {
      title: 'Align Palm in Center',
      instruction:
        'Hold your palm flat and steady with the palm surface clearly visible in good, even lighting.',
      shape:
        'border-2 border-dashed border-amber-400 rounded-[40%]',
    },

    skin: {
      title: 'Align Skin Area in Center',
      instruction:
        'Hold the camera a short distance from a clear area of skin on your hand, wrist, or arm in even lighting.',
      shape:
        'border-2 border-dashed border-teal-400 rounded-full',
    },
  };

  // =========================================================
  // STOP CAMERA
  // =========================================================

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => {
          track.stop();
        });

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject =
        null;
    }

    setIsCameraReady(false);
  };

  // =========================================================
  // START CAMERA
  // =========================================================

  const startCamera = async (
    mode: 'user' | 'environment'
  ) => {
    setIsInitializing(true);
    setCameraError(null);
    setIsCameraReady(false);

    // Stop any previous camera first
    stopCamera();

    try {
      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        throw new Error(
          'Camera access is not supported by this browser.'
        );
      }

      const mediaStream =
        await navigator.mediaDevices.getUserMedia(
          {
            video: {
              facingMode: {
                ideal: mode,
              },
              width: {
                ideal: 1280,
                min: 640,
              },
              height: {
                ideal: 720,
                min: 480,
              },
            },
            audio: false,
          }
        );

      streamRef.current =
        mediaStream;

      if (!videoRef.current) {
        throw new Error(
          'Camera preview could not be initialized.'
        );
      }

      const video =
        videoRef.current;

      video.srcObject =
        mediaStream;

      // =====================================================
      // WAIT FOR VIDEO METADATA
      // =====================================================

      await new Promise<void>(
        (resolve) => {
          const handleLoaded =
            () => {
              resolve();
            };

          if (
            video.readyState >= 2
          ) {
            resolve();
          } else {
            video.addEventListener(
              'loadedmetadata',
              handleLoaded,
              {
                once: true,
              }
            );
          }
        }
      );

      await video.play();

      setIsCameraReady(true);
    } catch (err: any) {
      console.error(
        'Camera initialization error:',
        err
      );

      let message =
        'Unable to access the camera. Please check your browser camera permissions.';

      if (
        err?.name ===
        'NotAllowedError'
      ) {
        message =
          'Camera permission was denied. Please allow camera access in your browser settings, then retry.';
      } else if (
        err?.name ===
          'NotFoundError' ||
        err?.name ===
          'DevicesNotFoundError'
      ) {
        message =
          'No camera was found on this device. You can use image upload instead.';
      } else if (
        err?.name ===
        'NotReadableError'
      ) {
        message =
          'The camera is already being used by another application. Close other camera apps and try again.';
      } else if (
        err?.name ===
        'OverconstrainedError'
      ) {
        message =
          'The selected camera does not support the requested settings. Try switching the camera.';
      } else if (
        err?.name ===
        'SecurityError'
      ) {
        message =
          'Camera access was blocked by the browser security settings.';
      }

      setCameraError(message);

      stopCamera();
    } finally {
      setIsInitializing(false);
    }
  };

  // =========================================================
  // CAMERA LIFECYCLE
  // =========================================================

  useEffect(() => {
    startCamera(
      facingMode
    );

    return () => {
      stopCamera();
    };
  }, [facingMode]);

  // =========================================================
  // SWITCH FRONT / BACK CAMERA
  // =========================================================

  const toggleFacingMode =
    () => {
      setFacingMode(
        (previous) =>
          previous === 'user'
            ? 'environment'
            : 'user'
      );
    };

  // =========================================================
  // CAPTURE PHOTO
  // =========================================================

  const capturePhoto = () => {
    const video =
      videoRef.current;

    if (
      !video ||
      !isCameraReady
    ) {
      return;
    }

    if (
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      setCameraError(
        'Camera is not ready yet. Please wait a moment and try again.'
      );

      return;
    }

    const canvas =
      document.createElement(
        'canvas'
      );

    canvas.width =
      video.videoWidth;

    canvas.height =
      video.videoHeight;

    const context =
      canvas.getContext('2d');

    if (!context) {
      setCameraError(
        'Unable to process the captured image.'
      );

      return;
    }

    // =====================================================
    // MIRROR FRONT CAMERA IMAGE
    // =====================================================

    if (
      facingMode === 'user'
    ) {
      context.translate(
        canvas.width,
        0
      );

      context.scale(-1, 1);
    }

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const imageDataUrl =
      canvas.toDataURL(
        'image/jpeg',
        0.92
      );

    stopCamera();

    onCapture(imageDataUrl);
  };

  // =========================================================
  // CANCEL
  // =========================================================

  const handleCancel = () => {
    stopCamera();
    onCancel();
  };

  const guide =
    modalityGuides[
      modality
    ];

  return (
    <div className="w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xl flex flex-col">

      {/* =====================================================
          CAMERA VIEWPORT
      ====================================================== */}

      <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center overflow-hidden">

        {cameraError ? (
          <div className="p-6 text-center max-w-md space-y-4">

            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1">

              <h4 className="text-white font-semibold text-sm">
                Camera Unavailable
              </h4>

              <p className="text-xs text-slate-400 leading-relaxed">
                {cameraError}
              </p>

            </div>

            <div className="flex flex-wrap gap-2 justify-center">

              <button
                type="button"
                onClick={() =>
                  startCamera(
                    facingMode
                  )
                }
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Camera
              </button>

              <button
                type="button"
                onClick={
                  handleCancel
                }
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Use Upload Instead
              </button>

            </div>

          </div>
        ) : (
          <>
            {/* =================================================
                VIDEO
            ================================================== */}

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${
                facingMode === 'user'
                  ? '-scale-x-100'
                  : ''
              }`}
            />

            {/* =================================================
                LOADING
            ================================================== */}

            {isInitializing && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70">

                <div className="text-center">

                  <RefreshCw className="w-7 h-7 text-teal-400 animate-spin mx-auto mb-2" />

                  <p className="text-xs text-slate-300">
                    Starting camera...
                  </p>

                </div>

              </div>
            )}

            {/* =================================================
                OPTICAL GUIDE
            ================================================== */}

            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">

              <div
                className={`w-48 sm:w-64 h-48 sm:h-64 ${guide.shape} flex items-center justify-center relative`}
              >

                <div className="w-4 h-0.5 bg-white/70" />

                <div className="w-0.5 h-4 bg-white/70 absolute" />

                <span className="absolute -top-7 text-[11px] font-semibold text-teal-300 bg-slate-900/80 px-2 py-0.5 rounded-full whitespace-nowrap">
                  {guide.title}
                </span>

              </div>

              <p className="mt-4 text-center text-xs text-slate-300 bg-slate-900/85 px-3 py-1.5 rounded-lg max-w-md border border-white/10">
                {guide.instruction}
              </p>

            </div>

            {/* =================================================
                SWITCH CAMERA
            ================================================== */}

            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">

              <button
                type="button"
                onClick={
                  toggleFacingMode
                }
                title="Switch front/back camera"
                className="p-2.5 rounded-xl bg-slate-900/80 text-white hover:bg-slate-800 border border-white/10 transition-colors shadow-sm"
              >
                <SwitchCamera className="w-4 h-4" />
              </button>

            </div>

          </>
        )}

      </div>

      {/* =====================================================
          CAMERA CONTROLS
      ====================================================== */}

      {!cameraError && (
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">

          <button
            type="button"
            onClick={
              handleCancel
            }
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Back
          </button>

          <button
            type="button"
            onClick={
              capturePhoto
            }
            disabled={
              isInitializing ||
              !isCameraReady
            }
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-teal-500/25 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >

            <Camera className="w-4 h-4" />

            {isInitializing
              ? 'Starting...'
              : 'Capture Photo'}

          </button>

          <div className="w-24 text-right">

            <span className="text-[10px] text-teal-400/80 font-mono uppercase tracking-wider">
              {isCameraReady
                ? 'Camera Ready'
                : 'Initializing'}
            </span>

          </div>

        </div>
      )}

    </div>
  );
};