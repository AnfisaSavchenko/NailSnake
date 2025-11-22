import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { storage, TrendItem } from '@/utils/storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { TrendCard } from '@/components/TrendCard';

// Pinterest Trend Roulette - Curated Keywords
const TREND_CATEGORIES = {
  aesthetics: [
    'Pinterest Newsroom editorial',
    'WGSN trend forecast',
    'Kawaii character aesthetic',
    'Harajuku street style',
    'Korean beauty editorial',
  ],
  '3d_elements': [
    '3D jelly art',
    'Maximalist 3D charms',
    'Dimensional gem clusters',
    '3D bubble tea pearls',
    'Sculptural pearl accents',
  ],
  finishes: [
    'Chrome powder mirror finish',
    'Syrup gel gradient',
    'Glass skin translucent',
    'Airbrush aura effect',
    'Velvet matte texture',
  ],
  kpop_kawaii: [
    'Coquette bows and ribbons',
    'Sanrio character motifs',
    'NewJeans aesthetic',
    'Magical girl aesthetic',
  ],
  wgsn_colors: [
    'Digital lavender',
    'Matcha latte greens',
    'Peach fuzz pastels',
    'Cyber Y2K metallics',
  ],
  newsroom_concepts: [
    'Micro French tips',
    'Negative space minimalism',
    'Abstract squiggle art',
  ],
  specific_details: [
    'Tiny rhinestone clusters',
    'Aurora film strips',
    'Magnetic cat eye',
  ],
};

// Flatten all categories into a single array for random selection
const ALL_TREND_KEYWORDS = Object.values(TREND_CATEGORIES).flat();

// Helper to select random keyword from flattened list
const getRandomKeyword = (): string => {
  const randomIndex = Math.floor(Math.random() * ALL_TREND_KEYWORDS.length);
  return ALL_TREND_KEYWORDS[randomIndex];
};

// Helper to format date for display
const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
};

export default function GalleryScreen() {
  const [trendItems, setTrendItems] = useState<TrendItem[]>([]);
  const [credits, setCredits] = useState(0);
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
      const [currentCredits, items] = await Promise.all([
        storage.getCredits(),
        storage.getTrendItems(),
      ]);
      setCredits(currentCredits);
      setTrendItems(items);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const unlockNewTrend = async () => {
    try {
      // Check if user has enough credits
      if (credits < 1) {
        Alert.alert(
          'Not Enough Credits! 💰',
          'You need 1 credit to unlock a new trend. Check in daily to earn more credits!',
          [{ text: 'Got it', style: 'default' }]
        );
        return;
      }

      // Spend the credit
      const spendResult = await storage.spendCredits(1);

      if (!spendResult.success) {
        Alert.alert('Error', spendResult.error || 'Could not spend credits');
        return;
      }

      setCredits(spendResult.newBalance);

      // Select random keyword
      const keyword = getRandomKeyword();

      // Create trend item (no image generation)
      const newItem: TrendItem = {
        id: Date.now().toString(),
        keyword,
        imageUrl: '', // No image URL for Pinterest launcher
        createdAt: new Date().toISOString(),
      };

      // Save to storage
      await storage.saveTrendItem(newItem);

      // Update local state
      const updatedItems = await storage.getTrendItems();
      setTrendItems(updatedItems);

      Alert.alert(
        '✨ New Trend Unlocked!',
        `"${keyword}" has been added to your collection!`,
        [{ text: 'Explore on Pinterest', onPress: () => openPinterestSearch(keyword) }]
      );
    } catch (error) {
      console.error('Error unlocking trend:', error);
      Alert.alert('Error', 'Could not unlock trend. Please try again.');
    }
  };

  const openPinterestSearch = async (keyword: string) => {
    try {
      const searchQuery = `${keyword} nail art`;
      const url = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(searchQuery)}`;

      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open Pinterest. Please make sure you have a browser installed.');
      }
    } catch (error) {
      console.error('Error opening Pinterest:', error);
      Alert.alert('Error', 'Could not open Pinterest. Please try again.');
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
            <Text style={styles.headerSubtitle}>Trend Roulette</Text>
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
            credits < 1 && styles.unlockButtonDisabled,
          ]}
          onPress={unlockNewTrend}
          disabled={credits < 1}
          activeOpacity={0.8}
        >
          <Text style={styles.unlockButtonText}>
            Unlock New Trend (1 Credit)
          </Text>
          {credits < 1 && (
            <Text style={styles.unlockButtonSubtext}>
              Check in daily to earn credits!
            </Text>
          )}
        </TouchableOpacity>

        {/* Empty State */}
        {trendItems.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>🎨</Text>
            <Text style={styles.emptyStateText}>
              Unlock your first trend!
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Each trend costs 1 credit. Tap any trend to explore it on Pinterest!
            </Text>
          </View>
        )}

        {/* Trend Cards List */}
        {trendItems.length > 0 && (
          <View style={styles.trendList}>
            <Text style={styles.sectionTitle}>
              Your Collection ({trendItems.length})
            </Text>
            {trendItems.map((item) => (
              <TrendCard
                key={item.id}
                title={item.keyword}
                date={formatDate(item.createdAt)}
                onPress={() => openPinterestSearch(item.keyword)}
              />
            ))}
          </View>
        )}
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
    marginBottom: 24,
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.darkBrown,
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.darkBrown,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 20,
  },
  trendList: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.darkBrown,
    marginBottom: 16,
  },
});
