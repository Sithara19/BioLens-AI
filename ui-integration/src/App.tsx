import React, { useState, useEffect } from 'react';
import {
  AppView,
  ModalityType,
  ScreeningResult,
  UserProfile,
  ScreeningHistoryItem,
} from './types';

import { storage } from './services/storage';
import { api } from './services/api';

import { Navbar } from './components/Navbar';

import { LandingPage } from './pages/LandingPage';
import { SignUpPage } from './pages/SignUpPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ConsentPage } from './pages/ConsentPage';
import { CapturePage } from './pages/CapturePage';
import { AllCapturedPage } from './pages/AllCapturedPage';
import { ReviewPage } from './pages/ReviewPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { ResultsPage } from './pages/ResultsPage';
import { HistoryPage } from './pages/HistoryPage';
import { ProfilePage } from './pages/ProfilePage';

export default function App() {
  const [currentView, setCurrentView] =
    useState<AppView>('landing');

  const [user, setUser] =
    useState<UserProfile | null>(() =>
      storage.getUser()
    );

  const [history, setHistory] =
    useState<ScreeningHistoryItem[]>(() =>
      storage.getHistory()
    );

  const [currentResult, setCurrentResult] =
    useState<ScreeningResult | null>(() =>
      storage.getLatestResult()
    );

  // =========================================================
  // ACTIVE SCREENING CAPTURE STATE
  // =========================================================

  const [captureModality, setCaptureModality] =
    useState<ModalityType>('eye');

  /*
   * Four modalities:
   *
   * Eye
   * Tongue
   * Nail
   * Skin
   *
   * Empty string = image was skipped/not provided.
   */
  const [capturedImages, setCapturedImages] =
    useState<Record<ModalityType, string>>({
      eye: '',
      tongue: '',
      nail: '',
      skin: '',
    });

  // =========================================================
  // SEED SAMPLE HISTORY
  // =========================================================

  useEffect(() => {
    const existing = storage.getHistory();

    if (existing.length === 0) {
      const initialSeed: ScreeningHistoryItem = {
        sessionId: 'BL-842910',
        date: 'September 12, 2026',
        status: 'Completed',

        /*
         * Demo history contains 3 images.
         * Tongue was not used in this old demo record.
         */
        imageCount: 3,

        result: {
          sessionId: 'BL-842910',
          createdAt: '2026-09-12T14:30:00.000Z',

          predictions: [
            {
              condition: 'Anemia',
              probability: 0.74,
              riskLevel: 'moderate',
              modalities: ['eye', 'nail'],

              description:
                'BioLens screening indicates a moderate observed risk pattern for anemia indicators based on eye and nail image analysis.',

              clinicalSignificance:
                'Lower eyelid and nail bed color tone provide visual indications that may be associated with anemia-related visual patterns.',

              observedFeatures: [
                'Eye: Slight pale tint observed in lower eyelid area',
                'Nail: Mild pale coloration in nail bed',
              ],
            },

            {
              condition: 'Jaundice',
              probability: 0.94,
              riskLevel: 'low',
              modalities: ['eye', 'skin'],

              description:
                'BioLens screening indicates a low observed risk pattern for jaundice-related discoloration in the analyzed eye and skin images.',

              clinicalSignificance:
                'The screening checks for visible color patterns that may be associated with jaundice.',

              observedFeatures: [
                'Eye: Clear sclera tone within normal visual limits',
                'Skin: Normal surface color balance',
              ],
            },

            {
              condition: 'Diabetes Risk Indicators',
              probability: 0.82,
              riskLevel: 'low',
              modalities: ['skin', 'nail'],

              description:
                'BioLens screening indicates a low observed risk pattern for visible skin or nail markers associated with metabolic health.',

              clinicalSignificance:
                'The screening checks for visible skin and nail patterns that may warrant further clinical evaluation.',

              observedFeatures: [
                'Skin: Even skin texture with no observed dark patches or dryness',
                'Nail: Healthy nail contour and smooth surface appearance',
              ],
            },
          ],

          /*
           * OLD DEMO RESULT.
           *
           * Tongue = 0 because no tongue image was used.
           *
           * These values are only for displaying the historical
           * demo result. New screening results should calculate
           * contributions dynamically from modalities that
           * actually have images.
           */
          modalityContributions: {
            eye: 44,
            tongue: 0,
            nail: 32,
            skin: 24,
          },

          /*
           * Tongue is intentionally empty in this old demo.
           */
          images: {
            eye: '',
            tongue: '',
            nail: '',
            skin: '',
          },

          isDemoMode: true,

          overallAssessment: {
            summary:
              'Screening indicated a mild pale tint in the lower eyelid with nail and skin tones within the expected visual range.',

            primaryObservedPatterns: [
              'Mild pale coloration in lower eyelid',
              'Normal nail contour and skin tone patterns',
            ],

            recommendedFollowUp:
              'This is a preliminary visual screening result, not a diagnosis. Consult a qualified healthcare professional if you have symptoms or health concerns.',
          },
        },
      };

      storage.addHistory(initialSeed.result);

      setHistory(storage.getHistory());
    }
  }, []);

  // =========================================================
  // LOGIN / SIGNUP
  // =========================================================

  const handleLoginSuccess = (
    loggedInUser: UserProfile
  ) => {
    setUser(loggedInUser);
    setCurrentView('dashboard');
  };

  const handleSignUpSuccess = (
    newUser: UserProfile
  ) => {
    setUser(newUser);
    setCurrentView('dashboard');
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    storage.setToken(null);

    setUser(null);
    setCurrentView('landing');
  };

  // =========================================================
  // START NEW SCREENING
  // =========================================================

  const handleStartScreening = () => {
    /*
     * Start every screening with completely empty image state.
     *
     * Empty image = modality skipped/not uploaded.
     */
    setCapturedImages({
      eye: '',
      tongue: '',
      nail: '',
      skin: '',
    });

    /*
     * Always begin with Eye.
     */
    setCaptureModality('eye');

    /*
     * Consent comes before image capture.
     */
    setCurrentView('consent');
  };

  // =========================================================
  // CONSENT ACCEPTED
  // =========================================================

  const handleAcceptConsent = () => {
    setCaptureModality('eye');
    setCurrentView('capture');
  };

  // =========================================================
  // SAVE IMAGE
  // =========================================================

  const handleSaveModalityImage = (
    modality: ModalityType,
    imageUrl: string
  ) => {
    setCapturedImages((previous) => ({
      ...previous,
      [modality]: imageUrl,
    }));
  };

  // =========================================================
  // MOVE TO NEXT MODALITY
  //
  // Eye -> Tongue -> Nail -> Skin
  // =========================================================

  const handleNextModality = (
    next: ModalityType
  ) => {
    setCaptureModality(next);
    setCurrentView('capture');
  };

  // =========================================================
  // SKIP CURRENT MODALITY
  //
  // Eye    -> Tongue
  // Tongue -> Nail
  // Nail   -> Skin
  // Skin   -> All Captured
  //
  // The skipped modality remains an empty string.
  // Therefore its AI model will NOT be included later.
  // =========================================================

  const handleSkipModality = (
    modality: ModalityType
  ) => {
    /*
     * Make absolutely sure that the skipped modality
     * has no image associated with it.
     */
    setCapturedImages((previous) => ({
      ...previous,
      [modality]: '',
    }));

    /*
     * Move directly to the next modality.
     */
    switch (modality) {
      case 'eye':
        setCaptureModality('tongue');
        setCurrentView('capture');
        break;

      case 'tongue':
        setCaptureModality('nail');
        setCurrentView('capture');
        break;

      case 'nail':
        setCaptureModality('skin');
        setCurrentView('capture');
        break;

      case 'skin':
        setCurrentView('all-captured');
        break;
    }
  };

  // =========================================================
  // AFTER ALL MODALITIES
  // =========================================================

  const handleFinishedAll = () => {
    setCurrentView('all-captured');
  };

  // =========================================================
  // GO TO REVIEW
  // =========================================================

  const handleGoToReview = () => {
    setCurrentView('review');
  };

  // =========================================================
  // RETAKE MODALITY
  // =========================================================

  const handleRetakeModality = (
    modality: ModalityType
  ) => {
    setCaptureModality(modality);
    setCurrentView('capture');
  };

  // =========================================================
  // UPDATE IMAGE FROM REVIEW
  // =========================================================

  const handleUpdateImageFromReview = (
    modality: ModalityType,
    newUrl: string
  ) => {
    setCapturedImages((previous) => ({
      ...previous,
      [modality]: newUrl,
    }));
  };

  // =========================================================
  // START ANALYSIS
  // =========================================================

  const handleStartAnalysis = () => {
    /*
     * AnalysisPage receives capturedImages.
     *
     * It will determine which modalities actually have
     * images and only send/use those modalities.
     */
    setCurrentView('analysis');
  };

  // =========================================================
  // ANALYSIS COMPLETE
  // =========================================================

  const handleAnalysisComplete = (
    result: ScreeningResult
  ) => {
    setCurrentResult(result);

    /*
     * Refresh history after analysis.
     */
    setHistory(storage.getHistory());

    setCurrentView('results');
  };

  // =========================================================
  // VIEW HISTORICAL RESULT
  // =========================================================

  const handleViewHistoricalResult = (
    result: ScreeningResult
  ) => {
    setCurrentResult(result);
    setCurrentView('results');
  };

  // =========================================================
  // CAPTURE FLOW NAVIGATION STATE
  // =========================================================

  const isCapturing =
    currentView === 'consent' ||
    currentView === 'capture' ||
    currentView === 'all-captured' ||
    currentView === 'review' ||
    currentView === 'analysis';

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">

      {/* =====================================================
          UNIVERSAL NAVIGATION
      ====================================================== */}

      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        user={user}
        onLogout={handleLogout}
        isCapturing={isCapturing}
      />

      {/* =====================================================
          MAIN VIEW ROUTER
      ====================================================== */}

      <main className="flex-1 flex flex-col">

        {/* ===================================================
            LANDING
        =================================================== */}

        {currentView === 'landing' && (
          <LandingPage
            onGetStarted={() => {
              if (user) {
                handleStartScreening();
              } else {
                setCurrentView('signup');
              }
            }}
            onLogin={() =>
              setCurrentView('login')
            }
          />
        )}

        {/* ===================================================
            SIGN UP
        =================================================== */}

        {currentView === 'signup' && (
          <SignUpPage
            onSuccess={handleSignUpSuccess}
            onGoToLogin={() =>
              setCurrentView('login')
            }
          />
        )}

        {/* ===================================================
            LOGIN
        =================================================== */}

        {currentView === 'login' && (
          <LoginPage
            onSuccess={handleLoginSuccess}
            onGoToSignUp={() =>
              setCurrentView('signup')
            }
          />
        )}

        {/* ===================================================
            DASHBOARD
        =================================================== */}

        {currentView === 'dashboard' &&
          user && (
            <DashboardPage
              user={user}
              history={history}
              onStartScreening={
                handleStartScreening
              }
              onViewResult={
                handleViewHistoricalResult
              }
              onGoToProfile={() =>
                setCurrentView('profile')
              }
              onGoToHistory={() =>
                setCurrentView('history')
              }
            />
          )}

        {/* ===================================================
            CONSENT
        =================================================== */}

        {currentView === 'consent' && (
          <ConsentPage
            onAcceptConsent={
              handleAcceptConsent
            }
            onCancel={() =>
              setCurrentView(
                user ? 'dashboard' : 'landing'
              )
            }
          />
        )}

        {/* ===================================================
            CAPTURE
            Eye -> Tongue -> Nail -> Skin
        =================================================== */}

        {currentView === 'capture' && (
          <CapturePage
            /*
             * Force a fresh CapturePage instance whenever
             * the modality changes.
             *
             * This makes Skip reliably move from:
             * Eye -> Tongue -> Nail -> Skin.
             */
            key={captureModality}

            currentModality={
              captureModality
            }

            capturedImages={
              capturedImages
            }

            onSaveImage={
              handleSaveModalityImage
            }

            onNextModality={
              handleNextModality
            }

            onFinishedAll={
              handleFinishedAll
            }

            onSkipModality={
              handleSkipModality
            }

            onCancelScreening={() =>
              setCurrentView('dashboard')
            }
          />
        )}

        {/* ===================================================
            ALL CAPTURED
        =================================================== */}

        {currentView ===
          'all-captured' && (
          <AllCapturedPage
            images={capturedImages}
            onReviewImages={
              handleGoToReview
            }
            onContinueToAnalysis={
              handleStartAnalysis
            }
          />
        )}

        {/* ===================================================
            REVIEW
        =================================================== */}

        {currentView === 'review' && (
          <ReviewPage
            images={capturedImages}
            onRetakeModality={
              handleRetakeModality
            }
            onContinueToAnalysis={
              handleStartAnalysis
            }
            onUpdateImage={
              handleUpdateImageFromReview
            }
          />
        )}

        {/* ===================================================
            ANALYSIS
        =================================================== */}

        {currentView === 'analysis' && (
          <AnalysisPage
            images={capturedImages}
            onAnalysisComplete={
              handleAnalysisComplete
            }
          />
        )}

        {/* ===================================================
            RESULTS
        =================================================== */}

        {currentView === 'results' &&
          currentResult && (
            <ResultsPage
              result={currentResult}
              onNewScreening={
                handleStartScreening
              }
            />
          )}

        {/* ===================================================
            HISTORY
        =================================================== */}

        {currentView === 'history' && (
          <HistoryPage
            history={history}
            onSelectResult={
              handleViewHistoricalResult
            }
            onStartNewScreening={
              handleStartScreening
            }
          />
        )}

        {/* ===================================================
            PROFILE
        =================================================== */}

        {currentView === 'profile' &&
          user && (
            <ProfilePage
              user={user}
              onProfileUpdated={(updated) =>
                setUser(updated)
              }
            />
          )}

      </main>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="w-full bg-white border-t border-slate-200/80 py-6 px-4 text-center text-xs text-slate-500">

        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">

          <div className="flex items-center gap-2">

            <span className="font-bold text-slate-800">
              BioLens AI
            </span>

            <span>—</span>

            <span className="italic">
              See Beyond the Surface.
            </span>

          </div>

          <div className="text-[11px] text-slate-400">
            Multimodal Health-Risk Screening
            Research Prototype • Designed for
            Academic Healthcare Demonstration
          </div>

        </div>

      </footer>

    </div>
  );
}
