import React from 'react';
import type { Page } from '../types';

interface HeaderProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
}

const NavLink: React.FC<{
  page: Page;
  label: string;
  activePage: Page;
  setActivePage: (page: Page) => void;
  isButton?: boolean;
}> = ({ page, label, activePage, setActivePage, isButton = false }) => {
  const isActive = activePage === page;
  const baseClasses = 'px-4 py-2 rounded-md text-sm sm:text-base transition-all duration-300';
  const activeClasses = isButton
    ? 'bg-[#007BFF] text-white shadow-[0_0_10px_#007BFF]'
    : 'text-white';
  const inactiveClasses = isButton
    ? 'bg-transparent border border-blue-500 text-blue-300 hover:bg-blue-500 hover:text-white'
    : 'text-gray-400 hover:text-white';

  return (
    <button
      onClick={() => setActivePage(page)}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      {label}
    </button>
  );
};

const Header: React.FC<HeaderProps> = ({ activePage, setActivePage }) => {
  return (
    <header className="flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <span role="img" aria-label="fist" className="text-2xl sm:text-3xl">👊</span>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-wider">SmackDown</h1>
      </div>
      <nav className="flex items-center space-x-2 sm:space-x-4">
        <NavLink page="settings" label="Settings" activePage={activePage} setActivePage={setActivePage} />
        <NavLink page="play" label="Play Now" activePage={activePage} setActivePage={setActivePage} isButton={true} />
      </nav>
    </header>
  );
};

export default Header;
