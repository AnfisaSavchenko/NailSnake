import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { storage } from '@/utils/storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { generateImage } from '@fastshot/ai';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_SIZE = (SCREEN_WIDTH - 60) / 2; // 2 columns with padding

// Curated trend-based keywords inspired by Pinterest Newsroom, WGSN, Kawaii, K-pop, and Asian 3D nail trends
const TREND_KEYWORDS = {
  // Core trend aesthetics
  aesthetics: [
    'Pinterest Newsroom editorial style',
    'WGSN trend forecast',
    'kawaii character aesthetic',
    'K-pop idol inspired',
    'Asian 3D nail art',
    'Japanese nail salon',
    'Korean beauty editorial',
    'Harajuku street style',
  ],

  // 3D Elements & Textures (Asian 3D nail specialty)
  threeDElements: [
    '3D jelly art',
    'maximalist 3D charms',
    '3D acrylic sculptures',
    'dimensional gem clusters',
    '3D bubble tea pearls',
    '3D kawaii characters',
    'raised floral appliques',
    '3D crystal formations',
    'sculptural pearl accents',
    '3D resin flowers',
  ],

  // Finishes & Techniques
  finishes: [
    'chrome powder mirror finish',
    'syrup gel gradient',
    'glass skin translucent',
    'airbrush aura effect',
    'holographic iridescent',
    'velvet matte texture',
    'glazed donut shine',
    'sugar crystal texture',
    'milk bath opacity',
    'candy gloss coating',
  ],

  // K-pop & Kawaii Elements
  kpopKawaii: [
    'coquette bows and ribbons',
    'Sanrio character motifs',
    'pastel decora',
    'idol stage costume inspired',
    'magical girl aesthetic',
    'cute bear face designs',
    'heart and star charms',
    'anime eye art',
    'plushie texture',
    'bubblegum pop colors',
  ],

  // WGSN Trend Colors & Patterns
  trendyColors: [
    'cyber Y2K metallics',
    'dopamine bright neons',
    'quiet luxury neutrals',
    'sunset sorbet gradients',
    'coastal grandmother blues',
    'blueberry milk purples',
    'matcha latte greens',
    'peach fuzz pastels',
    'cherry cola reds',
    'digital lavender',
  ],

  // Pinterest Newsroom Concepts
  concepts: [
    'micro French tips',
    'negative space minimalism',
    'abstract squiggle art',
    'geometric color blocking',
    'pressed flower embeds',
    'watercolor bleed effect',
    'marble stone swirls',
    'constellation dot patterns',
    'ombre cloud fade',
    'latte art swirls',
  ],

  // Specific Trend Details
  details: [
    'tiny rhinestone clusters',
    'hand-painted illustrations',
    'foil flake accents',
    'aurora film strips',
    'metallic leaf fragments',
    'caviar bead textures',
    'magnetic cat eye',
    'thermal color-change',
    'glow-in-the-dark elements',
    'iridescent flakes',
  ],
};

// Helper function to randomly select from array
const getRandomItem = <T,>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Generate trend-specific nail art prompt
const generateTrendPrompt = (): string => {
  const aesthetic = getRandomItem(TREND_KEYWORDS.aesthetics);
  const threeDElement = getRandomItem(TREND_KEYWORDS.threeDElements);
  const finish = getRandomItem(TREND_KEYWORDS.finishes);
  const kpopKawaii = getRandomItem(TREND_KEYWORDS.kpopKawaii);
  const color = getRandomItem(TREND_KEYWORDS.trendyColors);
  const concept = getRandomItem(TREND_KEYWORDS.concepts);
  const detail = getRandomItem(TREND_KEYWORDS.details);

  // Randomly combine 3-4 keywords for unique, specific prompts
  const keywordPool = [
    threeDElement,
    finish,
    kpopKawaii,
    color,
    concept,
    detail,
  ];

  // Shuffle and pick 3 elements
  const shuffled = keywordPool.sort(() => Math.random() - 0.5);
  const selectedKeywords = shuffled.slice(0, 3);

  return `${aesthetic} nail design featuring ${selectedKeywords.join(', ')}`;
};

export default function GalleryScreen() {
  const [savedImages, setSavedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const images = await storage.getSavedImages();
      setSavedImages(images);
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNailArt = async () => {
    try {
      setGenerating(true);

      // Generate trend-specific prompt
      const trendPrompt = generateTrendPrompt();

      // Use Newell AI to generate image with hyper-specific prompts
      const result = await generateImage({
        prompt: `${trendPrompt}, ultra-detailed professional nail photography, studio lighting, high resolution, trending on Pinterest and WGSN, editorial quality, luxurious aesthetic`,
        width: 768,
        height: 1024,
        numOutputs: 1,
      });

      if (result.success && result.images && result.images.length > 0) {
        const imageUrl = result.images[0];
        // Save to local storage
        await storage.saveImage(imageUrl);
        setSavedImages([imageUrl, ...savedImages]);
        Alert.alert('Success! 💅✨', 'New trendy nail art created!');
      } else {
        Alert.alert('Generation Failed', result.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      Alert.alert(
        'Generation Failed',
        'Could not generate nail art. Please check your configuration and try again.'
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleRemoveImage = async (imageUrl: string) => {
    Alert.alert(
      'Remove Image',
      'Are you sure you want to remove this from your collection?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await storage.removeImage(imageUrl);
            setSavedImages(savedImages.filter(img => img !== imageUrl));
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.coralOrange} />
        <Text style={styles.loadingText}>Loading your collection...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Manicure Inspo</Text>
          <TouchableOpacity
            style={[styles.generateButton, generating && styles.generateButtonDisabled]}
            onPress={generateNailArt}
            disabled={generating}
            activeOpacity={0.8}
          >
            {generating ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.generateButtonText}>✨ Generate</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Gallery Grid */}
        {savedImages.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>💅</Text>
            <Text style={styles.emptyStateTitle}>No inspiration yet!</Text>
            <Text style={styles.emptyStateText}>
              Tap Generate to create trendy designs{'\n'}inspired by K-pop, Kawaii, WGSN,{'\n'}and Asian 3D nail art!
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {savedImages.map((imageUrl, index) => (
              <TouchableOpacity
                key={index}
                style={styles.imageCard}
                onLongPress={() => handleRemoveImage(imageUrl)}
                activeOpacity={0.9}
              >
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.image}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Tip */}
        {savedImages.length > 0 && (
          <Text style={styles.tipText}>
            💡 Long press on any image to remove it
          </Text>
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
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.darkBrown,
  },
  generateButton: {
    backgroundColor: Colors.coralOrange,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 120,
    alignItems: 'center',
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyStateEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.darkBrown,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.darkBrown,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.7,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  imageCard: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE * 1.3,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: '100%',
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
