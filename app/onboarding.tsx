import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { storage } from '@/utils/storage';
import { SnakeHead, SnakeBody, SnakeTail } from '@/components/SnakeParts';
import Svg, { Rect, Circle } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const OnboardingScreen1 = () => (
  <View style={styles.slide}>
    <Text style={styles.title}>Stop{'\n'}biting nails{'\n'}forever</Text>

    <View style={styles.illustration}>
      {/* Simple garden scene */}
      <View style={styles.gardenScene}>
        {/* Snake in garden */}
        <View style={{ transform: [{ rotate: '15deg' }] }}>
          <SnakeHead size={80} />
        </View>

        {/* Decorative plants */}
        <View style={styles.plants}>
          <Svg width={80} height={80} style={{ position: 'absolute', left: -40, top: 20 }}>
            <Circle cx="40" cy="50" r="25" fill={Colors.darkGreen} />
            <Circle cx="30" cy="40" r="20" fill={Colors.darkGreen} opacity={0.8} />
          </Svg>
          <Svg width={60} height={60} style={{ position: 'absolute', right: -30, top: 30 }}>
            <Circle cx="30" cy="40" r="18" fill={Colors.darkGreen} />
          </Svg>
        </View>

        {/* Flowers */}
        <Svg width={40} height={40} style={{ position: 'absolute', left: 30, bottom: 10 }}>
          <Circle cx="20" cy="20" r="8" fill={Colors.white} />
          <Circle cx="20" cy="20" r="3" fill="#FFD700" />
        </Svg>
        <Svg width={40} height={40} style={{ position: 'absolute', right: 40, bottom: 15 }}>
          <Circle cx="20" cy="20" r="8" fill={Colors.lightPink} />
          <Circle cx="20" cy="20" r="3" fill="#FFD700" />
        </Svg>

        {/* Rocks */}
        <Svg width={100} height={30} style={{ position: 'absolute', bottom: 0 }}>
          <Circle cx="25" cy="20" r="15" fill="#C0C0C0" opacity={0.5} />
          <Circle cx="55" cy="22" r="12" fill="#C0C0C0" opacity={0.5} />
          <Circle cx="75" cy="20" r="10" fill="#C0C0C0" opacity={0.5} />
        </Svg>
      </View>
    </View>
  </View>
);

const OnboardingScreen2 = () => (
  <View style={styles.slide}>
    <Text style={styles.title}>Grow{'\n'}your snake{'\n'}with daily{'\n'}check-ins</Text>

    <View style={styles.illustration}>
      {/* Long snake */}
      <View style={styles.longSnake}>
        <SnakeHead size={60} />
        <SnakeBody size={50} />
        <SnakeBody size={50} />
        <SnakeBody size={50} />
        <SnakeBody size={50} />
        <SnakeTail size={40} />
      </View>
    </View>
  </View>
);

const OnboardingScreen3 = () => (
  <View style={styles.slide}>
    <Text style={styles.title}>Get{'\n'}manicure{'\n'}inspo</Text>

    <View style={styles.illustration}>
      {/* Nail art grid */}
      <View style={styles.nailGrid}>
        {[
          '#4A90E2', '#6B8E23', '#E8F5E9', '#FF6B6B',
          '#FF7F50', '#90EE90', '#228B22', '#FFB6C1',
          '#2F4F4F', '#FF69B4', '#4169E1', '#DC143C',
        ].map((color, index) => (
          <View key={index} style={[styles.nailCard, { backgroundColor: color }]}>
            {/* Simple nail art pattern */}
            <Svg width={40} height={50} viewBox="0 0 40 50">
              <Rect x="8" y="5" width="24" height="40" rx="12" fill="rgba(255,255,255,0.3)" />
              <Circle cx="20" cy="25" r="6" fill="rgba(255,255,255,0.5)" />
            </Svg>
          </View>
        ))}
      </View>
    </View>
  </View>
);

export default function OnboardingScreen() {
  const [currentPage, setCurrentPage] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentPage(page);
  };

  const handleComplete = async () => {
    await storage.setOnboardingComplete();
    router.replace('/(tabs)/home');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <OnboardingScreen1 />
        <OnboardingScreen2 />
        <OnboardingScreen3 />
      </ScrollView>

      {/* Page indicators */}
      <View style={styles.pagination}>
        {[0, 1, 2].map((index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              currentPage === index && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>

      {/* Start button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleComplete}>
          <Text style={styles.buttonText}>start growing them</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.limeGreen,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    paddingTop: 100,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.darkBrown,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 56,
  },
  illustration: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  gardenScene: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  plants: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  longSnake: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 280,
    marginHorizontal: -5,
  },
  nailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 280,
    gap: 12,
  },
  nailCard: {
    width: 60,
    height: 80,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.darkBrown,
    opacity: 0.3,
  },
  paginationDotActive: {
    width: 24,
    opacity: 1,
  },
  buttonContainer: {
    paddingHorizontal: 40,
    paddingBottom: 50,
  },
  button: {
    backgroundColor: Colors.coralOrange,
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '600',
  },
});
