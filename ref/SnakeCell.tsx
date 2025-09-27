import React, { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { COLORS } from "../../constants/Colors";
import { GAME_CONFIG } from "../../constants/GameConfig";
import { Position } from "../../types/GameTypes";

// 🐍 ENHANCED SNAKE CELL WITH EFFECTS
export const SnakeCell: React.FC<{
  position: Position;
  isHead: boolean;
  index: number;
  totalLength: number;
  hasDeathProtection?: boolean;
  hasMagnetPowerUp?: boolean;
  magnetTimeRemaining?: number;
}> = ({ position, isHead, index, totalLength, hasDeathProtection = false, hasMagnetPowerUp = false, magnetTimeRemaining = 0 }) => {
  const scale = useSharedValue(0);
  const glow = useSharedValue(0);
  const magnetPulse = useSharedValue(1);
  const isPulsing = useRef(false);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
    if (isHead) {
      glow.value = withRepeat(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
        -1,
        true
      );
    }
  }, [isHead, scale, glow]);

  // Pulse effect for magnet in last 3 seconds
  useEffect(() => {
    // Only apply magnet effects to the head
    if (!isHead) return;
    
    const shouldPulse = hasMagnetPowerUp && magnetTimeRemaining > 0 && magnetTimeRemaining <= 3000;
    
    // Only change animation if the pulsing state actually changed
    if (shouldPulse && !isPulsing.current) {
      console.log('🚨 Starting magnet pulse animation');
      isPulsing.current = true;
      magnetPulse.value = withRepeat(
        withTiming(1.2, { duration: 400, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      );
    } else if (!shouldPulse && isPulsing.current) {
      console.log('✅ Stopping magnet pulse animation');
      isPulsing.current = false;
      magnetPulse.value = withTiming(1, { duration: 200 });
    }
  }, [isHead, hasMagnetPowerUp, magnetTimeRemaining <= 3000 && magnetTimeRemaining > 0]);

  const animatedStyle = useAnimatedStyle(() => {
    const glowIntensity = isHead
      ? interpolate(glow.value, [0, 1], [0.3, 1])
      : 0.8;
    const cellScale = interpolate(scale.value, [0, 1], [0, 1]);

    return {
      transform: [{ scale: cellScale }],
      shadowOpacity: glowIntensity,
    };
  });

  const magnetRingStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: magnetPulse.value }],
    };
  });

  const getSegmentColor = () => {
    if (isHead) return COLORS.primary;
    const intensity = 1 - (index / totalLength) * 0.5;
    return `rgba(0, 255, 255, ${intensity})`;
  };

  const cellStyle = [
    styles.snakeCell,
    {
      left: position.x * GAME_CONFIG.CELL_SIZE + 2,
      top: position.y * GAME_CONFIG.CELL_SIZE + 2,
      width: GAME_CONFIG.CELL_SIZE - 4,
      height: GAME_CONFIG.CELL_SIZE - 4,
      backgroundColor: getSegmentColor(),
      shadowColor: COLORS.primary,
    },
  ];

  return (
    <Animated.View style={[cellStyle, animatedStyle]}>
      {/* Death Protection Shield Ring */}
      {hasDeathProtection && isHead && (
        <View style={[
          styles.protectionRing,
          hasMagnetPowerUp && styles.protectionRingWithMagnet
        ]}>
          <View style={[
            styles.protectionRingOuter,
            hasMagnetPowerUp && styles.protectionRingOuterWithMagnet
          ]} />
          <View style={[
            styles.protectionRingInner,
            hasMagnetPowerUp && styles.protectionRingInnerWithMagnet
          ]} />
        </View>
      )}
      
      {/* Magnet Power-up Ring */}
      {hasMagnetPowerUp && isHead && (
        <Animated.View style={[
          styles.magnetRing,
          hasDeathProtection && styles.magnetRingWithShield,
          magnetRingStyle
        ]}>
          <View style={[
            styles.magnetRingOuter,
            hasDeathProtection && styles.magnetRingOuterWithShield
          ]} />
          <View style={[
            styles.magnetRingInner,
            hasDeathProtection && styles.magnetRingInnerWithShield
          ]} />
        </Animated.View>
      )}
      
      {isHead && (
        <View style={styles.snakeEye}>
          <View
            style={[styles.eyeDot, { backgroundColor: COLORS.background }]}
          />
          <View
            style={[styles.eyeDot, { backgroundColor: COLORS.background }]}
          />
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  snakeCell: {
    position: "absolute",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    shadowRadius: 8,
    elevation: 5,
  },
  snakeEye: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "60%",
    height: "60%",
  },
  eyeDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  protectionRing: {
    position: "absolute",
    width: GAME_CONFIG.CELL_SIZE + 8,
    height: GAME_CONFIG.CELL_SIZE + 8,
    top: -6,
    left: -6,
    justifyContent: "center",
    alignItems: "center",
  },
  protectionRingOuter: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: (GAME_CONFIG.CELL_SIZE + 8) / 2,
    borderWidth: 2,
    borderColor: "rgba(128, 128, 128, 0.8)",
    backgroundColor: "transparent",
  },
  protectionRingInner: {
    position: "absolute",
    width: "90%",
    height: "90%",
    borderRadius: (GAME_CONFIG.CELL_SIZE + 8) * 0.45,
    borderWidth: 1,
    borderColor: "rgba(128, 128, 128, 0.4)",
    backgroundColor: "transparent",
  },
  magnetRing: {
    position: "absolute",
    width: GAME_CONFIG.CELL_SIZE + 12,
    height: GAME_CONFIG.CELL_SIZE + 12,
    top: -8,
    left: -8,
    justifyContent: "center",
    alignItems: "center",
  },
  magnetRingOuter: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: (GAME_CONFIG.CELL_SIZE + 12) / 2,
    borderWidth: 3,
    borderColor: "rgba(255, 215, 0, 0.9)", // Golden yellow
    backgroundColor: "transparent",
  },
  magnetRingInner: {
    position: "absolute",
    width: "85%",
    height: "85%",
    borderRadius: (GAME_CONFIG.CELL_SIZE + 12) * 0.425,
    borderWidth: 2,
    borderColor: "rgba(255, 215, 0, 0.6)", // Lighter golden yellow
    backgroundColor: "transparent",
  },
  // Combined power-up styles - when both shield and magnet are active
  protectionRingWithMagnet: {
    // Shield stays in center, slightly smaller
    width: GAME_CONFIG.CELL_SIZE + 6,
    height: GAME_CONFIG.CELL_SIZE + 6,
    top: -5,
    left: -5,
  },
  protectionRingOuterWithMagnet: {
    borderWidth: 3,
    borderColor: "rgba(128, 128, 128, 1)", // More opaque
  },
  protectionRingInnerWithMagnet: {
    borderWidth: 2,
    borderColor: "rgba(128, 128, 128, 0.7)",
  },
  magnetRingWithShield: {
    // Magnet ring becomes larger and positioned further out
    width: GAME_CONFIG.CELL_SIZE + 18,
    height: GAME_CONFIG.CELL_SIZE + 18,
    top: -11,
    left: -11,
  },
  magnetRingOuterWithShield: {
    borderWidth: 4,
    borderColor: "rgba(255, 215, 0, 1)", // More opaque
  },
  magnetRingInnerWithShield: {
    width: "80%",
    height: "80%",
    borderWidth: 3,
    borderColor: "rgba(255, 215, 0, 0.8)",
  },
});
