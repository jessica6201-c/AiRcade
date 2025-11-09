// Dinosaur Game Configuration

// Physics Constants
export const GRAVITY = 0.6; // Gravity acceleration (pixels per frame squared)
export const JUMP_FORCE = -12; // Initial jump velocity (negative = upward)
export const GROUND_Y_OFFSET = 100; // Distance from bottom of canvas to ground

// Dinosaur Constants
export const DINO_WIDTH = 44;
export const DINO_HEIGHT = 47;
export const DINO_X_POSITION = 100; // Fixed X position of the dino
export const DINO_LEG_ANIMATION_SPEED = 6; // Frames per leg cycle

// Obstacle Constants
export const CACTUS_WIDTH = 20;
export const CACTUS_HEIGHT = 40;
export const PTERODACTYL_WIDTH = 46;
export const PTERODACTYL_HEIGHT = 40;
export const PTERODACTYL_SPAWN_CHANCE = 0.7; // Threshold for spawning pterodactyl vs cactus (higher = more cacti)
export const PTERODACTYL_MIN_HEIGHT_OFFSET = 40; // Minimum height above ground
export const PTERODACTYL_MAX_HEIGHT_OFFSET = 80; // Maximum height above ground

// Game Speed Constants
export const INITIAL_SPEED = 6; // Starting game speed (pixels per frame)
export const SPEED_INCREMENT = 0.5; // Speed increase amount
export const SPEED_INCREMENT_INTERVAL = 100; // Score interval for speed increase

// Obstacle Spawning Constants
export const INITIAL_SPAWN_INTERVAL = 1500; // Initial time between spawns (ms)
export const MIN_SPAWN_INTERVAL = 800; // Minimum time between spawns (ms)
export const SPAWN_INTERVAL_REDUCTION_RATE = 5; // Reduction per score point

// Cloud Constants
export const CLOUD_WIDTH = 46;
export const CLOUD_MIN_Y = 50;
export const CLOUD_MAX_Y = 150;
export const CLOUD_SPEED_MULTIPLIER = 0.5; // Clouds move slower than ground
export const CLOUD_SPAWN_CHANCE = 0.98; // Per-frame probability (higher = fewer clouds)
export const MAX_CLOUDS = 5;

// Jump Detection Constants
export const JUMP_THRESHOLD = 0.15; // Vertical movement threshold for jump detection
export const HIP_LEFT_LANDMARK_INDEX = 23; // MediaPipe landmark index for left hip
export const HIP_RIGHT_LANDMARK_INDEX = 24; // MediaPipe landmark index for right hip

// Visual Constants
export const BACKGROUND_COLOR = "#f7f7f7";
export const DINO_COLOR = "#535353";
export const OBSTACLE_COLOR = "#535353";
export const GROUND_COLOR = "#535353";
export const CLOUD_COLOR = "#cccccc";
export const SCORE_COLOR = "#535353";

// Ground Pattern Constants
export const GROUND_PATTERN_WIDTH = 40;
export const GROUND_PATTERN_SEGMENT = 20;
export const GROUND_BUMP_SPACING = 60;
export const GROUND_LINE_WIDTH = 2;
