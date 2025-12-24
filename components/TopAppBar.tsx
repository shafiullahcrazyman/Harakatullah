import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings as SettingsIcon } from 'lucide-react';

interface TopAppBarProps {
  title: string;
  showBack?: boolean;
  showSettings?: boolean;
}

const TopAppBar: React.FC<TopAppBarProps> = ({ title, showBack = false, showSettings = true }) => {
  const navigate = useNavigate();

  return (
    <header className="h-16 flex items-center justify-between px-4 bg-[#FEF7FF]/80 dark:bg-[#1D1B20]/80 backdrop-blur-md sticky top-0 z-40 transition-colors duration-300">
      <div className="flex items-center">
        {showBack && (
          <button 
            onClick={() => navigate(-1)}
            className="p-3 mr-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 active:bg-black/10 transition-colors"
          >
            <ArrowLeft size={24} className="text-[#1D1B20] dark:text-[#E6E1E5]" />
          </button>
        )}
        <h1 className="text-[20px] font-bold text-[#1D1B20] dark:text-[#E6E1E5] tracking-tight">{title}</h1>
      </div>
      {showSettings && (
        <button 
          onClick={() => navigate('/settings')}
          className="p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/5 active:bg-black/10 transition-colors"
        >
          <SettingsIcon size={24} className="text-[#1D1B20] dark:text-[#E6E1E5]" />
        </button>
      )}
    </header>
  );
};

export default TopAppBar;