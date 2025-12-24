import React from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Home, PenTool, Camera, History } from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext';
import HomePage from './pages/HomePage';
import TashkeelPage from './pages/TashkeelPage';
import OCRPage from './pages/OCRPage';
import SettingsPage from './pages/SettingsPage';
import HistoryPage from './pages/HistoryPage';

const NavigationBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Tashkeel', path: '/tashkeel', icon: PenTool },
    { label: 'Scan', path: '/ocr', icon: Camera },
    { label: 'History', path: '/history', icon: History },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 z-50 pointer-events-none">
      <nav className="mx-auto w-full max-w-[420px] h-[70px] bg-[#F3EDF7]/80 dark:bg-[#2B2930]/75 backdrop-blur-xl flex justify-between items-center px-2 rounded-[28px] shadow-[0_12px_48px_rgba(0,0,0,0.25)] dark:shadow-[0_12px_48px_rgba(0,0,0,0.5)] pointer-events-auto transition-all duration-300">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path === '/' && (location.pathname === '' || location.pathname === '/'));
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center flex-1 h-full min-w-0 transition-all duration-300 relative group"
              aria-label={item.label}
            >
              <div className={`
                relative px-3 py-2 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex items-center justify-center
                ${isActive 
                  ? 'bg-[#E8DEF8] text-[#1D192B] dark:bg-[#4F378B] dark:text-[#EADDFF] scale-105 shadow-sm rounded-[20px] rounded-tr-[6px] rounded-bl-[6px]' 
                  : 'text-[#49454F] dark:text-[#CAC4D0] hover:bg-black/5 dark:hover:bg-white/5 rounded-full'}
              `}>
                {isActive && (
                  <div className="absolute inset-0 bg-[#D0BCFF]/10 dark:bg-[#D0BCFF]/5 animate-blob rounded-[inherit]" />
                )}
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className="relative z-10 transition-transform duration-300" />
              </div>
              <span className={`
                text-[9px] font-bold tracking-tight mt-0.5 transition-all duration-300 truncate w-full text-center leading-none
                ${isActive 
                  ? 'text-[#1D192B] dark:text-[#E6E1E5] opacity-100' 
                  : 'text-[#49454F] dark:text-[#CAC4D0] opacity-60'}
              `}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0.5 w-1 h-1 rounded-full bg-[#6750A4] dark:bg-[#D0BCFF] animate-in fade-in duration-500" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-[#FEF7FF] dark:bg-[#1D1B20] transition-colors duration-300">
        <main className="flex-1 overflow-auto pb-32">
          <Routes>
            <Route index element={<HomePage />} />
            <Route path="tashkeel" element={<TashkeelPage />} />
            <Route path="ocr" element={<OCRPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <NavigationBar />
      </div>
    </ThemeProvider>
  );
};

export default App;