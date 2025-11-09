import { BaseGame, GameContext, PoseData } from "../types/game";
import {
    BOUNDING_BOX_SIZE,
    CURSOR_RADIUS,
    DEFAULT_FRUIT_COLOR,
    FRUITS,
    FRUIT_KEYS,
    GAME_DURATION,
    GRAVITY,
    INITIAL_VELOCITY,
    ROTATION_SPEED_MAX,
    ROTATION_SPEED_MIN,
    SPAWN_ANGLE_DEGREES,
    SPAWN_INTERVAL_MAX,
    SPAWN_INTERVAL_MIN,
    TRAIL_DURATION,
    TRAIL_SAMPLE_INTERVAL
} from "./fruitConfig";

interface Fruit {
    id: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    type: string;
    rotation: number;
    rotationSpeed: number;
    size: number;
    sliced: boolean;
}

// Preload fruit images
const fruitImages: Record<string, HTMLImageElement> = {};
let imagesLoaded = false;

function preloadImages(): void {
    if (imagesLoaded) return;

    FRUIT_KEYS.forEach(key => {
        const fruit = FRUITS[key];
        if (fruit.imagePath) {
            const img = new Image();
            img.src = fruit.imagePath;
            fruitImages[key] = img;
        }
    });

    imagesLoaded = true;
}

interface TrailPoint {
    x: number;
    y: number;
    timestamp: number;
}

interface CursorTrail {
    right: TrailPoint[];
    left: TrailPoint[];
}

interface GameState {
    fruits: Fruit[];
    redScore: number;
    blueScore: number;
    lastSpawnTime: number;
    nextSpawnInterval: number;
    gameStartTime: number;
    gameEndTime: number;
    isGameOver: boolean;
    cursorTrail: CursorTrail;
    lastTrailSampleTime: { right: number; left: number };
    lastFrameTime: number;
}

const state: GameState = {
    fruits: [],
    redScore: 0,
    blueScore: 0,
    lastSpawnTime: 0,
    nextSpawnInterval: 1,
    gameStartTime: 0,
    gameEndTime: 0,
    isGameOver: false,
    cursorTrail: {
        right: [],
        left: []
    },
    lastTrailSampleTime: {
        right: 0,
        left: 0
    },
    lastFrameTime: 0
};

function getRandomFruitType(): string {
    return FRUIT_KEYS[Math.floor(Math.random() * FRUIT_KEYS.length)];
}

function getRandomSpawnInterval(): number {
    return SPAWN_INTERVAL_MIN + Math.random() * (SPAWN_INTERVAL_MAX - SPAWN_INTERVAL_MIN);
}

function degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

function spawnFruit(canvas: HTMLCanvasElement): void {
    const fruitType = getRandomFruitType();
    const fruitConfig = FRUITS[fruitType];

    // Random angle between -SPAWN_ANGLE_DEGREES and +SPAWN_ANGLE_DEGREES from vertical
    const angleDegrees = (Math.random() * 2 - 1) * SPAWN_ANGLE_DEGREES;
    const angleRadians = degreesToRadians(90 - angleDegrees); // 90° is straight up

    // Initial velocity components
    const vx = INITIAL_VELOCITY * Math.cos(angleRadians);
    const vy = -INITIAL_VELOCITY * Math.sin(angleRadians);

    // Rotation speed depends on angle direction
    const rotationSpeed = angleDegrees < 0
        ? ROTATION_SPEED_MIN + Math.random() * (ROTATION_SPEED_MAX - ROTATION_SPEED_MIN)
        : -ROTATION_SPEED_MIN + Math.random() * (-ROTATION_SPEED_MAX + ROTATION_SPEED_MIN);

    // Spawn position at bottom center of screen with some horizontal variation
    const spawnX = canvas.width / 2 + (Math.random() - 0.5) * canvas.width * 0.4;
    const spawnY = canvas.height + 50; // Start below visible area

    const fruit: Fruit = {
        id: Math.random().toString(36).substr(2, 9),
        x: spawnX,
        y: spawnY,
        vx: vx,
        vy: vy,
        type: fruitType,
        rotation: 0,
        rotationSpeed: rotationSpeed,
        size: fruitConfig.size,
        sliced: false
    };

    state.fruits.push(fruit);
}

function updateCursorTrail(cursorPositions: { right?: { x: number; y: number }; left?: { x: number; y: number } }): void {
    const currentTime = performance.now();
    const sampleIntervalMs = TRAIL_SAMPLE_INTERVAL * 1000;

    // Add right hand position to trail if enough time has passed
    if (cursorPositions.right) {
        if (currentTime - state.lastTrailSampleTime.right >= sampleIntervalMs) {
            state.cursorTrail.right.push({
                x: cursorPositions.right.x,
                y: cursorPositions.right.y,
                timestamp: currentTime
            });
            state.lastTrailSampleTime.right = currentTime;
        }
    }

    // Add left hand position to trail if enough time has passed
    if (cursorPositions.left) {
        if (currentTime - state.lastTrailSampleTime.left >= sampleIntervalMs) {
            state.cursorTrail.left.push({
                x: cursorPositions.left.x,
                y: cursorPositions.left.y,
                timestamp: currentTime
            });
            state.lastTrailSampleTime.left = currentTime;
        }
    }

    // Remove old trail points
    const cutoffTime = currentTime - TRAIL_DURATION * 1000;

    state.cursorTrail.right = state.cursorTrail.right.filter(point => point.timestamp > cutoffTime);
    state.cursorTrail.left = state.cursorTrail.left.filter(point => point.timestamp > cutoffTime);
}

function drawCursorTrail(ctx: CanvasRenderingContext2D, trail: TrailPoint[], color: string, currentPos?: { x: number; y: number }): void {
    const currentTime = performance.now();

    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = CURSOR_RADIUS * 1.5;
    ctx.globalAlpha = 0.7;

    // Draw straight lines between consecutive sampled points
    if (trail.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(trail[0].x, trail[0].y);

        for (let i = 1; i < trail.length; i++) {
            const point = trail[i];
            ctx.lineTo(point.x, point.y);
        }

        // Draw from last sampled point to current cursor position to avoid lag
        if (currentPos && trail.length > 0) {
            ctx.lineTo(currentPos.x, currentPos.y);
        }

        ctx.stroke();
    }

    // Draw individual sampled points with fading opacity
    trail.forEach((point) => {
        const age = (currentTime - point.timestamp) / 1000;
        const opacity = Math.max(0, 1 - age / TRAIL_DURATION);

        ctx.fillStyle = color;
        ctx.globalAlpha = opacity * 0.8;
        ctx.beginPath();
        ctx.arc(point.x, point.y, CURSOR_RADIUS * 0.3, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.globalAlpha = 1;
}

function updatePhysics(deltaTime: number, canvas: HTMLCanvasElement): void {
    state.fruits.forEach(fruit => {
        if (!fruit.sliced) {
            // Update position
            fruit.x += fruit.vx * deltaTime;
            fruit.y += fruit.vy * deltaTime;

            // Apply gravity
            fruit.vy += GRAVITY * deltaTime;

            // Update rotation
            fruit.rotation += fruit.rotationSpeed * deltaTime;
        }
    });

    // Remove fruits that are off-screen (below screen AND falling down)
    const visibleFruits = state.fruits.filter(fruit => {
        const isBelowScreen = fruit.y > canvas.height + 100;
        const isFallingDown = fruit.vy > 0;
        return !fruit.sliced && !(isBelowScreen && isFallingDown);
    });

    state.fruits = visibleFruits;
}

function checkCollisions(canvas: HTMLCanvasElement, poseData: PoseData | null): { right?: { x: number; y: number }; left?: { x: number; y: number } } {
    const cursorPositions: { right?: { x: number; y: number }; left?: { x: number; y: number } } = {};

    if (!poseData || poseData.landmarks.length === 0) return cursorPositions;

    const firstPose = poseData.landmarks[0];

    // Check right wrist (index 16)
    const rightWrist = firstPose[16];
    if (rightWrist) {
        const rightPos = {
            x: (1 - rightWrist.x) * canvas.width,
            y: rightWrist.y * canvas.height
        };
        cursorPositions.right = rightPos;

        // Check collisions with right hand
        state.fruits.forEach(fruit => {
            if (!fruit.sliced) {
                // Circle-rectangle collision detection
                const halfSize = fruit.size / 2;
                const fruitLeft = fruit.x - halfSize;
                const fruitRight = fruit.x + halfSize;
                const fruitTop = fruit.y - halfSize;
                const fruitBottom = fruit.y + halfSize;

                // Find closest point on rectangle to circle center
                const closestX = Math.max(fruitLeft, Math.min(rightPos.x, fruitRight));
                const closestY = Math.max(fruitTop, Math.min(rightPos.y, fruitBottom));

                // Calculate distance from circle center to closest point
                const distanceX = rightPos.x - closestX;
                const distanceY = rightPos.y - closestY;
                const distanceSquared = distanceX * distanceX + distanceY * distanceY;

                // Check if distance is less than circle radius
                if (distanceSquared < CURSOR_RADIUS * CURSOR_RADIUS) {
                    fruit.sliced = true;
                    state.redScore += FRUITS[fruit.type].scoreValue;
                }
            }
        });
    }

    // Check left wrist (index 15)
    const leftWrist = firstPose[15];
    if (leftWrist) {
        const leftPos = {
            x: (1 - leftWrist.x) * canvas.width,
            y: leftWrist.y * canvas.height
        };
        cursorPositions.left = leftPos;

        // Check collisions with left hand
        state.fruits.forEach(fruit => {
            if (!fruit.sliced) {
                // Circle-rectangle collision detection
                const halfSize = fruit.size / 2;
                const fruitLeft = fruit.x - halfSize;
                const fruitRight = fruit.x + halfSize;
                const fruitTop = fruit.y - halfSize;
                const fruitBottom = fruit.y + halfSize;

                // Find closest point on rectangle to circle center
                const closestX = Math.max(fruitLeft, Math.min(leftPos.x, fruitRight));
                const closestY = Math.max(fruitTop, Math.min(leftPos.y, fruitBottom));

                // Calculate distance from circle center to closest point
                const distanceX = leftPos.x - closestX;
                const distanceY = leftPos.y - closestY;
                const distanceSquared = distanceX * distanceX + distanceY * distanceY;

                // Check if distance is less than circle radius
                if (distanceSquared < CURSOR_RADIUS * CURSOR_RADIUS) {
                    fruit.sliced = true;
                    state.blueScore += FRUITS[fruit.type].scoreValue;
                }
            }
        });
    }

    return cursorPositions;
}

function drawFruit(ctx: CanvasRenderingContext2D, fruit: Fruit): void {
    ctx.save();

    // Translate to fruit position and rotate
    ctx.translate(fruit.x, fruit.y);
    ctx.rotate(degreesToRadians(fruit.rotation));

    const img = fruitImages[fruit.type];
    if (img && img.complete && img.naturalWidth > 0) {
        // Draw image
        ctx.drawImage(img, -fruit.size / 2, -fruit.size / 2, fruit.size, fruit.size);
    } else {
        // Fallback: draw rectangle when image not loaded
        ctx.fillStyle = DEFAULT_FRUIT_COLOR;
        ctx.fillRect(-fruit.size / 2, -fruit.size / 2, fruit.size, fruit.size);

        // Draw fruit type label
        ctx.fillStyle = "#ffffff";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(fruit.type.substring(0, 3).toUpperCase(), 0, 0);
    }

    ctx.restore();
}

function getRemainingTime(): number {
    const elapsed = (performance.now() - state.gameStartTime) / 1000;
    return Math.max(0, GAME_DURATION - elapsed);
}

export const fruitNinjaGame: BaseGame = {
    metadata: {
        id: "fruit-ninja",
        name: "Fruit Ninja",
        description: "Hand Slicing",
        splashArt: "/fruit-ninja-2020-08-31.jpg",
        showCameraBackground: true
    },

    onInit: (context: GameContext) => {
        // Preload images
        preloadImages();

        // Reset game state
        state.fruits = [];
        state.redScore = 0;
        state.blueScore = 0;
        const currentTime = performance.now();
        state.lastSpawnTime = currentTime;
        state.nextSpawnInterval = getRandomSpawnInterval();
        state.gameStartTime = currentTime;
        state.gameEndTime = state.gameStartTime + GAME_DURATION * 1000;
        state.isGameOver = false;
        state.cursorTrail.right = [];
        state.cursorTrail.left = [];
        state.lastTrailSampleTime.right = currentTime;
        state.lastTrailSampleTime.left = currentTime;
        state.lastFrameTime = currentTime;
    },

    onFrame: (context: GameContext, poseData: PoseData | null) => {
        const { ctx, canvas } = context;
        const currentTime = performance.now();

        // Check if game is over
        if (currentTime > state.gameEndTime && !state.isGameOver) {
            state.isGameOver = true;
        }

        if (!state.isGameOver) {
            // Calculate delta time for physics
            const deltaTime = (currentTime - state.lastFrameTime) / 1000;
            state.lastFrameTime = currentTime;

            // Update physics
            updatePhysics(deltaTime, canvas);

            // Spawn new fruits
            if (currentTime - state.lastSpawnTime > state.nextSpawnInterval * 1000) {
                spawnFruit(canvas);
                state.lastSpawnTime = currentTime;
                state.nextSpawnInterval = getRandomSpawnInterval();
            }

            // Check collisions and update cursor trail
            const cursorPositions = checkCollisions(canvas, poseData);
            updateCursorTrail(cursorPositions);

            // Remove sliced fruits
            state.fruits = state.fruits.filter(fruit => !fruit.sliced);
        }

        // Draw fruits
        state.fruits.forEach(fruit => {
            if (!fruit.sliced) {
                drawFruit(ctx, fruit);
            }
        });

        // Draw cursor trails (only if game is not over)
        if (!state.isGameOver) {
            const currentCursorPositions = poseData && poseData.landmarks.length > 0 ? {
                right: poseData.landmarks[0][16] ? {
                    x: (1 - poseData.landmarks[0][16].x) * canvas.width,
                    y: poseData.landmarks[0][16].y * canvas.height
                } : undefined,
                left: poseData.landmarks[0][15] ? {
                    x: (1 - poseData.landmarks[0][15].x) * canvas.width,
                    y: poseData.landmarks[0][15].y * canvas.height
                } : undefined
            } : {};

            drawCursorTrail(ctx, state.cursorTrail.right, "#FF0000", currentCursorPositions.right);
            drawCursorTrail(ctx, state.cursorTrail.left, "#0000FF", currentCursorPositions.left);
        }

        // Draw hand positions if available
        if (poseData && poseData.landmarks.length > 0) {
            const firstPose = poseData.landmarks[0];

            // Right wrist (index 16)
            const rightWrist = firstPose[16];
            if (rightWrist) {
                const x = (1 - rightWrist.x) * canvas.width;
                const y = rightWrist.y * canvas.height;

                ctx.fillStyle = "#FF0000";
                ctx.beginPath();
                ctx.arc(x, y, CURSOR_RADIUS, 0, Math.PI * 2);
                ctx.fill();
            }

            // Left wrist (index 15)
            const leftWrist = firstPose[15];
            if (leftWrist) {
                const x = (1 - leftWrist.x) * canvas.width;
                const y = leftWrist.y * canvas.height;

                ctx.fillStyle = "#0000FF";
                ctx.beginPath();
                ctx.arc(x, y, CURSOR_RADIUS, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Draw UI
        ctx.font = "bold 36px sans-serif";

        // Red player score (right hand)
        ctx.fillStyle = "#FF0000";
        ctx.fillText(`Red: ${state.redScore}`, 30, 50);

        // Blue player score (left hand)
        ctx.fillStyle = "#0000FF";
        ctx.fillText(`Blue: ${state.blueScore}`, 30, 100);

        // Time
        ctx.fillStyle = "#ffffff";
        const remainingTime = getRemainingTime();
        ctx.fillText(`Time: ${Math.ceil(remainingTime)}s`, canvas.width - 150, 50);

        // Draw game over message
        if (state.isGameOver) {
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 48px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 80);
            ctx.font = "bold 36px sans-serif";
            ctx.fillStyle = "#FF0000";
            ctx.fillText(`Red: ${state.redScore}`, canvas.width / 2, canvas.height / 2 - 20);
            ctx.fillStyle = "#0000FF";
            ctx.fillText(`Blue: ${state.blueScore}`, canvas.width / 2, canvas.height / 2 + 30);
            ctx.textAlign = "left";
        }
    },

    onCleanup: () => {
        // Clean up state
        state.fruits = [];
        state.redScore = 0;
        state.blueScore = 0;
        state.isGameOver = false;
        state.cursorTrail.right = [];
        state.cursorTrail.left = [];
        state.lastTrailSampleTime.right = 0;
        state.lastTrailSampleTime.left = 0;
        state.lastFrameTime = 0;
    }
};
