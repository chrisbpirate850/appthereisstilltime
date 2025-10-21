'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useTimer } from '@/lib/hooks/useTimer';
import { useSessionTracking } from '@/lib/hooks/useSessionTracking';
import { useHourglassLibrary } from '@/lib/hooks/useHourglassLibrary';
import { usePreferences } from '@/lib/hooks/usePreferences';
import { useTrialLimits } from '@/lib/hooks/useTrialLimits';
import { getFeatureFlags, isPremiumUser } from '@/lib/utils/featureFlags';
import { getUserSubscription } from '@/lib/firebase/firestore';
import { createReflection } from '@/lib/firebase/firestore';
import { addMilestoneReached } from '@/lib/firebase/firestore';
import { getUserId } from '@/lib/utils/userId';
import { useRouter } from 'next/navigation';
import { hasAnalyticsAccess, hasStudyRoomsAccess, getImageCredits } from '@/lib/subscription/tiers';

// Components
import { SessionPresets } from '@/components/Timer/SessionPresets';
import { TimerDisplay } from '@/components/Timer/TimerDisplay';
import { HourglassAnimation } from '@/components/Timer/HourglassAnimation';
import { HourglassSelector } from '@/components/Personalization/HourglassSelector';
import { CustomHourglassModal } from '@/components/Personalization/CustomHourglassModal';
import { MilestoneToast } from '@/components/Progression/MilestoneToast';
import { ReflectionModal } from '@/components/Progression/ReflectionModal';
import { SignupModal } from '@/components/Auth/SignupModal';
import { TrialBanner } from '@/components/Auth/TrialBanner';
import { HamburgerMenu } from '@/components/Navigation/HamburgerMenu';
import { SessionCompletionModal } from '@/components/Sharing/SessionCompletionModal';

export default function Home() {
  const userId = getUserId();
  const router = useRouter();
  // Test CI/CD deployment

  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(true);

  // UI state management
  const [showHourglassSelector, setShowHourglassSelector] = useState(false);
  const [showCustomHourglass, setShowCustomHourglass] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [completionData, setCompletionData] = useState<{
    durationMinutes: number;
    totalSessions: number;
    totalHours: number;
    currentStreak: number;
  } | null>(null);
  const [signupReason, setSignupReason] = useState<'trial_expired' | 'trial_limit' | 'feature_locked' | 'voluntary'>('voluntary');
  const [milestoneToast, setMilestoneToast] = useState<{
    message: string;
  } | null>(null);
  const [completedSessionId, setCompletedSessionId] = useState<string | null>(null);
  const [subscription, setSubscription] = useState(null);
  const [previousSessionCount, setPreviousSessionCount] = useState<number>(0);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  // Trial limits hook (now with Firestore sync)
  const {
    shouldPromptSignup,
    sessionsRemainingToday,
    isTrialExpired,
    recordTrialSession,
    clearTrialState,
    isLoading: trialLoading,
  } = useTrialLimits(currentUser?.uid);

  // Custom hooks
  const { userStats, recordSession, checkNewMilestones } = useSessionTracking();
  const { availableHourglasses, selectedHourglass, selectHourglass, refreshCustomHourglasses } =
    useHourglassLibrary(userStats);
  const { preferences, updateTheme, toggleAnimations } = usePreferences();

  // Feature flags
  const featureFlags = userStats
    ? getFeatureFlags(userStats, subscription)
    : {
        phase2_symbolicMapping: false,
        phase3_customAI: false,
        phase4_journaling: false,
        phase5_premium: false,
      };

  const isPremium = isPremiumUser(subscription);

  // Listen to auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAnonymous(user?.isAnonymous ?? true);

      console.log('🔐 Auth state changed:', {
        uid: user?.uid,
        isAnonymous: user?.isAnonymous,
        email: user?.email,
      });
    });

    return () => unsubscribe();
  }, []);

  // Load subscription (for registered users only)
  useEffect(() => {
    if (!currentUser || currentUser.isAnonymous) {
      setSubscription(null);
      return;
    }

    async function loadSubscription() {
      const sub = await getUserSubscription(userId);
      setSubscription(sub as any);
    }
    loadSubscription();
  }, [userId, currentUser]);

  // Check for milestones when session count increases
  useEffect(() => {
    if (!userStats) return;

    // Only check if session count increased
    if (userStats.totalSessions > previousSessionCount && previousSessionCount > 0) {
      const newMilestones = checkNewMilestones(userStats);

      if (newMilestones.length > 0) {
        // Show first milestone
        setMilestoneToast({ message: newMilestones[0].message });

        // Save milestone
        addMilestoneReached(userId, newMilestones[0].id);
      }
    }

    // Update previous count
    setPreviousSessionCount(userStats.totalSessions);
  }, [userStats?.totalSessions, checkNewMilestones, userId, previousSessionCount]);

  // Timer hook
  const onTimerComplete = async () => {
    // Play gentle sound (if enabled)
    if (preferences?.enableSound) {
      const audio = new Audio('/sounds/completion.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Ignore if audio can't play
      });
    }

    // Record session (this will update userStats via the hook)
    const durationMinutes = timerState.duration / 60;
    const sessionId = `session_${Date.now()}`;

    // Calculate what the stats WILL BE after this session
    const currentStats = userStats || { totalSessions: 0, totalHours: 0, currentStreak: 0 };
    const newTotalSessions = currentStats.totalSessions + 1;
    const newTotalHours = currentStats.totalHours + (durationMinutes / 60);

    // Show completion modal immediately with projected stats
    setCompletionData({
      durationMinutes,
      totalSessions: newTotalSessions,
      totalHours: newTotalHours,
      currentStreak: currentStats.currentStreak || 0,
    });
    setShowCompletion(true);

    // Record session in background (this will update userStats via the hook)
    await recordSession(
      durationMinutes,
      selectedHourglass.id,
      undefined
    );

    setCompletedSessionId(sessionId);

    // Note: Milestone checking happens in useEffect below when userStats updates
    // Note: Reflection modal will be shown after completion modal is closed
  };

  const {
    timerState,
    startTimer,
    pauseTimer,
    resumeTimer,
    endTimer,
    progress,
  } = useTimer(onTimerComplete);

  // Handlers
  const handleStartSession = (durationMinutes: number) => {
    // Check trial limits for anonymous users
    if (isAnonymous && currentUser) {
      // Check if trial has expired
      if (isTrialExpired) {
        setSignupReason('trial_expired');
        setShowSignup(true);
        return;
      }

      // Check daily session limit
      if (sessionsRemainingToday === 0) {
        setSignupReason('trial_limit');
        setShowSignup(true);
        return;
      }

      // Record trial session
      recordTrialSession();
    }

    // Start the timer
    startTimer(durationMinutes);
  };

  // Handle successful signup
  const handleSignupSuccess = (user: User) => {
    console.log('✅ Signup successful:', user.uid);
    console.log('✅ User email:', user.email);
    console.log('✅ Is anonymous:', user.isAnonymous);

    // Force update the current user state
    setCurrentUser(user);
    setIsAnonymous(user.isAnonymous);

    // Clear trial state
    clearTrialState();

    // Close modal
    setShowSignup(false);

    // Show welcome toast
    setMilestoneToast({
      message: 'Welcome! You now have unlimited sessions.',
    });
  };

  const handleReflectionSubmit = async (
    reflection: string,
    guidedTheme?: string
  ) => {
    if (completedSessionId) {
      await createReflection({
        userId,
        sessionId: completedSessionId,
        text: reflection,
        guidedTheme,
      });
    }
    setShowReflection(false);
    setCompletedSessionId(null);
  };

  const handleReflectionSkip = () => {
    setShowReflection(false);
    setCompletedSessionId(null);
  };

  const handleCompletionContinue = () => {
    setShowCompletion(false);

    // After completion modal, show reflection modal if enabled
    if (preferences?.enableJournaling && featureFlags.phase4_journaling && completedSessionId) {
      setShowReflection(true);
    }
  };

  const handleCompletionClose = () => {
    setShowCompletion(false);
    setCompletionData(null);
  };

  const handleCustomHourglassSubmit = async (prompt: string, style: string) => {
    console.log('Generating custom hourglass:', prompt, style);
    setIsGeneratingImage(true);
    setGeneratedImageUrl(null);

    try {
      // Call the Cloud Function to generate the image
      const response = await fetch('https://us-central1-there-is-still-time.cloudfunctions.net/generateImage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          style,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();

      if (data.success && data.imageUrl && data.hourglassId) {
        // Show the generated image
        setGeneratedImageUrl(data.imageUrl);
        setIsGeneratingImage(false);

        // Refresh the custom hourglasses list
        await refreshCustomHourglasses();

        // Auto-select the new custom hourglass
        const customHourglassId = `custom_${data.hourglassId}`;
        await selectHourglass(customHourglassId);

        console.log('Generated hourglass:', data);
      } else {
        throw new Error(data.error || 'Failed to generate image');
      }
    } catch (error: any) {
      console.error('Error generating hourglass:', error);
      setIsGeneratingImage(false);
      setShowCustomHourglass(false);
      setMilestoneToast({
        message: '❌ Failed to generate hourglass. Please try again.',
      });
    }
  };

  const handleCloseCustomHourglass = () => {
    setShowCustomHourglass(false);
    setIsGeneratingImage(false);
    setGeneratedImageUrl(null);
  };

  // Settings unlocked after first session
  const canShowSettings = userStats && userStats.totalSessions > 0;

  return (
    <main className="relative min-h-screen">
      {/* Background Video */}
      <HourglassAnimation
        videoUrl={selectedHourglass.videoUrl}
        prefersReducedMotion={!preferences?.enableAnimations}
      />

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4 sm:p-6">
        {/* Header */}
        <div className="absolute left-4 right-4 sm:left-6 sm:right-6 top-4 sm:top-6 flex items-start justify-between">
          {/* Logo/Title */}
          <div>
            <h1 className="text-lg sm:text-2xl font-light tracking-wide text-white">
              There Is Still Time
            </h1>
            <p className="text-xs sm:text-sm text-twilight-400 italic">
              Get Locked In and Achieve
            </p>
            {userStats && (
              <div className="mt-1 text-xs sm:text-sm text-twilight-300">
                {userStats.totalSessions} sessions · {userStats.totalHours}h
                focused
              </div>
            )}
          </div>

          {/* Hamburger Menu (always visible) */}
          <HamburgerMenu
            currentUser={currentUser}
            isAnonymous={isAnonymous}
            subscription={subscription}
            sessionsRemainingToday={sessionsRemainingToday}
            onSignupClick={() => {
              setSignupReason('voluntary');
              setShowSignup(true);
            }}
          />
        </div>

        {/* Timer or Session Select */}
        <div className="flex-1 flex items-center justify-center">
          {!timerState.isActive && timerState.remaining === 0 ? (
            <SessionPresets onSelectDuration={handleStartSession} />
          ) : (
            <TimerDisplay
              remainingSeconds={timerState.remaining}
              progress={progress}
              isActive={timerState.isActive}
              isPaused={timerState.isPaused}
              onPause={pauseTimer}
              onResume={resumeTimer}
              onEnd={endTimer}
            />
          )}
        </div>

        {/* Footer */}
        <div className="absolute bottom-4 sm:bottom-6 text-center px-4">
          <button
            onClick={() => setShowHourglassSelector(true)}
            className="group flex items-center gap-2 glass rounded-full px-4 py-2 transition-smooth hover:bg-twilight-600/30"
          >
            <span className="text-xs sm:text-sm text-twilight-400">
              There is still time to{' '}
              <span className="text-twilight-200 group-hover:text-white transition-smooth">
                {selectedHourglass.promptText}
              </span>
            </span>
            <svg className="w-4 h-4 text-twilight-400 group-hover:text-twilight-200 transition-smooth" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Modals */}
      {showCompletion && completionData && (
        <SessionCompletionModal
          durationMinutes={completionData.durationMinutes}
          totalSessions={completionData.totalSessions}
          totalHours={completionData.totalHours}
          currentStreak={completionData.currentStreak}
          onClose={handleCompletionClose}
          onContinue={handleCompletionContinue}
        />
      )}

      {showHourglassSelector && (
        <HourglassSelector
          availableHourglasses={availableHourglasses}
          selectedId={selectedHourglass.id}
          onSelect={selectHourglass}
          onClose={() => setShowHourglassSelector(false)}
          onCreateCustom={() => setShowCustomHourglass(true)}
        />
      )}

      {showCustomHourglass && (
        <CustomHourglassModal
          onSubmit={handleCustomHourglassSubmit}
          onClose={handleCloseCustomHourglass}
          isGenerating={isGeneratingImage}
          generatedImageUrl={generatedImageUrl || undefined}
          creditsRemaining={getImageCredits(subscription).unlimited ? 'unlimited' : getImageCredits(subscription).monthly}
        />
      )}

      {showReflection && completedSessionId && (
        <ReflectionModal
          sessionId={completedSessionId}
          onSubmit={handleReflectionSubmit}
          onSkip={handleReflectionSkip}
          isPremium={isPremium}
        />
      )}

      {/* Milestone Toast */}
      {milestoneToast && (
        <MilestoneToast
          message={milestoneToast.message}
          onClose={() => setMilestoneToast(null)}
        />
      )}

      {/* Trial Banner (for anonymous users only, hidden during active session) */}
      {isAnonymous && !timerState.isActive && (
        <TrialBanner onSignupClick={() => {
          setSignupReason('voluntary');
          setShowSignup(true);
        }} />
      )}

      {/* Signup Modal */}
      {showSignup && (
        <SignupModal
          onClose={() => setShowSignup(false)}
          onSuccess={handleSignupSuccess}
          currentAnonymousUser={currentUser}
          reason={signupReason}
        />
      )}

      {/* Settings Panel (TODO: Implement) */}
      {showSettings && (
        <div className="fixed right-6 top-20 z-40 glass-strong w-72 rounded-2xl p-6 shadow-2xl">
          <h3 className="mb-4 text-lg font-medium text-white">Settings</h3>
          {/* TODO: Add settings controls */}
          <p className="text-sm text-twilight-300">Settings panel coming soon</p>
        </div>
      )}
    </main>
  );
}
