import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SnakeHead, SnakeBody, SnakeTail } from './SnakeParts';

interface SnakeProps {
  segments: number; // Number of body segments (equals streak)
}

export const Snake: React.FC<SnakeProps> = ({ segments }) => {
  const bodySegments = Math.max(0, segments);

  return (
    <View style={styles.container}>
      <View style={styles.snakeContainer}>
        {/* Head */}
        <View style={styles.head}>
          <SnakeHead size={70} />
        </View>

        {/* Body segments */}
        <View style={styles.body}>
          {Array.from({ length: bodySegments }).map((_, index) => (
            <View key={index} style={styles.bodySegment}>
              <SnakeBody size={55} />
            </View>
          ))}
        </View>

        {/* Tail */}
        <View style={styles.tail}>
          <SnakeTail size={45} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  snakeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    maxWidth: 350,
    justifyContent: 'center',
  },
  head: {
    marginRight: -10,
  },
  body: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodySegment: {
    marginHorizontal: -8,
  },
  tail: {
    marginLeft: -10,
  },
});
