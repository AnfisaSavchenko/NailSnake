import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  ONBOARDING_COMPLETE: '@nailgrow:onboarding_complete',
  STREAK: '@nailgrow:streak',
  LONGEST_STREAK: '@nailgrow:longest_streak',
  TOTAL_CHECKINS: '@nailgrow:total_checkins',
  LAST_CHECKIN: '@nailgrow:last_checkin',
  SAVED_IMAGES: '@nailgrow:saved_images',
  START_DATE: '@nailgrow:start_date',
  STORAGE_VERSION: '@nailgrow:storage_version',
};

const STORAGE_VERSION = '1.0';

// Helper: Get today's date string (YYYY-MM-DD) in local timezone
const getTodayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper: Get date string from ISO string
const getDateStringFromISO = (isoString: string): string => {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper: Get yesterday's date string
const getYesterdayDateString = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, '0');
  const day = String(yesterday.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper: Calculate days between two date strings
const daysBetween = (date1: string, date2: string): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  totalCheckins: number;
  lastCheckin: string | null;
  hasCheckedInToday: boolean;
  streakBroken: boolean;
  daysMissed: number;
}

export const storage = {
  // Initialize storage (run on first launch)
  async initialize(): Promise<void> {
    try {
      const version = await AsyncStorage.getItem(KEYS.STORAGE_VERSION);
      if (!version) {
        // First time setup
        await AsyncStorage.setItem(KEYS.STORAGE_VERSION, STORAGE_VERSION);
        await AsyncStorage.setItem(KEYS.START_DATE, new Date().toISOString());
      }
    } catch (error) {
      console.error('Error initializing storage:', error);
    }
  },

  // Onboarding
  async isOnboardingComplete(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(KEYS.ONBOARDING_COMPLETE);
      return value === 'true';
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  },

  async setOnboardingComplete(): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.ONBOARDING_COMPLETE, 'true');
      await this.initialize();
    } catch (error) {
      console.error('Error setting onboarding complete:', error);
      throw error;
    }
  },

  // Streak Management
  async getStreak(): Promise<number> {
    try {
      const value = await AsyncStorage.getItem(KEYS.STREAK);
      return value ? parseInt(value, 10) : 0;
    } catch (error) {
      console.error('Error getting streak:', error);
      return 0;
    }
  },

  async setStreak(streak: number): Promise<void> {
    try {
      if (streak < 0) streak = 0;
      await AsyncStorage.setItem(KEYS.STREAK, streak.toString());

      // Update longest streak if needed
      const longestStreak = await this.getLongestStreak();
      if (streak > longestStreak) {
        await AsyncStorage.setItem(KEYS.LONGEST_STREAK, streak.toString());
      }
    } catch (error) {
      console.error('Error setting streak:', error);
      throw error;
    }
  },

  async getLongestStreak(): Promise<number> {
    try {
      const value = await AsyncStorage.getItem(KEYS.LONGEST_STREAK);
      return value ? parseInt(value, 10) : 0;
    } catch (error) {
      console.error('Error getting longest streak:', error);
      return 0;
    }
  },

  async getTotalCheckins(): Promise<number> {
    try {
      const value = await AsyncStorage.getItem(KEYS.TOTAL_CHECKINS);
      return value ? parseInt(value, 10) : 0;
    } catch (error) {
      console.error('Error getting total checkins:', error);
      return 0;
    }
  },

  async incrementTotalCheckins(): Promise<number> {
    try {
      const current = await this.getTotalCheckins();
      const newTotal = current + 1;
      await AsyncStorage.setItem(KEYS.TOTAL_CHECKINS, newTotal.toString());
      return newTotal;
    } catch (error) {
      console.error('Error incrementing total checkins:', error);
      throw error;
    }
  },

  async getLastCheckin(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(KEYS.LAST_CHECKIN);
    } catch (error) {
      console.error('Error getting last checkin:', error);
      return null;
    }
  },

  async setLastCheckin(date: string): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.LAST_CHECKIN, date);
    } catch (error) {
      console.error('Error setting last checkin:', error);
      throw error;
    }
  },

  // Comprehensive streak check with automatic streak reset logic
  async getStreakInfo(): Promise<StreakInfo> {
    try {
      const currentStreak = await this.getStreak();
      const longestStreak = await this.getLongestStreak();
      const totalCheckins = await this.getTotalCheckins();
      const lastCheckin = await this.getLastCheckin();

      const today = getTodayDateString();
      const yesterday = getYesterdayDateString();

      let hasCheckedInToday = false;
      let streakBroken = false;
      let daysMissed = 0;

      if (lastCheckin) {
        const lastCheckinDate = getDateStringFromISO(lastCheckin);

        // Check if already checked in today
        if (lastCheckinDate === today) {
          hasCheckedInToday = true;
        }
        // Check if streak is still valid (checked in yesterday or today)
        else if (lastCheckinDate !== yesterday) {
          // Streak broken! Calculate days missed
          daysMissed = daysBetween(lastCheckinDate, today);
          streakBroken = true;

          // Auto-reset streak to 0 if more than 1 day missed
          if (currentStreak > 0) {
            await this.setStreak(0);
            return {
              currentStreak: 0,
              longestStreak,
              totalCheckins,
              lastCheckin,
              hasCheckedInToday: false,
              streakBroken: true,
              daysMissed,
            };
          }
        }
      }

      return {
        currentStreak,
        longestStreak,
        totalCheckins,
        lastCheckin,
        hasCheckedInToday,
        streakBroken,
        daysMissed,
      };
    } catch (error) {
      console.error('Error getting streak info:', error);
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalCheckins: 0,
        lastCheckin: null,
        hasCheckedInToday: false,
        streakBroken: false,
        daysMissed: 0,
      };
    }
  },

  // Check-in with automatic streak management
  async performCheckin(): Promise<{
    success: boolean;
    newStreak: number;
    totalCheckins: number;
    error?: string;
  }> {
    try {
      const streakInfo = await this.getStreakInfo();

      if (streakInfo.hasCheckedInToday) {
        return {
          success: false,
          newStreak: streakInfo.currentStreak,
          totalCheckins: streakInfo.totalCheckins,
          error: 'Already checked in today',
        };
      }

      const newStreak = streakInfo.currentStreak + 1;
      const totalCheckins = await this.incrementTotalCheckins();
      const today = new Date().toISOString();

      await this.setStreak(newStreak);
      await this.setLastCheckin(today);

      return {
        success: true,
        newStreak,
        totalCheckins,
      };
    } catch (error) {
      console.error('Error performing checkin:', error);
      return {
        success: false,
        newStreak: 0,
        totalCheckins: 0,
        error: 'Failed to save checkin',
      };
    }
  },

  // Reset streak (for slip-ups)
  async resetStreak(): Promise<void> {
    try {
      await this.setStreak(0);
    } catch (error) {
      console.error('Error resetting streak:', error);
      throw error;
    }
  },

  // Gallery Images
  async getSavedImages(): Promise<string[]> {
    try {
      const value = await AsyncStorage.getItem(KEYS.SAVED_IMAGES);
      return value ? JSON.parse(value) : [];
    } catch (error) {
      console.error('Error getting saved images:', error);
      return [];
    }
  },

  async saveImage(imageUrl: string): Promise<void> {
    try {
      const images = await this.getSavedImages();
      // Avoid duplicates
      if (!images.includes(imageUrl)) {
        images.unshift(imageUrl);
        await AsyncStorage.setItem(KEYS.SAVED_IMAGES, JSON.stringify(images));
      }
    } catch (error) {
      console.error('Error saving image:', error);
      throw error;
    }
  },

  async removeImage(imageUrl: string): Promise<void> {
    try {
      const images = await this.getSavedImages();
      const filtered = images.filter(img => img !== imageUrl);
      await AsyncStorage.setItem(KEYS.SAVED_IMAGES, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing image:', error);
      throw error;
    }
  },

  // Debug: Clear all data
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(KEYS));
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  },
};
