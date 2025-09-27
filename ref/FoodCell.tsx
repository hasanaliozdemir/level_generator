import React, { useEffect, useRef } from "react";

import { Image, StyleSheet } from "react-native";

import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { COLORS } from "../../constants/Colors";

import { GAME_CONFIG } from "../../constants/GameConfig";

import { FoodType, Position } from "../../types/GameTypes";
import {
    usePulseAnimation,
    useRotationAnimation,
} from "../../utils/animations";

import { selectFoodImage } from "../../utils/selectCellImage";

// 🍎 ENHANCED FOOD WITH PARTICLE EFFECT
export const FoodCell: React.FC<{
  position: Position;
  foodType: FoodType;
  foodTypes?: any[];
}> = React.memo(({ position, foodType, foodTypes = [] }) => {
  const scale = useSharedValue(0);
  const { rotation, startRotation } = useRotationAnimation();
  const { pulse, startPulse } = usePulseAnimation();
  const hasAnimated = useRef(false);

  useEffect(() => {
    // Only animate once when component mounts
    if (!hasAnimated.current) {
      hasAnimated.current = true;
      scale.value = withSpring(1, { damping: 8, stiffness: 150 });
      startRotation(5000); // 5 saniyede tam tur
      startPulse(1.1, 800); // Hafif pulse efekti
    }
  }, []); // Empty dependency array for mount-only effect

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(scale.value, [0, 1], [0, 1.1]) },
      { rotate: `${rotation.value}deg` },
    ],
    shadowOpacity: interpolate(pulse.value, [1, 1.1], [0.4, 1]),
  }));

  const cellStyle = [
    styles.foodCell,
    {
      left: position.x * GAME_CONFIG.CELL_SIZE + 2,
      top: position.y * GAME_CONFIG.CELL_SIZE + 2,
      width: GAME_CONFIG.CELL_SIZE - 4,
      height: GAME_CONFIG.CELL_SIZE - 4,
      //backgroundColor: COLORS.secondary,
    },
  ];

  // Supabase'den gelen emoji kullan, yoksa statik emoji kullan
  const supabaseFood = foodTypes.find((food) => food.name === foodType);
  const foodImage = selectFoodImage(foodType);

  return (
    <Animated.View style={[cellStyle, animatedStyle]}>
      <Image source={foodImage} style={styles.foodImage} resizeMode="contain" />
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  foodCell: {
    position: "absolute",
    borderRadius: 8,
    shadowColor: COLORS.secondary,
    shadowRadius: 12,
    elevation: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  foodImage: {
    width: GAME_CONFIG.CELL_SIZE * 0.6,
    height: GAME_CONFIG.CELL_SIZE * 0.6,
    resizeMode: "contain",
  },
});
