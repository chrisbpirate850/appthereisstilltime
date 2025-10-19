import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getUserPreferences,
  updateUserPreferences,
  getUserSubscription,
} from '@/lib/firebase/firestore';
import { logHourglassChanged } from '@/lib/firebase/analytics';
import { getUserId } from '@/lib/utils/userId';
import { isHourglassUnlocked } from '@/lib/utils/featureFlags';
import { HourglassVideo, UserStats, UserPreferences, UserSubscription } from '@/types';
import { HOURGLASS_LIBRARY, DEFAULT_HOURGLASS_ID } from '@/app/constants/hourglassLibrary';

interface UseHourglassLibraryReturn {
  availableHourglasses: HourglassVideo[];
  selectedHourglass: HourglassVideo;
  selectHourglass: (hourglassId: string) => Promise<void>;
  loading: boolean;
}

export function useHourglassLibrary(
  userStats: UserStats | null
): UseHourglassLibraryReturn {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const userId = getUserId();

  // Load user preferences and subscription
  useEffect(() => {
    async function loadData() {
      try {
        const [prefs, sub] = await Promise.all([
          getUserPreferences(userId),
          getUserSubscription(userId),
        ]);

        setPreferences(prefs);
        setSubscription(sub);
      } catch (error) {
        console.error('Error loading hourglass data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [userId]);

  // Filter available hourglasses based on user progress
  const availableHourglasses = useMemo(() => {
    if (!userStats) return [HOURGLASS_LIBRARY[0]]; // Default only

    return HOURGLASS_LIBRARY.filter((hourglass) =>
      isHourglassUnlocked(
        hourglass.id,
        userStats,
        subscription,
        hourglass.unlockRequirement
      )
    );
  }, [userStats, subscription]);

  // Get selected hourglass
  const selectedHourglass = useMemo(() => {
    const selectedId = preferences?.selectedHourglassId || DEFAULT_HOURGLASS_ID;
    const hourglass = HOURGLASS_LIBRARY.find((h) => h.id === selectedId);

    // If selected hourglass is not unlocked, fallback to default
    if (
      hourglass &&
      userStats &&
      !isHourglassUnlocked(
        hourglass.id,
        userStats,
        subscription,
        hourglass.unlockRequirement
      )
    ) {
      return HOURGLASS_LIBRARY[0]; // Default
    }

    return hourglass || HOURGLASS_LIBRARY[0];
  }, [preferences, userStats, subscription]);

  // Select a different hourglass
  const selectHourglass = useCallback(
    async (hourglassId: string) => {
      const previousId = selectedHourglass.id;

      // Update local state immediately (optimistic update)
      setPreferences((prev) => ({
        ...(prev || {
          userId,
          theme: 'zen',
          enableAnimations: true,
          enableSound: true,
          enableJournaling: false,
          updatedAt: null as any,
        }),
        selectedHourglassId: hourglassId,
      }));

      // Try to save to Firebase (fails gracefully in offline mode)
      try {
        await updateUserPreferences(userId, {
          selectedHourglassId: hourglassId,
        });

        // Log analytics
        logHourglassChanged(userId, previousId, hourglassId);
      } catch (error) {
        console.log('Firebase offline - selection saved locally only');
      }
    },
    [userId, selectedHourglass]
  );

  return {
    availableHourglasses,
    selectedHourglass,
    selectHourglass,
    loading,
  };
}
