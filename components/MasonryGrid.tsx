import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_WIDTH = (SCREEN_WIDTH - 60) / 2;

interface MasonryGridProps {
  images: string[];
  onImagePress?: (imageUrl: string, index: number) => void;
  onImageLongPress?: (imageUrl: string, index: number) => void;
}

export const MasonryGrid: React.FC<MasonryGridProps> = ({
  images,
  onImagePress,
  onImageLongPress,
}) => {
  // Split images into two columns
  const leftColumn: string[] = [];
  const rightColumn: string[] = [];

  images.forEach((image, index) => {
    if (index % 2 === 0) {
      leftColumn.push(image);
    } else {
      rightColumn.push(image);
    }
  });

  const renderColumn = (columnImages: string[], columnIndex: number) => {
    return (
      <View style={styles.column}>
        {columnImages.map((imageUrl, index) => {
          const originalIndex = columnIndex === 0 ? index * 2 : index * 2 + 1;
          // Vary heights for masonry effect
          const heightVariation = [1.2, 1.5, 1.3, 1.4];
          const height = COLUMN_WIDTH * heightVariation[originalIndex % 4];

          return (
            <TouchableOpacity
              key={originalIndex}
              style={[styles.imageCard, { height }]}
              onPress={() => onImagePress?.(imageUrl, originalIndex)}
              onLongPress={() => onImageLongPress?.(imageUrl, originalIndex)}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: imageUrl }}
                style={styles.image}
                resizeMode="cover"
              />
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderColumn(leftColumn, 0)}
      {renderColumn(rightColumn, 1)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
  },
  column: {
    flex: 1,
    gap: 12,
  },
  imageCard: {
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
});
