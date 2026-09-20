
import {
  ModalityType,
  ScreeningResult,
  Prediction,
} from '../types';

/**
 * All modalities supported by BioLens.
 */
const ALL_MODALITIES: ModalityType[] = [
  'eye',
  'tongue',
  'nail',
  'skin',
];

/**
 * Generates an SVG data URL representing an experimental
 * Grad-CAM / Attention-style heatmap.
 *
 * IMPORTANT:
 * This is only a visual prototype placeholder.
 * It is NOT a real Grad-CAM output from a trained model.
 */
function createHeatmapOverlay(
  title: string,
  colorHex: string
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400" width="100%" height="100%">
    <defs>
      <radialGradient id="gradCam1" cx="52%" cy="48%" r="45%">
        <stop offset="0%" stop-color="#ef4444" stop-opacity="0.85"/>
        <stop offset="35%" stop-color="#f59e0b" stop-opacity="0.65"/>
        <stop offset="65%" stop-color="#10b981" stop-opacity="0.4"/>
        <stop offset="100%" stop-color="#0284c7" stop-opacity="0.05"/>
      </radialGradient>

      <radialGradient id="gradCam2" cx="30%" cy="65%" r="30%">
        <stop offset="0%" stop-color="#ef4444" stop-opacity="0.75"/>
        <stop offset="50%" stop-color="#f59e0b" stop-opacity="0.45"/>
        <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
      </radialGradient>
    </defs>

    <rect
      width="500"
      height="400"
      fill="#0f172a"
      fill-opacity="0.82"
    />

    <!-- Experimental activation zones -->
    <circle
      cx="260"
      cy="190"
      r="140"
      fill="url(#gradCam1)"
    />

    <circle
      cx="150"
      cy="260"
      r="90"
      fill="url(#gradCam2)"
    />

    <!-- Heatmap contour rings -->
    <ellipse
      cx="260"
      cy="190"
      rx="90"
      ry="65"
      fill="none"
      stroke="#ef4444"
      stroke-width="1.5"
      stroke-dasharray="4,4"
      opacity="0.8"
    />

    <ellipse
      cx="260"
      cy="190"
      rx="130"
      ry="100"
      fill="none"
      stroke="#f59e0b"
      stroke-width="1"
      stroke-dasharray="3,3"
      opacity="0.6"
    />

    <!-- Experimental focal crosshair -->
    <path
      d="M 240,190 L 280,190 M 260,170 L 260,210"
      stroke="#ffffff"
      stroke-width="2"
    />

    <text
      x="20"
      y="35"
      fill="#f8fafc"
      font-family="system-ui, sans-serif"
      font-size="13"
      font-weight="700"
      letter-spacing="0.5"
    >
      ATTENTION MAP [${title.toUpperCase()}]
    </text>

    <text
      x="20"
      y="55"
      fill="#94a3b8"
      font-family="system-ui, sans-serif"
      font-size="11"
    >
      Experimental visual attention field — prototype only
    </text>

    <rect
      x="20"
      y="345"
      width="460"
      height="36"
      rx="6"
      fill="#1e293b"
      fill-opacity="0.9"
    />

    <circle
      cx="38"
      cy="363"
      r="6"
      fill="${colorHex}"
    />

    <text
      x="54"
      y="367"
      fill="#e2e8f0"
      font-family="system-ui, sans-serif"
      font-size="11"
      font-weight="500"
    >
      Experimental saliency visualization — not a diagnostic finding
    </text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Determines which modalities actually contain images.
 *
 * Empty string = skipped / unavailable.
 */
function getAvailableModalities(
  images: Record<ModalityType, string>
): ModalityType[] {
  return ALL_MODALITIES.filter(
    (modality) =>
      typeof images[modality] === 'string' &&
      images[modality].trim().length > 0
  );
}

/**
 * Creates modality contributions for the prototype.
 *
 * IMPORTANT:
 * These are NOT medical weights.
 *
 * Until the trained models and validated fusion strategy are connected,
 * the demo gives equal contribution to each submitted modality.
 *
 * Skipped modalities always receive 0.
 *
 * Examples:
 *
 * Eye + Nail:
 * Eye   = 50
 * Tongue = 0
 * Nail  = 50
 * Skin  = 0
 *
 * Eye + Tongue + Nail:
 * Eye    = 34
 * Tongue = 33
 * Nail   = 33
 * Skin   = 0
 */
function createModalityContributions(
  availableModalities: ModalityType[]
): Record<ModalityType, number> {
  const contributions: Record<ModalityType, number> = {
    eye: 0,
    tongue: 0,
    nail: 0,
    skin: 0,
  };

  if (availableModalities.length === 0) {
    return contributions;
  }

  const baseValue = Math.floor(
    100 / availableModalities.length
  );

  let remaining = 100;

  availableModalities.forEach((modality, index) => {
    if (index === availableModalities.length - 1) {
      contributions[modality] = remaining;
    } else {
      contributions[modality] = baseValue;
      remaining -= baseValue;
    }
  });

  return contributions;
}

/**
 * Creates predictions only for modalities that are actually available.
 *
 * This is still DEMO behavior.
 *
 * The real trained model predictions will later replace this function.
 */
function createDemoPredictions(
  availableModalities: ModalityType[]
): Prediction[] {
  const predictions: Prediction[] = [];

  /**
   * ---------------------------------------------------------------
   * ANEMIA DEMO PATTERN
   * ---------------------------------------------------------------
   *
   * Requires Eye and/or Nail.
   *
   * Tongue can participate when available, but it is not treated
   * as a mandatory modality.
   */
  const anemiaModalities = availableModalities.filter((modality) =>
    ['eye', 'tongue', 'nail'].includes(modality)
  );

  if (anemiaModalities.length > 0) {
    predictions.push({
      condition: 'Anemia-related visual pattern',
      probability: 0.50,
      riskLevel: 'low',
      modalities: anemiaModalities,
      description:
        'The prototype identified visual features that can be associated with anemia-related screening patterns. This is a demonstration output and not a diagnosis.',
      clinicalSignificance:
        'Visual characteristics such as pallor may be relevant to preliminary screening, but image appearance alone cannot establish anemia or determine its cause.',
      observedFeatures: [
        'Experimental color and appearance analysis performed on submitted modalities',
        'Only submitted modalities were included in this assessment',
      ],
    });
  }

  /**
   * ---------------------------------------------------------------
   * JAUNDICE DEMO PATTERN
   * ---------------------------------------------------------------
   *
   * Eye and Skin are relevant visual inputs for this prototype.
   */
  const jaundiceModalities = availableModalities.filter((modality) =>
    ['eye', 'skin'].includes(modality)
  );

  if (jaundiceModalities.length > 0) {
    predictions.push({
      condition: 'Jaundice-related visual pattern',
      probability: 0.35,
      riskLevel: 'low',
      modalities: jaundiceModalities,
      description:
        'The prototype evaluated submitted eye and/or skin images for visible color patterns that may warrant further review.',
      clinicalSignificance:
        'Visible yellowing can have multiple causes and cannot be confirmed as jaundice from an image alone.',
      observedFeatures: [
        'Experimental color-balance analysis',
        'Visual surface appearance evaluated in submitted modalities',
      ],
    });
  }

  /**
   * ---------------------------------------------------------------
   * SKIN DEMO PATTERN
   * ---------------------------------------------------------------
   *
   * This is kept deliberately generic rather than claiming a
   * specific disease from the skin image.
   */
  if (availableModalities.includes('skin')) {
    predictions.push({
      condition: 'Skin visual pattern',
      probability: 0.25,
      riskLevel: 'low',
      modalities: ['skin'],
      description:
        'The prototype evaluated visible skin color and surface characteristics for patterns that may warrant additional assessment.',
      clinicalSignificance:
        'Skin appearance can vary because of lighting, pigmentation, environment, and many medical and non-medical factors. Image screening alone is not diagnostic.',
      observedFeatures: [
        'Experimental skin surface analysis',
        'Color and texture characteristics evaluated',
      ],
    });
  }

  return predictions;
}

/**
 * Creates attention maps only for submitted modalities.
 *
 * A skipped modality gets NO attention map because it was not analyzed.
 */
function createAttentionMaps(
  availableModalities: ModalityType[]
): ScreeningResult['attentionMaps'] {
  const attentionMaps: ScreeningResult['attentionMaps'] = {};

  if (availableModalities.includes('eye')) {
    attentionMaps.eye = {
      description:
        'Experimental visual attention is focused on relevant regions of the submitted eye image.',
      heatmapUrl: createHeatmapOverlay(
        'Eye',
        '#ef4444'
      ),
      keyRegions: [
        'Submitted eye region',
        'Visible sclera/lower eyelid area',
      ],
    };
  }

  if (availableModalities.includes('tongue')) {
    attentionMaps.tongue = {
      description:
        'Experimental visual attention is focused on the visible tongue surface.',
      heatmapUrl: createHeatmapOverlay(
        'Tongue',
        '#f43f5e'
      ),
      keyRegions: [
        'Tongue surface',
        'Visible tongue color/texture region',
      ],
    };
  }

  if (availableModalities.includes('nail')) {
    attentionMaps.nail = {
      description:
        'Experimental visual attention is focused on the submitted nail and nail-bed region.',
      heatmapUrl: createHeatmapOverlay(
        'Nail',
        '#10b981'
      ),
      keyRegions: [
        'Nail bed',
        'Visible nail surface',
      ],
    };
  }

  if (availableModalities.includes('skin')) {
    attentionMaps.skin = {
      description:
        'Experimental visual attention is focused on the submitted skin surface.',
      heatmapUrl: createHeatmapOverlay(
        'Skin',
        '#0ea5e9'
      ),
      keyRegions: [
        'Skin surface',
        'Visible color/texture area',
      ],
    };
  }

  return attentionMaps;
}

/**
 * Creates the overall screening assessment.
 */
function createOverallAssessment(
  availableModalities: ModalityType[],
  predictions: Prediction[]
): ScreeningResult['overallAssessment'] {
  /**
   * No prediction case.
   *
   * This is the result that will eventually be used when the
   * real trained models determine that no significant visual
   * risk indicators are present.
   */
  if (predictions.length === 0) {
    return {
      summary:
        'No significant visual risk indicators were identified in the submitted images.',

      primaryObservedPatterns: [
        'No significant visual risk pattern was identified by the current screening model.',
      ],

      recommendedFollowUp:
        'This is a preliminary visual screening result, not a medical diagnosis. If you have symptoms or health concerns, consult a qualified healthcare professional.',
    };
  }

  const modalityNames = availableModalities.map(
    (modality) =>
      modality.charAt(0).toUpperCase() +
      modality.slice(1)
  );

  return {
    summary:
      `The prototype evaluated the submitted ${modalityNames.join(
        ', '
      )} image${modalityNames.length === 1 ? '' : 's'} and identified visual patterns that may warrant further review. These findings are preliminary and are not a medical diagnosis.`,

    primaryObservedPatterns: [
      'Visual characteristics were evaluated only in the submitted modalities.',
      'Skipped modalities were excluded from the screening analysis.',
    ],

    recommendedFollowUp:
      'Use these findings as preliminary screening information only. If you have symptoms or concerns, discuss them with a qualified healthcare professional.',
  };
}

/**
 * Run BioLens client-side demo analysis.
 *
 * IMPORTANT:
 * This function does NOT represent the final BioLens AI model.
 * It is a temporary frontend demonstration until the trained
 * FastAPI models are connected.
 */
export function runDemoAnalysis(
  images: Record<ModalityType, string>
): ScreeningResult {
  const sessionId =
    'BL-' + Math.floor(100000 + Math.random() * 900000);

  const now = new Date().toISOString();

  /**
   * Determine exactly which images were submitted.
   */
  const availableModalities =
    getAvailableModalities(images);

  /**
   * Skipped modalities never enter the prediction pipeline.
   */
  const predictions =
    createDemoPredictions(availableModalities);

  /**
   * Only available modalities receive contribution.
   * Skipped modalities remain 0.
   */
  const modalityContributions =
    createModalityContributions(
      availableModalities
    );

  /**
   * Only available modalities receive an attention map.
   */
  const attentionMaps =
    createAttentionMaps(availableModalities);

  /**
   * Preserve all four image slots for the frontend.
   *
   * Empty string means:
   * "No image submitted — not analyzed."
   */
  const normalizedImages: Record<
    ModalityType,
    string
  > = {
    eye: images.eye || '',
    tongue: images.tongue || '',
    nail: images.nail || '',
    skin: images.skin || '',
  };

  return {
    sessionId,
    createdAt: now,

    predictions,

    modalityContributions,

    images: normalizedImages,

    isDemoMode: true,

    overallAssessment:
      createOverallAssessment(
        availableModalities,
        predictions
      ),

    attentionMaps,
  };
}
