import React, { useState } from 'react';
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
   * Five supported image modalities:
   *
   * Eye
   * Tongue
   * Nail
   * Palm
   * Skin
   *
   * Empty string = image was skipped/not provided.
   */
  const [capturedImages, setCapturedImages] =
    useState<Record<ModalityType, string>>({
      eye: '',
      tongue: '',
      nail: '',
      palm: '',
      skin: '',
    });

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
     * Every new screening starts with completely
     * empty image state.
     *
     * Empty image = modality skipped/not uploaded.
     */
    setCapturedImages({
      eye: '',
      tongue: '',
      nail: '',
      palm: '',
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
  // CapturePage controls the actual sequence:
  //
  // Eye -> Tongue -> Nail -> Palm -> Skin
  //
  // When Skin is finished, CapturePage calls
  // onFinishedAll instead of providing another modality.
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
  // Nail   -> Palm
  // Palm   -> Skin
  // Skin   -> All Captured
  //
  // The skipped modality remains empty, so the backend
  // will not receive an image for that modality.
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
        setCaptureModality('palm');
        setCurrentView('capture');
        break;

      case 'palm':
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
     * AnalysisPage receives all five possible image keys.
     *
     * It and the API layer determine which modalities
     * actually contain images.
     */
    setCurrentView('analysis');
  };

  // =========================================================
  // ANALYSIS COMPLETE
  // =========================================================

  const handleAnalysisComplete = (
    result: ScreeningResult
  ) => {
    /*
     * TEMPORARY DEBUGGING:
     * Verify exactly what reaches App.tsx after
     * the real backend response is transformed.
     */
    console.log(
      'BIOLENS FINAL SCREENING RESULT:',
      result
    );

    console.log(
      'BIOLENS FINAL PREDICTIONS:',
      result.predictions
    );

    console.log(
      'BIOLENS PREDICTION CONDITIONS:',
      result.predictions.map(
        (prediction) => prediction.condition
      )
    );

    setCurrentResult(result);

    /*
     * Refresh history after the real backend analysis.
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
        ==================================================== */}

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
        ==================================================== */}

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
        ==================================================== */}

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
        ==================================================== */}

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
        ==================================================== */}

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
            Eye -> Tongue -> Nail -> Palm -> Skin
        ==================================================== */}

        {currentView === 'capture' && (
          <CapturePage
            /*
             * Force a fresh CapturePage instance whenever
             * the modality changes.
             *
             * This makes Skip reliably move through:
             * Eye -> Tongue -> Nail -> Palm -> Skin.
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
        ==================================================== */}

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
        ==================================================== */}

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
        ==================================================== */}

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
        ==================================================== */}

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
        ==================================================== */}

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
        ==================================================== */}

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