import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Image, StyleSheet } from "react-native";
import Animated, {
    Easing,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import { GAME_CONFIG } from "../../constants/GameConfig";
import { Position, PremiumItemType } from "../../types/GameTypes";
import { selectPremiumImage } from "../../utils/selectCellImage";

// 💎 ENHANCED PREMIUM ITEM WITH SPECIAL EFFECTS
export const PremiumItemCell: React.FC<{
  position: Position;
  itemType: PremiumItemType;
  premiumItems?: any[];
}> = React.memo(({ position, itemType, premiumItems = [] }) => {
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);
  const sparkle = useSharedValue(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    // Only animate once when component mounts
    if (!hasAnimated.current) {
      hasAnimated.current = true;
      scale.value = withSpring(1, { damping: 6, stiffness: 120 });
      rotation.value = withRepeat(
        withTiming(360, { duration: 5000, easing: Easing.linear }),
        -1,
        false
      );
      sparkle.value = withRepeat(
        withTiming(1, { duration: 500, easing: Easing.inOut(Easing.quad) }),
        -1,
        true
      );
    }
  }, []); // Empty dependency array for mount-only effect

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(scale.value, [0, 1], [0, 1.4]) },
      { rotate: `${rotation.value}deg` },
    ],
    shadowOpacity: interpolate(sparkle.value, [0, 1], [0.8, 1]),
  }));

  const cellStyle = [
    styles.premiumItemCell,
    {
      left: position.x * GAME_CONFIG.CELL_SIZE + 2,
      top: position.y * GAME_CONFIG.CELL_SIZE + 2,
      width: GAME_CONFIG.CELL_SIZE - 4,
      height: GAME_CONFIG.CELL_SIZE - 4,
      //backgroundColor: COLORS.accent,
    },
  ];

  // Supabase'den gelen emoji kullan, yoksa statik emoji kullan
  const supabasePremium = premiumItems.find((item) => item.name === itemType);
  const foodImage = selectPremiumImage(itemType);
  return (
    <Animated.View style={[cellStyle, animatedStyle]}>
      <LinearGradient
        colors={[
          "rgba(233, 30, 99, 0.4)",
          "rgba(156, 39, 176, 0.4)",
          "rgba(233, 30, 99, 0.3)",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <Image source={foodImage} style={styles.foodImage} />
      </LinearGradient>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  premiumItemCell: {
    position: "absolute",
    borderRadius: 12,
    shadowColor: "#E91E63",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 16,
    shadowOpacity: 0.8,
    elevation: 12,
    overflow: "hidden",
  },
  gradientBackground: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  foodImage: {
    width: GAME_CONFIG.CELL_SIZE * 0.6,
    height: GAME_CONFIG.CELL_SIZE * 0.6,
    resizeMode: "contain",
  },
});
