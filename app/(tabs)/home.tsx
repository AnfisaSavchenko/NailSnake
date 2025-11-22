import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { storage } from '@/utils/storage';
import { Snake } from '@/components/Snake';
import { Confetti } from '@/components/Confetti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [streak, setStreak] = useState(0);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedStreak = await storage.getStreak();
      const lastCheckin = await storage.getLastCheckin();

      setStreak(savedStreak);

      // Check if user already checked in today
      if (lastCheckin) {
        const lastDate = new Date(lastCheckin).toDateString();
        const today = new Date().toDateString();
        setHasCheckedInToday(lastDate === today);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      const newStreak = streak + 1;
      const today = new Date().toISOString();

      await storage.setStreak(newStreak);
      await storage.setLastCheckin(today);

      setStreak(newStreak);
      setHasCheckedInToday(true);
      setShowConfetti(true);

      // Hide confetti after animation
      setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
    } catch (error) {
      console.error('Error checking in:', error);
      Alert.alert('Error', 'Failed to save check-in. Please try again.');
    }
  };

  const handleSlipUp = () => {
    Alert.alert(
      'That\'s okay! 💚',
      'Progress isn\'t always linear. What matters is that you\'re here and trying. Your snake will wait for you!',
      [
        {
          text: 'Keep Going',
          style: 'default',
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading your habitat...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {showConfetti && <Confetti />}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Habitat</Text>
          <View style={styles.streakBadge}>
            <Text style={styles.streakNumber}>{streak}</Text>
            <Text style={styles.streakLabel}>day streak</Text>
          </View>
        </View>

        {/* Snake Display */}
        <View style={styles.snakeContainer}>
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
          <Text style={styles.question}>
            Did you let your nails{'\n'}grow today?
          </Text>

          {hasCheckedInToday ? (
            <View style={styles.completedCard}>
              <Text style={styles.completedEmoji}>✓</Text>
              <Text style={styles.completedText}>
                Checked in for today!{'\n'}See you tomorrow!
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.checkInButton}
              onPress={handleCheckIn}
              activeOpacity={0.8}
            >
              <Text style={styles.checkInButtonText}>Yes, I did! 🌱</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.darkBrown,
  },
  streakBadge: {
    backgroundColor: Colors.coralOrange,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    minWidth: 80,
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
  snakeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 30,
    padding: 30,
    minHeight: 250,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
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
  question: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.darkBrown,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 36,
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
  completedCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    paddingVertical: 30,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignItems: 'center',
  },
  completedEmoji: {
    fontSize: 60,
    marginBottom: 10,
  },
  completedText: {
    fontSize: 18,
    color: Colors.darkBrown,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 26,
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
