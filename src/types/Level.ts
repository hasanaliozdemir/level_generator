// CyberSnake seviye JSON formatı ve grid öğeleri için tipler

export type Position = [number, number];

export type ObstacleType = 'wall' | 'laser' | 'portal';

export interface WallObstacle {
    type: 'wall';
    axis: 'vertical' | 'horizontal';
    positions: Position[];
}

export interface LaserObstacle {
    type: 'laser';
    axis: 'vertical' | 'horizontal';
    positions: Position[];
}

export interface PortalObstacle {
    type: 'portal';
    effect: 'teleport';
    positions: [Position, Position];
}

export type Obstacle = WallObstacle | LaserObstacle | PortalObstacle;

export interface LevelJson {
    snake?: Position[];
    food?: { position: Position };
    premiumItem?: { position: Position };
    obstacles: Obstacle[];
}
