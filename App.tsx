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

  // Prefer explicit Vite env variable VITE_API_BASE_URL if provided (useful for pointing local frontend to Render backend)
  const envApi = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
  const isProduction = window.location.hostname !== 'localhost' && !window.location.hostname.startsWith('127.');
  const API_BASE_URL = envApi && envApi.length > 0
    ? envApi
    : isProduction
      ? 'https://smackdown-r2qj.onrender.com'
      : 'http://localhost:5555';

  // Log the API base URL so it's easy to debug network calls in DevTools/Console
  console.log('API_BASE_URL =', API_BASE_URL, ' (VITE_API_BASE_URL=', envApi, ')');


  const showToast = (message: string) => {
    setToast({ message, show: true });
    setTimeout(() => {
      setToast({ message: '', show: false });
    }, 3000);
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/leaderboard`);
      if (!response.ok) {
        let detail = '';
        try { detail = await response.text(); } catch (_) {}
        throw new Error(`Failed to fetch leaderboard: ${response.status} ${response.statusText} ${detail}`);
      }
      let data;
      try {
        data = await response.json();
      } catch (parseErr) {
        const txt = await response.text().catch(() => '<unreadable response>');
        throw new Error(`Invalid JSON from leaderboard: ${parseErr} - ${txt}`);
      }
      setLeaderboard(data);
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
      // Show the detailed message so you can debug what went wrong
      showToast((error as Error).message || 'Could not load scores.');
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
