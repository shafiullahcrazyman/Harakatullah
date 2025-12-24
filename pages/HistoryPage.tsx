import React, { useState, useEffect } from 'react';
import { Trash2, Copy, History as HistoryIcon, Clock, AlertTriangle, X } from 'lucide-react';
import TopAppBar from '../components/TopAppBar.tsx';
import { HistoryItem } from '../types.ts';

const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('tashkeel_history') || '[]');
    setHistory(data);
  }, []);

  const handleClearClick = () => {
    if (!isConfirming) {
      setIsConfirming(true);
      // Auto-reset confirmation state after 3 seconds if not clicked again
      setTimeout(() => setIsConfirming(false), 3000);
    } else {
      performClear();
    }
  };

  const performClear = () => {
    localStorage.removeItem('tashkeel_history');
    setHistory([]);
    setIsConfirming(false);
  };

  const copyResult = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-[#FEF7FF] dark:bg-[#1D1B20] min-h-full transition-colors duration-300">
      <TopAppBar title="History" showBack />
      
      <div className="p-4">
        {history.length > 0 ? (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button 
                type="button"
                onClick={handleClearClick}
                className={`flex items-center gap-2 font-medium px-4 py-2 rounded-full transition-all duration-300 active:scale-95 ${
                  isConfirming 
                    ? 'bg-[#B3261E] text-white shadow-md animate-pulse' 
                    : 'text-[#B3261E] dark:text-[#FFB4AB] hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {isConfirming ? (
                  <>
                    <AlertTriangle size={18} />
                    <span>Confirm Clear?</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    <span>Clear All</span>
                  </>
                )}
              </button>
              
              {isConfirming && (
                <button 
                  onClick={() => setIsConfirming(false)}
                  className="ml-2 p-2 rounded-full bg-black/5 dark:bg-white/5 text-[#49454F] dark:text-[#CAC4D0]"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            
            {history.map((item) => (
              <div key={item.id} className="bg-[#F7F2FA] dark:bg-[#2B2930] rounded-[16px] p-4 space-y-3 shadow-sm border border-black/[0.03] dark:border-white/[0.03]">
                <div className="flex justify-between items-center text-[#49454F] dark:text-[#CAC4D0] text-[12px]">
                  <div className="flex items-center gap-1 opacity-70">
                    <Clock size={14} />
                    {new Date(item.timestamp).toLocaleString()}
                  </div>
                  <span className="bg-[#EADDFF] dark:bg-[#4F378B] px-2.5 py-0.5 rounded-full text-[#21005D] dark:text-[#EADDFF] font-bold text-[10px]">
                    {item.type.toUpperCase()}
                  </span>
                </div>
                
                <p className="text-right arabic-font text-2xl leading-relaxed text-[#1D1B20] dark:text-[#E6E1E5]">
                  {item.result}
                </p>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => copyResult(item.result)}
                    className="flex-1 py-2.5 rounded-full bg-white/60 dark:bg-white/5 flex items-center justify-center gap-2 text-sm font-medium text-[#1D1B20] dark:text-[#E6E1E5] transition-all active:scale-[0.98] border border-black/5 dark:border-white/5"
                  >
                    <Copy size={16} className="opacity-70" /> 
                    <span>Copy Result</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-[70vh] flex flex-col items-center justify-center opacity-30 dark:opacity-10 text-[#1D1B20] dark:text-[#E6E1E5]">
            <HistoryIcon size={80} className="mb-4" strokeWidth={1} />
            <p className="text-lg font-medium">No history yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;