import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import * as api from '@/services/api';
import ReactConfetti from 'react-confetti';

const GameBoard: React.FC = () => {
  const { 
    username, 
    bestTry, 
    tries,
    setBestTry, 
    incrementTries,
    resetGame,
    correctAnswers,
    incorrectAnswers,
    setCorrectAnswers,
    setIncorrectAnswers
  } = useGameStore();
  
  const [destination, setDestination] = useState<api.Destination | null>(null);
  const [guess, setGuess] = useState('');
  const [resultState, setResultState] = useState<api.AnswerResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [incorrectGuesses, setIncorrectGuesses] = useState<string[]>([]);
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const fetchNewDestination = async () => {
    setLoading(true);
    setError(null);
    setGuess('');
    setResultState(null);
    setIncorrectGuesses([]);
    setHintMessage(null);
    setGaveUp(false);
    resetGame();
    
    try {
      const data = await api.getRandomDestination();
      setDestination(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load destination. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchNewDestination();
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!destination || !guess.trim()) return;
    
    incrementTries();
    
    try {
      const data = await api.checkAnswer(destination.id, guess, username || undefined, false, tries + 1);
      
      if (data.correct) {
        // Correct answer
        setResultState(data);
        console.log("Received best_try from API:", data.best_try);
        if (data.best_try) {
          console.log("Setting bestTry in store to:", data.best_try);
          setBestTry(data.best_try);
        }
        
        // Update correct answers count
        if (data.correct_answers !== undefined) {
          setCorrectAnswers(data.correct_answers);
        }
        
        // Show confetti
        setShowConfetti(true);
      } else {
        // Incorrect answer - don't show the correct answer yet
        setIncorrectGuesses([...incorrectGuesses, guess]);
        
        // Update incorrect answers count
        if (data.incorrect_answers !== undefined) {
          setIncorrectAnswers(data.incorrect_answers);
        }
        
        // Clear the input field
        setGuess('');
        
        // Add shake animation
        setShake(true);
        setTimeout(() => setShake(false), 500);
        
        // Provide a hint after 3 incorrect guesses
        if (incorrectGuesses.length === 2) {
          setHintMessage("Hint: Try thinking about the continent or region mentioned in the clues.");
        } else if (incorrectGuesses.length === 4) {
          setHintMessage(`Hint: The first letter is "${destination.name[0]}"`);
        }
        
        // Focus the input field for the next guess
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 100);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to submit answer. Please try again.');
    }
  };
  
  const handleGiveUp = async () => {
    if (!destination) return;
    
    setGaveUp(true);
    
    try {
      // Get the destination details
      const destData = await api.getDestinationById(destination.id);
      
      // Create a result object manually
      setResultState({
        correct: false,
        correct_answer: destData.name,
        fun_fact: destData.funFacts && destData.funFacts.length > 0 
          ? destData.funFacts[Math.floor(Math.random() * destData.funFacts.length)] 
          : "No fun facts available for this destination.",
        best_try: null
      });
      
      // Also update the user's stats if needed
      if (username) {
        try {
          await api.checkAnswer(destination.id, destData.name, username || undefined, true, tries);
        } catch (err) {
          console.error("Failed to update user stats:", err);
        }
      }
      
    } catch (err) {
      console.error("Failed to get destination details:", err);
      
      // Fallback: Use the destination we already have
      setResultState({
        correct: false,
        correct_answer: destination.name,
        fun_fact: "Unable to load additional details for this destination.",
        best_try: null
      });
      
      // Still try to update user stats
      if (username) {
        try {
          await api.checkAnswer(destination.id, destination.name, username || undefined, true, tries);
        } catch (statsErr) {
          console.error("Failed to update user stats:", statsErr);
        }
      }
    }
  };
  
  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
        <div className="text-red-400 mb-4">
          <h3 className="font-bold text-lg mb-2">Error</h3>
          <p>{error}</p>
          {error.includes('connection failed') && (
            <div className="mt-4 p-3 bg-gray-700 rounded text-sm">
              <p className="mb-2">Please make sure the backend server is running:</p>
              <ol className="list-decimal pl-5">
                <li>Open a terminal in the globetrotter-be directory</li>
                <li>Run <code className="bg-gray-900 px-1 rounded">python main.py</code></li>
                <li>Wait for the server to start</li>
                <li>Refresh this page</li>
              </ol>
            </div>
          )}
        </div>
        <button 
          onClick={fetchNewDestination}
          className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-300">Loading destination...</p>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
      {showConfetti && (
        <ReactConfetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
        />
      )}
      
      {destination && !resultState && (
        <>
          <h2 className="text-xl font-bold mb-4 text-white">Where am I?</h2>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-300">Clues:</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-300">
              {destination.clues.map((clue, index) => (
                <li key={index}>{clue}</li>
              ))}
            </ul>
          </div>
          
          {incorrectGuesses.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-1 text-gray-400">Previous guesses:</h3>
              <div className="flex flex-wrap gap-2">
                {incorrectGuesses.map((guess, index) => (
                  <span key={index} className="px-2 py-1 bg-red-900/30 text-red-300 text-sm rounded">
                    {guess}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {hintMessage && (
            <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-800/50 rounded text-yellow-300">
              {hintMessage}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="flex">
              <input
                ref={inputRef}
                type="text"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="Enter your guess..."
                className={`flex-grow p-2 rounded-l bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500 ${
                  shake ? 'animate-shake' : ''
                }`}
                autoFocus
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700 transition-colors"
              >
                Submit
              </button>
            </div>
          </form>
          
          <button
            onClick={handleGiveUp}
            className="w-full py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
          >
            I give up, show me the answer
          </button>
        </>
      )}
      
      {resultState && (
        <div className="text-center">
          <h2 className={`text-2xl font-bold mb-2 ${resultState.correct ? 'text-green-400' : 'text-red-400'}`}>
            {resultState.correct ? 'Correct!' : gaveUp ? 'Better luck next time!' : 'Incorrect!'}
          </h2>
          
          <p className="text-xl mb-4 text-white">
            The answer is: <span className="font-bold">{resultState.correct_answer}</span>
          </p>
          
          {resultState.correct && (
            <div className="mb-4 p-3 bg-green-900/30 border border-green-800/50 rounded text-green-300">
              {tries === 1 
                ? "Amazing! You got it on your first try!" 
                : `You got it in ${tries} tries!`}
              {bestTry > 0 && bestTry === tries && " That's your best score!"}
              {bestTry > 0 && bestTry < tries && ` Your best is ${bestTry} ${bestTry === 1 ? 'try' : 'tries'}.`}
            </div>
          )}
          
          <div className="p-4 bg-gray-700 rounded mb-6">
            <h3 className="text-lg font-semibold mb-2 text-blue-300">Fun Fact:</h3>
            <p className="text-gray-300">{resultState.fun_fact}</p>
          </div>
          
          {username && (correctAnswers > 0 || incorrectAnswers > 0) && (
            <div className="mb-4 p-3 bg-gray-700 rounded">
              <h3 className="text-lg font-semibold mb-2 text-white">Your Stats:</h3>
              <div className="flex justify-center space-x-6">
                <div className="text-green-400">
                  <span className="font-bold">{correctAnswers}</span> correct
                </div>
                <div className="text-red-400">
                  <span className="font-bold">{incorrectAnswers}</span> incorrect
                </div>
              </div>
            </div>
          )}
          
          <button
            onClick={fetchNewDestination}
            className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Next Destination
          </button>
        </div>
      )}
    </div>
  );
};

export default GameBoard; 