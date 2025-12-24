import React, { useState, useRef } from 'react';
import { Camera, RefreshCw, Copy, Check, Sparkles } from 'lucide-react';
import TopAppBar from '../components/TopAppBar.tsx';
import { GeminiService } from '../services/geminiService.ts';

const OCRPage: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setResult(''); 
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async () => {
    if (!selectedImage) return;
    setLoading(true);
    try {
      const base64 = selectedImage.split(',')[1];
      const diacritized = await GeminiService.performOCRAndTashkeel(base64);
      setResult(diacritized);

      const history = JSON.parse(localStorage.getItem('tashkeel_history') || '[]');
      history.unshift({
        id: Date.now().toString(),
        type: 'ocr',
        content: 'Image Scan',
        result: diacritized,
        timestamp: Date.now()
      });
      localStorage.setItem('tashkeel_history', JSON.stringify(history.slice(0, 50)));
    } catch (error) {
      console.error(error);
      alert('Failed to extract text. Please ensure the image has clear Arabic text.');
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
      <TopAppBar title="Scan & Restore" showBack />
      
      <div className="p-4 space-y-6">
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="aspect-square w-full max-sm mx-auto bg-[#F7F2FA] dark:bg-[#2B2930] rounded-[32px] flex flex-col items-center justify-center overflow-hidden cursor-pointer relative group shadow-inner"
        >
          {selectedImage ? (
            <>
              <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <p className="text-white font-medium">Tap to Change</p>
              </div>
            </>
          ) : (
            <>
              <Camera size={48} className="text-[#49454F] dark:text-[#CAC4D0] mb-4 opacity-50" />
              <p className="text-[#49454F] dark:text-[#CAC4D0] font-medium px-8 text-center">Capture Arabic text or upload an image</p>
            </>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        {selectedImage && !result && (
          <button
            onClick={processImage}
            disabled={loading}
            className="w-full py-5 bg-[#6750A4] dark:bg-[#D0BCFF] text-white dark:text-[#381E72] rounded-[24px] font-bold flex items-center justify-center gap-3 active:scale-95 transition-all shadow-md"
          >
            {loading ? <RefreshCw className="animate-spin" /> : <><Sparkles size={20} /> Extract & Diacritize</>}
          </button>
        )}

        {result && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center gap-2 px-2">
              <span className="h-[2px] w-4 bg-[#6750A4] dark:bg-[#D0BCFF]"></span>
              <h3 className="text-xs font-bold text-[#6750A4] dark:text-[#D0BCFF] uppercase">Result</h3>
            </div>
            <div className="relative">
              <div className="w-full p-8 bg-[#EADDFF] dark:bg-[#4F378B] rounded-[32px] arabic-font text-3xl leading-loose text-right text-[#21005D] dark:text-[#EADDFF] shadow-sm">
                {result}
              </div>
              <button
                onClick={handleCopy}
                className="absolute top-4 left-4 bg-white/60 dark:bg-black/20 backdrop-blur p-2 rounded-xl hover:bg-white dark:hover:bg-black transition-all active:scale-90"
              >
                {copied ? <Check size={18} className="text-green-600 dark:text-green-400" /> : <Copy size={18} className="text-[#1D1B20] dark:text-[#E6E1E5]" />}
              </button>
            </div>
            <button
              onClick={() => { setSelectedImage(null); setResult(''); }}
              className="w-full py-4 bg-black/5 dark:bg-white/5 text-[#6750A4] dark:text-[#D0BCFF] rounded-[24px] font-bold active:scale-95 transition-all"
            >
              Start New Scan
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OCRPage;