import {
  ModalityType,
  ScreeningResult,
  UserProfile,
  ScreeningHistoryItem,
  BackendAnalyzeResponse,
  Prediction,
} from '../types';
import { storage } from './storage';

/**
 * BioLens AI Service Layer
 *
 * Handles communication with the real FastAPI backend.
 *
 * Supported modalities:
 * - Eye
 * - Tongue
 * - Nail
 * - Palm
 * - Skin
 *
 * Backend analysis:
 * - Eye -> Diabetes
 * - Eye -> Jaundice
 * - Eye + Nail + Palm -> Anemia
 * - Nail -> Nail Disease
 * - Skin -> Skin Disease
 * - Tongue -> Tongue Findings
 *
 * IMPORTANT:
 * This service does NOT fall back to simulated/demo inference.
 * If the real backend is unavailable, analysis fails clearly.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const ALL_MODALITIES: ModalityType[] = [
  'eye',
  'tongue',
  'nail',
  'palm',
  'skin',
];

class BioLensApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthHeaders(): HeadersInit {
    const token = storage.getToken();

    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  /**
   * Return only modalities that actually contain an image.
   *
   * Empty strings represent skipped modalities.
   */
  private getAvailableImages(
    images: Record<ModalityType, string>
  ): Partial<Record<ModalityType, string>> {
    const availableImages: Partial<Record<ModalityType, string>> = {};

    ALL_MODALITIES.forEach((modality) => {
      const image = images[modality];

      if (typeof image === 'string' && image.trim().length > 0) {
        availableImages[modality] = image;
      }
    });

    return availableImages;
  }

  /**
   * Convert a backend probability into the old frontend riskLevel field.
   *
   * This is TEMPORARY compatibility for the existing Prediction type.
   *
   * IMPORTANT:
   * These are NOT clinical risk levels.
   * The actual UI will later be changed to display
   * "Model Probability" instead of medical risk labels.
   */
  private getCompatibilityRiskLevel(): 'low' | 'moderate' | 'high' {
    return 'moderate';
  }

  /**
   * Build a frontend Prediction object.
   */
  private createPrediction(
    condition: string,
    probability: number,
    modalities: ModalityType[],
    description: string,
    observedFeatures?: string[]
  ): Prediction {
    return {
      condition,
      probability,
      riskLevel: this.getCompatibilityRiskLevel(),
      modalities,
      description,
      observedFeatures,
    };
  }

  /**
   * Convert the REAL FastAPI response into the frontend
   * ScreeningResult structure.
   *
   * No predictions are invented here.
   * Only modules actually returned by the backend are included.
   */
  private transformBackendResult(
    backendResponse: BackendAnalyzeResponse,
    originalImages: Record<ModalityType, string>
  ): ScreeningResult {
    const backend = backendResponse.results;

    const predictions: Prediction[] = [];

    /*
     * ----------------------------------------------------------
     * DIABETES
     * Eye image -> Diabetes ViT-Tiny
     * ----------------------------------------------------------
     */
    if (backend.diabetes) {
      const diabetes = backend.diabetes;

      predictions.push(
        this.createPrediction(
          `Diabetes Screening: ${diabetes.predicted_class}`,
          diabetes.diabetes_probability,
          ['eye'],
          `The eye image was processed by the BioLens diabetes screening model. Model prediction: ${diabetes.predicted_class}.`,
          [
            `Healthy model probability: ${(
              diabetes.class_probabilities.Healthy * 100
            ).toFixed(2)}%`,
            `Diabetes model probability: ${(
              diabetes.class_probabilities.Diabetes * 100
            ).toFixed(2)}%`,
          ]
        )
      );
    }

    /*
     * ----------------------------------------------------------
     * JAUNDICE
     * Eye image -> Jaundice ViT-Tiny
     * ----------------------------------------------------------
     */
    if (backend.jaundice) {
      const jaundice = backend.jaundice;

      predictions.push(
        this.createPrediction(
          `Jaundice Screening: ${jaundice.predicted_class}`,
          jaundice.jaundice_probability,
          ['eye'],
          `The eye image was processed by the BioLens jaundice screening model. Model prediction: ${jaundice.predicted_class}.`,
          [
            `Healthy model probability: ${(
              jaundice.class_probabilities.Healthy * 100
            ).toFixed(2)}%`,
            `Jaundice model probability: ${(
              jaundice.class_probabilities.Jaundice * 100
            ).toFixed(2)}%`,
          ]
        )
      );
    }

    /*
     * ----------------------------------------------------------
     * ANEMIA
     * Eye + Nail + Palm -> Mask-Aware Fusion Model
     * ----------------------------------------------------------
     */
    if (backend.anemia) {
      const anemia = backend.anemia;

      predictions.push(
        this.createPrediction(
          `Anemia Screening: ${anemia.predicted_class}`,
          anemia.anemia_probability,
          ['eye', 'nail', 'palm'],
          `The Eye, Nail, and Palm images were processed together by the BioLens anemia fusion model. Model prediction: ${anemia.predicted_class}.`,
          [
            `Anemia model probability: ${(
              anemia.anemia_probability * 100
            ).toFixed(2)}%`,
            `Decision threshold: ${(
              anemia.threshold * 100
            ).toFixed(2)}%`,
          ]
        )
      );
    }

    /*
     * ----------------------------------------------------------
     * NAIL DISEASE
     * Nail image -> ViT-Tiny
     * ----------------------------------------------------------
     */
    if (backend.nail) {
      const nail = backend.nail;

      const nailProbabilities = Object.entries(
        nail.class_probabilities
      )
        .sort(
          ([, probabilityA], [, probabilityB]) =>
            probabilityB - probabilityA
        )
        .slice(0, 3)
        .map(
          ([label, probability]) =>
            `${label}: ${(probability * 100).toFixed(2)}%`
        );

      predictions.push(
        this.createPrediction(
          `Nail Screening: ${nail.predicted_class}`,
          nail.predicted_class_probability,
          ['nail'],
          `The nail image was processed by the BioLens nail screening model. Model prediction: ${nail.predicted_class}.`,
          nailProbabilities
        )
      );
    }

    /*
     * ----------------------------------------------------------
     * SKIN DISEASE
     * Skin image -> EfficientNet-B0
     * ----------------------------------------------------------
     */
    if (backend.skin) {
      const skin = backend.skin;

      const skinProbabilities = Object.entries(
        skin.class_probabilities
      )
        .sort(
          ([, probabilityA], [, probabilityB]) =>
            probabilityB - probabilityA
        )
        .slice(0, 3)
        .map(
          ([label, probability]) =>
            `${label}: ${(probability * 100).toFixed(2)}%`
        );

      predictions.push(
        this.createPrediction(
          `Skin Screening: ${skin.predicted_class}`,
          skin.predicted_class_probability,
          ['skin'],
          `The skin image was processed by the BioLens skin screening model. Model prediction: ${skin.predicted_class}.`,
          skinProbabilities
        )
      );
    }

    /*
     * ----------------------------------------------------------
     * TONGUE
     * Tongue image -> YOLO detection model
     * ----------------------------------------------------------
     *
     * Tongue confidence is detection confidence.
     * It is NOT treated as classification probability or accuracy.
     */
    if (backend.tongue) {
      const tongue = backend.tongue;

      if (
        tongue.detection_count > 0
      ) {
        const topDetection = tongue.detections
          .slice()
          .sort(
            (a, b) => b.confidence - a.confidence
          )[0];

        predictions.push(
          this.createPrediction(
            `Tongue Finding: ${topDetection.label}`,
            topDetection.confidence,
            ['tongue'],
            `The tongue image was processed by the BioLens tongue detection model. Observed model finding: ${topDetection.label}.`,
            [
              `Detection confidence: ${(
                topDetection.confidence * 100
              ).toFixed(2)}%`,
              `Total detections: ${tongue.detection_count}`,
            ]
          )
        );
      } else if (tongue.detection_count === 0) {
        /*
         * No detection is not treated as "Healthy".
         * We simply do not create a disease/finding prediction.
         */
      }
    }

    /*
     * ----------------------------------------------------------
     * IMAGE STRUCTURE
     * ----------------------------------------------------------
     *
     * Always keep all five modality keys.
     * Skipped modalities remain empty.
     */
    const normalizedImages: Record<ModalityType, string> = {
      eye: originalImages.eye || '',
      tongue: originalImages.tongue || '',
      nail: originalImages.nail || '',
      palm: originalImages.palm || '',
      skin: originalImages.skin || '',
    };

    /*
     * ----------------------------------------------------------
     * ANEMIA CONTRIBUTIONS
     * ----------------------------------------------------------
     *
     * These come ONLY from the backend's actual ablation-based
     * anemia fusion calculation.
     *
     * They are NOT clinical importance scores.
     *
     * Other modalities are 0 because they are not part of the
     * anemia fusion model.
     */
    const modalityContributions = {
      eye: backend.anemia?.contributions.eye || 0,
      tongue: 0,
      nail: backend.anemia?.contributions.nail || 0,
      palm: backend.anemia?.contributions.palm || 0,
      skin: 0,
    };

    /*
     * ----------------------------------------------------------
     * SKIPPED MODALITIES
     * ----------------------------------------------------------
     */
    const availableModalities = ALL_MODALITIES.filter(
      (modality) =>
        typeof normalizedImages[modality] === 'string' &&
        normalizedImages[modality].trim().length > 0
    );

    const skippedModalities = ALL_MODALITIES.filter(
      (modality) => !availableModalities.includes(modality)
    );

    const skippedText =
      skippedModalities.length > 0
        ? ` ${skippedModalities
            .map(
              (modality) =>
                `${modality.charAt(0).toUpperCase()}${modality.slice(1)}`
            )
            .join(', ')} ${
            skippedModalities.length === 1 ? 'was' : 'were'
          } skipped and not analyzed.`
        : '';

    /*
     * ----------------------------------------------------------
     * OVERALL ASSESSMENT
     * ----------------------------------------------------------
     *
     * This is a neutral screening summary.
     * It does not claim diagnosis.
     */
    let summary: string;

    if (predictions.length === 0) {
      summary =
        'No model findings were returned for the submitted images.';
    } else {
      summary = `BioLens processed ${predictions.length} model output${
        predictions.length === 1 ? '' : 's'
      } from the submitted body images. These are model predictions from a research screening prototype and are not medical diagnoses.`;
    }

    summary += skippedText;

    const primaryObservedPatterns = predictions.map(
      (prediction) => prediction.condition
    );

    /*
     * ----------------------------------------------------------
     * FINAL SCREENING RESULT
     * ----------------------------------------------------------
     */
    return {
      sessionId: `screening_${Date.now()}`,
      createdAt: new Date().toISOString(),

      predictions,

      modalityContributions,

      images: normalizedImages,

      /*
       * This came from the real FastAPI backend.
       */
      isDemoMode: false,

      overallAssessment: {
        summary,

        primaryObservedPatterns,

        recommendedFollowUp:
          'BioLens provides preliminary visual screening outputs from trained machine-learning models. These results are not a medical diagnosis. Consult a qualified healthcare professional if you have symptoms, concerns, or need clinical evaluation.',
      },
    };
  }

  /**
   * Check if the FastAPI backend is reachable.
   */
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * User Registration -> POST /api/auth/signup
   *
   * Existing local fallback is retained because authentication
   * is outside the current model-integration task.
   */
  async signup(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<{ token: string; user: UserProfile }> {
    try {
      const res = await fetch(`${this.baseUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const result = await res.json();

        storage.setToken(result.token);
        storage.setUser(result.user);

        return result;
      }
    } catch {
      // Fall through to local persistence for prototype.
    }

    const user: UserProfile = {
      name: data.name,
      email: data.email,
      age: 28,
      gender: 'Not specified',
    };

    const token = 'demo_token_' + Date.now();

    storage.setUser(user);
    storage.setToken(token);

    return { token, user };
  }

  /**
   * User Login -> POST /api/auth/login
   */
  async login(
    email: string,
    password: string
  ): Promise<{ token: string; user: UserProfile }> {
    try {
      const res = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const result = await res.json();

        storage.setToken(result.token);
        storage.setUser(result.user);

        return result;
      }
    } catch {
      // Fall through to local fallback.
    }

    let user = storage.getUser();

    if (!user || user.email !== email) {
      user = {
        name: email
          .split('@')[0]
          .replace('.', ' ')
          .replace(/\b\w/g, (letter) => letter.toUpperCase()),
        email,
        age: 28,
        gender: 'Not specified',
      };

      storage.setUser(user);
    }

    const token = 'demo_token_' + Date.now();

    storage.setToken(token);

    return { token, user };
  }

  /**
   * Get User Profile -> GET /api/profile
   */
  async getProfile(): Promise<UserProfile> {
    try {
      const res = await fetch(`${this.baseUrl}/profile`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (res.ok) {
        const data = await res.json();

        storage.setUser(data);

        return data;
      }
    } catch {
      // Local fallback.
    }

    return storage.getUser();
  }

  /**
   * Update User Profile -> PUT /api/profile
   */
  async updateProfile(
    profile: Partial<UserProfile>
  ): Promise<UserProfile> {
    try {
      const res = await fetch(`${this.baseUrl}/profile`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        const data = await res.json();

        storage.setUser(data);

        return data;
      }
    } catch {
      // Local fallback.
    }

    const current = storage.getUser();

    const updated: UserProfile = {
      ...current,
      ...profile,
    };

    storage.setUser(updated);

    return updated;
  }

  /**
   * Upload individual modality image -> POST /api/upload/{modality}
   */
  async uploadModality(
    sessionId: string,
    modality: ModalityType,
    imageData: string
  ): Promise<{ success: boolean; imageUrl: string }> {
    try {
      const res = await fetch(
        `${this.baseUrl}/upload/${modality}`,
        {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({
            sessionId,
            modality,
            imageData,
          }),
        }
      );

      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Local fallback.
    }

    return {
      success: true,
      imageUrl: imageData,
    };
  }

  /**
   * Run Multimodal Analysis -> POST /api/analyze
   *
   * This uses ONLY the real FastAPI backend.
   *
   * Available images are sent as base64 Data URLs:
   *
   * {
   *   images: {
   *     eye: "...",
   *     tongue: "...",
   *     nail: "...",
   *     palm: "...",
   *     skin: "..."
   *   }
   * }
   *
   * Skipped modalities are omitted from the request.
   */
  async analyzeScreening(
    images: Record<ModalityType, string>
  ): Promise<ScreeningResult> {
    const availableImages = this.getAvailableImages(images);

    const availableCount = Object.keys(availableImages).length;

    /*
     * Defensive check.
     *
     * AnalysisPage should normally prevent this situation.
     */
    if (availableCount === 0) {
      const emptyResult: ScreeningResult = {
        sessionId: `screening_${Date.now()}`,
        createdAt: new Date().toISOString(),

        predictions: [],

        modalityContributions: {
          eye: 0,
          tongue: 0,
          nail: 0,
          palm: 0,
          skin: 0,
        },

        images: {
          eye: '',
          tongue: '',
          nail: '',
          palm: '',
          skin: '',
        },

        isDemoMode: false,

        overallAssessment: {
          summary:
            'No images were submitted for visual screening.',
          primaryObservedPatterns: [],
          recommendedFollowUp:
            'Please submit at least one supported image to perform a screening. BioLens provides preliminary visual screening outputs and is not a medical diagnosis.',
        },
      };

      return emptyResult;
    }

    /*
     * ----------------------------------------------------------
     * REAL BACKEND REQUEST
     * ----------------------------------------------------------
     */
    let response: Response;

    try {
      response = await fetch(`${this.baseUrl}/analyze`, {
        method: 'POST',
        headers: this.getAuthHeaders(),

        /*
         * Send ONLY modalities that actually contain images.
         */
        body: JSON.stringify({
          images: availableImages,
        }),
      });
    } catch (error) {
      throw new Error(
        'BioLens backend is not reachable. Please make sure the FastAPI server is running on port 8000.'
      );
    }

    /*
     * ----------------------------------------------------------
     * BACKEND HTTP ERROR
     * ----------------------------------------------------------
     */
    if (!response.ok) {
      let detail = '';

      try {
        const errorBody = await response.json();

        if (errorBody?.detail) {
          detail =
            typeof errorBody.detail === 'string'
              ? errorBody.detail
              : JSON.stringify(errorBody.detail);
        }
      } catch {
        // Ignore JSON parsing failure.
      }

      throw new Error(
        `BioLens analysis failed (HTTP ${response.status})${
          detail ? `: ${detail}` : '.'
        }`
      );
    }

    /*
     * ----------------------------------------------------------
     * PARSE REAL BACKEND RESPONSE
     * ----------------------------------------------------------
     */
    let backendResult: BackendAnalyzeResponse;

    try {
      backendResult =
        (await response.json()) as BackendAnalyzeResponse;
    } catch {
      throw new Error(
        'BioLens backend returned an invalid analysis response.'
      );
    }

    /*
     * Make sure the backend returned the expected top-level status.
     */
    if (backendResult.status !== 'success') {
      throw new Error(
        'BioLens backend did not return a successful analysis status.'
      );
    }

    /*
     * ----------------------------------------------------------
     * TRANSFORM BACKEND -> FRONTEND
     * ----------------------------------------------------------
     */
    const screeningResult = this.transformBackendResult(
      backendResult,
      images
    );

    /*
     * Save the REAL result to local history.
     */
    storage.addHistory(screeningResult);

    return screeningResult;
  }

  /**
   * Retrieve Results by Session ID -> GET /api/results/{session_id}
   */
  async getResults(
    sessionId: string
  ): Promise<ScreeningResult | null> {
    try {
      const res = await fetch(
        `${this.baseUrl}/results/${sessionId}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(),
        }
      );

      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Local fallback.
    }

    const history = storage.getHistory();

    const found = history.find(
      (item) => item.sessionId === sessionId
    );

    if (found) {
      return found.result;
    }

    const latest = storage.getLatestResult();

    if (latest && latest.sessionId === sessionId) {
      return latest;
    }

    return null;
  }

  /**
   * Retrieve Screening History -> GET /api/history
   */
  async getHistory(): Promise<ScreeningHistoryItem[]> {
    try {
      const res = await fetch(`${this.baseUrl}/history`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Local fallback.
    }

    return storage.getHistory();
  }
}

export const api = new BioLensApiClient(API_BASE_URL);

