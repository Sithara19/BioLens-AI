export type ModalityType = 'eye' | 'tongue' | 'nail' | 'skin';

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
 * A value of 0 means that the modality was not provided
 * and therefore was not used in the multimodal fusion.
 *
 * The values can be dynamically normalized among the
 * modalities that are actually available.
 */
export interface ModalityContributions {
  eye: number;
  tongue: number;
  nail: number;
  skin: number;
}

export interface ScreeningResult {
  sessionId: string;
  createdAt: string;
  predictions: Prediction[];

  /*
   * Contribution percentages are calculated only for
   * modalities whose images were actually provided.
   */
  modalityContributions: ModalityContributions;

  /*
   * Every modality exists as a key, but an empty string
   * means that the user skipped that image.
   */
  images: Record<ModalityType, string>;

  isDemoMode: boolean;

  overallAssessment: {
    summary: string;
    primaryObservedPatterns: string[];
    recommendedFollowUp: string;
  };

  attentionMaps?: Record<
    ModalityType,
    {
      description: string;
      heatmapUrl?: string;
      keyRegions: string[];
    }
  >;
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
