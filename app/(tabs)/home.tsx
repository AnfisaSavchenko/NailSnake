import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { storage, StreakInfo } from '@/utils/storage';
import { Snake } from '@/components/Snake';
import { Confetti } from '@/components/Confetti';
import { InfoModal } from '@/components/InfoModal';
import { SettingsModal } from '@/components/SettingsModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen() {
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null);
  const [credits, setCredits] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  // Reload data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [info, currentCredits] = await Promise.all([
        storage.getStreakInfo(),
        storage.getCredits(),
      ]);
      setStreakInfo(info);
      setCredits(currentCredits);

      // Show alert if streak was broken
      if (info.streakBroken && info.daysMissed > 0) {
        setTimeout(() => {
          Alert.alert(
            '🥺 Streak Reset',
            `You missed ${info.daysMissed} day${info.daysMissed > 1 ? 's' : ''}. Your streak has been reset, but don't give up! Start fresh today! 💪`,
            [{ text: 'Start Fresh', style: 'default' }]
          );
        }, 500);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load your data. Please restart the app.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      const result = await storage.performCheckin();

      if (!result.success) {
        Alert.alert('Already Checked In', 'You\'ve already checked in today! See you tomorrow! 🌟');
        return;
      }

      // Update UI with new streak and credits
      const updatedInfo = await storage.getStreakInfo();
      setStreakInfo(updatedInfo);
      setCredits(result.newCreditBalance);
      setShowConfetti(true);

      // Hide confetti after animation
      setTimeout(() => {
        setShowConfetti(false);
      }, 3000);

      // Show credit reward alert first
      Alert.alert(
        '💰 +2 Credits Earned!',
        `You now have ${result.newCreditBalance} credit${result.newCreditBalance !== 1 ? 's' : ''}! Use them to unlock trends in the Inspo tab.`,
        [{ text: 'Nice!', style: 'default' }]
      );

      // Show milestone alerts
      if (result.newStreak === 7) {
        setTimeout(() => {
          Alert.alert('🎉 One Week!', 'Amazing! You\'ve completed 7 days in a row!');
        }, 2000);
      } else if (result.newStreak === 30) {
        setTimeout(() => {
          Alert.alert('👑 30 Days!', 'Incredible! You\'re a nail-growing champion!');
        }, 2000);
      } else if (result.newStreak % 10 === 0 && result.newStreak > 0) {
        setTimeout(() => {
          Alert.alert('🔥 Milestone!', `${result.newStreak} days! You\'re unstoppable!`);
        }, 2000);
      }
    } catch (error) {
      console.error('Error checking in:', error);
      Alert.alert('Error', 'Failed to save check-in. Please try again.');
    }
  };

  const handleSlipUp = () => {
    Alert.alert(
      'That\'s okay! 💚',
      'Would you like to reset your streak and start fresh? Remember: progress isn\'t always linear!',
      [
        {
          text: 'Keep Current Streak',
          style: 'cancel',
        },
        {
          text: 'Reset & Start Fresh',
          style: 'destructive',
          onPress: async () => {
            await storage.resetStreak();
            const updatedInfo = await storage.getStreakInfo();
            setStreakInfo(updatedInfo);
            Alert.alert('Fresh Start! 🌱', 'Your streak has been reset. You\'ve got this!');
          },
        },
      ]
    );
  };

  const handleResetProgress = async () => {
    try {
      // Clear all data from AsyncStorage
      await storage.resetStreak();
      await storage.setCredits(0);
      await storage.clearChatHistory();
      await storage.clearTrendItems();

      // Reload data to update UI
      await loadData();

      Alert.alert('🌱 Fresh Start', 'All progress has been reset. Your journey begins anew!');
    } catch (error) {
      console.error('Error resetting progress:', error);
      Alert.alert('Error', 'Could not reset progress. Please try again.');
    }
  };

  if (loading || !streakInfo) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.coralOrange} />
        <Text style={styles.loadingText}>Loading your habitat...</Text>
      </View>
    );
  }

  const streak = streakInfo.currentStreak;
  const hasCheckedInToday = streakInfo.hasCheckedInToday;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {showConfetti && <Confetti />}
      <InfoModal visible={showInfoModal} onClose={() => setShowInfoModal(false)} />
      <SettingsModal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onResetProgress={handleResetProgress}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header with Credits and Info */}
        <View style={styles.topBar}>
          <View style={styles.creditsContainer}>
            <Text style={styles.creditsEmoji}>💰</Text>
            <Text style={styles.creditsText}>{credits}</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.infoButton}
              onPress={() => setShowInfoModal(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.infoButtonText}>?</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => setShowSettingsModal(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.settingsButtonText}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.pageTitle}>Your Habitat</Text>
        {streakInfo.totalCheckins > 0 && (
          <Text style={styles.pageSubtitle}>
            {streakInfo.totalCheckins} total check-in{streakInfo.totalCheckins !== 1 ? 's' : ''}
          </Text>
        )}

        {/* HERO: Snake Display - Centrally positioned above everything */}
        <View style={styles.heroSnakeContainer}>
          {streak === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>🥚</Text>
              <Text style={styles.emptyStateSubtext}>
                Your snake is waiting to be born!{'\n'}Check in today to start growing.
              </Text>
            </View>
          ) : (
            <Snake segments={streak} />
          )}
        </View>

        {/* Streak Badge */}
        <View style={styles.streakBadgeContainer}>
          <View style={styles.streakBadge}>
            <Text style={styles.streakNumber}>{streak}</Text>
            <Text style={styles.streakLabel}>day streak</Text>
          </View>
          {streakInfo.longestStreak > streak && streakInfo.longestStreak > 0 && (
            <Text style={styles.longestStreakText}>
              Best: {streakInfo.longestStreak} days
            </Text>
          )}
        </View>

        {/* Motivational message */}
        {streak > 0 && (
          <View style={styles.messageCard}>
            <Text style={styles.messageText}>
              {streak === 1 && "🎉 Your snake is born! Keep going!"}
              {streak > 1 && streak < 7 && "💪 You're doing great! Your snake is growing!"}
              {streak >= 7 && streak < 14 && "🌟 One week strong! Amazing progress!"}
              {streak >= 14 && streak < 30 && "🔥 Two weeks! You're unstoppable!"}
              {streak >= 30 && "👑 30+ days! You're a nail-growing champion!"}
            </Text>
          </View>
        )}

        {/* Check-in Section */}
        <View style={styles.checkInSection}>
          {hasCheckedInToday ? (
            <TouchableOpacity
              style={styles.checkInButtonDisabled}
              activeOpacity={1}
              disabled
            >
              <Text style={styles.checkInButtonTextDisabled}>✓</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.checkInButton}
              onPress={handleCheckIn}
              activeOpacity={0.8}
            >
              <Text style={styles.checkInButtonText}>Check In</Text>
            </TouchableOpacity>
          )}

          {/* Slip-up link */}
          {!hasCheckedInToday && (
            <TouchableOpacity onPress={handleSlipUp} style={styles.slipUpButton}>
              <Text style={styles.slipUpText}>I had a slip-up...</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.limeGreen,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: Colors.darkBrown,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  creditsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  creditsEmoji: {
    fontSize: 20,
  },
  creditsText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.darkBrown,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  infoButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.coralOrange,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  infoButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
  },
  settingsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.coralOrange,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  settingsButtonText: {
    fontSize: 18,
  },
  pageTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.darkBrown,
    textAlign: 'center',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 14,
    color: Colors.darkBrown,
    opacity: 0.6,
    textAlign: 'center',
    marginBottom: 24,
  },
  heroSnakeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 30,
    padding: 40,
    minHeight: 280,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  streakBadgeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  streakBadge: {
    backgroundColor: Colors.coralOrange,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  longestStreakText: {
    fontSize: 12,
    color: Colors.darkBrown,
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.7,
    fontWeight: '600',
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
  },
  streakLabel: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyStateText: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: Colors.darkBrown,
    textAlign: 'center',
    lineHeight: 24,
  },
  messageCard: {
    backgroundColor: Colors.coralOrange,
    padding: 20,
    borderRadius: 20,
    marginBottom: 30,
  },
  messageText: {
    fontSize: 18,
    color: Colors.white,
    fontWeight: '600',
    textAlign: 'center',
  },
  checkInSection: {
    alignItems: 'center',
  },
  checkInButton: {
    backgroundColor: Colors.coralOrange,
    paddingVertical: 20,
    paddingHorizontal: 50,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  checkInButtonText: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: '700',
  },
  checkInButtonDisabled: {
    backgroundColor: 'rgba(139, 195, 74, 0.4)',
    paddingVertical: 20,
    paddingHorizontal: 50,
    borderRadius: 30,
    opacity: 0.6,
  },
  checkInButtonTextDisabled: {
    color: Colors.darkBrown,
    fontSize: 32,
    fontWeight: '700',
  },
  slipUpButton: {
    marginTop: 20,
    padding: 10,
  },
  slipUpText: {
    fontSize: 16,
    color: Colors.darkBrown,
    textDecorationLine: 'underline',
    opacity: 0.7,
  },
});
