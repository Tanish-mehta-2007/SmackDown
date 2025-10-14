import React, { useState } from 'react';

interface SettingsPageProps {
  resetLeaderboard: () => void;
  playerName: string;
  setPlayerName: (name: string) => void;
  showToast: (message: string) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ resetLeaderboard, playerName, setPlayerName, showToast }) => {
  const [newName, setNewName] = useState(playerName);

  const handleNameChange = () => {
    setPlayerName(newName);
    showToast(`Player name changed to ${newName}`);
  };

  const handleTestConnection = () => {
    showToast('Connect your device on the Play Now screen!');
  };

  return (
    <div className="max-w-2xl mx-auto bg-[#2B0066] p-8 rounded-2xl border-2 border-[#FFD33D] shadow-[0_0_20px_rgba(255,211,61,0.5)]">
      <h2 className="text-3xl text-center mb-8 text-white tracking-wide">Settings</h2>
      
      <div className="space-y-8">
        {/* Change Player Name */}
        <div>
          <label className="block text-lg mb-2 text-gray-300">Change Player Name</label>
          <div className="flex space-x-4">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter new name"
              className="flex-grow bg-transparent border-b-2 border-gray-400 focus:border-[#FFD33D] text-white py-2 px-3 outline-none transition duration-300 placeholder-gray-500"
            />
            <button
              onClick={handleNameChange}
              className="bg-[#007BFF] text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 hover:shadow-[0_0_15px_#007BFF] hover:scale-105"
            >
              Save
            </button>
          </div>
        </div>

        {/* Arduino Connection */}
        <div>
          <h3 className="text-lg text-gray-300">Hardware Connection</h3>
          <p className="text-sm text-gray-400 mb-4">Connect to your Arduino via the Web Serial API on the "Play Now" screen.</p>
          <div className="flex items-center space-x-4 p-6 bg-black bg-opacity-20 rounded-lg">
            <span className="text-gray-400">Arduino Connection Status</span>
            <div className="flex-grow"></div>
            <button
              onClick={handleTestConnection}
              className="bg-gray-600 text-gray-300 font-bold py-2 px-6 rounded-lg transition-all duration-300 hover:bg-gray-500"
            >
              Connection Info
            </button>
          </div>
        </div>

        {/* Reset Leaderboard */}
        <div>
          <h3 className="text-lg text-red-400">Danger Zone</h3>
          <div className="flex items-center justify-between p-6 bg-black bg-opacity-20 rounded-lg border border-red-500/50">
            <p className="text-gray-300">This will permanently delete all scores.</p>
            <button
              onClick={resetLeaderboard}
              className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 hover:bg-red-700 hover:shadow-[0_0_15px_#E03131]"
            >
              Reset Leaderboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
