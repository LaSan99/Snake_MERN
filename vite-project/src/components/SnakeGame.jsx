import { useState, useEffect, useCallback } from "react";

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_FOOD = { x: 15, y: 15 };
const INITIAL_DIRECTION = "RIGHT";
const SPEED = 150;
const SWIPE_THRESHOLD = 50; // Minimum swipe distance to trigger direction change
const TOUCH_CONTROLS_SIZE = 120; // Size of touch control buttons

function SnakeGame() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState(INITIAL_FOOD);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(
    localStorage.getItem("snakeHighScore") || 0
  );
  const [touchStart, setTouchStart] = useState(null);
  const [showTouchControls, setShowTouchControls] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);

  useEffect(() => {
    if (isGameOver && score > highScore) {
      setHighScore(score);
      localStorage.setItem("snakeHighScore", score);
    }
  }, [isGameOver, score, highScore]);

  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    setFood(newFood);
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setIsGameOver(false);
    setIsPaused(false);
    setScore(0);
    generateFood();
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const moveSnake = useCallback(() => {
    if (isGameOver || isPaused || !isGameStarted) return;

    setSnake((currentSnake) => {
      const head = currentSnake[0];
      const newHead = { ...head };

      switch (direction) {
        case "UP":
          newHead.y -= 1;
          break;
        case "DOWN":
          newHead.y += 1;
          break;
        case "LEFT":
          newHead.x -= 1;
          break;
        case "RIGHT":
          newHead.x += 1;
          break;
      }

      // Check collision with walls
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
      ) {
        setIsGameOver(true);
        return currentSnake;
      }

      // Check collision with self
      if (
        currentSnake.some(
          (segment) => segment.x === newHead.x && segment.y === newHead.y
        )
      ) {
        setIsGameOver(true);
        return currentSnake;
      }

      const newSnake = [newHead, ...currentSnake];

      // Check if food is eaten
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore((prev) => prev + 1);
        generateFood();
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, generateFood, isGameOver, isPaused, isGameStarted]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === " ") {
        // Space bar to pause/resume
        togglePause();
        return;
      }

      if (isPaused) return;

      switch (e.key) {
        case "ArrowUp":
          if (direction !== "DOWN") setDirection("UP");
          break;
        case "ArrowDown":
          if (direction !== "UP") setDirection("DOWN");
          break;
        case "ArrowLeft":
          if (direction !== "RIGHT") setDirection("LEFT");
          break;
        case "ArrowRight":
          if (direction !== "LEFT") setDirection("RIGHT");
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [direction, isPaused]);

  useEffect(() => {
    const gameLoop = setInterval(moveSnake, SPEED);
    return () => clearInterval(gameLoop);
  }, [moveSnake]);

  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setShowTouchControls(isMobile);
  }, []);

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
    });
  };

  const handleTouchMove = (e) => {
    if (!touchStart || isPaused) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    if (
      Math.abs(deltaX) < SWIPE_THRESHOLD &&
      Math.abs(deltaY) < SWIPE_THRESHOLD
    ) {
      return;
    }

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (deltaX > 0 && direction !== "LEFT") {
        setDirection("RIGHT");
      } else if (deltaX < 0 && direction !== "RIGHT") {
        setDirection("LEFT");
      }
    } else {
      // Vertical swipe
      if (deltaY > 0 && direction !== "UP") {
        setDirection("DOWN");
      } else if (deltaY < 0 && direction !== "DOWN") {
        setDirection("UP");
      }
    }

    setTouchStart(null);
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
  };

  const handleDirectionButton = (newDirection) => {
    if (isPaused) return;

    switch (newDirection) {
      case "UP":
        if (direction !== "DOWN") setDirection("UP");
        break;
      case "DOWN":
        if (direction !== "UP") setDirection("DOWN");
        break;
      case "LEFT":
        if (direction !== "RIGHT") setDirection("LEFT");
        break;
      case "RIGHT":
        if (direction !== "LEFT") setDirection("RIGHT");
        break;
    }
  };

  const startGame = () => {
    setIsGameStarted(true);
    resetGame();
  };

  return (
    <div
      className="snake-game"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="game-info">
        <div className="score-container">
          <div className="current-score">
            <h2>Score: {score}</h2>
          </div>
          <div className="high-score">
            <h3>High Score: {highScore}</h3>
          </div>
        </div>

        {!isGameStarted ? (
          <div className="start-screen">
            <h2>Welcome to Snake Game!</h2>
            <button onClick={startGame} className="start-btn">
              Play Game
            </button>
          </div>
        ) : (
          <div className="game-controls">
            <button onClick={togglePause} className="control-btn">
              {isPaused ? "Resume" : "Pause"}
            </button>
            <button onClick={resetGame} className="control-btn">
              New Game
            </button>
          </div>
        )}

        {isGameOver && (
          <div className="game-over">
            <h2>Game Over!</h2>
            {score > highScore && (
              <h3 className="new-high-score">New High Score! 🎉</h3>
            )}
            <button onClick={startGame} className="start-btn">
              Play Again
            </button>
          </div>
        )}

        {isPaused && !isGameOver && isGameStarted && (
          <div className="paused-overlay">
            <h2>Game Paused</h2>
            <p>Press Space or click Resume to continue</p>
          </div>
        )}
      </div>

      {isGameStarted && (
        <div className="game-container">
          <div
            className="game-board"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
              gap: "1px",
              backgroundColor: "#2a2a2a",
              padding: "10px",
              borderRadius: "10px",
              boxShadow: "0 0 20px rgba(0, 0, 0, 0.3)",
            }}
          >
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
              const x = index % GRID_SIZE;
              const y = Math.floor(index / GRID_SIZE);
              const isSnake = snake.some(
                (segment) => segment.x === x && segment.y === y
              );
              const isFood = food.x === x && food.y === y;
              const isHead = isSnake && x === snake[0].x && y === snake[0].y;

              return (
                <div
                  key={index}
                  className={`game-cell ${isHead ? "snake-head" : ""} ${
                    isSnake ? "snake-body" : ""
                  } ${isFood ? "food" : ""}`}
                  style={{
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                  }}
                />
              );
            })}
          </div>

          {showTouchControls && (
            <div className="touch-controls">
              <button
                className="direction-btn up"
                onClick={() => handleDirectionButton("UP")}
              >
                ↑
              </button>
              <div className="horizontal-controls">
                <button
                  className="direction-btn left"
                  onClick={() => handleDirectionButton("LEFT")}
                >
                  ←
                </button>
                <button
                  className="direction-btn right"
                  onClick={() => handleDirectionButton("RIGHT")}
                >
                  →
                </button>
              </div>
              <button
                className="direction-btn down"
                onClick={() => handleDirectionButton("DOWN")}
              >
                ↓
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SnakeGame;
