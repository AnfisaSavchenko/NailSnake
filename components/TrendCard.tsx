import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface TrendCardProps {
  title: string;
  date: string;
  onPress: () => void;
}

export const TrendCard: React.FC<TrendCardProps> = ({ title, date, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{date}</Text>
      </View>
      <View style={styles.iconContainer}>
        <Text style={styles.iconText}>🔍</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  textContainer: {
    flex: 1,
    paddingRight: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A3C34',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#7A9B8E',
    fontWeight: '500',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF0E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 24,
    color: '#FF7F50',
  },
});
