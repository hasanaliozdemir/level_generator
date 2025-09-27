import { Audiowide_400Regular, useFonts } from "@expo-google-fonts/audiowide";
import LottieView from "lottie-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { ANIMATIONS } from "../../constants/Assets";
import { COLORS } from "../../constants/Colors";
import { GAME_CONFIG } from "../../constants/GameConfig";
import {
  Direction,
  Food,
  GameState,
  Obstacle,
  Position,
  PremiumItem
} from "../../types/GameTypes";
import { playHapticFeedback } from "../../utils/settingsUtils";
import { CountdownOverlay } from "./CountdownOverlay";
import { FoodCell } from "./FoodCell";
import { ObstacleCell } from "./ObstacleCell";
import { PremiumItemCell } from "./PremiumItemCell";
import { SnakeCell } from "./SnakeCell";

// 🎮 GAME BOARD COMPONENT
export const GameBoard: React.FC<{
  snake: Position[];
  food: Food;
  premiumItem: PremiumItem | null;
  gameState: GameState;
  currentBoss: any | null;
  countdownSeconds: number;
  onDirectionChange: (direction: Direction) => void;
  onBossEncounterComplete?: () => void;
  onResumeComplete?: () => void;
  foodTypes?: any[];
  premiumItems?: any[];
  hasDeathProtection?: boolean;
  hasMagnetPowerUp?: boolean;
  magnetTimeRemaining?: number;
  obstacles?: Obstacle[];
}> = ({
  snake,
  food,
  premiumItem,
  gameState,
  currentBoss,
  countdownSeconds,
  onDirectionChange,
  onBossEncounterComplete,
  onResumeComplete,
  foodTypes = [],
  premiumItems = [],
  hasDeathProtection = false,
  hasMagnetPowerUp = false,
  magnetTimeRemaining = 0,
  obstacles = [],
}) => {
    const [fontsLoaded] = useFonts({
      Audiowide_400Regular,
    });

    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const gameScale = useSharedValue(1);

    const [bossSnake, setBossSnake] = useState<Position[]>([]);
    const [battlePlayerSnake, setBattlePlayerSnake] = useState<Position[]>([]);
    const [battlePhase, setBattlePhase] = useState<
      "idle" | "intro" | "entering" | "prowling" | "clash" | "result"
    >("idle");

    const bossOpacity = useSharedValue(0);
    const playerBattleOpacity = useSharedValue(0);
    const titleOpacity = useSharedValue(0);
    const overlayOpacity = useSharedValue(0);
    const resultOpacity = useSharedValue(0);
    const playerSnakeScale = useSharedValue(1);
    const bossSnakeScale = useSharedValue(1);

    useEffect(() => {
      if (gameState === "bossEncounter" && currentBoss) {
        console.log("🐍 EPIC Boss Battle Starting!");

        setBattlePhase("intro");
        overlayOpacity.value = withTiming(1, { duration: 500 });

        setTimeout(() => {
          titleOpacity.value = withTiming(1, { duration: 400 });
        }, 200);

        setTimeout(() => {
          setBattlePhase("entering");

          overlayOpacity.value = withTiming(0, { duration: 300 });

          const centerY = Math.floor(GAME_CONFIG.GRID_HEIGHT / 2);
          const leftStartX = 2;
          const rightStartX = GAME_CONFIG.GRID_WIDTH - 3;

          const playerBattlePositions: Position[] = [];
          for (let i = 0; i < snake.length; i++) {
            playerBattlePositions.push({
              x: leftStartX - i,
              y: centerY + (i % 2 === 0 ? 0 : 1),
            });
          }
          setBattlePlayerSnake(playerBattlePositions);

          const bossBattlePositions: Position[] = [];
          for (let i = 0; i < currentBoss.size; i++) {
            bossBattlePositions.push({
              x: rightStartX + i,
              y: centerY + (i % 2 === 0 ? 0 : -1),
            });
          }
          setBossSnake(bossBattlePositions);

          playerBattleOpacity.value = withTiming(1, { duration: 600 });
          bossOpacity.value = withTiming(1, { duration: 600 });

          setTimeout(() => {
            setBattlePhase("prowling");

            setTimeout(() => {
              setBattlePlayerSnake((prev) =>
                prev.map((seg, i) => ({
                  x: leftStartX + 2 - i,
                  y: centerY + (i % 2 === 0 ? 0 : 1),
                }))
              );

              setBossSnake((prev) =>
                prev.map((seg, i) => ({
                  x: rightStartX - 2 + i,
                  y: centerY + (i % 2 === 0 ? 0 : -1),
                }))
              );
            }, 400);

            setTimeout(() => {
              setBattlePlayerSnake((prev) =>
                prev.map((seg, i) => ({
                  x: leftStartX + 4 - i,
                  y: centerY + (i % 2 === 0 ? 1 : 0),
                }))
              );

              setBossSnake((prev) =>
                prev.map((seg, i) => ({
                  x: rightStartX - 4 + i,
                  y: centerY + (i % 2 === 0 ? -1 : 0),
                }))
              );
            }, 800);

            setTimeout(() => {
              setBattlePhase("clash");
              const centerX = Math.floor(GAME_CONFIG.GRID_WIDTH / 2);

              setBattlePlayerSnake((prev) =>
                prev.map((seg, i) => ({
                  x: centerX - 1 - i,
                  y: centerY,
                }))
              );

              setBossSnake((prev) =>
                prev.map((seg, i) => ({
                  x: centerX + 1 + i,
                  y: centerY,
                }))
              );

              setTimeout(() => {
                const playerWins = snake.length >= currentBoss.size;
                setBattlePhase("result");

                if (playerWins) {
                  // Player wins - boss gets eaten
                  bossSnakeScale.value = withSequence(
                    withTiming(0.3, { duration: 300 }),
                    withTiming(0, { duration: 200 })
                  );
                  playerSnakeScale.value = withSpring(1.4, { damping: 8 });
                  playHapticFeedback("success");
                } else {
                  // Boss wins - player gets eaten
                  playerSnakeScale.value = withSequence(
                    withTiming(0.3, { duration: 300 }),
                    withTiming(0, { duration: 200 })
                  );
                  bossSnakeScale.value = withSpring(1.4, { damping: 8 });
                  playHapticFeedback("error");
                }

                resultOpacity.value = withTiming(1, { duration: 400 });

                setTimeout(() => {
                  // 🔄 Reset battle states BEFORE calling complete
                  setBattlePhase("idle");
                  setBossSnake([]);
                  setBattlePlayerSnake([]);
                  bossOpacity.value = 0;
                  playerBattleOpacity.value = 0;
                  titleOpacity.value = 0;
                  overlayOpacity.value = 0;
                  resultOpacity.value = 0;
                  playerSnakeScale.value = 1;
                  bossSnakeScale.value = 1;

                  onBossEncounterComplete?.();
                }, 2000);
              }, 600);
            }, 1200);
          }, 600);
        }, 1000);
      } else {
        setBattlePhase("idle");
        setBossSnake([]);
        setBattlePlayerSnake([]);
        bossOpacity.value = 0;
        playerBattleOpacity.value = 0;
        titleOpacity.value = 0;
        overlayOpacity.value = 0;
        resultOpacity.value = 0;
        playerSnakeScale.value = 1;
        bossSnakeScale.value = 1;
      }
    }, [
      gameState,
      currentBoss,
      snake,
      bossOpacity,
      playerBattleOpacity,
      titleOpacity,
      overlayOpacity,
      resultOpacity,
      playerSnakeScale,
      bossSnakeScale,
      onBossEncounterComplete,
    ]);

    // 🎮 ENHANCED GESTURE HANDLING - INSTANT RESPONSE
    const gestureHandler = useAnimatedGestureHandler<
      PanGestureHandlerGestureEvent,
      {
        startX: number;
        startY: number;
        hasTriggered: boolean;
        initialDirection: Direction | null;
      }
    >({
      onStart: (_, context) => {
        context.startX = translateX.value;
        context.startY = translateY.value;
        context.hasTriggered = false;
        context.initialDirection = null;
      },
      onActive: (event, context) => {
        // Very minimal visual feedback during gesture
        translateX.value = context.startX + event.translationX * 0.05;
        translateY.value = context.startY + event.translationY * 0.05;

        // 🚀 INSTANT DIRECTION DETECTION - Process during swipe!
        if (!context.hasTriggered) {
          const { velocityX, velocityY, translationX, translationY } = event;

          const absVelX = Math.abs(velocityX);
          const absVelY = Math.abs(velocityY);
          const absTransX = Math.abs(translationX);
          const absTransY = Math.abs(translationY);

          if (Math.max(absTransX, absTransY) > 15) {
            let direction: Direction;

            if (absVelX > absVelY || absTransX > absTransY) {
              direction = velocityX > 0 || translationX > 0 ? "right" : "left";
            } else {
              direction = velocityY > 0 || translationY > 0 ? "down" : "up";
            }

            context.hasTriggered = true;
            context.initialDirection = direction;
            runOnJS(playHapticFeedback)("light");
            runOnJS(onDirectionChange)(direction);
          }
        }
      },
      onEnd: (event, context) => {
        // Reset with bounce effect
        translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
        translateY.value = withSpring(0, { damping: 15, stiffness: 150 });

        // 🚀 BACKUP DETECTION - Only if not already triggered
        if (!context.hasTriggered) {
          const { velocityX, velocityY, translationX, translationY } = event;

          const absVelX = Math.abs(velocityX);
          const absVelY = Math.abs(velocityY);
          const absTransX = Math.abs(translationX);
          const absTransY = Math.abs(translationY);

          if (Math.max(absTransX, absTransY) >= 10) {
            let direction: Direction;

            if (absVelX > absVelY || absTransX > absTransY) {
              direction = velocityX > 0 || translationX > 0 ? "right" : "left";
            } else {
              direction = velocityY > 0 || translationY > 0 ? "down" : "up";
            }

            runOnJS(playHapticFeedback)("light");
            runOnJS(onDirectionChange)(direction);
          }
        }
      },
    });

    const animatedGameStyle = useAnimatedStyle(() => ({
      transform: [{ scale: gameScale.value }],
    }));

    const playerSnakeAnimStyle = useAnimatedStyle(() => ({
      transform: [{ scale: playerSnakeScale.value }],
    }));

    const playerBattleSnakeAnimStyle = useAnimatedStyle(() => ({
      opacity: playerBattleOpacity.value,
      transform: [{ scale: playerSnakeScale.value }],
    }));

    const bossSnakeAnimStyle = useAnimatedStyle(() => ({
      opacity: bossOpacity.value,
      transform: [{ scale: bossSnakeScale.value }],
    }));

    const overlayAnimStyle = useAnimatedStyle(() => ({
      opacity: overlayOpacity.value,
    }));

    const titleAnimStyle = useAnimatedStyle(() => ({
      opacity: titleOpacity.value,
    }));

    const resultAnimStyle = useAnimatedStyle(() => ({
      opacity: resultOpacity.value,
    }));

    const gameElements = useMemo(() => {
      const elements: React.ReactElement[] = [];

      // 🚨 Render obstacles 
      obstacles.forEach((obstacle, idx) => {
        obstacle.positions.forEach(([x, y], i) => {
          elements.push(
            <ObstacleCell
              key={`obstacle-${idx}-${i}`}
              position={{ x, y }}
              obstacle={obstacle}
            />
          );
        });
      });

      // 🐍 Show normal snake only in active game states
      if (
        gameState !== "bossEncounter" &&
        gameState !== "bossVictory" &&
        gameState !== "levelRetry"
      ) {
        snake.forEach((segment, index) => {
          elements.push(
            <Animated.View
              key={`player-snake-${index}`}
              style={playerSnakeAnimStyle}
            >
              <SnakeCell
                position={segment}
                isHead={index === 0}
                index={index}
                totalLength={snake.length}
                hasDeathProtection={hasDeathProtection && index === 0}
                hasMagnetPowerUp={hasMagnetPowerUp && index === 0}
                magnetTimeRemaining={magnetTimeRemaining}
              />
            </Animated.View>
          );
        });
      }

      if (gameState === "bossEncounter") {
        battlePlayerSnake.forEach((segment, index) => {
          if (
            segment.x >= 0 &&
            segment.x < GAME_CONFIG.GRID_WIDTH &&
            segment.y >= 0 &&
            segment.y < GAME_CONFIG.GRID_HEIGHT
          ) {
            elements.push(
              <Animated.View
                key={`battle-player-${index}`}
                style={playerBattleSnakeAnimStyle}
              >
                <SnakeCell
                  position={segment}
                  isHead={index === 0}
                  index={index}
                  totalLength={battlePlayerSnake.length}
                />
              </Animated.View>
            );
          }
        });

        bossSnake.forEach((segment, index) => {
          if (
            segment.x >= 0 &&
            segment.x < GAME_CONFIG.GRID_WIDTH &&
            segment.y >= 0 &&
            segment.y < GAME_CONFIG.GRID_HEIGHT
          ) {
            elements.push(
              <Animated.View
                key={`boss-snake-${index}`}
                style={bossSnakeAnimStyle}
              >
                <View
                  style={[
                    styles.bossSnakeSegment,
                    {
                      left: segment.x * GAME_CONFIG.CELL_SIZE,
                      top: segment.y * GAME_CONFIG.CELL_SIZE,
                      backgroundColor: index === 0 ? "#FF4444" : "#FF6666",
                      opacity: index === 0 ? 1 : 0.8 - index * 0.1,
                    },
                  ]}
                >
                  {index === 0 && (
                    <View style={styles.bossSnakeEyes}>
                      <View style={styles.bossEye} />
                      <View style={styles.bossEye} />
                    </View>
                  )}
                </View>
              </Animated.View>
            );
          }
        });
      }

      // 🍎 Show food only in active game states
      if (
        gameState !== "bossEncounter" &&
        gameState !== "bossVictory" &&
        gameState !== "levelRetry"
      ) {
        elements.push(
          <FoodCell
            key={`food-${food.position.x}-${food.position.y}`}
            position={food.position}
            foodType={food.type}
            foodTypes={foodTypes}
          />
        );
      }

      // 💎 Show premium items only in active game states
      if (
        premiumItem &&
        gameState !== "bossEncounter" &&
        gameState !== "bossVictory" &&
        gameState !== "levelRetry"
      ) {
        elements.push(
          <PremiumItemCell
            key={`premium-${premiumItem.position.x}-${premiumItem.position.y}`}
            position={premiumItem.position}
            itemType={premiumItem.type}
            premiumItems={premiumItems}
          />
        );
      }

      return elements;
    }, [
      snake,
      food,
      premiumItem,
      gameState,
      bossSnake,
      battlePlayerSnake,
      playerSnakeAnimStyle,
      playerBattleSnakeAnimStyle,
      bossSnakeAnimStyle,
      foodTypes,
      premiumItems,
    ]);

    return (
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.gameBoard, animatedGameStyle]}>
          <View
            style={[styles.boardContent, { backgroundColor: COLORS.surface }]}
          >
            <View style={styles.gameGrid}>
              {gameElements}

              <View style={styles.gridOverlay}>
                {Array.from({ length: GAME_CONFIG.GRID_WIDTH - 1 }, (_, i) => (
                  <View
                    key={`vertical-${i + 1}`}
                    style={[
                      styles.gridLine,
                      styles.verticalGridLine,
                      { left: (i + 1) * GAME_CONFIG.CELL_SIZE },
                    ]}
                  />
                ))}

                {Array.from({ length: GAME_CONFIG.GRID_HEIGHT - 1 }, (_, i) => (
                  <View
                    key={`horizontal-${i + 1}`}
                    style={[
                      styles.gridLine,
                      styles.horizontalGridLine,
                      { top: (i + 1) * GAME_CONFIG.CELL_SIZE },
                    ]}
                  />
                ))}
              </View>
            </View>

            {/* 🎭 SIMPLE PAUSE OVERLAY FOR BOARD ONLY */}
            {gameState === "paused" && (
              <View style={styles.boardPauseOverlay}>
                <MaterialCommunityIcons
                  name="pause"
                  size={60}
                  color={COLORS.text.primary}
                />
              </View>
            )}

            {/* ⏰ RESUME COUNTDOWN OVERLAY */}
            {gameState === "resuming" && (
              <CountdownOverlay
                visible={true}
                onComplete={() => {
                  console.log("🎯 GameBoard: CountdownOverlay onComplete triggered");
                  if (onResumeComplete) {
                    console.log("🎯 GameBoard: Calling onResumeComplete");
                    onResumeComplete();
                  } else {
                    console.log("⚠️ GameBoard: onResumeComplete is undefined");
                  }
                }}
              />
            )}

            {gameState === "bossEncounter" && (
              <>
                <Animated.View
                  style={[styles.bossIntroOverlay, overlayAnimStyle]}
                >
                  <View style={styles.bossIntroContent}>
                    <Text
                      style={[
                        styles.bossIntroTitle,
                        fontsLoaded && { fontFamily: "Audiowide_400Regular" },
                      ]}
                    >
                      ⚔️ BOSS FIGHT! ⚔️
                    </Text>

                    <LottieView
                      source={ANIMATIONS.perfectLoopLoading}
                      autoPlay
                      loop
                      style={styles.bossIntroLottie}
                      speed={1.2}
                    />
                  </View>
                </Animated.View>

                <Animated.View style={[styles.bossBattleTitle, titleAnimStyle]}>
                  <Text
                    style={[
                      styles.bossBattleTitleText,
                      fontsLoaded && { fontFamily: "Audiowide_400Regular" },
                    ]}
                  >
                    {battlePhase === "intro"
                      ? "Boss Fight!"
                      : battlePhase === "entering"
                        ? "Entering Arena..."
                        : battlePhase === "prowling"
                          ? "Battle Commencing..."
                          : battlePhase === "clash"
                            ? "CLASH!"
                            : ""}
                  </Text>
                </Animated.View>

                <Animated.View style={[styles.bossBattleResult, resultAnimStyle]}>
                  {battlePhase === "result" && (
                    <>
                      <Text
                        style={[
                          styles.bossBattleResultText,
                          {
                            color:
                              snake.length >= (currentBoss?.size || 0)
                                ? "#00FF88"
                                : "#FF4444",
                          },
                        ]}
                      >
                        {snake.length >= (currentBoss?.size || 0)
                          ? "🎉 VICTORY!"
                          : "💀 DEFEAT"}
                      </Text>
                      <Text style={styles.bossBattleResultDesc}>
                        {snake.length >= (currentBoss?.size || 0)
                          ? `You defeated ${currentBoss?.name}!`
                          : `${currentBoss?.name} was too strong!`}
                      </Text>
                    </>
                  )}
                </Animated.View>
              </>
            )}
          </View>
        </Animated.View>
      </PanGestureHandler>
    );
  };

const styles = StyleSheet.create({
  gameBoard: {
    width: GAME_CONFIG.ACTUAL_BOARD_WIDTH,
    height: GAME_CONFIG.ACTUAL_BOARD_HEIGHT,
    borderRadius: 16,
    marginBottom: 10, // Reduced from 25 to 10 for better space utilization
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  boardContent: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  gameGrid: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  gridOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
  },
  gridLine: {
    position: "absolute",
    backgroundColor: "rgba(0, 255, 255, 0.015)", //0.15
  },
  verticalGridLine: {
    width: 1,
    height: "100%",
  },
  horizontalGridLine: {
    height: 1,
    width: "100%",
  },
  boardPauseOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 16,
  },
  bossSnakeSegment: {
    position: "absolute",
    width: GAME_CONFIG.CELL_SIZE,
    height: GAME_CONFIG.CELL_SIZE,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FF2222",
  },
  // Boss Snake Eyes
  bossSnakeEyes: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "60%",
    height: "50%",
    position: "absolute",
    top: "25%",
    left: "20%",
  },
  bossEye: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFFF00",
    borderWidth: 1,
    borderColor: "#FF0000",
  },
  bossIntroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },
  bossIntroContent: {
    alignItems: "center",
    padding: 30,
  },
  bossIntroTitle: {
    fontSize: 30,
    fontWeight: "400",
    color: "#00FFFF",
    letterSpacing: 4,
    textAlign: "center",
    marginBottom: 25,
  },
  bossIntroLottie: {
    width: 120,
    height: 120,
  },
  bossBattleTitle: {
    position: "absolute",
    top: "15%",
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  bossBattleTitleText: {
    fontSize: 20,
    fontWeight: "400",
    color: "#FFFFFF",
    letterSpacing: 1.5,
    textAlign: "center",
    textShadowColor: "#000000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    opacity: 0.9,
  },
  bossBattleResult: {
    position: "absolute",
    bottom: "15%",
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  bossBattleResultText: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 1,
    textAlign: "center",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    marginBottom: 8,
  },
  bossBattleResultDesc: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text.secondary,
    textAlign: "center",
    letterSpacing: 0.5,
  },
});
