import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { Redirect } from 'expo-router';
import { storage } from '@/utils/storage';
import { Colors } from '@/constants/Colors';

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      // Small delay to prevent flickering
      await new Promise(resolve => setTimeout(resolve, 300));

      const isComplete = await storage.isOnboardingComplete();
      setOnboardingComplete(isComplete);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.logo}>🐍</Text>
        <ActivityIndicator size="large" color={Colors.coralOrange} />
        <Text style={styles.loadingText}>Nailgrow</Text>
      </View>
    );
  }

  if (!onboardingComplete) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)/home" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.limeGreen,
  },
  logo: {
    fontSize: 80,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.darkBrown,
    marginTop: 20,
  },
});
