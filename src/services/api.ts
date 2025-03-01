import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


export interface Destination {
  id: number;
  name: string;
  clues: string[];
  funFacts?: string[];
}

export interface AnswerResult {
  correct: boolean;
  correct_answer: string;
  fun_fact: string;
  best_try: number | null;
  correct_answers?: number;
  incorrect_answers?: number;
}

// Helper function to handle API errors
async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${response.status}`);
  }
  return response.json();
}

export const getRandomDestination = async (): Promise<Destination> => {
  const response = await fetch(`${API_URL}/api/destinations/random`);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch random destination');
  }
  
  return await response.json();
};

export const getDestinationById = async (id: number): Promise<Destination> => {
  const response = await fetch(`${API_URL}/api/destinations/${id}`);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch destination');
  }
  
  return await response.json();
};

export const checkAnswer = async (
  destination_id: number, 
  answer: string, 
  username?: string, 
  gave_up: boolean = false,
  tries: number = 1
): Promise<AnswerResult> => {
  const response = await fetch(`${API_URL}/api/destinations/check-answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      destination_id,
      answer,
      username,
      gave_up,
      tries
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to check answer');
  }
  
  return await response.json();
};

export const getDestinationOptions = async (destinationId: number) => {
  const response = await api.get(`/api/destinations/options?destination_id=${destinationId}`);
  return response.data;
};

export const createUser = async (username: string): Promise<{ 
  id: number; 
  username: string; 
  best_try: number;
  correct_answers: number;
  incorrect_answers: number;
}> => {
  console.log(`Creating user with username: ${username}`);
  const response = await fetch(`${API_URL}/api/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create user');
  }
  
  const data = await response.json();
  console.log(`User API response:`, data);
  return {
    id: data.id,
    username: data.username,
    best_try: data.best_try || 0,
    correct_answers: data.correct_answers || 0,
    incorrect_answers: data.incorrect_answers || 0
  };
};

export const getUser = async (username: string): Promise<{ 
  id: number; 
  username: string; 
  bestTry: number;
  correct_answers: number;
  incorrect_answers: number;
}> => {
  const response = await fetch(`${API_URL}/api/users/${username}`);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch user');
  }
  
  return await response.json();
};

export const createChallenge = async (userId: number) => {
  const response = await api.post('/api/users/challenge', { user_id: userId });
  return response.data;
};

export const getChallenge = async (inviteCode: string) => {
  const response = await api.get(`/api/users/challenge/${inviteCode}`);
  return response.data;
}; 