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
import { storage, TrendItem } from '@/utils/storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useImageGeneration } from '@fastshot/ai';
import { TrendCard } from '@/components/TrendCard';
import { ImageViewerModal } from '@/components/ImageViewerModal';

// Pinterest Simulator - Trend Categories
const TREND_CATEGORIES = {
  aesthetics: [
    'Pinterest Newsroom editorial style',
    'WGSN trend forecast',
    'Kawaii character aesthetic',
    'K-pop idol inspired',
    'Asian 3D nail art',
    'Japanese nail salon',
    'Korean beauty editorial',
    'Harajuku street style',
  ],
  '3d_elements': [
    '3D jelly art',
    'Maximalist 3D charms',
    '3D acrylic sculptures',
    'Dimensional gem clusters',
    '3D bubble tea pearls',
    '3D kawaii characters',
    'Raised floral appliques',
    '3D crystal formations',
    'Sculptural pearl accents',
    '3D resin flowers',
  ],
  finishes: [
    'Chrome powder mirror finish',
    'Syrup gel gradient',
    'Glass skin translucent',
    'Airbrush aura effect',
    'Holographic iridescent',
    'Velvet matte texture',
    'Glazed donut shine',
    'Sugar crystal texture',
    'Milk bath opacity',
    'Candy gloss coating',
  ],
  kpop_kawaii: [
    'Coquette bows and ribbons',
    'Sanrio character motifs',
    'Pastel decora',
    'Idol stage costume inspired',
    'Magical girl aesthetic',
    'Cute bear face designs',
    'Heart and star charms',
    'Anime eye art',
    'Plushie texture',
    'Bubblegum pop colors',
  ],
  wgsn_colors: [
    'Cyber Y2K metallics',
    'Dopamine bright neons',
    'Quiet luxury neutrals',
    'Sunset sorbet gradients',
    'Coastal grandmother blues',
    'Blueberry milk purples',
    'Matcha latte greens',
    'Peach fuzz pastels',
    'Cherry cola reds',
    'Digital lavender',
  ],
  newsroom_concepts: [
    'Micro French tips',
    'Negative space minimalism',
    'Abstract squiggle art',
    'Geometric color blocking',
    'Pressed flower embeds',
    'Watercolor bleed effect',
    'Marble stone swirls',
    'Constellation dot patterns',
    'Ombre cloud fade',
    'Latte art swirls',
  ],
  specific_details: [
    'Tiny rhinestone clusters',
    'Hand-painted illustrations',
    'Foil flake accents',
    'Aurora film strips',
    'Metallic leaf fragments',
    'Caviar bead textures',
    'Magnetic cat eye',
    'Thermal color-change',
    'Glow-in-the-dark elements',
    'Iridescent flakes',
  ],
};

// Helper to select random keyword from random category
const getRandomKeyword = (): string => {
  const categories = Object.values(TREND_CATEGORIES);
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  const randomKeyword = randomCategory[Math.floor(Math.random() * randomCategory.length)];
  return randomKeyword;
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
  const [selectedItem, setSelectedItem] = useState<TrendItem | null>(null);
  const insets = useSafeAreaInsets();

  const { generateImage, isLoading: isGenerating } = useImageGeneration({
    onSuccess: async (result) => {
      if (result.images && result.images.length > 0) {
        // Get the current keyword from state (set before generation)
        const pendingKeyword = sessionStorage.current;
        if (!pendingKeyword) return;

        const newItem: TrendItem = {
          id: Date.now().toString(),
          keyword: pendingKeyword,
          imageUrl: result.images[0],
          createdAt: new Date().toISOString(),
        };

        // Save to storage
        await storage.saveTrendItem(newItem);

        // Update local state
        const updatedItems = await storage.getTrendItems();
        setTrendItems(updatedItems);

        Alert.alert(
          '✨ New Inspo Generated!',
          `${pendingKeyword} added to your gallery!`,
          [{ text: 'View', onPress: () => setSelectedItem(newItem) }]
        );
      }
    },
    onError: (error) => {
      console.error('Image generation error:', error);
      Alert.alert(
        'Oops!',
        'Could not generate image. Try again or check your connection.',
        [{ text: 'OK', style: 'default' }]
      );
      // Refund the credit if generation failed
      storage.addCredits(1).then(() => {
        loadData();
      });
    },
  });

  // Session storage for current keyword
  const sessionStorage = React.useRef<string | null>(null);

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

  const generateNewTrend = async () => {
    try {
      // Check if user has enough credits
      if (credits < 1) {
        Alert.alert(
          'Not Enough Credits! 💰',
          'You need 1 credit to generate a new image. Check in daily to earn more credits!',
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
      sessionStorage.current = keyword;

      // Construct prompt (photorealistic, high-end style)
      const prompt = `${keyword} nail art, Macro photography, high-end beauty editorial, Pinterest trending style, photorealistic, 8k resolution, soft lighting. NOT illustration, NOT painting, NOT cartoon`;

      // Generate image (10-30 seconds)
      await generateImage({
        prompt,
        width: 1024,
        height: 1024,
      });
    } catch (error) {
      console.error('Error generating trend:', error);
      Alert.alert('Error', 'Could not generate image. Please try again.');
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
            <Text style={styles.headerSubtitle}>Pinterest Simulator</Text>
          </View>
          <View style={styles.creditsContainer}>
            <Text style={styles.creditsEmoji}>💰</Text>
            <Text style={styles.creditsText}>{credits}</Text>
          </View>
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          style={[
            styles.generateButton,
            (isGenerating || credits < 1) && styles.generateButtonDisabled,
          ]}
          onPress={generateNewTrend}
          disabled={isGenerating || credits < 1}
          activeOpacity={0.8}
        >
          {isGenerating ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={Colors.white} />
              <Text style={styles.generatingText}>
                Generating... (10-30 seconds)
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.generateButtonText}>
                Generate New Inspo (1 Credit)
              </Text>
              {credits < 1 && (
                <Text style={styles.generateButtonSubtext}>
                  Check in daily to earn credits!
                </Text>
              )}
            </>
          )}
        </TouchableOpacity>

        {/* Empty State */}
        {trendItems.length === 0 && !isGenerating && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>🎨</Text>
            <Text style={styles.emptyStateText}>
              Generate your first nail art inspiration!
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Each generation uses 1 credit. Check in daily to earn more.
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
                onPress={() => setSelectedItem(item)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Image Viewer Modal */}
      {selectedItem && (
        <ImageViewerModal
          visible={!!selectedItem}
          imageUrl={selectedItem.imageUrl}
          title={selectedItem.keyword}
          date={formatDate(selectedItem.createdAt)}
          onClose={() => setSelectedItem(null)}
        />
      )}
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
  generateButton: {
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
  generateButtonDisabled: {
    opacity: 0.5,
  },
  generateButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  generateButtonSubtext: {
    color: Colors.white,
    fontSize: 12,
    marginTop: 4,
    opacity: 0.9,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  generatingText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
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
