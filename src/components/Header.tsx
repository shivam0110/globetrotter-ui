'use client';

import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { FaTrophy } from 'react-icons/fa';
import * as api from '@/services/api';
import ChallengeModal from './ChallengeModal';

const Header: React.FC = () => {
  const { username, setUsername, bestTry, setBestTry } = useGameStore();
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(username || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);

  // Create user when component mounts if username exists but user might not be in DB
  useEffect(() => {
    const createUserIfNeeded = async () => {
      if (username && !isLoading) {
        try {
          setIsLoading(true);
          console.log("Creating/retrieving user on mount:", username);
          const userData = await api.createUser(username);
          console.log("User data retrieved:", userData);
          if (userData.best_try !== undefined) {
            setBestTry(userData.best_try);
          }
        } catch (error) {
          console.error("Error creating/retrieving user:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    createUserIfNeeded();
  }, [username, setBestTry]);

  const handleSaveUsername = async () => {
    if (newUsername.trim()) {
      try {
        setIsLoading(true);
        console.log("Creating user with username:", newUsername.trim());
        const userData = await api.createUser(newUsername.trim());
        console.log("User created/retrieved:", userData);
        
        setUsername(userData.username);
        if (userData.best_try !== undefined) {
          console.log("Setting bestTry from API:", userData.best_try);
          setBestTry(userData.best_try);
        }
      } catch (error) {
        console.error("Error creating user:", error);
      } finally {
        setIsLoading(false);
        setIsEditing(false);
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveUsername();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setNewUsername(username || '');
    }
  };

  return (
    <header className="bg-gray-900 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold mr-2">Globetrotter</h1>
          <span className="text-blue-400 text-sm">Geography Quiz</span>
        </div>
        
        <div className="flex items-center space-x-4">
          {isLoading && (
            <div className="text-xs text-gray-400">Loading...</div>
          )}

        {/* {username && ( */}
            <div className="border-t border-gray-700">
              <button
                onClick={() => setIsChallengeModalOpen(true)}
                className="w-full px-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex items-center justify-center"
              >
                <span>Challenge a Friend</span>
              </button>
            </div>
          {/* )} */}
          
          {username && !isEditing ? (
            <div className="text-sm">
              <span className="text-gray-400 mr-1">Playing as:</span>
              <span className="font-semibold">{username}</span>
              <button 
                onClick={() => setIsEditing(true)}
                className="ml-2 text-blue-400 hover:text-blue-300 text-xs"
                disabled={isLoading}
              >
                Change
              </button>
            </div>
          ) : isEditing ? (
            <div className="flex items-center">
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter username"
                className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm mr-2 focus:outline-none focus:border-blue-500"
                autoFocus
                disabled={isLoading}
              />
              <button 
                onClick={handleSaveUsername}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded"
                disabled={isLoading}
              >
                Save
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
              disabled={isLoading}
            >
              Set Username
            </button>
          )}
          
          {bestTry > 0 && (
            <div className="flex items-center text-sm bg-yellow-900/30 px-3 py-1 rounded-full border border-yellow-700/50">
              <FaTrophy className="text-yellow-500 mr-2" />
              <span className="text-yellow-300">
                Best: {bestTry} {bestTry === 1 ? 'try' : 'tries'}
              </span>
            </div>
          )}
        </div>
      </div>
      <ChallengeModal 
        isOpen={isChallengeModalOpen}
        onClose={() => setIsChallengeModalOpen(false)}
      />
    </header>
  );
};

export default Header; 