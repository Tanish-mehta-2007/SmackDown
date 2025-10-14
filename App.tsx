import React, { useState, useEffect } from 'react';
import type { Page } from './types';
import Header from './components/Header';
import PlayPage from './components/PlayPage';
import SettingsPage from './components/SettingsPage';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { ScoreEntry } from './types';
import Toast from './components/Toast';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('play');
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);
  const [playerName, setPlayerName] = useLocalStorage<string>('smackdown-player', '');
  const [toast, setToast] = useState<{ message: string; show: boolean }>({ message: '', show: false });

  // Dynamically set the API URL based on the hostname.
  // This allows the app to work in both local development and production without code changes.
  const isProduction = window.location.hostname !== 'localhost' && !window.location.hostname.startsWith('127.');
  const API_BASE_URL = isProduction
    ? 'https://your-smackdown-backend.onrender.com' // IMPORTANT: Replace with your actual Render backend URL
    : 'http://localhost:5555';

  // Log the API base URL so it's easy to debug network calls in DevTools/Console
  console.log('API_BASE_URL =', API_BASE_URL);


  const showToast = (message: string) => {
    setToast({ message, show: true });
    setTimeout(() => {
      setToast({ message: '', show: false });
    }, 3000);
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/leaderboard`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setLeaderboard(data);
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
      showToast('Could not load scores.');
    }
  };
  
  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const resetLeaderboard = async () => {
    try {
      // FIX: Complete the truncated fetch call to reset the leaderboard.
      const response = await fetch(`${API_BASE_URL}/api/leaderboard`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to reset leaderboard');
      fetchLeaderboard(); // Refetch to show the empty leaderboard
      showToast('Leaderboard has been reset!');
    } catch (error) {
      console.error("Failed to reset leaderboard:", error);
      showToast('Could not reset leaderboard.');
    }
  };

  // FIX: Add the missing addScore function required by PlayPage.
  const addScore = async (score: number) => {
    if (!playerName) {
      showToast('Please enter a player name first!');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/leaderboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerName, score }),
      });
      if (!response.ok) {
        // try to get server error details
        let detail = '';
        try {
          const txt = await response.text();
          detail = txt;
        } catch (_) {}
        throw new Error(`Failed to save score: ${response.status} ${response.statusText} ${detail}`);
      }
      
      // After successfully saving, refresh the leaderboard to show the new score
      await fetchLeaderboard(); 
      showToast(`Score of ${score} saved for ${playerName}!`);
    } catch (error) {
      console.error("Failed to add score:", error);
      showToast((error as Error).message || 'Could not save your score.');
    }
  };

  // FIX: The component was not returning any JSX, causing a type error.
  return (
    <div className="bg-[#12002B] text-white min-h-screen font-sans p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Header activePage={activePage} setActivePage={setActivePage} />
        <main className="mt-8">
          {activePage === 'play' && (
            <PlayPage
              leaderboard={leaderboard}
              playerName={playerName}
              setPlayerName={setPlayerName}
              addScore={addScore}
              showToast={showToast}
            />
          )}
          {activePage === 'settings' && (
            <SettingsPage
              resetLeaderboard={resetLeaderboard}
              playerName={playerName}
              setPlayerName={setPlayerName}
              showToast={showToast}
            />
          )}
        </main>
      </div>
      <Toast message={toast.message} show={toast.show} />
    </div>
  );
};

// FIX: Add the missing default export for the App component.
export default App;
