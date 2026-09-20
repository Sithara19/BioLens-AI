import {
  ModalityType,
  ScreeningResult,
  UserProfile,
  ScreeningHistoryItem,
} from '../types';
import { runDemoAnalysis } from './demoAnalysis';
import { storage } from './storage';

/**
 * BioLens AI Service Layer
 *
 * Handles communication with the FastAPI backend.
 *
 * Important multimodal rule:
 * - Only submitted images are analyzed.
 * - Skipped modalities are excluded from the analysis request.
 * - Skipped modalities always have contribution = 0.
 * - The remaining available modalities may be normalized for fusion.
 *
 * The current frontend can fall back to demo inference while the
 * FastAPI/deep-learning backend is being developed.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const ALL_MODALITIES: ModalityType[] = [
  'eye',
  'tongue',
  'nail',
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
   * Ensure the result always contains all four modality keys.
   *
   * Missing/skipped modalities receive:
   * - empty image
   * - contribution = 0
   */
  private normalizeResult(
    result: ScreeningResult,
    originalImages: Record<ModalityType, string>
  ): ScreeningResult {
    const availableModalities = ALL_MODALITIES.filter(
      (modality) =>
        typeof originalImages[modality] === 'string' &&
        originalImages[modality].trim().length > 0
    );

    const skippedModalities = ALL_MODALITIES.filter(
      (modality) => !availableModalities.includes(modality)
    );

    /**
     * Keep the four image slots in the result.
     * A skipped modality remains empty and is never treated as normal.
     */
    const normalizedImages: Record<ModalityType, string> = {
      eye: originalImages.eye || '',
      tongue: originalImages.tongue || '',
      nail: originalImages.nail || '',
      skin: originalImages.skin || '',
    };

    /**
     * Remove skipped modalities from prediction metadata.
     *
     * This prevents a skipped body part from appearing as if it
     * contributed to a prediction.
     */
    const normalizedPredictions = (result.predictions || [])
      .map((prediction) => {
        const validModalities = (prediction.modalities || []).filter(
          (modality) => availableModalities.includes(modality)
        );

        return {
          ...prediction,
          modalities: validModalities,
        };
      })
      .filter((prediction) => prediction.modalities.length > 0);

    /**
     * Normalize modality contributions.
     *
     * The important rule is that skipped modalities ALWAYS equal 0.
     *
     * If the backend supplies meaningful modality weights, preserve
     * their relative proportions and normalize them across the
     * available modalities.
     *
     * If no usable weights are supplied, use equal contribution
     * temporarily for the prototype.
     *
     * These are NOT clinical weights. Real fusion weights should
     * eventually come from validated model/calibration experiments.
     */
    const rawContributions = result.modalityContributions || {
      eye: 0,
      tongue: 0,
      nail: 0,
      skin: 0,
    };

    const availableRawWeights = availableModalities.map(
      (modality) => Number(rawContributions[modality]) || 0
    );

    const rawWeightSum = availableRawWeights.reduce(
      (sum, weight) => sum + weight,
      0
    );

    const normalizedContributions: Record<ModalityType, number> = {
      eye: 0,
      tongue: 0,
      nail: 0,
      skin: 0,
    };

    if (availableModalities.length > 0) {
      if (rawWeightSum > 0) {
        availableModalities.forEach((modality) => {
          const weight = Number(rawContributions[modality]) || 0;

          normalizedContributions[modality] = Math.round(
            (weight / rawWeightSum) * 100
          );
        });

        /**
         * Correct rounding so available contributions add exactly to 100.
         */
        const currentTotal = availableModalities.reduce(
          (sum, modality) => sum + normalizedContributions[modality],
          0
        );

        if (currentTotal !== 100) {
          const correctionModality = availableModalities[0];

          normalizedContributions[correctionModality] +=
            100 - currentTotal;
        }
      } else {
        /**
         * Temporary prototype fallback:
         * equal contribution among available modalities.
         */
        const equalWeight = Math.floor(
          100 / availableModalities.length
        );

        let remaining = 100;

        availableModalities.forEach((modality, index) => {
          if (index === availableModalities.length - 1) {
            normalizedContributions[modality] = remaining;
          } else {
            normalizedContributions[modality] = equalWeight;
            remaining -= equalWeight;
          }
        });
      }
    }

    /**
     * Make sure skipped modalities explicitly remain zero.
     */
    skippedModalities.forEach((modality) => {
      normalizedContributions[modality] = 0;
    });

    /**
     * If every submitted image produced no meaningful prediction,
     * use a neutral screening statement instead of inventing a disease.
     */
    const hasPredictions = normalizedPredictions.length > 0;

    const normalizedAssessment = result.overallAssessment || {
      summary: '',
      primaryObservedPatterns: [],
      recommendedFollowUp: '',
    };

    let summary = normalizedAssessment.summary;

    if (!hasPredictions) {
      summary =
        'No significant visual risk indicators were identified in the submitted images.';
    }

    const skippedText =
      skippedModalities.length > 0
        ? ` ${skippedModalities
            .map(
              (modality) =>
                `${modality.charAt(0).toUpperCase()}${modality.slice(1)}`
            )
            .join(', ')} ${skippedModalities.length === 1 ? 'was' : 'were'} skipped and not analyzed.`
        : '';

    /**
     * Always keep the screening disclaimer in the final service result.
     */
    const recommendedFollowUp =
      normalizedAssessment.recommendedFollowUp ||
      'This is a preliminary visual screening result, not a medical diagnosis. Consult a qualified healthcare professional if you have symptoms or concerns.';

    return {
      ...result,

      images: normalizedImages,

      predictions: normalizedPredictions,

      modalityContributions: normalizedContributions,

      overallAssessment: {
        ...normalizedAssessment,
        summary: `${summary}${skippedText}`,
        recommendedFollowUp,
      },

      /**
       * Current frontend implementation is still operating as a
       * prototype until the actual trained backend models are connected.
       */
      isDemoMode: result.isDemoMode ?? true,
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

    // Local prototype fallback.
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

    // Local prototype fallback.
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
   * IMPORTANT:
   * Only modalities containing an actual image are sent to the
   * analysis pipeline.
   *
   * Example:
   *
   * Eye   -> image
   * Tongue -> skipped
   * Nail  -> image
   * Skin  -> skipped
   *
   * Backend receives:
   * {
   *   eye: "...",
   *   nail: "..."
   * }
   *
   * Tongue and Skin are NOT analyzed.
   */
  async analyzeScreening(
    images: Record<ModalityType, string>
  ): Promise<ScreeningResult> {
    const availableImages = this.getAvailableImages(images);

    const availableCount = Object.keys(availableImages).length;

    /**
     * Defensive check.
     *
     * Analysis should normally never be started with zero images,
     * because AnalysisPage already prevents this.
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
          skin: 0,
        },

        images: {
          eye: '',
          tongue: '',
          nail: '',
          skin: '',
        },

        isDemoMode: true,

        overallAssessment: {
          summary:
            'No images were submitted for visual screening.',
          primaryObservedPatterns: [],
          recommendedFollowUp:
            'Please submit at least one supported image if you want to perform a screening. This system provides preliminary screening only and is not a medical diagnosis.',
        },
      };

      storage.addHistory(emptyResult);

      return emptyResult;
    }

    /**
     * Try the real FastAPI backend first.
     */
    try {
      const res = await fetch(`${this.baseUrl}/analyze`, {
        method: 'POST',
        headers: this.getAuthHeaders(),

        /**
         * Send ONLY available images.
         *
         * This is the key change for skipped-modality handling.
         */
        body: JSON.stringify({
          images: availableImages,
        }),
      });

      if (res.ok) {
        const backendResult: ScreeningResult = await res.json();

        /**
         * Normalize the backend result so the frontend still has
         * predictable four-modality structure and skipped modalities
         * cannot accidentally contribute.
         */
        const normalizedResult = this.normalizeResult(
          backendResult,
          images
        );

        storage.addHistory(normalizedResult);

        return normalizedResult;
      }
    } catch {
      // Server not connected -> use demo analysis service.
    }

    /**
     * Demo fallback.
     *
     * Demo analysis also receives only available images.
     * This prevents skipped modalities from being analyzed.
     */
    const demoResult = runDemoAnalysis(
      availableImages as Record<ModalityType, string>
    );

    const normalizedDemoResult = this.normalizeResult(
      demoResult,
      images
    );

    storage.addHistory(normalizedDemoResult);

    return normalizedDemoResult;
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
