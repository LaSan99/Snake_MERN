import SnakeGame from "./components/SnakeGame";
import "./App.css";

function App() {
  return (
    <div className="app">
      <h1>Snake Game</h1>
      <SnakeGame />
      <div className="instructions">
        <h3>How to Play:</h3>
        <p>Use arrow keys to control the snake</p>
        <p>Eat the food (orange squares) to grow and score points</p>
        <p>Don't hit the walls or yourself!</p>
      </div>
    </div>
  );
}

export default App;
