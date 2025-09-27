import React from "react";
import { Image, StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { GAME_CONFIG } from "../../constants/GameConfig";
import { Obstacle, Position } from "../../types/GameTypes";

// 🚨 OBSTACLE CELL COMPONENT
export const ObstacleCell: React.FC<{
    position: Position;
    obstacle: Obstacle;
}> = ({ position, obstacle }) => {
    // You can customize style based on obstacle type/axis
    const isLaser = obstacle.type === "laser";
    const isWall = obstacle.type === "wall";
    const isPortal = obstacle.type === "portal";
    const isVertical = obstacle.axis === "vertical";
    // Laser & Wall border logic
    let borderLeftWidth = 0, borderRightWidth = 0, borderTopWidth = 0, borderBottomWidth = 0;
    if ((isLaser || isWall) && obstacle.positions.length > 1) {
        const idx = obstacle.positions.findIndex(([x, y]) => x === position.x && y === position.y);
        if (isVertical) {
            if (idx === 0) borderTopWidth = 4;
            if (idx === obstacle.positions.length - 1) borderBottomWidth = 4;
        } else {
            if (idx === 0) borderLeftWidth = 4;
            if (idx === obstacle.positions.length - 1) borderRightWidth = 4;
        }
    }

    // Portal cell logic
    let portalEntry = null, portalExit = null, isEntry = false, isExit = false;
    if (isPortal && obstacle.positions.length === 2) {
        portalEntry = obstacle.positions[0];
        portalExit = obstacle.positions[1];
        isEntry = position.x === portalEntry[0] && position.y === portalEntry[1];
        isExit = position.x === portalExit[0] && position.y === portalExit[1];
    }

    const cellStyle = [
        styles.obstacleCell,
        {
            left: position.x * GAME_CONFIG.CELL_SIZE,
            top: position.y * GAME_CONFIG.CELL_SIZE,
            width: GAME_CONFIG.CELL_SIZE,
            height: GAME_CONFIG.CELL_SIZE,
            opacity: isLaser ? 1 : isWall ? 1 : isPortal ? 0.85 : 0.7,
            borderLeftWidth,
            borderRightWidth,
            borderTopWidth,
            borderBottomWidth,
            borderLeftColor: borderLeftWidth ? "#00FFFF" : undefined,
            borderRightColor: borderRightWidth ? "#00FFFF" : undefined,
            borderTopColor: borderTopWidth ? "#00FFFF" : undefined,
            borderBottomColor: borderBottomWidth ? "#00FFFF" : undefined,
        },
    ];

    // Neon animated line logic
    const neonAnim = useSharedValue(0);
    React.useEffect(() => {
        neonAnim.value = withRepeat(
            withTiming(1, { duration: 1200 }),
            -1,
            true
        );
    }, []);

    const neonStyle = useAnimatedStyle(() => {
        const borderClearance = 4; // px
        if (isVertical) {
            let bottomMargin = borderBottomWidth ? borderClearance : 0;
            return {
                position: "absolute",
                left: neonAnim.value * (GAME_CONFIG.CELL_SIZE - 12),
                width: 8,
                height: GAME_CONFIG.CELL_SIZE - bottomMargin,
                backgroundColor: "#FF0033",
                shadowColor: "#FF00CC",
                shadowRadius: 16,
                shadowOpacity: 0.9,
                elevation: 10,
                opacity: 0.98,
            };
        } else {
            let rightMargin = borderRightWidth ? borderClearance : 0;
            return {
                position: "absolute",
                top: neonAnim.value * (GAME_CONFIG.CELL_SIZE - 12),
                width: GAME_CONFIG.CELL_SIZE - rightMargin,
                height: 8,
                backgroundColor: "#FF0033",
                shadowColor: "#FF00CC",
                shadowRadius: 16,
                shadowOpacity: 0.9,
                elevation: 10,
                opacity: 0.98,
            };
        }
    });

    // Portal image rotation animation
    const portalRotation = useSharedValue(0);
    const portalPulse = useSharedValue(1);
    React.useEffect(() => {
        portalRotation.value = withRepeat(
            withTiming(360, { duration: 6000, easing: Easing.linear }),
            -1,
            false
        );
        portalPulse.value = withRepeat(
            withTiming(1.25, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
    }, []);
    const portalImageStyle = useAnimatedStyle(() => ({
        transform: [
            { rotate: `${portalRotation.value}deg` },
            { scale: portalPulse.value }
        ],
    }));

    return (

        <View style={cellStyle}>

            {isLaser ? (
                <Animated.View style={neonStyle} />
            ) : null}
            {isWall ? (
                <Image
                    source={require("../../assets/images/obstacle/wall.png")}
                    style={styles.wallImage}
                    resizeMode="contain"
                />
            ) : null}
            {isPortal && (isEntry) ? (
                <Animated.View style={[styles.portalImageContainer, portalImageStyle]}>
                    <Image
                        source={require("../../assets/images/obstacle/portal-in.png")}
                        style={styles.portalImage}
                        resizeMode="contain"
                    />
                </Animated.View>
            ) : null}
            {isPortal && (isExit) ? (
                <Animated.View style={[styles.portalImageContainer, portalImageStyle]}>
                    <Image
                        source={require("../../assets/images/obstacle/portal-out.png")}
                        style={styles.portalImage}
                        resizeMode="contain"
                    />
                </Animated.View>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    obstacleCell: {
        position: "absolute",
        zIndex: 5,
    },
    wallImage: {
        width: "100%",
        height: "100%",
        position: "absolute",
        left: 0,
        top: 0,
    },
    portalImageContainer: {
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        zIndex: 10,
    },
    portalImage: {
        width: "100%",
        height: "100%",
    },
});