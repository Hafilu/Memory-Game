import { useEffect , useState } from "react";
import Counter from "./Counter";

const MemoryGame = () => {

   

  const [gridSize, setGridSize] = useState(4);
  const [cards, setCards] = useState([]);

  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [disabled, setDisabled] = useState(false);

  const [won, setWon] = useState(false);
  const [wonTime, setWonTime] = useState(null);
  const [lose, setLose] = useState(false);

  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(gridSize*gridSize*2 );

  // User related states
  const [user, setUser] = useState(null); // To store username
  const [leaderboard, setLeaderboard] = useState([]);

  // Modal form state
  const [showForm, setShowForm] = useState(true);
  const [usernameInput, setUsernameInput] = useState("");

  const handleGridSizeChange = (e) => {
    const size = parseInt(e.target.value);
    if (size >= 2 && size <= 10) setGridSize(size);
  };


  useEffect(()=>{
    
       initializeGame()
   
  },[gridSize])

  const initializeGame = () => {
    const totalCards = gridSize * gridSize;
    const pairCount = Math.floor(totalCards / 2);
    const numbers = [...Array(pairCount).keys()].map((n) => n + 1);
    const shuffledCards = [...numbers, ...numbers]
      .sort(() => Math.random() - 0.5)
      .slice(0, totalCards)
      .map((number, index) => ({ id: index, number }));

    setCards(shuffledCards);
    setFlipped([]);
    setSolved([]);
    setWon(false);
    setLose(false);
    setDisabled(false);
    setSeconds(gridSize*gridSize*2 );
    setIsRunning(true);
  };

  const checkMatch = (secondId) => {
    const [firstId] = flipped;
    if (cards[firstId].number === cards[secondId].number) {
      setSolved([...solved, firstId, secondId]);
      setFlipped([]);
      setDisabled(false);
    } else {
      setTimeout(() => {
        setFlipped([]);
        setDisabled(false);
      }, 500);
    }
  };

  const handleClick = (id) => {
    if (disabled || won) return;

    if (flipped.length === 0) {
      setFlipped([id]);
      return;
    }

    if (flipped.length === 1) {
      setDisabled(true);
      if (id !== flipped[0]) {
        setFlipped([...flipped, id]);
        checkMatch(id);
      } else {
        setFlipped([]);
        setDisabled(false);
      }
    }
  };

  const isFlipped = (id) => flipped.includes(id) || solved.includes(id);
  const isSolved = (id) => solved.includes(id);

  const handleLose = () => {
    setLose(true);
    setSeconds(gridSize*gridSize*2 );
    setIsRunning(false);
    setDisabled(true);

    updateLeaderboard(user, false);
  };

  const handleWin = () => {
    setWon(true);
    setWonTime(seconds);
    setSeconds(gridSize*gridSize*2 );
    setIsRunning(false);

    updateLeaderboard(user, true);
  };

  // Retrieve leaderboard from localStorage when the component mounts
  useEffect(() => {
    const storedLeaderboard = localStorage.getItem("leaderboard");
    if (storedLeaderboard) {
      setLeaderboard(JSON.parse(storedLeaderboard));
    }
  }, []);

  // Function to update the leaderboard
  const updateLeaderboard = (username, won) => {
    setLeaderboard((prevLeaderboard) => {
      const existingUser = prevLeaderboard.find(
        (entry) => entry.username === username
      );

      let updatedLeaderboard;
      if (existingUser) {
        updatedLeaderboard = prevLeaderboard.map((entry) =>
          entry.username === username
            ? {
                ...entry,
                points: won ? entry.points + 1 * gridSize : entry.points,
                attempts: entry.attempts + 1,
              }
            : entry
        );
      } else {
        updatedLeaderboard = [
          ...prevLeaderboard,
          { username, points: won ? 1 * gridSize : 0, attempts: 1 },
        ];
      }

      // Save the updated leaderboard to localStorage
      localStorage.setItem("leaderboard", JSON.stringify(updatedLeaderboard));

      return updatedLeaderboard;
    });
  };

  useEffect(() => {
    if (solved.length === cards.length && cards.length > 0) {
      handleWin();
    }
  }, [solved, cards]);

  // Form submission to set username
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (usernameInput.trim()) {
      setUser(usernameInput.trim());
      setShowForm(false);
      // initializeGame();
    }
  };

  const handleLogout = () => {
    setUser(null);
    setShowForm(true);

    setUsernameInput("");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-grey-100 p-4">
      <h1 className="text-3xl font-bold mb-6">Memory Game</h1>

      {/* Username Form Popup */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <form
            onSubmit={handleFormSubmit}
            className="bg-white p-6 rounded shadow-md md:w-max w-[90%] mx-auto"
          >
            <h2 className="text-xl font-bold mb-4">Enter Your Name to Start</h2>
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className="border-2 border-gray-300 rounded px-2 py-1 mb-4 w-full"
              placeholder="Username"
              required
            />
            <div className="text-center">
               <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Start Game
            </button>
            </div>
           
          </form>
        </div>
      )}

      {/* Game Board */}
      {!showForm && (
        <>
          <div className="mb-4">
            <label htmlFor="gridSize" className="mr-2">
              Grid Size: (max 10)
            </label>
            <input
              type="number"
              id="gridSize"
              min="2"
              max="10"
              value={gridSize}
              onChange={handleGridSizeChange}
              className="border-2 border-gray-300 rounded px-2 py-1"
            />
          </div>

          <div>
            <Counter
              handleLose={handleLose}
              isRunning={isRunning}
              setIsRunning={setIsRunning}
              seconds={seconds}
              setSeconds={setSeconds}
            />
          </div>

          <div
            className={`grid gap-2 mb-4`}
            style={{
              gridTemplateColumns: `repeat(${gridSize}, minmax(0,1fr))`,
              width: `min(100%, ${gridSize * 5.5}rem)`,
            }}
          >
            {cards.map((card) => (
              <div
                key={card.id}
                onClick={() => handleClick(card.id)}
                className={`aspect-square flex items-center justify-center text-xl font-bold rounded-lg cursor-pointer transition-all duration-300  ${
                  isFlipped(card.id)
                    ? isSolved(card.id)
                      ? "bg-green-500 text-white"
                      : "bg-blue-500 text-white"
                    : "bg-gray-300 text-gray-400"
                }`}
              >
                {isFlipped(card.id) ? card.number : "?"}
              </div>
            ))}
          </div>

          {/* Result */}
          {won && (
            <div className="mt-4 text-4xl font-bold text-green-600 animate-bounce">
              You Won! {wonTime} seconds left
            </div>
          )}
          {lose && (
            <div className="mt-4 text-4xl font-bold text-red-600 animate-bounce">
              You Lose!
            </div>
          )}

          {/* Reset / Play Again Btn */}
           
              <button
                onClick={initializeGame}
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
              { (won || lose) ? "Play Again" :"Restart"}
              </button>
             
          {/* Logout Btn */}
          <button
            onClick={handleLogout}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Log Out
          </button>

          {/* Leaderboard */}
          {leaderboard.length > 0 && (
            <div className="mt-6 w-full max-w-lg">
              <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
              <table className="min-w-full border-collapse border border-gray-400">
                <thead>
                  <tr>
                    <th className="border px-4 py-2">Rank</th>

                    <th className="border px-4 py-2">Username</th>
                    <th className="border px-4 py-2">No of try</th>
                    <th className="border px-4 py-2">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard
                    .sort((a, b) => b.points - a.points) // Sort leaderboard by points (descending)
                    .map((entry, index) => (
                      <tr key={index}>
                        <td className="border px-4 py-2">{index + 1}</td>
                        <td className="border px-4 py-2">{entry.username}</td>
                        <td className="border px-4 py-2">{entry.attempts}</td>
                        <td className="border px-4 py-2">{entry.points}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MemoryGame;
