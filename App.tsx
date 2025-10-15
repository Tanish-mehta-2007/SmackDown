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

  // Prefer explicit Vite env variable VITE_API_BASE_URL if provided.
  // For local development (localhost) we force a relative '/api' so Vite's dev proxy is used
  // and the browser doesn't call the Render URL directly (avoids CORS).
  const envApi = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname.startsWith('127.');
  const isProduction = !isLocalhost;

  let API_BASE_URL: string;
  if (isLocalhost) {
    // prefer envApi if explicitly set to '/api', otherwise use '/api' to enable the proxy
    API_BASE_URL = envApi && envApi.length > 0 ? envApi : '/api';
  } else {
    // production behavior: prefer VITE env var if set. This allows using a direct
    // backend URL when the app was built with VITE_API_BASE_URL (e.g. build:render).
    if (envApi && envApi.length > 0) {
      API_BASE_URL = envApi;
    } else {
      // Fallback to previous behavior: if hosted on Firebase prefer relative '/api'
      const host = window.location.hostname;
      const isFirebaseHost = /(?:web\.app|firebaseapp\.com)$/.test(host);
      API_BASE_URL = isFirebaseHost ? '/api' : 'https://smackdown-r2qj.onrender.com';
    }
  }

  // Log the API base URL so it's easy to debug network calls in DevTools/Console
  console.log('API_BASE_URL =', API_BASE_URL, ' (VITE_API_BASE_URL=', envApi, ', isLocalhost=', isLocalhost, ')');

  // Helper to build the runtime API URL. In local dev we force relative '/api' so Vite proxies requests
  const buildApiUrl = (path: string) => {
    // path should start with '/' e.g. '/leaderboard' or '/leaderboard'
    if (isLocalhost) {
      // ensure a single slash: '/api' + path
      return `/api${path.startsWith('/') ? path : '/' + path}`;
    }
    // production: API_BASE_URL may already be '/api' or a full URL
    if (API_BASE_URL.endsWith('/') && path.startsWith('/')) {
      return API_BASE_URL.slice(0, -1) + path;
    }
    return API_BASE_URL + path;
  };


  const showToast = (message: string) => {
    setToast({ message, show: true });
    setTimeout(() => {
      setToast({ message: '', show: false });
    }, 3000);
  };

  const fetchLeaderboard = async () => {
    try {
  const response = await fetch(buildApiUrl('/leaderboard'));
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
      const response = await fetch(buildApiUrl('/leaderboard'), {
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
      const response = await fetch(buildApiUrl('/leaderboard'), {
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
