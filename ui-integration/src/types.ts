export type ModalityType = 'eye' | 'tongue' | 'nail' | 'palm' | 'skin';

export interface ScreeningImage {
  type: ModalityType;
  imageUrl: string;
  capturedAt?: string;
  source?: 'camera' | 'upload' | 'sample';
  fileName?: string;
}

export type RiskLevel = 'low' | 'moderate' | 'high';

export interface Prediction {
  condition: string;
  probability: number;
  riskLevel: RiskLevel;
  modalities: ModalityType[];
  description?: string;
  clinicalSignificance?: string;
  observedFeatures?: string[];
}

/*
 * AI contribution of each modality.
 *
 * For BioLens, anemia contributions are calculated using
 * modality ablation in the backend for Eye + Nail + Palm.
 *
 * Other modalities may have a value of 0 because they are
 * not part of the anemia fusion model.
 */
export interface ModalityContributions {
  eye: number;
  tongue: number;
  nail: number;
  palm: number;
  skin: number;
}

export interface ScreeningResult {
  sessionId: string;
  createdAt: string;
  predictions: Prediction[];

  /*
   * Contribution percentages are calculated only for
   * modalities that are actually used by the relevant model.
   */
  modalityContributions: ModalityContributions;

  /*
   * Every supported modality exists as a key.
   * An empty string means that the user skipped that image.
   */
  images: Record<ModalityType, string>;

  /*
   * BioLens uses the real backend models.
   * This is retained for compatibility with the existing
   * frontend data structure, but exhibition results must
   * not be presented as simulated/demo results.
   */
  isDemoMode: boolean;

  overallAssessment: {
    summary: string;
    primaryObservedPatterns: string[];
    recommendedFollowUp: string;
  };

  /*
   * Reserved for future explainability features.
   * The current backend does not generate attention maps.
   */
  attentionMaps?: Record<
    ModalityType,
    {
      description: string;
      heatmapUrl?: string;
      keyRegions: string[];
    }
  >;
}

/*
 * ============================================================
 * REAL BACKEND RESPONSE TYPES
 * ============================================================
 *
 * These interfaces match the JSON returned by:
 *
 * POST /api/analyze
 *
 * The backend runs the actual BioLens inference modules:
 * - Eye -> Diabetes
 * - Eye -> Jaundice
 * - Eye + Nail + Palm -> Anemia
 * - Nail -> Nail Disease
 * - Skin -> Skin Disease
 * - Tongue -> Tongue Detection
 */

export interface BackendDiabetesResult {
  module: 'diabetes';
  predicted_class: 'Healthy' | 'Diabetes';
  diabetes_probability: number;
  class_probabilities: {
    Healthy: number;
    Diabetes: number;
  };
}

export interface BackendJaundiceResult {
  module: 'jaundice';
  predicted_class: 'Healthy' | 'Jaundice';
  jaundice_probability: number;
  class_probabilities: {
    Healthy: number;
    Jaundice: number;
  };
}

export interface BackendAnemiaResult {
  module: 'anemia';
  predicted_class: 'Anemia' | 'Non-Anemia';
  anemia_probability: number;
  threshold: number;
  contributions: {
    eye: number;
    nail: number;
    palm: number;
  };
}

export interface BackendNailResult {
  module: 'nail';
  predicted_class: string;
  predicted_class_probability: number;
  class_probabilities: Record<string, number>;
}

export interface BackendSkinResult {
  module: 'skin';
  predicted_class: string;
  predicted_class_probability: number;
  class_probabilities: Record<string, number>;
}

export interface BackendTongueDetection {
  label: string;
  confidence: number;
  bbox: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
}

export interface BackendTongueResult {
  module: 'tongue';
  predicted_class: string | null;
  detections: BackendTongueDetection[];
  detection_count: number;
}

export interface BackendAnalyzeResponse {
  status: 'success';
  results: {
    diabetes?: BackendDiabetesResult;
    jaundice?: BackendJaundiceResult;
    anemia?: BackendAnemiaResult;
    nail?: BackendNailResult;
    skin?: BackendSkinResult;
    tongue?: BackendTongueResult;

    /*
     * The backend catches individual model errors so that
     * one failed module does not necessarily stop the others.
     */
    diabetes_error?: string;
    jaundice_error?: string;
    anemia_error?: string;
    nail_error?: string;
    skin_error?: string;
    tongue_error?: string;
  };
}

export interface UserProfile {
  name: string;
  email: string;
  age?: number;
  gender?: string;
}

export interface ScreeningHistoryItem {
  sessionId: string;
  date: string;
  status: 'Completed' | 'In Progress';
  imageCount: number;
  result: ScreeningResult;
}

export type AppView =
  | 'landing'
  | 'signup'
  | 'login'
  | 'dashboard'
  | 'consent'
  | 'capture'
  | 'all-captured'
  | 'review'
  | 'analysis'
  | 'results'
  | 'history'
  | 'profile';
