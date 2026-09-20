import React, { useEffect, useMemo, useState } from 'react';
import {
  X,
  Sparkles,
  Info,
  CheckCircle2,
  Eye,
  Smile,
  Layers,
} from 'lucide-react';
import {
  ModalityType,
  ScreeningResult,
} from '../types';

interface AttentionModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ScreeningResult;
  initialModality?: ModalityType;
}

const ALL_MODALITIES: {
  key: ModalityType;
  label: string;
  icon: React.ElementType;
}[] = [
  {
    key: 'eye',
    label: 'Eye',
    icon: Eye,
  },
  {
    key: 'tongue',
    label: 'Tongue',
    icon: Smile,
  },
  {
    key: 'nail',
    label: 'Nail',
    icon: Layers,
  },
  {
    key: 'skin',
    label: 'Skin',
    icon: Layers,
  },
];

export const AttentionModal: React.FC<
  AttentionModalProps
> = ({
  isOpen,
  onClose,
  result,
  initialModality = 'eye',
}) => {
  const availableModalities = useMemo(
    () =>
      ALL_MODALITIES.filter(
        (modality) =>
          Boolean(result.images?.[modality.key])
      ),
    [result.images]
  );

  const firstAvailableModality =
    availableModalities[0]?.key ?? 'eye';

  const getSafeInitialModality = (
    requested: ModalityType
  ): ModalityType => {
    const requestedIsAvailable =
      availableModalities.some(
        (modality) =>
          modality.key === requested
      );

    return requestedIsAvailable
      ? requested
      : firstAvailableModality;
  };

  const [selectedModality, setSelectedModality] =
    useState<ModalityType>(
      getSafeInitialModality(initialModality)
    );

  const [viewMode, setViewMode] = useState<
    'overlay' | 'original' | 'heatmap'
  >('overlay');

  /*
   * Keep the selected modality valid when:
   * - a new result is loaded
   * - a modality is skipped
   * - the modal is opened from a different condition
   */
  useEffect(() => {
    if (!isOpen) return;

    const safeModality =
      getSafeInitialModality(initialModality);

    setSelectedModality(safeModality);
    setViewMode('overlay');
  }, [
    isOpen,
    initialModality,
    availableModalities,
  ]);

  if (!isOpen) return null;

  /*
   * No image was submitted.
   *
   * The modal normally won't be opened in this situation,
   * but this guard prevents an invalid viewer state.
   */
  if (availableModalities.length === 0) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
                <Info className="w-4 h-4" />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Attention Visualization
                </h3>

                <p className="text-xs text-slate-500">
                  No submitted modality is available
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Close attention viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-600 leading-relaxed">
              No image was submitted for analysis, so
              there is no Grad-CAM or attention
              visualization to display.
            </div>
          </div>

          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-white font-semibold text-xs hover:bg-slate-900 transition-colors shadow-xs"
            >
              Close Viewer
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentAttention =
    result.attentionMaps?.[selectedModality];

  const originalImage =
    result.images?.[selectedModality] || '';

  const selectedModalityLabel =
    ALL_MODALITIES.find(
      (modality) =>
        modality.key === selectedModality
    )?.label ?? selectedModality;

  const hasHeatmap =
    Boolean(currentAttention?.heatmapUrl);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* ===================================================== */}
        {/* HEADER                                                */}
        {/* ===================================================== */}

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                AI Attention &amp; Saliency Map
              </h3>

              <p className="text-xs text-slate-500">
                Visualizing model attention for the submitted
                {` ${selectedModalityLabel.toLowerCase()}`}
                image
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close attention viewer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ===================================================== */}
        {/* MODALITY TABS                                         */}
        {/* ===================================================== */}

        <div className="flex border-b border-slate-200 px-6 bg-white overflow-x-auto gap-1">
          {ALL_MODALITIES.map((modality) => {
            const Icon = modality.icon;

            const isAvailable =
              availableModalities.some(
                (available) =>
                  available.key === modality.key
              );

            const isSelected =
              selectedModality === modality.key;

            return (
              <button
                key={modality.key}
                onClick={() => {
                  if (!isAvailable) return;

                  setSelectedModality(
                    modality.key
                  );
                  setViewMode('overlay');
                }}
                disabled={!isAvailable}
                className={`py-3 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? 'border-teal-600 text-teal-700 bg-teal-50/30'
                    : isAvailable
                    ? 'border-transparent text-slate-500 hover:text-slate-800'
                    : 'border-transparent text-slate-300 cursor-not-allowed'
                }`}
                title={
                  isAvailable
                    ? `View ${modality.label} attention map`
                    : `${modality.label} was skipped and was not analyzed`
                }
              >
                <Icon className="w-3.5 h-3.5" />

                {modality.label}

                {!isAvailable && (
                  <span className="text-[9px] font-bold uppercase">
                    Skipped
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ===================================================== */}
        {/* BODY                                                  */}
        {/* ===================================================== */}

        <div className="p-6 space-y-5">

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-medium text-slate-600">
              Visualization Layer:
            </span>

            <div className="inline-flex rounded-lg p-1 bg-slate-100 border border-slate-200">
              <button
                onClick={() =>
                  setViewMode('overlay')
                }
                disabled={!hasHeatmap}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  viewMode === 'overlay'
                    ? 'bg-white text-teal-800 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                } ${
                  !hasHeatmap
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                Grad-CAM Overlay
              </button>

              <button
                onClick={() =>
                  setViewMode('heatmap')
                }
                disabled={!hasHeatmap}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  viewMode === 'heatmap'
                    ? 'bg-white text-teal-800 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                } ${
                  !hasHeatmap
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                Activation Heatmap
              </button>

              <button
                onClick={() =>
                  setViewMode('original')
                }
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  viewMode === 'original'
                    ? 'bg-white text-teal-800 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Captured Image
              </button>
            </div>
          </div>

          {/* =================================================== */}
          {/* VISUAL DISPLAY                                      */}
          {/* =================================================== */}

          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center border border-slate-200 shadow-inner">

            {/* Original image */}
            {(viewMode === 'original' ||
              viewMode === 'overlay') &&
              originalImage && (
                <img
                  src={originalImage}
                  alt={`${selectedModalityLabel} captured`}
                  className="absolute inset-0 w-full h-full object-contain"
                />
              )}

            {/* Heatmap */}
            {(viewMode === 'heatmap' ||
              viewMode === 'overlay') &&
              currentAttention?.heatmapUrl && (
                <img
                  src={currentAttention.heatmapUrl}
                  alt={`${selectedModalityLabel} attention heatmap`}
                  className={`absolute inset-0 w-full h-full object-contain ${
                    viewMode === 'overlay'
                      ? 'opacity-75 mix-blend-screen'
                      : 'opacity-100'
                  }`}
                />
              )}

            {/* No heatmap available */}
            {!hasHeatmap && (
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="max-w-md text-center">
                  <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-white/10 flex items-center justify-center">
                    <Info className="w-5 h-5 text-white/70" />
                  </div>

                  <p className="text-sm font-semibold text-white">
                    Attention map not available
                  </p>

                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    A model-generated Grad-CAM visualization
                    will be available when the trained model
                    and backend inference pipeline are connected.
                  </p>
                </div>
              </div>
            )}

            {/* Viewer indicator */}
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-xs text-[11px] font-mono text-white flex items-center gap-1.5 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />

              {selectedModalityLabel} ·{' '}
              {viewMode.toUpperCase()}
            </div>
          </div>

          {/* =================================================== */}
          {/* VISUALIZATION INFORMATION                           */}
          {/* =================================================== */}

          {currentAttention && (
            <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200/70 text-xs">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />

                <p className="text-slate-700 leading-relaxed font-medium">
                  {currentAttention.description}
                </p>
              </div>

              {currentAttention.keyRegions &&
                currentAttention.keyRegions.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-600">
                      Visual Regions of Interest:
                    </span>

                    {currentAttention.keyRegions.map(
                      (region, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-slate-300 text-slate-700 text-[11px]"
                        >
                          <CheckCircle2 className="w-3 h-3 text-teal-600" />

                          {region}
                        </span>
                      )
                    )}
                  </div>
                )}
            </div>
          )}

          {/* =================================================== */}
          {/* EXPLAINABILITY NOTICE                               */}
          {/* =================================================== */}

          <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-100 text-[11px] text-teal-900 leading-relaxed">
            <strong>
              Explainable AI Architecture:
            </strong>{' '}
            Grad-CAM can highlight regions associated with
            model feature activations. In this prototype,
            the displayed attention overlays are demonstration
            visualizations. When the trained FastAPI inference
            pipeline is connected, model-generated heatmaps for
            the submitted image will replace the demonstration
            overlays.
          </div>

          {/* =================================================== */}
          {/* SCREENING DISCLAIMER                                */}
          {/* =================================================== */}

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
            <strong className="text-slate-700">
              Important:
            </strong>{' '}
            An attention or saliency map shows where a model
            may have focused during prediction. It does not
            establish the presence, absence, severity, or cause
            of a medical condition and should not be interpreted
            as a diagnostic finding.
          </div>
        </div>

        {/* ===================================================== */}
        {/* FOOTER                                                */}
        {/* ===================================================== */}

        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-white font-semibold text-xs hover:bg-slate-900 transition-colors shadow-xs"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
