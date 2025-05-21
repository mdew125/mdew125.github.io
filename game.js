const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const winImage = new Image();
winImage.src = "https://media.licdn.com/dms/image/v2/C4E03AQG8uiLdQ_z1Gw/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1593600188139?e=2147483647&v=beta&t=CLnDWnKyZvx2rkW24M-wYpQV91ml6d1xabpRctz8syg";

const loseImage = new Image();
loseImage.src = "https://media.tenor.com/-vrZWF9Ly18AAAAM/wet-eggplant.gif";

// Grid Settings
const COLS = 7;
const ROWS = 16;
const BLOCK_WIDTH = canvas.width / COLS;
const BLOCK_HEIGHT = canvas.height / ROWS;

const STACK_COLOR = "#ff3333";

let stack = [];
let currentBlock;
let direction = 1;
let speed = 0.15; // Default starting speed
let gameOver = false;
let win = false;

const speedInput = document.getElementById("speedInput");

// Update the speed when the input changes
speedInput.addEventListener("input", (e) => {
  speed = mapSpeed(Number(e.target.value));
});

// Map input value (1-10) to a speed range (0.05 to 0.25)
function mapSpeed(value) {
  const min = 0.05;
  const max = 0.25;
  const mappedSpeed = (max - min) * (value - 1) / 9 + min;
  return mappedSpeed;
}

function createBlock(row, colSpan, colStart = null) {
  const start = colStart !== null ? colStart : Math.floor((COLS - colSpan) / 2);
  return {
    row,
    colSpan,
    colStart: start,
    get x() {
      return this.colStart * BLOCK_WIDTH;
    },
    get y() {
      return this.row * BLOCK_HEIGHT;
    },
    get width() {
      return this.colSpan * BLOCK_WIDTH;
    },
    height: BLOCK_HEIGHT
  };
}

function initGame() {
  stack = [];
  const row = ROWS - 1;
  stack.push(createBlock(row, 3, 2)); // Start block
  const nextRow = row - 1;
  currentBlock = createBlock(nextRow, 3); // Start next block centered
  direction = 1;
  speed = mapSpeed(speedInput.value); // Get the speed from the input
  gameOver = false;
  win = false;
  requestAnimationFrame(gameLoop);
}

function drawGrid() {
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 1;

  // Vertical lines
  for (let i = 0; i <= COLS; i++) {
    let x = i * BLOCK_WIDTH;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  // Horizontal lines
  for (let i = 0; i <= ROWS; i++) {
    let y = i * BLOCK_HEIGHT;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function drawBlock(block, color = STACK_COLOR) {
  ctx.fillStyle = color;
  ctx.fillRect(block.x, block.y, block.width, block.height);
}

function drawAll() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  stack.forEach(b => drawBlock(b));
  drawBlock(currentBlock, STACK_COLOR);
  drawGrid(); // Draw grid on top of blocks

  if (gameOver) {
    if (win && winImage.complete) {
      const imgWidth = 300;
      const imgHeight = 300;
      const imgX = canvas.width / 2 - imgWidth / 2;
      const imgY = canvas.height / 2 - imgHeight - 30;
      ctx.drawImage(winImage, imgX, imgY, imgWidth, imgHeight);
    } else if (!win && loseImage.complete) {
      const imgWidth = 300;
      const imgHeight = 300;
      const imgX = canvas.width / 2 - imgWidth / 2;
      const imgY = canvas.height / 2 - imgHeight - 30;
      ctx.drawImage(loseImage, imgX, imgY, imgWidth, imgHeight);
    }
  
    ctx.fillStyle = "white";
    ctx.font = "28px Arial";
    const message = win ? "YOU WIN!" : "GAME OVER";
    ctx.fillText(message, canvas.width / 2 - ctx.measureText(message).width / 2, canvas.height / 2 + 20);
    ctx.font = "16px Arial";
    ctx.fillText("Press Space or Click to Restart", canvas.width / 2 - 100, canvas.height / 2 + 50);
  }
}

function moveBlock() {
  currentBlock.colStart += direction * speed;

  if (currentBlock.colStart + currentBlock.colSpan >= COLS) {
    currentBlock.colStart = COLS - currentBlock.colSpan;
    direction = -1;
  } else if (currentBlock.colStart <= 0) {
    currentBlock.colStart = 0;
    direction = 1;
  }
}

function lockBlock() {
  const prev = stack[stack.length - 1];
  let currStart = Math.round(currentBlock.colStart);
  let currEnd = currStart + currentBlock.colSpan;

  const prevStart = prev.colStart;
  const prevEnd = prev.colStart + prev.colSpan;

  // No overlap = game over
  if (currEnd <= prevStart || currStart >= prevEnd) {
    gameOver = true;
    return;
  }

  // Determine overlap
  const overlapStart = Math.max(currStart, prevStart);
  const overlapEnd = Math.min(currEnd, prevEnd);
  const overlapWidth = overlapEnd - overlapStart;

  // If overlap is only 1 block, trim 2 off
  if (overlapWidth === 1 && currentBlock.colSpan > 1) {
    currentBlock.colSpan = 1;
    currentBlock.colStart = overlapStart;
  } else {
    // Normal trimming
    currentBlock.colSpan = overlapWidth;
    currentBlock.colStart = overlapStart;
  }

  currentBlock.row = prev.row - 1;
  stack.push(currentBlock);

  if (currentBlock.row < 0) {
    win = true;
    gameOver = true;
    return;
  }

  // Prepare new block
  speed = Math.min(0.25, speed + 0.01);
  direction = 1;
  currentBlock = createBlock(currentBlock.row - 1, currentBlock.colSpan);
}

function gameLoop() {
  if (!gameOver) {
    moveBlock();
    drawAll();
    requestAnimationFrame(gameLoop);
  } else {
    drawAll();
  }
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    if (!gameOver) {
      lockBlock();
    } else {
      initGame();
    }
  }
});

canvas.addEventListener("click", () => {
  if (!gameOver) {
    lockBlock();
  } else {
    initGame();
  }
});

initGame();