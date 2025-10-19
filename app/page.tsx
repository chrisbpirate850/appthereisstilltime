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
import { hasAnalyticsAccess } from '@/lib/subscription/tiers';

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

export default function Home() {
  const userId = getUserId();
  const router = useRouter();

  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(true);

  // UI state management
  const [showHourglassSelector, setShowHourglassSelector] = useState(false);
  const [showCustomHourglass, setShowCustomHourglass] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [signupReason, setSignupReason] = useState<'trial_expired' | 'trial_limit' | 'feature_locked' | 'voluntary'>('voluntary');
  const [milestoneToast, setMilestoneToast] = useState<{
    message: string;
  } | null>(null);
  const [completedSessionId, setCompletedSessionId] = useState<string | null>(null);
  const [subscription, setSubscription] = useState(null);

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
  const { availableHourglasses, selectedHourglass, selectHourglass } =
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

    // Record session
    const durationMinutes = timerState.duration / 60;
    const sessionId = `session_${Date.now()}`;
    await recordSession(
      durationMinutes,
      selectedHourglass.id,
      undefined
    );

    setCompletedSessionId(sessionId);

    // Check for new milestones
    if (userStats) {
      const newStats = {
        ...userStats,
        totalSessions: userStats.totalSessions + 1,
        totalMinutes: userStats.totalMinutes + durationMinutes,
        totalHours: Math.floor(
          (userStats.totalMinutes + durationMinutes) / 60
        ),
      };

      const newMilestones = checkNewMilestones(newStats);

      if (newMilestones.length > 0) {
        // Show first milestone
        setMilestoneToast({ message: newMilestones[0].message });

        // Save milestone
        await addMilestoneReached(userId, newMilestones[0].id);
      }
    }

    // Show reflection modal (if enabled)
    if (preferences?.enableJournaling && featureFlags.phase4_journaling) {
      setShowReflection(true);
    }
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

  const handleCustomHourglassSubmit = async (prompt: string) => {
    // TODO: Implement API call to generate custom hourglass
    console.log('Generating custom hourglass:', prompt);
    setShowCustomHourglass(false);

    // Show loading toast
    setMilestoneToast({
      message: 'Generating your custom hourglass... This may take 30-60 seconds.',
    });
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
            {userStats && (
              <div className="mt-1 text-xs sm:text-sm text-twilight-300">
                {userStats.totalSessions} sessions · {userStats.totalHours}h
                focused
              </div>
            )}
          </div>

          {/* Settings (unlocked after first session) */}
          {canShowSettings && (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Dashboard Button (Focus+ tier) */}
              {!isAnonymous && hasAnalyticsAccess(subscription) && (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="glass rounded-full p-2 sm:p-3 transition-smooth hover:bg-twilight-600/30"
                  aria-label="Analytics Dashboard"
                  title="Dashboard"
                >
                  <svg
                    className="h-4 w-4 sm:h-5 sm:w-5 text-twilight-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </button>
              )}

              {/* Hourglass Selector Button (Phase 2) */}
              {featureFlags.phase2_symbolicMapping && (
                <button
                  onClick={() => setShowHourglassSelector(true)}
                  className="glass rounded-full p-2 sm:p-3 transition-smooth hover:bg-twilight-600/30"
                  aria-label="Change hourglass theme"
                  title="Change hourglass"
                >
                  <svg
                    className="h-4 w-4 sm:h-5 sm:w-5 text-twilight-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
              )}

              {/* Custom AI Hourglass Button (Phase 3) */}
              {featureFlags.phase3_customAI && isPremium && (
                <button
                  onClick={() => setShowCustomHourglass(true)}
                  className="glass rounded-full p-2 sm:p-3 transition-smooth hover:bg-gold-600/30"
                  aria-label="Create custom hourglass"
                  title="AI Custom Hourglass"
                >
                  <svg
                    className="h-4 w-4 sm:h-5 sm:w-5 text-gold-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </button>
              )}

              {/* Settings Button */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="glass rounded-full p-2 sm:p-3 transition-smooth hover:bg-twilight-600/30"
                aria-label="Settings"
                title="Settings"
              >
                <svg
                  className="h-4 w-4 sm:h-5 sm:w-5 text-twilight-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            </div>
          )}
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
          <p className="text-xs sm:text-sm text-twilight-400">
            There is still time to{' '}
            <span className="text-twilight-200">
              {selectedHourglass.promptText}
            </span>
          </p>
        </div>
      </div>

      {/* Modals */}
      {showHourglassSelector && (
        <HourglassSelector
          availableHourglasses={availableHourglasses}
          selectedId={selectedHourglass.id}
          onSelect={selectHourglass}
          onClose={() => setShowHourglassSelector(false)}
        />
      )}

      {showCustomHourglass && (
        <CustomHourglassModal
          onSubmit={handleCustomHourglassSubmit}
          onClose={() => setShowCustomHourglass(false)}
          isGenerating={false}
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
