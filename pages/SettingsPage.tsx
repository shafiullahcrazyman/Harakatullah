import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor, ShieldCheck, ShieldAlert, RefreshCw, AlertCircle, Server } from 'lucide-react';
import TopAppBar from '../components/TopAppBar.tsx';
import { useTheme } from '../context/ThemeContext.tsx';
import { GeminiService } from '../services/geminiService.ts';

const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [keyCount, setKeyCount] = useState(0);

  useEffect(() => {
    // Check loaded keys on mount
    const diags = GeminiService.getDiagnostics();
    setKeyCount(diags.keyCount);
  }, []);

  const checkApiStatus = async () => {
    setChecking(true);
    setStatus('idle');
    setErrorMessage(null);
    try {
      // Small test to check if the current rotated API key is valid
      await GeminiService.restoreTashkeel('مرحبا');
      setStatus('success');
    } catch (e: any) {
      console.error(e);
      setStatus('error');
      // Extract meaningful error info
      const msg = e.message || "Unknown error occurred";
      setErrorMessage(msg);
    } finally {
      setChecking(false);
    }
  };

  const themes = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Monitor },
  ] as const;

  return (
    <div className="bg-[#FEF7FF] dark:bg-[#1D1B20] min-h-full transition-colors duration-300">
      <TopAppBar title="Settings" showBack showSettings={false} />
      
      <div className="p-4 space-y-8">
        {/* Theme Selection */}
        <section>
          <h3 className="text-[11px] font-bold text-[#6750A4] dark:text-[#D0BCFF] mb-4 uppercase ml-2 tracking-[0.2em] opacity-80">Appearance</h3>
          <div className="bg-[#F7F2FA] dark:bg-[#2B2930] rounded-[28px] shadow-sm p-1.5 flex gap-1">
            {themes.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTheme(id)}
                className={`flex-1 flex flex-col items-center justify-center py-4 rounded-[22px] transition-all duration-300 gap-1.5 ${
                  theme === id 
                    ? 'bg-[#E8DEF8] text-[#1D192B] dark:bg-[#4F378B] dark:text-[#EADDFF] shadow-sm' 
                    : 'text-[#49454F] dark:text-[#CAC4D0] hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <Icon size={20} strokeWidth={theme === id ? 2.5 : 2} />
                <span className={`text-[11px] font-bold ${theme === id ? 'opacity-100' : 'opacity-70'}`}>{label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* API Status Check */}
        <section>
          <h3 className="text-[11px] font-bold text-[#6750A4] dark:text-[#D0BCFF] mb-4 uppercase ml-2 tracking-[0.2em] opacity-80">Diagnostics</h3>
          <div className="bg-[#F7F2FA] dark:bg-[#2B2930] rounded-[28px] shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-bold text-[#1D1B20] dark:text-[#E6E1E5] text-[15px]">API Connectivity</p>
                <p className="text-[13px] text-[#49454F] dark:text-[#CAC4D0] opacity-70">Test if your API keys are working</p>
              </div>
              
              {status === 'success' && <ShieldCheck className="text-green-500 animate-in zoom-in duration-300" size={24} />}
              {status === 'error' && <ShieldAlert className="text-red-500 animate-in shake duration-300" size={24} />}
            </div>

            {/* Config Info */}
            <div className="bg-black/5 dark:bg-white/5 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server size={16} className="text-[#49454F] dark:text-[#CAC4D0]" />
                <span className="text-xs font-medium text-[#49454F] dark:text-[#CAC4D0]">Env Config</span>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${keyCount > 0 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
                {keyCount} Key{keyCount !== 1 ? 's' : ''} Loaded
              </span>
            </div>

            <div className="space-y-3">
              <button 
                onClick={checkApiStatus}
                disabled={checking}
                className={`w-full py-3.5 rounded-full font-medium text-[14px] flex items-center justify-center gap-2.5 transition-all active:scale-[0.97] ${
                  status === 'success' 
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
                    : status === 'error'
                    ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                    : 'bg-[#EADDFF] dark:bg-[#D0BCFF] text-[#21005D] dark:text-[#381E72]'
                }`}
              >
                {checking ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <>
                    <RefreshCw size={18} className={status === 'idle' ? 'opacity-80' : ''} />
                    <span>
                      {status === 'success' ? 'Connection Verified' : status === 'error' ? 'Connection Failed' : 'Check API Connection'}
                    </span>
                  </>
                )}
              </button>

              {/* Explicitly show error box if status is error */}
              {status === 'error' && (
                <div className="flex gap-2 items-start bg-red-50 dark:bg-red-900/10 p-3 rounded-xl border border-red-100 dark:border-red-900/20 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle size={16} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <p className="text-[12px] text-red-700 dark:text-red-300 font-mono break-all leading-relaxed">
                    {errorMessage || "An unspecified error occurred."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;