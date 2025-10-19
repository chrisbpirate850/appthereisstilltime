import { useState, useEffect, useCallback } from 'react';
import { getUserPreferences, updateUserPreferences } from '@/lib/firebase/firestore';
import { getUserId } from '@/lib/utils/userId';
import { UserPreferences } from '@/types';

interface UsePreferencesReturn {
  preferences: UserPreferences | null;
  loading: boolean;
  updateTheme: (theme: 'zen' | 'dusk' | 'midnight') => Promise<void>;
  toggleAnimations: () => Promise<void>;
  toggleSound: () => Promise<void>;
  toggleJournaling: () => Promise<void>;
}

const DEFAULT_PREFERENCES: Partial<UserPreferences> = {
  theme: 'zen',
  enableAnimations: true,
  enableSound: true,
  enableJournaling: false,
  selectedHourglassId: 'zen-default',
};

export function usePreferences(): UsePreferencesReturn {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const userId = getUserId();

  // Load preferences on mount
  useEffect(() => {
    async function loadPreferences() {
      try {
        let prefs = await getUserPreferences(userId);

        // If no preferences exist, create default
        if (!prefs) {
          await updateUserPreferences(userId, DEFAULT_PREFERENCES);
          prefs = (await getUserPreferences(userId)) as UserPreferences;
        }

        // If still null (offline mode), use defaults
        if (!prefs) {
          prefs = DEFAULT_PREFERENCES as UserPreferences;
        }

        setPreferences(prefs);
      } catch (error) {
        console.error('Error loading preferences:', error);
        // Use default preferences on error
        setPreferences(DEFAULT_PREFERENCES as UserPreferences);
      } finally {
        setLoading(false);
      }
    }

    loadPreferences();
  }, [userId]);

  // Update theme
  const updateTheme = useCallback(
    async (theme: 'zen' | 'dusk' | 'midnight') => {
      try {
        await updateUserPreferences(userId, { theme });
        setPreferences((prev) => (prev ? { ...prev, theme } : null));
      } catch (error) {
        console.error('Error updating theme:', error);
      }
    },
    [userId]
  );

  // Toggle animations
  const toggleAnimations = useCallback(async () => {
    try {
      const newValue = !preferences?.enableAnimations;
      await updateUserPreferences(userId, { enableAnimations: newValue });
      setPreferences((prev) =>
        prev ? { ...prev, enableAnimations: newValue } : null
      );
    } catch (error) {
      console.error('Error toggling animations:', error);
    }
  }, [userId, preferences]);

  // Toggle sound
  const toggleSound = useCallback(async () => {
    try {
      const newValue = !preferences?.enableSound;
      await updateUserPreferences(userId, { enableSound: newValue });
      setPreferences((prev) => (prev ? { ...prev, enableSound: newValue } : null));
    } catch (error) {
      console.error('Error toggling sound:', error);
    }
  }, [userId, preferences]);

  // Toggle journaling
  const toggleJournaling = useCallback(async () => {
    try {
      const newValue = !preferences?.enableJournaling;
      await updateUserPreferences(userId, { enableJournaling: newValue });
      setPreferences((prev) =>
        prev ? { ...prev, enableJournaling: newValue } : null
      );
    } catch (error) {
      console.error('Error toggling journaling:', error);
    }
  }, [userId, preferences]);

  return {
    preferences,
    loading,
    updateTheme,
    toggleAnimations,
    toggleSound,
    toggleJournaling,
  };
}
