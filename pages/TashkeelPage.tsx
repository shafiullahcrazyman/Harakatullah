import React, { useState } from 'react';
import { Copy, RefreshCw, Send, Check, PenTool } from 'lucide-react';
import TopAppBar from '../components/TopAppBar.tsx';
import { GeminiService } from '../services/geminiService.ts';

const TashkeelPage: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const diacritized = await GeminiService.restoreTashkeel(inputText);
      setResult(diacritized);
      
      const history = JSON.parse(localStorage.getItem('tashkeel_history') || '[]');
      history.unshift({
        id: Date.now().toString(),
        type: 'tashkeel',
        content: inputText,
        result: diacritized,
        timestamp: Date.now()
      });
      localStorage.setItem('tashkeel_history', JSON.stringify(history.slice(0, 50)));
    } catch (error) {
      console.error(error);
      alert('Failed to process text. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-full pb-8">
      <TopAppBar title="Quick Tashkeel" showBack />
      
      <div className="p-4 space-y-6">
        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or paste Arabic text here..."
            className="w-full h-56 p-6 bg-[#F7F2FA] dark:bg-[#2B2930] rounded-[32px] arabic-font text-3xl focus:ring-4 focus:ring-[#6750A4]/10 dark:focus:ring-[#D0BCFF]/10 focus:outline-none placeholder:text-[#49454F]/40 dark:placeholder:text-[#CAC4D0]/40 placeholder:font-sans shadow-inner resize-none text-right text-[#1D1B20] dark:text-[#E6E1E5]"
            dir="rtl"
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !inputText.trim()}
            className={`absolute bottom-6 right-6 p-4 rounded-2xl shadow-lg transition-all ${
              loading 
                ? 'bg-gray-200 dark:bg-gray-700' 
                : 'bg-[#6750A4] dark:bg-[#D0BCFF] text-white dark:text-[#381E72] active:scale-90 hover:shadow-xl'
            }`}
          >
            {loading ? <RefreshCw className="animate-spin" /> : <Send size={24} />}
          </button>
        </div>

        {result && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex items-center gap-2 px-2">
              <span className="h-[2px] w-4 bg-[#6750A4] dark:bg-[#D0BCFF]"></span>
              <h3 className="text-xs font-bold text-[#6750A4] dark:text-[#D0BCFF] uppercase">Result</h3>
            </div>
            <div className="relative group">
              <div className="w-full p-8 bg-[#EADDFF] dark:bg-[#4F378B] rounded-[36px] arabic-font text-4xl leading-[1.8] text-right text-[#21005D] dark:text-[#EADDFF] shadow-md selection:bg-[#6750A4] selection:text-white">
                {result}
              </div>
              <button
                onClick={handleCopy}
                className="absolute top-4 left-4 bg-white/80 dark:bg-black/40 backdrop-blur p-3 rounded-2xl hover:bg-white dark:hover:bg-black/60 transition-all active:scale-90 shadow-sm"
                title="Copy"
              >
                {copied ? <Check size={20} className="text-green-600 dark:text-green-400" /> : <Copy size={20} className="text-[#1D1B20] dark:text-[#E6E1E5]" />}
              </button>
            </div>
          </div>
        )}

        {!result && !loading && (
          <div className="flex flex-col items-center justify-center pt-16 text-center opacity-20 dark:opacity-10 text-[#1D1B20] dark:text-[#E6E1E5]">
            <div className="relative mb-6">
              <PenTool size={80} strokeWidth={1} />
              <div className="absolute inset-0 scale-150 border border-current rounded-full opacity-20 animate-ping"></div>
            </div>
            <p className="text-xl">Enter Arabic text to see the magic</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TashkeelPage;