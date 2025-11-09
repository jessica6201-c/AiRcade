// Fruit Ninja Configuration
export interface FruitType {
    name: string;
    imagePath?: string;
    scoreValue: number;
    size: number;
}

export const FRUITS: Record<string, FruitType> = {
    apple: {
        name: "apple",
        imagePath: "/images/apple.png",
        scoreValue: 10,
        size: 60 * 2
    },
    orange: {
        name: "orange",
        imagePath: "/images/orange.png",
        scoreValue: 15,
        size: 70 * 2 * 2
    },
    watermelon: {
        name: "watermelon",
        imagePath: "/images/watermelon.png",
        scoreValue: 25,
        size: 90 * 2
    },
    banana: {
        name: "banana",
        imagePath: "/images/banana.png",
        scoreValue: 12,
        size: 65 * 2
    },
    grape: {
        name: "grape",
        imagePath: "/images/grape.png",
        scoreValue: 8,
        size: 45 * 2
    },
    pineapple: {
        name: "pineapple",
        imagePath: "/images/pineapple.png",
        scoreValue: 20,
        size: 80 * 2
    }
};

export const FRUIT_KEYS = Object.keys(FRUITS);

// Physics Constants
export const GRAVITY = 600; // pixels/s² (positive = downward in canvas coords)
export const INITIAL_VELOCITY = 800; // pixels/s
export const SPAWN_ANGLE_DEGREES = 35; // degrees from vertical
export const ROTATION_SPEED_MIN = -150; // degrees/s
export const ROTATION_SPEED_MAX = 150; // degrees/s

// Spawning Constants
export const SPAWN_INTERVAL_MIN = 0.5; // seconds
export const SPAWN_INTERVAL_MAX = 1.25; // seconds

// Game Constants
export const GAME_DURATION = 60; // seconds
export const BOUNDING_BOX_SIZE = 80; // pixels - fallback for image-less fruits

// Cursor settings
export const CURSOR_RADIUS = 20; // pixels
export const TRAIL_DURATION = 0.6; // seconds
export const TRAIL_SAMPLE_INTERVAL = 0.05; // seconds

export const DEFAULT_FRUIT_COLOR = "#000000"; // Black fallback color
