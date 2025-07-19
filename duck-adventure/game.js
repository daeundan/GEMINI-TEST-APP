const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Adjust canvas for high-DPI screens
const dpr = 1; // Optimized for mobile performance by fixing DPR to 1
canvas.width = 500 * dpr;
canvas.height = 600 * dpr;

// Game constants
const gravity = 0.5;
const jumpForce = -15;
const playerSpeed = 5;
const obstacleSpeed = 5;
const obstacleSpawnInterval = 120; // frames
const coinSpawnInterval = 90; // frames, slightly more frequent than obstacles
const coinBonus = 100; // Default coin bonus

// Game state
let gameState = "playing";
let score = 0;
let highScore = 0;

// Game objects
let player = {
  x: 50,
  y: 500,
  width: 50, // Increased size
  height: 60, // Increased size
  velocityY: 0,
  jumpCount: 0,
  maxJumps: 7,
};

let obstacles = [];
let clouds = [];
let coins = []; // Added coins array
let collectedCoinEffects = []; // Added for bonus text effects
let frameCount = 0;

// Input states
const keys = {};
let jumpKeyDown = false;

// --- ART ASSETS ---
const duckPixels = [
  [0, 0, 1, 1, 1, 0, 0], // Head
  [0, 1, 1, 1, 1, 1, 0], // Face
  [1, 1, 2, 1, 2, 1, 1], // Eyes (black with white pixel in middle)
  [1, 1, 1, 3, 3, 1, 1], // Beak
  [0, 1, 1, 1, 1, 1, 0], // Body
  [0, 0, 1, 1, 1, 0, 0], // Lower Body
  [0, 0, 3, 0, 3, 0, 0], // Feet
];
const duckColors = ["yellow", "black", "orange"];

const cloudPixels = [
  [0, 1, 1, 1, 0],
  [1, 1, 1, 1, 1],
  [0, 1, 1, 1, 0],
];

const treePixels = [
  [0, 0, 2, 2, 2, 0, 0],
  [0, 2, 2, 2, 2, 2, 0],
  [2, 2, 2, 2, 2, 2, 2],
  [0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 1, 1, 0, 0],
  [0, 0, 0, 1, 1, 0, 0],
];
const treeColors = ["#8B4513", "#228B22"]; // Brown, Green

const coinPixels = [
  [0, 1, 0],
  [1, 1, 1],
  [0, 1, 0],
];
const coinColors = ["gold"];

const starCoinPixels = [
  [0, 0, 1, 0, 0],
  [0, 1, 1, 1, 0],
  [1, 1, 1, 1, 1],
  [0, 1, 1, 1, 0],
  [0, 0, 1, 0, 0],
];
const starCoinColors = ["silver"];

const heartCoinPixels = [
  [0, 1, 0, 1, 0],
  [1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1],
  [0, 1, 1, 1, 0],
  [0, 0, 1, 0, 0],
];
const heartCoinColors = ["red"];

function drawPixelArt(x, y, width, height, pixels, colors) {
  const pixelSizeX = width / pixels[0].length;
  const pixelSizeY = height / pixels.length;
  for (let r = 0; r < pixels.length; r++) {
    for (let c = 0; c < pixels[r].length; c++) {
      if (pixels[r][c] > 0) {
        ctx.fillStyle = colors[pixels[r][c] - 1];
        ctx.fillRect(
          x + c * pixelSizeX,
          y + r * pixelSizeY,
          pixelSizeX,
          pixelSizeY
        );
      }
    }
  }
}

// --- INPUT HANDLING ---
document.addEventListener("keydown", (e) => {
  keys[e.code] = true;
});
document.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});

// Handle jump on canvas click/touch
canvas.addEventListener("mousedown", handleJumpInput);
canvas.addEventListener("touchstart", handleJumpInput);

function handleJumpInput(e) {
  e.preventDefault(); // Prevent default touch behavior (like scrolling)
  if (gameState === "gameOver") {
    resetGame();
    return;
  }

  if (player.jumps < player.maxJumps) {
    player.velocityY = jumpForce;
    player.jumps++;
  }
}

function handleInput() {
  // No longer handling jump here, it's handled by canvas click/touch
  if (gameState === "gameOver") {
    if (keys["Enter"]) resetGame(); // Keep Enter for desktop restart
    return;
  }

  if (keys["ArrowLeft"] && player.x > 0) player.x -= playerSpeed;
  if (keys["ArrowRight"] && player.x < canvas.width - player.width)
    player.x += playerSpeed;
  // ArrowUp and ArrowDown are not used for movement in this game
}

// --- GAME LOGIC ---
function update() {
  if (gameState !== "playing") return;

  player.velocityY += gravity;
  player.y += player.velocityY;
  if (player.y >= canvas.height - player.height) {
    player.y = canvas.height - player.height;
    player.velocityY = 0;
    player.jumps = 0;
  }

  score++;
  frameCount++;

  // Obstacles
  if (frameCount % obstacleSpawnInterval === 0) {
    const minHeight = 50;
    const maxHeight = canvas.height - 250;
    const obstacleHeight = Math.random() * (maxHeight - minHeight) + minHeight;
    obstacles.push({
      x: canvas.width,
      y: canvas.height - obstacleHeight,
      width: 50,
      height: obstacleHeight,
    });
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    let o = obstacles[i];
    o.x -= obstacleSpeed;
    if (o.x + o.width < 0) {
      obstacles.splice(i, 1);
    } else if (
      player.x < o.x + o.width &&
      player.x + player.width > o.x &&
      player.y < o.y + o.height &&
      player.y + player.height > o.y
    ) {
      gameState = "gameOver";
      if (score > highScore) highScore = score;
    }
  }

  // Coins
  if (frameCount % coinSpawnInterval === 0) {
    const coinWidth = 30; // Adjust size as needed
    const coinHeight = 30;
    // Random Y position: from near top (0) to above ground (canvas.height - player.height - coinHeight)
    const randomY =
      Math.random() * (canvas.height - player.height - coinHeight - 50) + 50; // Avoid very top/bottom

    const coinTypes = [
      { pixels: coinPixels, colors: coinColors, bonus: 100 },
      { pixels: starCoinPixels, colors: starCoinColors, bonus: 50 },
      { pixels: heartCoinPixels, colors: heartCoinColors, bonus: 150 },
    ];
    const randomCoinType =
      coinTypes[Math.floor(Math.random() * coinTypes.length)];

    coins.push({
      x: canvas.width,
      y: randomY,
      width: coinWidth,
      height: coinHeight,
      type: randomCoinType,
    });
  }

  for (let i = coins.length - 1; i >= 0; i--) {
    let c = coins[i];
    c.x -= obstacleSpeed; // Coins move at the same speed as obstacles
    if (c.x + c.width < 0) {
      coins.splice(i, 1); // Remove if off-screen
    } else if (
      player.x < c.x + c.width &&
      player.x + player.width > c.x &&
      player.y < c.y + c.height &&
      player.y + c.height > c.y
    ) {
      // Collision with coin
      score += c.type.bonus;
      collectedCoinEffects.push({
        x: c.x,
        y: c.y,
        text: `+${c.type.bonus}점!`,
        startTime: Date.now(),
      });
      coins.splice(i, 1); // Remove collected coin
    }
  }

  // Update and remove collected coin effects
  const now = Date.now();
  for (let i = collectedCoinEffects.length - 1; i >= 0; i--) {
    const effect = collectedCoinEffects[i];
    const duration = now - effect.startTime;
    if (duration > 1000) {
      // Effect lasts for 1 second
      collectedCoinEffects.splice(i, 1);
    } else {
      effect.y -= 1; // Move text upwards
    }
  }

  // Clouds
  if (frameCount % 180 === 0) {
    // Spawn clouds less frequently
    clouds.push({
      x: canvas.width,
      y: Math.random() * 150,
      width: 80,
      height: 40,
      speed: 0.5,
    });
  }
  for (let i = clouds.length - 1; i >= 0; i--) {
    clouds[i].x -= clouds[i].speed;
    if (clouds[i].x + clouds[i].width < 0) clouds.splice(i, 1);
  }

  // Update score display only when score changes
  if (score !== parseInt(document.getElementById("currentScore").innerText.split(": ")[1])) {
    document.getElementById("currentScore").innerText = `점수: ${score}`;
  }
  if (highScore !== parseInt(document.getElementById("highScore").innerText.split(": ")[1])) {
    document.getElementById("highScore").innerText = `최고 점수: ${highScore}`;
  }
}

// --- DRAWING ---
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw clouds
  for (const cloud of clouds) {
    drawPixelArt(cloud.x, cloud.y, cloud.width, cloud.height, cloudPixels, [
      "white",
    ]);
  }

  if (gameState === "playing") {
    drawPixelArt(
      player.x,
      player.y,
      player.width,
      player.height,
      duckPixels,
      duckColors
    ); // Use duck assets

    for (const o of obstacles) {
      drawPixelArt(o.x, o.y, o.width, o.height, treePixels, treeColors);
    }

    // Draw coins
    for (const coin of coins) {
      drawPixelArt(
        coin.x,
        coin.y,
        coin.width,
        coin.height,
        coin.type.pixels,
        coin.type.colors
      );
    }

    // Draw collected coin effects
    for (const effect of collectedCoinEffects) {
      const alpha = 1 - (Date.now() - effect.startTime) / 1000; // Fade out over 1 second
      ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
      ctx.font = "bold 20px 'Helvetica Neue', sans-serif";
      ctx.fillText(effect.text, effect.x, effect.y);
    }

    // Remove canvas score drawing
    // ctx.fillStyle = "black";
    // ctx.font = "bold 24px 'Helvetica Neue', sans-serif";
    // ctx.fillText(`점수: ${score}`, 10, 30);
    // ctx.fillText(`최고 점수: ${highScore}`, 10, 60);
  } else if (gameState === "gameOver") {
    drawGameOverScreen();
  }
}

function drawGameOverScreen() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.font = "bold 60px 'Helvetica Neue', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("게임 오버", canvas.width / 2, canvas.height / 2 - 100);

  ctx.font = "30px 'Helvetica Neue', sans-serif";
  ctx.fillText(`최종 점수: ${score}`, canvas.width / 2, canvas.height / 2);
  ctx.fillText(
    `최고 점수: ${highScore}`,
    canvas.width / 2,
    canvas.height / 2 + 50
  );

  ctx.font = "20px 'Helvetica Neue', sans-serif";
  ctx.fillText(
    "Enter 또는 점프 버튼을 눌러 다시 시작",
    canvas.width / 2,
    canvas.height / 2 + 120
  );
  ctx.textAlign = "left";
}

// --- GAME CONTROL ---
function resetGame() {
  player.x = 50;
  player.y = 500;
  player.velocityY = 0;
  player.jumps = 0;
  obstacles = [];
  clouds = [];
  coins = []; // Reset coins
  collectedCoinEffects = []; // Reset coin effects
  score = 0;
  frameCount = 0;
  gameState = "playing";
  // Update score display on reset
  document.getElementById("currentScore").innerText = `점수: ${score}`;
  document.getElementById("highScore").innerText = `최고 점수: ${highScore}`;
}

function gameLoop() {
  handleInput();
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Start Game
resetGame();
gameLoop();
