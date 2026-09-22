import React, { useEffect, useMemo, useState } from 'react';
import {
  Eye,
  Smile,
  Layers,
  Hand,
  Check,
  RotateCcw,
  ArrowRight,
  SkipForward,
  Info,
} from 'lucide-react';

import { ModalityType } from '../types';

import { ImageUploader } from '../components/ImageUploader';
import { CameraCapture } from '../components/CameraCapture';
import { ProgressStepper } from '../components/ProgressStepper';

interface CapturePageProps {
  currentModality: ModalityType;
  capturedImages: Record<ModalityType, string>;

  onSaveImage: (
    modality: ModalityType,
    imageUrl: string
  ) => void;

  onNextModality: (
    next: ModalityType
  ) => void;

  onFinishedAll: () => void;

  onSkipModality: (
    modality: ModalityType
  ) => void;

  onCancelScreening: () => void;
}

const ALL_MODALITIES: ModalityType[] = [
  'eye',
  'tongue',
  'nail',
  'palm',
  'skin',
];

const modalityMeta: Record<
  ModalityType,
  {
    stepNumber: number;
    name: string;
    subtitle: string;
    instruction: string;
    icon: React.ElementType;
  }
> = {
  eye: {
    stepNumber: 1,
    name: 'Eye',
    subtitle: 'Eye & Lower Eyelid',
    instruction:
      'Capture your eye and lower eyelid clearly in good, even lighting.',
    icon: Eye,
  },

  tongue: {
    stepNumber: 2,
    name: 'Tongue',
    subtitle: 'Tongue Surface',
    instruction:
      'Open your mouth naturally and extend your tongue gently. Keep the tongue surface clearly visible in good, even lighting.',
    icon: Smile,
  },

  nail: {
    stepNumber: 3,
    name: 'Nail',
    subtitle: 'Fingernail',
    instruction:
      'Capture a clear image of your fingernail against a plain background.',
    icon: Layers,
  },

  palm: {
    stepNumber: 4,
    name: 'Palm',
    subtitle: 'Palm Surface',
    instruction:
      'Hold your palm flat and steady with the palm surface clearly visible in good, even lighting.',
    icon: Hand,
  },

  skin: {
    stepNumber: 5,
    name: 'Skin',
    subtitle: 'Skin Area',
    instruction:
      'Capture a clear area of skin in even lighting without shadows or glare.',
    icon: Layers,
  },
};

export function CapturePage({
  currentModality,
  capturedImages,
  onSaveImage,
  onNextModality,
  onFinishedAll,
  onSkipModality,
  onCancelScreening,
}: CapturePageProps) {
  const [activeMode, setActiveMode] = useState<
    'select' | 'camera' | 'preview'
  >('select');

  const [tempImage, setTempImage] =
    useState<string | null>(null);

  const currentInfo =
    modalityMeta[currentModality];

  const CurrentIcon = currentInfo.icon;

  // =========================================================
  // CURRENT IMAGE
  // =========================================================

  useEffect(() => {
    const existingImage =
      capturedImages[currentModality];

    if (existingImage) {
      setTempImage(existingImage);
      setActiveMode('preview');
    } else {
      setTempImage(null);
      setActiveMode('select');
    }
  }, [currentModality, capturedImages]);

  // =========================================================
  // COMPLETED MODALITIES
  // =========================================================

  const completedModalities = useMemo(() => {
    return ALL_MODALITIES.filter(
      (modality) =>
        Boolean(capturedImages[modality])
    );
  }, [capturedImages]);

  // =========================================================
  // NEXT MODALITY
  // =========================================================

  const getNextModality = (
    modality: ModalityType
  ): ModalityType | null => {
    switch (modality) {
      case 'eye':
        return 'tongue';

      case 'tongue':
        return 'nail';

      case 'nail':
        return 'palm';

      case 'palm':
        return 'skin';

      case 'skin':
        return null;

      default:
        return null;
    }
  };

  // =========================================================
  // IMAGE SELECTED
  // =========================================================

  const handleImageSelected = (
    imageUrl: string
  ) => {
    setTempImage(imageUrl);
    setActiveMode('preview');
  };

  // =========================================================
  // CAMERA CAPTURED
  // =========================================================

  const handleCameraCapture = (
    imageUrl: string
  ) => {
    setTempImage(imageUrl);
    setActiveMode('preview');
  };

  // =========================================================
  // RETAKE
  // =========================================================

  const handleRetake = () => {
    setTempImage(null);
    setActiveMode('select');
  };

  // =========================================================
  // OPEN CAMERA
  // =========================================================

  const handleOpenCamera = () => {
    setActiveMode('camera');
  };

  // =========================================================
  // SAVE CURRENT IMAGE
  // =========================================================

  const handleSaveAndContinue = () => {
    if (!tempImage) {
      return;
    }

    onSaveImage(
      currentModality,
      tempImage
    );

    const nextModality =
      getNextModality(currentModality);

    if (!nextModality) {
      onFinishedAll();
      return;
    }

    onNextModality(nextModality);
  };

  // =========================================================
  // SKIP CURRENT MODALITY
  // =========================================================

  const handleSkip = () => {
    setTempImage(null);
    setActiveMode('select');

    onSkipModality(currentModality);
  };

  // =========================================================
  // SELECT MODE
  // =========================================================

  if (activeMode === 'select') {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-5xl">

          <div className="mb-6">
            <ProgressStepper
              currentModality={currentModality}
              completedModalities={
                completedModalities
              }
            />
          </div>

          <div className="mb-6 flex items-start justify-between gap-4">

            <div>

              <div className="mb-3 flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50">

                  <CurrentIcon
                    className="h-5 w-5 text-teal-600"
                    strokeWidth={1.8}
                  />

                </div>

                <div>

                  <p className="text-xs font-bold uppercase tracking-wider text-teal-600">
                    Step {currentInfo.stepNumber} of 5
                  </p>

                  <h1 className="text-2xl font-bold text-slate-900">
                    {currentInfo.name}
                  </h1>

                </div>

              </div>

              <p className="max-w-2xl text-sm leading-6 text-slate-600">
                {currentInfo.instruction}
              </p>

            </div>

          </div>

          {/* =================================================
              UPLOAD AREA
          ================================================== */}

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

            <ImageUploader
              modality={currentModality}
              onImageSelected={
                handleImageSelected
              }
              onOpenCamera={
                handleOpenCamera
              }
            />

          </div>

          {/* =================================================
              SKIP
          ================================================== */}

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-start gap-3">

                <Info className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />

                <div>

                  <p className="text-sm font-medium text-slate-700">
                    Don't have a suitable{' '}
                    {currentInfo.name.toLowerCase()}{' '}
                    image?
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    You can skip this modality. It will not
                    be analyzed and will not contribute to
                    the multimodal screening result.
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={handleSkip}
                className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 active:scale-[0.98]"
              >
                <SkipForward className="h-4 w-4" />

                Skip {currentInfo.name} Image
              </button>

            </div>

          </div>

          {/* =================================================
              CANCEL
          ================================================== */}

          <div className="mt-5 text-center">

            <button
              type="button"
              onClick={onCancelScreening}
              className="text-sm font-medium text-slate-500 transition hover:text-slate-800"
            >
              Cancel Screening
            </button>

          </div>

        </div>

      </div>
    );
  }

  // =========================================================
  // CAMERA MODE
  // =========================================================

  if (activeMode === 'camera') {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-4xl">

          <div className="mb-6">
            <ProgressStepper
              currentModality={currentModality}
              completedModalities={
                completedModalities
              }
            />
          </div>

          <div className="mb-5">

            <p className="text-xs font-bold uppercase tracking-wider text-teal-600">
              Step {currentInfo.stepNumber} of 5
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Capture {currentInfo.name} Image
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              {currentInfo.instruction}
            </p>

          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">

            <CameraCapture
              modality={currentModality}
              onCapture={
                handleCameraCapture
              }
              onCancel={() =>
                setActiveMode('select')
              }
            />

          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">

            <button
              type="button"
              onClick={handleSkip}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <SkipForward className="h-4 w-4" />

              Skip {currentInfo.name} Image
            </button>

          </div>

        </div>

      </div>
    );
  }

  // =========================================================
  // PREVIEW MODE
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-5xl">

        <div className="mb-6">

          <ProgressStepper
            currentModality={currentModality}
            completedModalities={
              completedModalities
            }
          />

        </div>

        <div className="mb-6">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50">

              <CurrentIcon
                className="h-5 w-5 text-teal-600"
                strokeWidth={1.8}
              />

            </div>

            <div>

              <p className="text-xs font-bold uppercase tracking-wider text-teal-600">
                Step {currentInfo.stepNumber} of 5
              </p>

              <h1 className="text-2xl font-bold text-slate-900">
                Review {currentInfo.name} Image
              </h1>

            </div>

          </div>

          <p className="mt-2 text-sm text-slate-600">
            Make sure the image is clear before
            continuing.
          </p>

        </div>

        {/* ===================================================
            IMAGE PREVIEW
        ==================================================== */}

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          {tempImage && (
            <div className="relative flex min-h-[320px] items-center justify-center bg-slate-900 p-4 sm:min-h-[440px]">

              <img
                src={tempImage}
                alt={`${currentInfo.name} preview`}
                className="max-h-[70vh] max-w-full rounded-xl object-contain"
              />

            </div>
          )}

          <div className="border-t border-slate-200 p-5">

            <div className="flex items-start gap-3">

              <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

              <div>

                <p className="text-sm font-semibold text-slate-800">
                  Image ready
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  This image will be included in the
                  preliminary screening for the{' '}
                  {currentInfo.name.toLowerCase()}{' '}
                  modality.
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* ===================================================
            ACTIONS
        ==================================================== */}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-between">

          <button
            type="button"
            onClick={handleRetake}
            className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <RotateCcw className="h-4 w-4" />

            Retake / Replace
          </button>

          <button
            type="button"
            onClick={handleSaveAndContinue}
            disabled={!tempImage}
            className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {currentModality === 'skin'
              ? 'Save & Review Images'
              : 'Save & Continue'}

            <ArrowRight className="h-4 w-4" />
          </button>

        </div>

        {/* ===================================================
            SKIP FROM PREVIEW
        ==================================================== */}

        <div className="mt-4 text-center">

          <button
            type="button"
            onClick={handleSkip}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <SkipForward className="h-4 w-4" />

            Skip {currentInfo.name} Image
          </button>

        </div>

        {/* ===================================================
            CANCEL
        ==================================================== */}

        <div className="mt-3 text-center">

          <button
            type="button"
            onClick={onCancelScreening}
            className="text-xs font-medium text-slate-400 hover:text-slate-700"
          >
            Cancel Screening
          </button>

        </div>

      </div>

    </div>
  );
}