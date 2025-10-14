import React, { useState, useEffect, useRef } from 'react';
import type { ScoreEntry, SerialStatus } from '../types';

// Fix: Add missing Web Serial API type definitions for TypeScript
// These types are not yet included in the default TypeScript library and are needed to compile the Web Serial code.
declare global {
  interface SerialPort {
    open(options: { baudRate: number }): Promise<void>;
    close(): Promise<void>;
    readable: ReadableStream<Uint8Array>;
    writable: WritableStream<Uint8Array>;
  }

  interface Navigator {
    serial: {
      requestPort(): Promise<SerialPort>;
    };
  }
}

const PlayerPanel: React.FC<{
  playerName: string;
  setPlayerName: (name: string) => void;
  onStart: () => void;
  onReset: () => void;
  status: SerialStatus;
}> = ({ playerName, setPlayerName, onStart, onReset, status }) => {
  const isPlaying = status === 'connecting' || status === 'connected';

  const getButtonText = () => {
    switch (status) {
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return 'Punch Now!';
      case 'finished':
        return 'Play Again';
      case 'error':
        return 'Try Again';
      case 'disconnected':
      default:
        return 'Connect & Start';
    }
  };

  const handleButtonClick = () => {
    if (status === 'finished' || status === 'error') {
      onReset();
    } else {
      onStart();
    }
  };

  return (
    <div className="bg-[#2B0066] p-6 sm:p-8 rounded-2xl border-2 border-[#FFD33D] shadow-[0_0_20px_rgba(255,211,61,0.5)] flex-1 min-w-[280px]">
      <h2 className="text-2xl text-center mb-6 text-white tracking-wide">Player Ready?</h2>
      <input
        type="text"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        placeholder="Enter your name"
        disabled={isPlaying}
        className="w-full bg-transparent border-b-2 border-gray-400 focus:border-[#FFD33D] text-white text-center py-2 px-3 outline-none transition duration-300 placeholder-gray-500 disabled:opacity-50"
      />
      <button
        onClick={handleButtonClick}
        disabled={(status === 'disconnected' && !playerName) || status === 'connecting' || status === 'connected'}
        className="w-full mt-8 bg-[#FFD33D] text-[#12002B] font-bold py-3 rounded-lg text-lg transition-all duration-300 hover:shadow-[0_0_25px_#FFD33D] hover:scale-105 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
      >
        {getButtonText()}
      </button>
    </div>
  );
};

const ScorePanel: React.FC<{ score: number | null, status: SerialStatus }> = ({ score, status }) => {
    const getScoreContent = () => {
      switch (status) {
          case 'connecting':
              return <span className="text-3xl text-yellow-300 animate-pulse">Waiting for device...</span>;
          case 'connected':
              return <span className="text-3xl text-green-300 animate-pulse">Punch now!</span>;
          case 'finished':
              return score !== null && <span key={score} className="text-7xl font-mono text-[#00FF80] drop-shadow-[0_0_15px_#00FF80] animate-score-pulse">{score}</span>;
          case 'disconnected':
          case 'error':
          default:
              return <span className="text-7xl font-mono text-[#00FF80] drop-shadow-[0_0_15px_#00FF80]">0</span>;
      }
  };
    
  return (
    <div className="bg-gradient-to-b from-[#E03131] to-[#8A1C1C] p-6 sm:p-8 rounded-2xl border-2 border-[#FFD33D] shadow-[0_0_20px_rgba(255,211,61,0.5)] flex-1 min-w-[280px]">
      <h2 className="text-2xl text-center mb-6 text-white tracking-wide">Live Punch Score</h2>
      <div className="bg-black bg-opacity-30 p-4 rounded-lg flex items-center justify-center h-36">
        {getScoreContent()}
      </div>
    </div>
  );
};

const LeaderboardPanel: React.FC<{ scores: ScoreEntry[] }> = ({ scores }) => {
  return (
    <div className="bg-gradient-to-b from-[#42A5F5] to-[#1565C0] p-6 sm:p-8 rounded-2xl border-2 border-[#FFD33D] shadow-[0_0_20px_rgba(255,211,61,0.5)]">
      <h2 className="text-2xl sm:text-3xl text-center mb-6 text-white tracking-wide">Top Scores</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-black bg-opacity-30">
            <tr>
              <th className="p-3 sm:p-4 text-sm sm:text-base tracking-wider">Rank</th>
              <th className="p-3 sm:p-4 text-sm sm:text-base tracking-wider">Player</th>
              <th className="p-3 sm:p-4 text-sm sm:text-base tracking-wider text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            {scores.length > 0 ? (
              scores.map((entry, index) => (
                <tr key={entry.id} className="border-b border-white border-opacity-10 last:border-b-0">
                  <td className="p-4 sm:p-5 text-base sm:text-lg">{index + 1}</td>
                  <td className="p-4 sm:p-5 text-base sm:text-lg">{entry.playerName}</td>
                  <td className="p-4 sm:p-5 text-base sm:text-lg text-right font-mono">{entry.score}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center p-8 text-gray-400">No scores yet. Be the first!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface PlayPageProps {
  leaderboard: ScoreEntry[];
  playerName: string;
  setPlayerName: (name: string) => void;
  addScore: (score: number) => Promise<void>;
  showToast: (message: string) => void;
}

const PlayPage: React.FC<PlayPageProps> = ({ leaderboard, playerName, setPlayerName, addScore, showToast }) => {
  const [status, setStatus] = useState<SerialStatus>('disconnected');
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const portRef = useRef<SerialPort | null>(null);
  
  const handleReset = () => {
    setStatus('disconnected');
    setFinalScore(null);
  };

  const handleConnectAndPlay = async () => {
    if (!('serial' in navigator)) {
      showToast('Web Serial API is not supported in this browser.');
      return;
    }

    setStatus('connecting');
    setFinalScore(null);

    let reader: ReadableStreamDefaultReader<string> | undefined;

    try {
      const port = await navigator.serial.requestPort();
      portRef.current = port;
      await port.open({ baudRate: 9600 });
      setStatus('connected');
      showToast('Device connected! Punch now!');
      
      const textDecoder = new TextDecoderStream();
      port.readable.pipeTo(textDecoder.writable);
      reader = textDecoder.readable.getReader();

      let lineBuffer = '';
      while (portRef.current) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }
        
        lineBuffer += value;
        const lines = lineBuffer.split(/\r?\n/);
        
        if (lines.length > 1) {
          const scoreLine = lines[0].trim();
          if (scoreLine) { // Process only non-empty lines
            const score = parseInt(scoreLine, 10);
            
            if (!isNaN(score) && score >= 0) {
              setFinalScore(score);
              await addScore(score);
              setStatus('finished');
              break; 
            }
          }
          lineBuffer = lines.slice(1).join('\r\n');
        }
      }
    } catch (err: any) {
      if (err.name !== 'NotFoundError') { // Ignore error if user cancels port selection
        console.error('Serial connection error:', err);
        setStatus('error');
        showToast('Connection failed. Please try again.');
      } else {
        setStatus('disconnected');
      }
    } finally {
      if (reader) {
        await reader.cancel().catch(() => {});
        reader.releaseLock();
      }
      if (portRef.current) {
        await portRef.current.close().catch(() => {});
        portRef.current = null;
      }
      setStatus(currentStatus => (currentStatus === 'connected' || currentStatus === 'connecting' ? 'disconnected' : currentStatus));
    }
  };
  
  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (portRef.current) {
        // Create an async IIFE to handle closing
        (async () => {
          await portRef.current?.close().catch(console.error);
          portRef.current = null;
        })();
      }
    };
  }, []);

  return (
    <div>
      <h2 className="text-2xl sm:text-4xl text-center font-bold mb-8 tracking-wider">Welcome to the Smart Punching Bag Game</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <PlayerPanel
          playerName={playerName}
          setPlayerName={setPlayerName}
          onStart={handleConnectAndPlay}
          onReset={handleReset}
          status={status}
        />
        <ScorePanel score={finalScore} status={status} />
      </div>
      <div className="mt-8">
        <LeaderboardPanel scores={leaderboard} />
      </div>
    </div>
  );
};

export default PlayPage;