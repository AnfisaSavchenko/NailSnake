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
import { storage } from '@/utils/storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MasonryGrid } from '@/components/MasonryGrid';
import { getRandomTrendBoard, getInitialBoard } from '@/data/nailTrends';

export default function GalleryScreen() {
  const [currentBoard, setCurrentBoard] = useState(getInitialBoard());
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const insets = useSafeAreaInsets();

  // Reload credits when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadCredits();
    }, [])
  );

  useEffect(() => {
    loadCredits();
  }, []);

  const loadCredits = async () => {
    try {
      const currentCredits = await storage.getCredits();
      setCredits(currentCredits);
    } catch (error) {
      console.error('Error loading credits:', error);
    } finally {
      setLoading(false);
    }
  };

  const unlockNewBoard = async () => {
    try {
      // Check if user has enough credits
      if (credits < 1) {
        Alert.alert(
          'Not Enough Credits! 💰',
          'You need 1 credit to unlock a new board. Check in daily to earn more credits!',
          [{ text: 'Got it', style: 'default' }]
        );
        return;
      }

      setUnlocking(true);

      // Spend the credit
      const spendResult = await storage.spendCredits(1);

      if (!spendResult.success) {
        Alert.alert('Error', spendResult.error || 'Could not spend credits');
        return;
      }

      // Get a new random trend board
      const newBoard = getRandomTrendBoard();
      setCurrentBoard(newBoard);
      setCredits(spendResult.newBalance);

      // Show success message
      Alert.alert(
        '🎨 New Board Unlocked!',
        `${newBoard.name} inspiration! You have ${spendResult.newBalance} credit${spendResult.newBalance !== 1 ? 's' : ''} remaining.`,
        [{ text: 'Love it!', style: 'default' }]
      );
    } catch (error) {
      console.error('Error unlocking board:', error);
      Alert.alert('Error', 'Could not unlock new board. Please try again.');
    } finally {
      setUnlocking(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.coralOrange} />
        <Text style={styles.loadingText}>Loading inspo...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Inspo</Text>
            <Text style={styles.headerSubtitle}>{currentBoard.name}</Text>
          </View>
          <View style={styles.creditsContainer}>
            <Text style={styles.creditsEmoji}>💰</Text>
            <Text style={styles.creditsText}>{credits}</Text>
          </View>
        </View>

        {/* Unlock Button */}
        <TouchableOpacity
          style={[
            styles.unlockButton,
            (unlocking || credits < 1) && styles.unlockButtonDisabled,
          ]}
          onPress={unlockNewBoard}
          disabled={unlocking || credits < 1}
          activeOpacity={0.8}
        >
          {unlocking ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <>
              <Text style={styles.unlockButtonText}>
                Unlock New Board (1 Credit)
              </Text>
              {credits < 1 && (
                <Text style={styles.unlockButtonSubtext}>
                  Check in daily to earn credits!
                </Text>
              )}
            </>
          )}
        </TouchableOpacity>

        {/* Trend Keywords */}
        <View style={styles.keywordsContainer}>
          {currentBoard.keywords.slice(0, 4).map((keyword, index) => (
            <View key={index} style={styles.keywordPill}>
              <Text style={styles.keywordText}>{keyword}</Text>
            </View>
          ))}
        </View>

        {/* Masonry Grid */}
        <MasonryGrid images={currentBoard.images} />

        {/* Footer tip */}
        <Text style={styles.tipText}>
          💡 Each board showcases a different nail art trend
        </Text>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.darkBrown,
    fontWeight: '600',
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.darkBrown,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.darkBrown,
    opacity: 0.7,
    marginTop: 4,
    fontWeight: '600',
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
  unlockButton: {
    backgroundColor: Colors.coralOrange,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  unlockButtonDisabled: {
    opacity: 0.5,
  },
  unlockButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  unlockButtonSubtext: {
    color: Colors.white,
    fontSize: 12,
    marginTop: 4,
    opacity: 0.9,
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  keywordPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  keywordText: {
    fontSize: 12,
    color: Colors.darkBrown,
    fontWeight: '600',
  },
  tipText: {
    textAlign: 'center',
    fontSize: 14,
    color: Colors.darkBrown,
    opacity: 0.6,
    marginTop: 24,
    fontStyle: 'italic',
  },
});
