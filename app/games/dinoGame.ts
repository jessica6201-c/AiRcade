import { BaseGame, GameContext, PoseData } from "@/app/types/game";
import {
    BACKGROUND_COLOR,
    CACTUS_HEIGHT,
    CACTUS_WIDTH,
    CLOUD_COLOR,
    CLOUD_MAX_Y,
    CLOUD_MIN_Y,
    CLOUD_SPEED_MULTIPLIER,
    CLOUD_SPAWN_CHANCE,
    CLOUD_WIDTH,
    DINO_COLOR,
    DINO_HEIGHT,
    DINO_LEG_ANIMATION_SPEED,
    DINO_WIDTH,
    DINO_X_POSITION,
    GRAVITY,
    GROUND_BUMP_SPACING,
    GROUND_COLOR,
    GROUND_LINE_WIDTH,
    GROUND_PATTERN_SEGMENT,
    GROUND_PATTERN_WIDTH,
    GROUND_Y_OFFSET,
    HIP_LEFT_LANDMARK_INDEX,
    HIP_RIGHT_LANDMARK_INDEX,
    INITIAL_SPAWN_INTERVAL,
    INITIAL_SPEED,
    JUMP_FORCE,
    JUMP_THRESHOLD,
    MAX_CLOUDS,
    MIN_SPAWN_INTERVAL,
    OBSTACLE_COLOR,
    PTERODACTYL_HEIGHT,
    PTERODACTYL_MAX_HEIGHT_OFFSET,
    PTERODACTYL_MIN_HEIGHT_OFFSET,
    PTERODACTYL_SPAWN_CHANCE,
    PTERODACTYL_WIDTH,
    SCORE_COLOR,
    SPAWN_INTERVAL_REDUCTION_RATE,
    SPEED_INCREMENT,
    SPEED_INCREMENT_INTERVAL
} from "./dinoConfig";

interface Obstacle {
    x: number;
    y: number;
    width: number;
    height: number;
    type: 'cactus' | 'pterodactyl';
}

interface Cloud {
    x: number;
    y: number;
    width: number;
}

interface GameAssets {
    dinoRunLeft: HTMLImageElement | null;
    dinoRunRight: HTMLImageElement | null;
    cactus: HTMLImageElement | null;
    loaded: boolean;
}

interface GameState {
    dino: {
        x: number;
        y: number;
        width: number;
        height: number;
        velocityY: number;
        isJumping: boolean;
        isDucking: boolean;
        legFrame: number;
    };
    obstacles: Obstacle[];
    clouds: Cloud[];
    ground: {
        x: number;
        y: number;
    };
    score: number;
    speed: number;
    gameOver: boolean;
    lastSpawnTime: number;
    lastPoseY: number | null;
    jumpThreshold: number;
    frameCount: number;
    keyboardJumpRequested: boolean;
    lastFrameTime: number;
    canvas: HTMLCanvasElement | null;
    ctx: CanvasRenderingContext2D | null;
    latestPoseData: PoseData | null;
    assets: GameAssets;
}

const state: GameState = {
    dino: {
        x: DINO_X_POSITION,
        y: 0,
        width: DINO_WIDTH,
        height: DINO_HEIGHT,
        velocityY: 0,
        isJumping: false,
        isDucking: false,
        legFrame: 0
    },
    obstacles: [],
    clouds: [],
    ground: {
        x: 0,
        y: 0
    },
    score: 0,
    speed: INITIAL_SPEED,
    gameOver: false,
    lastSpawnTime: 0,
    lastPoseY: null,
    jumpThreshold: JUMP_THRESHOLD,
    frameCount: 0,
    keyboardJumpRequested: false,
    lastFrameTime: 0,
    canvas: null,
    ctx: null,
    latestPoseData: null,
    assets: {
        dinoRunLeft: null,
        dinoRunRight: null,
        cactus: null,
        loaded: false
    }
};

// Load assets
function loadAssets(): Promise<void> {
    return new Promise((resolve) => {
        let loadedCount = 0;
        const totalAssets = 3;

        const checkAllLoaded = () => {
            loadedCount++;
            console.log(`Asset loaded: ${loadedCount}/${totalAssets}`);
            if (loadedCount === totalAssets) {
                state.assets.loaded = true;
                console.log("All assets loaded!");
                resolve();
            }
        };

        // Load dino left run
        const dinoLeft = new Image();
        dinoLeft.onload = checkAllLoaded;
        dinoLeft.onerror = () => {
            console.warn("Failed to load dino left sprite, using fallback");
            checkAllLoaded();
        };
        dinoLeft.src = "/Chrome_T-Rex_Left_Run.webp";
        state.assets.dinoRunLeft = dinoLeft;

        // Load dino right run
        const dinoRight = new Image();
        dinoRight.onload = checkAllLoaded;
        dinoRight.onerror = () => {
            console.warn("Failed to load dino right sprite, using fallback");
            checkAllLoaded();
        };
        dinoRight.src = "/Chrome_T-Rex_Right_Run.webp";
        state.assets.dinoRunRight = dinoRight;

        // Load cactus
        const cactus = new Image();
        cactus.onload = checkAllLoaded;
        cactus.onerror = () => {
            console.warn("Failed to load cactus sprite, using fallback");
            checkAllLoaded();
        };
        cactus.src = "/1_Cactus_Chrome_Dino.webp";
        state.assets.cactus = cactus;
    });
}

function drawDino(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    const dino = state.dino;
    const groundY = canvas.height - GROUND_Y_OFFSET;

    // Use sprite if loaded, otherwise use placeholder
    const legFrame = Math.floor(state.frameCount / DINO_LEG_ANIMATION_SPEED) % 2;
    const dinoSprite = legFrame === 0 ? state.assets.dinoRunLeft : state.assets.dinoRunRight;

    if (state.assets.loaded && dinoSprite && dinoSprite.complete) {
        // Draw sprite
        ctx.drawImage(dinoSprite, dino.x, dino.y, dino.width, dino.height);
    } else {
        // Fallback to placeholder graphics
        ctx.fillStyle = DINO_COLOR;
        ctx.fillRect(dino.x, dino.y, dino.width, dino.height);

        // Eye
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(dino.x + 30, dino.y + 10, 4, 4);

        // Legs (animated)
        if (!state.dino.isJumping) {
            const legOffset = legFrame === 0 ? 0 : 4;
            ctx.fillRect(dino.x + 10, dino.y + dino.height, 6, 12);
            ctx.fillRect(dino.x + 26 + legOffset, dino.y + dino.height, 6, 12);
        }

        // Tail
        ctx.fillRect(dino.x - 10, dino.y + 20, 10, 8);
    }
}

function drawObstacle(ctx: CanvasRenderingContext2D, obstacle: Obstacle) {
    if (obstacle.type === 'cactus') {
        // Use cactus sprite if loaded
        if (state.assets.loaded && state.assets.cactus && state.assets.cactus.complete) {
            ctx.drawImage(state.assets.cactus, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        } else {
            // Fallback cactus shape
            ctx.fillStyle = OBSTACLE_COLOR;
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            // Arms
            ctx.fillRect(obstacle.x - 5, obstacle.y + 10, 5, 15);
            ctx.fillRect(obstacle.x + obstacle.width, obstacle.y + 10, 5, 15);
        }
    } else {
        // Pterodactyl shape (placeholder - no sprite yet)
        ctx.fillStyle = OBSTACLE_COLOR;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        // Wings
        const wingOffset = Math.floor(state.frameCount / 10) % 2 === 0 ? -5 : 5;
        ctx.fillRect(obstacle.x - 10, obstacle.y + wingOffset, 10, 4);
        ctx.fillRect(obstacle.x + obstacle.width, obstacle.y + wingOffset, 10, 4);
    }
}

function drawGround(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    const groundY = canvas.height - GROUND_Y_OFFSET;

    // Ground line
    ctx.strokeStyle = GROUND_COLOR;
    ctx.lineWidth = GROUND_LINE_WIDTH;
    ctx.beginPath();

    // Repeating ground pattern
    for (let x = state.ground.x % GROUND_PATTERN_WIDTH; x < canvas.width; x += GROUND_PATTERN_WIDTH) {
        ctx.moveTo(x, groundY);
        ctx.lineTo(x + GROUND_PATTERN_SEGMENT, groundY);
    }
    ctx.stroke();

    // Dirt bumps
    for (let x = state.ground.x % GROUND_BUMP_SPACING; x < canvas.width; x += GROUND_BUMP_SPACING) {
        ctx.fillStyle = GROUND_COLOR;
        ctx.fillRect(x, groundY + 2, 2, 2);
    }
}

function drawClouds(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = CLOUD_COLOR;
    state.clouds.forEach(cloud => {
        // Simple cloud shape
        ctx.fillRect(cloud.x, cloud.y, cloud.width, 12);
        ctx.fillRect(cloud.x + 10, cloud.y - 6, cloud.width - 20, 18);
    });
}

function spawnObstacle(canvas: HTMLCanvasElement) {
    const groundY = canvas.height - GROUND_Y_OFFSET;
    const type = Math.random() > PTERODACTYL_SPAWN_CHANCE ? 'pterodactyl' : 'cactus';

    const obstacle: Obstacle = {
        x: canvas.width + 50,
        y: type === 'cactus'
            ? groundY - CACTUS_HEIGHT
            : groundY - PTERODACTYL_MIN_HEIGHT_OFFSET - Math.random() * (PTERODACTYL_MAX_HEIGHT_OFFSET - PTERODACTYL_MIN_HEIGHT_OFFSET),
        width: type === 'cactus' ? CACTUS_WIDTH : PTERODACTYL_WIDTH,
        height: type === 'cactus' ? CACTUS_HEIGHT : PTERODACTYL_HEIGHT,
        type: type
    };

    state.obstacles.push(obstacle);
}

function spawnCloud(canvas: HTMLCanvasElement) {
    const cloud: Cloud = {
        x: canvas.width + 50,
        y: CLOUD_MIN_Y + Math.random() * (CLOUD_MAX_Y - CLOUD_MIN_Y),
        width: CLOUD_WIDTH
    };
    state.clouds.push(cloud);
}

function checkCollision(): boolean {
    const dino = state.dino;

    for (const obstacle of state.obstacles) {
        if (
            dino.x < obstacle.x + obstacle.width &&
            dino.x + dino.width > obstacle.x &&
            dino.y < obstacle.y + obstacle.height &&
            dino.y + dino.height > obstacle.y
        ) {
            return true;
        }
    }

    return false;
}

function resetGame(canvas: HTMLCanvasElement) {
    const groundY = canvas.height - GROUND_Y_OFFSET;

    state.dino.y = groundY - state.dino.height;
    state.dino.velocityY = 0;
    state.dino.isJumping = false;
    state.obstacles = [];
    state.clouds = [];
    state.score = 0;
    state.speed = INITIAL_SPEED;
    state.gameOver = false;
    state.lastSpawnTime = performance.now();
    state.lastPoseY = null;
    state.frameCount = 0;
    state.keyboardJumpRequested = false;
}

// Keyboard event handler
function handleKeyDown(event: KeyboardEvent) {
    if (event.code === 'Space') {
        event.preventDefault();
        if (!state.dino.isJumping || state.gameOver) {
            state.keyboardJumpRequested = true;
        }
    }
}

// Game update logic (separated from rendering)
function updateGame(deltaTime: number) {
    if (!state.canvas) return;

    const canvas = state.canvas;
    const groundY = canvas.height - GROUND_Y_OFFSET;
    const poseData = state.latestPoseData;

    if (!state.gameOver) {
        state.frameCount++;

        // Keyboard jump detection
        if (state.keyboardJumpRequested && !state.dino.isJumping) {
            state.dino.velocityY = JUMP_FORCE;
            state.dino.isJumping = true;
            state.keyboardJumpRequested = false;
        }

        // Jump detection via pose
        if (poseData && poseData.landmarks.length > 0) {
            const firstPose = poseData.landmarks[0];
            const leftHip = firstPose[HIP_LEFT_LANDMARK_INDEX];
            const rightHip = firstPose[HIP_RIGHT_LANDMARK_INDEX];

            if (leftHip && rightHip) {
                const currentY = (leftHip.y + rightHip.y) / 2;

                if (state.lastPoseY !== null) {
                    const deltaY = state.lastPoseY - currentY;

                    if (deltaY > state.jumpThreshold && !state.dino.isJumping) {
                        state.dino.velocityY = JUMP_FORCE;
                        state.dino.isJumping = true;
                    }
                }

                state.lastPoseY = currentY;
            }
        }

        // Physics (time-based)
        const gravityPerSecond = GRAVITY * 60; // Convert frame-based to per-second
        const speedPerSecond = state.speed * 60;

        state.dino.velocityY += gravityPerSecond * deltaTime;
        state.dino.y += state.dino.velocityY;

        // Ground collision
        if (state.dino.y >= groundY - state.dino.height) {
            state.dino.y = groundY - state.dino.height;
            state.dino.velocityY = 0;
            state.dino.isJumping = false;
        }

        // Move ground
        state.ground.x -= speedPerSecond * deltaTime;

        // Move obstacles
        state.obstacles.forEach(obstacle => {
            obstacle.x -= speedPerSecond * deltaTime;
        });

        // Move clouds (slower)
        state.clouds.forEach(cloud => {
            cloud.x -= speedPerSecond * CLOUD_SPEED_MULTIPLIER * deltaTime;
        });

        // Remove off-screen obstacles
        state.obstacles = state.obstacles.filter(o => o.x > -100);
        state.clouds = state.clouds.filter(c => c.x > -100);

        // Spawn obstacles
        const currentTime = performance.now();
        const spawnInterval = Math.max(INITIAL_SPAWN_INTERVAL - state.score * SPAWN_INTERVAL_REDUCTION_RATE, MIN_SPAWN_INTERVAL);

        if (currentTime - state.lastSpawnTime > spawnInterval) {
            spawnObstacle(canvas);
            state.lastSpawnTime = currentTime;
        }

        // Spawn clouds
        if (Math.random() > CLOUD_SPAWN_CHANCE && state.clouds.length < MAX_CLOUDS) {
            spawnCloud(canvas);
        }

        // Check collision
        if (checkCollision()) {
            state.gameOver = true;
        }

        // Increase score and speed (frame-based, convert to time-based)
        const scoreIncrement = 60 * deltaTime; // 60 score points per second
        state.score += scoreIncrement;

        if (Math.floor(state.score / SPEED_INCREMENT_INTERVAL) > Math.floor((state.score - scoreIncrement) / SPEED_INCREMENT_INTERVAL)) {
            state.speed += SPEED_INCREMENT;
        }
    } else {
        // Game over - check for restart
        if (state.keyboardJumpRequested) {
            resetGame(canvas);
            state.lastFrameTime = 0; // Reset timing
            return;
        }

        if (poseData && poseData.landmarks.length > 0) {
            const firstPose = poseData.landmarks[0];
            const leftHip = firstPose[HIP_LEFT_LANDMARK_INDEX];
            const rightHip = firstPose[HIP_RIGHT_LANDMARK_INDEX];

            if (leftHip && rightHip) {
                const currentY = (leftHip.y + rightHip.y) / 2;

                if (state.lastPoseY !== null) {
                    const deltaY = state.lastPoseY - currentY;
                    if (deltaY > state.jumpThreshold) {
                        resetGame(canvas);
                        state.lastFrameTime = 0; // Reset timing
                    }
                }

                state.lastPoseY = currentY;
            }
        }
    }
}

// Render game (separated from update)
function renderGame() {
    if (!state.canvas || !state.ctx) {
        console.error("renderGame called but canvas or ctx is null");
        return;
    }

    const canvas = state.canvas;
    const ctx = state.ctx;

    // Clear canvas
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw everything
    drawClouds(ctx);
    drawGround(ctx, canvas);
    state.obstacles.forEach(obstacle => drawObstacle(ctx, obstacle));
    drawDino(ctx, canvas);

    // Score
    ctx.fillStyle = SCORE_COLOR;
    ctx.font = "bold 20px monospace";
    const scoreText = Math.floor(state.score / 10).toString().padStart(5, '0');
    ctx.fillText(scoreText, canvas.width - 150, 40);

    // Game over
    if (state.gameOver) {
        ctx.fillStyle = SCORE_COLOR;
        ctx.font = "bold 32px monospace";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 20);

        ctx.font = "20px monospace";
        ctx.fillText("Jump or press SPACE to restart", canvas.width / 2, canvas.height / 2 + 20);
        ctx.textAlign = "left";
    } else {
        // Instructions
        ctx.fillStyle = SCORE_COLOR;
        ctx.font = "16px monospace";
        ctx.fillText("Jump in real life to jump in-game.", 20, canvas.height - 20);
    }
}

export const dinoGame: BaseGame = {
    metadata: {
        id: "dino-game",
        name: "Dino Run",
        description: "Jump to control",
        splashArt: "/Chrome_T-Rex_Right_Run.webp",
        useHandDetection: false
    },

    onInit: (context: GameContext) => {
        const { canvas, ctx } = context;

        console.log("Dino game onInit called");

        // Store canvas and context in state
        state.canvas = canvas;
        state.ctx = ctx;

        // Load assets in background (non-blocking)
        loadAssets().then(() => {
            console.log("Assets loaded!");
        }).catch((error) => {
            console.error("Error loading assets:", error);
        });

        resetGame(canvas);

        // Add keyboard event listener
        window.addEventListener('keydown', handleKeyDown);

        // Initialize timing
        state.lastFrameTime = performance.now();
    },

    onFrame: (context: GameContext, poseData: PoseData | null) => {
        // Calculate delta time for smooth time-based physics
        const currentTime = performance.now();
        const deltaTime = (currentTime - state.lastFrameTime) / 1000; // Convert to seconds
        state.lastFrameTime = currentTime;

        // Update pose data
        state.latestPoseData = poseData;

        // Update and render game
        updateGame(deltaTime);
        renderGame();
    },

    onCleanup: () => {
        // Remove keyboard event listener
        window.removeEventListener('keydown', handleKeyDown);

        // Clean up state
        state.obstacles = [];
        state.clouds = [];
        state.score = 0;
        state.gameOver = false;
        state.canvas = null;
        state.ctx = null;
        state.latestPoseData = null;
        state.lastFrameTime = 0;
    }
};
