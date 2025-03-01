import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import * as api from '@/services/api';
import { FaTimes, FaWhatsapp, FaCopy, FaCheck, FaUser } from 'react-icons/fa';
import Image from 'next/image';

interface ChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChallengeModal: React.FC<ChallengeModalProps> = ({ isOpen, onClose }) => {
  const { username, bestTry, setUsername } = useGameStore();
  const [inviteLink, setInviteLink] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareImageUrl, setShareImageUrl] = useState<string>('');
  const [tempUsername, setTempUsername] = useState('');
  const [isSettingUsername, setIsSettingUsername] = useState(false);

  const createChallenge = async () => {
    if (!username) {
      setIsSettingUsername(true);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Get user data
      await api.createUser(username);
      
      // Create invite link with username encoded
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/challenge?username=${encodeURIComponent(username)}`;
      setInviteLink(link);
    } catch (err) {
      console.error("Failed to create challenge:", err);
      setError("Failed to create challenge. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const generateShareImage = () => {
    const cloudName = 'dsjcqd10y'; // Your Cloudinary cloud name
    const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
  
    // Encode text properly
    const title = encodeURIComponent('Globetrotter Challenge');
    const subtitle = encodeURIComponent(`${username} is challenging you!`);
    const scoreText = bestTry > 0 
      ? encodeURIComponent(`Best Score: ${bestTry} ${bestTry === 1 ? 'try' : 'tries'}`) 
      : encodeURIComponent('Can you beat me?');
    const callToAction = encodeURIComponent('Play Now!');
  
    // Define styling and transformations
    const transformations = [
        `w_800,h_418,c_fill,q_auto,f_auto,b_rgb:000000`, // Solid black background
        `l_text:Arial_48_bold:${title},co_rgb:ffffff,g_north,y_60`,  // Larger title
        `l_text:Arial_32_bold:${subtitle},co_rgb:ffffff,g_north,y_140`,  // Subtitle with contrast
        `l_text:Arial_36_bold:${scoreText},co_rgb:ffffff,g_center,y_40`,  // Score with bright text
        `l_text:Arial_28_bold:${callToAction},co_rgb:ffffff,g_south,y_60`  // CTA in red
      ].join('/');
      
  
    // Choose a background image (replace with your uploaded image in Cloudinary)
    const imagePublicId = 'sample'; // Change to your custom background image if needed
  
    // Final URL
    const imageUrl = `${baseUrl}/${transformations}/${imagePublicId}.jpg`;
    
    setShareImageUrl(imageUrl);
  };

  useEffect(() => {
    if (isOpen && username) {
      createChallenge();
    } else if (isOpen && !username) {
      setIsSettingUsername(true);
    }
  }, [isOpen, username]);
  
  useEffect(() => {
    if (inviteLink && username) {
      generateShareImage();
    }
  }, [inviteLink, username]);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  const shareOnWhatsApp = () => {
    // Include both the image URL and the invite link in the message
    const text = `I challenge you to beat my Globetrotter score! Can you guess the destination in fewer than ${bestTry > 0 ? bestTry : 'X'} tries?\n\n${shareImageUrl}\n\nPlay here: ${inviteLink}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };
  
  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tempUsername.trim()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Create user with the provided username
      const userData = await api.createUser(tempUsername);
      
      // Update global state with the returned user data
      setUsername(userData.username);
      
      // Reset temp username and move to challenge creation
      setTempUsername('');
      setIsSettingUsername(false);
      
      // Create the challenge with the new username
      // We don't need to call createChallenge() here as the useEffect will trigger it
    } catch (err) {
      console.error("Failed to set username:", err);
      setError("Failed to set username. Please try a different one.");
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <FaTimes />
        </button>
        
        <h2 className="text-xl font-bold mb-4 text-white">
          {isSettingUsername ? "Set Username" : "Challenge a Friend"}
        </h2>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-300">
              {isSettingUsername ? "Setting username..." : "Creating your challenge..."}
            </p>
          </div>
        ) : error ? (
          <div className="text-red-400 mb-4">
            <p>{error}</p>
            <button 
              onClick={isSettingUsername ? () => setError(null) : createChallenge}
              className="mt-4 w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : isSettingUsername ? (
          <div>
            <p className="text-gray-300 mb-4">
              Please set a username before challenging friends.
            </p>
            
            <form onSubmit={handleUsernameSubmit}>
              <div className="mb-4">
                <label htmlFor="username" className="block text-gray-300 mb-2">
                  Username
                </label>
                <div className="flex">
                  <div className="bg-gray-700 flex items-center px-3 rounded-l border border-gray-600">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="username"
                    value={tempUsername}
                    onChange={(e) => setTempUsername(e.target.value)}
                    className="flex-grow p-2 rounded-r bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                    placeholder="Enter a username"
                    autoFocus
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={!tempUsername.trim()}
                className={`w-full py-2 rounded-md transition-colors ${
                  tempUsername.trim() 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                Continue
              </button>
            </form>
          </div>
        ) : inviteLink ? (
          <>
            {shareImageUrl && (
              <div className="mb-4">
                <Image 
                  src={shareImageUrl} 
                  alt="Challenge share image" 
                  width={500} 
                  height={300}
                  className="w-full rounded-md"
                />
              </div>
            )}
            
            <div className="mb-4">
              <p className="text-gray-300 mb-2">Share this link with your friends:</p>
              <div className="flex">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="flex-grow p-2 rounded-l bg-gray-700 text-white border border-gray-600"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-3 py-2 bg-gray-600 text-white rounded-r hover:bg-gray-500 transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? <FaCheck className="text-green-400" /> : <FaCopy />}
                </button>
              </div>
            </div>
            
            <button
              onClick={shareOnWhatsApp}
              className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <FaWhatsapp className="mr-2" /> Share on WhatsApp
            </button>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-300">Something went wrong. Please try again.</p>
            <button 
              onClick={createChallenge}
              className="mt-4 w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Challenge
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengeModal; 