import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  ONBOARDING_COMPLETE: '@nailgrow:onboarding_complete',
  STREAK: '@nailgrow:streak',
  LAST_CHECKIN: '@nailgrow:last_checkin',
  SAVED_IMAGES: '@nailgrow:saved_images',
};

export const storage = {
  async isOnboardingComplete(): Promise<boolean> {
    const value = await AsyncStorage.getItem(KEYS.ONBOARDING_COMPLETE);
    return value === 'true';
  },

  async setOnboardingComplete(): Promise<void> {
    await AsyncStorage.setItem(KEYS.ONBOARDING_COMPLETE, 'true');
  },

  async getStreak(): Promise<number> {
    const value = await AsyncStorage.getItem(KEYS.STREAK);
    return value ? parseInt(value, 10) : 0;
  },

  async setStreak(streak: number): Promise<void> {
    await AsyncStorage.setItem(KEYS.STREAK, streak.toString());
  },

  async getLastCheckin(): Promise<string | null> {
    return await AsyncStorage.getItem(KEYS.LAST_CHECKIN);
  },

  async setLastCheckin(date: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.LAST_CHECKIN, date);
  },

  async getSavedImages(): Promise<string[]> {
    const value = await AsyncStorage.getItem(KEYS.SAVED_IMAGES);
    return value ? JSON.parse(value) : [];
  },

  async saveImage(imageUrl: string): Promise<void> {
    const images = await this.getSavedImages();
    images.unshift(imageUrl);
    await AsyncStorage.setItem(KEYS.SAVED_IMAGES, JSON.stringify(images));
  },

  async removeImage(imageUrl: string): Promise<void> {
    const images = await this.getSavedImages();
    const filtered = images.filter(img => img !== imageUrl);
    await AsyncStorage.setItem(KEYS.SAVED_IMAGES, JSON.stringify(filtered));
  },
};
