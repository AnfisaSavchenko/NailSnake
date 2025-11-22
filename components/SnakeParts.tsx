import React from 'react';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
import { Colors } from '@/constants/Colors';

interface SnakePartProps {
  size?: number;
}

export const SnakeHead: React.FC<SnakePartProps> = ({ size = 60 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 60 60">
      {/* Head */}
      <Ellipse cx="30" cy="30" rx="28" ry="25" fill={Colors.coralOrange} />

      {/* Eyes */}
      <Circle cx="20" cy="22" r="5" fill={Colors.darkBrown} />
      <Circle cx="40" cy="22" r="5" fill={Colors.darkBrown} />
      <Circle cx="21" cy="21" r="2" fill={Colors.white} />
      <Circle cx="41" cy="21" r="2" fill={Colors.white} />

      {/* Smile */}
      <Path
        d="M 15 35 Q 30 42 45 35"
        stroke={Colors.darkBrown}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      {/* Blush */}
      <Circle cx="12" cy="32" r="4" fill="#FF6B6B" opacity={0.3} />
      <Circle cx="48" cy="32" r="4" fill="#FF6B6B" opacity={0.3} />
    </Svg>
  );
};

export const SnakeBody: React.FC<SnakePartProps> = ({ size = 50 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 50 50">
      {/* Body segment */}
      <Ellipse cx="25" cy="25" rx="23" ry="20" fill={Colors.coralOrange} />

      {/* Stripes */}
      <Path
        d="M 10 25 Q 25 20 40 25"
        stroke={Colors.white}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        opacity={0.6}
      />
      <Path
        d="M 12 32 Q 25 28 38 32"
        stroke={Colors.white}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        opacity={0.6}
      />
    </Svg>
  );
};

export const SnakeTail: React.FC<SnakePartProps> = ({ size = 40 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 50">
      {/* Tail */}
      <Path
        d="M 20 10 Q 15 25 20 35 Q 18 42 20 50"
        fill={Colors.coralOrange}
        stroke={Colors.coralOrange}
        strokeWidth="15"
        strokeLinecap="round"
      />

      {/* Tail stripe */}
      <Path
        d="M 20 12 Q 17 25 20 38"
        stroke={Colors.white}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity={0.6}
      />
    </Svg>
  );
};
