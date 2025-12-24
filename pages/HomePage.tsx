import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PenTool, Camera, ChevronRight, Sparkles, Volume2, VolumeX } from 'lucide-react';
import TopAppBar from '../components/TopAppBar.tsx';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAutoScrolling = useRef(false);

  useEffect(() => {
    // The auto move happens just one time after a 6-second delay
    const timer = setTimeout(() => {
      scrollToSlide(1);
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  const scrollToSlide = (index: number) => {
    if (scrollRef.current) {
      isAutoScrolling.current = true;
      const slideWidth = scrollRef.current.offsetWidth;
      scrollRef.current.scrollTo({
        left: index * slideWidth,
        behavior: 'smooth'
      });
      setActiveSlide(index);
      // Reset the lock after animation finishes
      setTimeout(() => {
        isAutoScrolling.current = false;
      }, 700);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isAutoScrolling.current) return;
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.offsetWidth;
    const newIndex = Math.round(scrollLeft / width);
    if (newIndex !== activeSlide) {
      setActiveSlide(newIndex);
    }
  };

  const features = [
    {
      title: 'Quick Tashkeel',
      desc: 'Restore diacritics to plain text instantly.',
      path: '/tashkeel',
      icon: PenTool,
      color: 'bg-[#D0BCFF] dark:bg-[#4F378B]',
      onColor: 'text-[#381E72] dark:text-[#EADDFF]',
      shape: 'rounded-[40px] rounded-tr-[12px] rounded-bl-[12px]'
    },
    {
      title: 'Scan & Restore',
      desc: 'Extract text from images with full marks.',
      path: '/ocr',
      icon: Camera,
      color: 'bg-[#B1E5FD] dark:bg-[#004A77]',
      onColor: 'text-[#003548] dark:text-[#C2E8FF]',
      shape: 'rounded-[12px] rounded-tl-[40px] rounded-br-[40px]'
    }
  ];

  return (
    <div className="min-h-full pb-8">
      <style>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .snap-item {
          scroll-snap-align: center;
          scroll-snap-stop: always;
          flex: 0 0 100%;
        }
      `}</style>
      <TopAppBar title="Harakatullah" />
      
      <div className="px-4 py-6">
        {/* Hero Section Wrapper - Locked Aspect Ratio & Themed Border */}
        <div className="mx-auto max-w-[500px] bg-[#EADDFF] dark:bg-[#4F378B] p-1.5 rounded-[50px] mb-12 shadow-[0_12px_40px_-12px_rgba(103,80,164,0.4)] dark:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.6)]">
          <div className="bg-[#EADDFF] dark:bg-[#4F378B] rounded-[44px] relative overflow-hidden aspect-[1.37/1] p-[1px]">
            <div className="absolute top-[-30px] right-[-30px] w-40 h-40 bg-white/20 dark:bg-black/10 rounded-full blur-3xl animate-blob pointer-events-none z-10"></div>
            
            {/* Scroll Container */}
            <div 
              ref={scrollRef}
              onScroll={handleScroll}
              className="h-full w-full flex overflow-x-auto snap-x snap-mandatory hide-scrollbar relative z-0"
            >
              {/* Slide 0: Welcome Text */}
              <div className="h-full snap-item flex flex-col items-center justify-center p-8 transition-opacity duration-500 bg-[#EADDFF] dark:bg-[#4F378B] overflow-hidden">
                <h2 className="text-[56px] font-bold text-[#21005D] dark:text-[#EADDFF] leading-none mb-4 kufi-font text-center drop-shadow-sm">
                  مَرْحَبًا بِكَ
                </h2>
                <p className="text-[#21005D] dark:text-[#EADDFF] text-lg font-medium text-center opacity-70 leading-relaxed px-4">
                  Master the art of classical Arabic reading.
                </p>
              </div>

              {/* Slide 1: Video Tutorial - Full Screen & Zoomed */}
              <div 
                className="h-full snap-item flex items-center justify-center overflow-hidden relative"
              >
                <div className="w-full h-full relative overflow-hidden flex items-center justify-center bg-black">
                  {/* Scale maintains coverage within the rounded hero area without gaps */}
                  <div className="w-full h-full scale-[1.35] transform origin-center transition-transform duration-700">
                    <iframe 
                      allow="autoplay; fullscreen" 
                      allowFullScreen 
                      height="100%" 
                      src={`https://streamable.com/e/tgeaeb?autoplay=1&nocontrols=1&muted=${isMuted ? 1 : 0}`} 
                      width="100%" 
                      style={{ border: 'none', width: '100%', height: '100%', position: 'absolute', left: '0px', top: '0px', overflow: 'hidden', background: 'black' }}
                    ></iframe>
                  </div>
                </div>

                {/* Small Mute Toggle Button */}
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                  className="absolute bottom-6 right-6 z-30 bg-black/40 backdrop-blur-md p-3 rounded-full text-white/90 hover:text-white transition-all active:scale-90 shadow-lg"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
              </div>
            </div>

            {/* Carousel Indicators - Interactive Dots */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 items-center z-20">
              <button 
                onClick={() => scrollToSlide(0)}
                className={`h-1.5 rounded-full bg-[#21005D] dark:bg-[#EADDFF] transition-all duration-500 hover:scale-110 active:scale-90 ${activeSlide === 0 ? 'w-10 opacity-100' : 'w-1.5 opacity-20'}`}
                aria-label="Welcome slide"
              />
              <button 
                onClick={() => scrollToSlide(1)}
                className={`h-1.5 rounded-full bg-[#21005D] dark:bg-[#EADDFF] transition-all duration-500 hover:scale-110 active:scale-90 ${activeSlide === 1 ? 'w-10 opacity-100' : 'w-1.5 opacity-20'}`}
                aria-label="Video tutorial slide"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-8 px-2">
          <h3 className="text-[10px] font-black text-[#6750A4] dark:text-[#D0BCFF] uppercase tracking-[0.3em] flex items-center gap-1.5">
            <span className="animate-pulse"><Sparkles size={12} /></span> Features
          </h3>
          <div className="h-[1px] flex-1 bg-[#CAC4D0] dark:bg-[#49454F] ml-6 opacity-20"></div>
        </div>
        
        <div className="grid gap-6">
          {features.map((f) => (
            <button
              key={f.path}
              onClick={() => navigate(f.path)}
              className="group flex items-center p-6 bg-[#F7F2FA] dark:bg-[#2B2930] rounded-[40px] text-left active:scale-[0.96] transition-all duration-300 hover:shadow-lg relative overflow-hidden"
            >
              <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] group-hover:opacity-[0.06] transition-all duration-700 group-hover:scale-125">
                <f.icon size={120} strokeWidth={0.5} />
              </div>

              <div className={`${f.color} ${f.onColor} p-5 ${f.shape} mr-6 shadow-md transition-all duration-500 group-hover:rotate-6`}>
                <f.icon size={36} strokeWidth={1.5} />
              </div>
              
              <div className="flex-1 relative z-10">
                <h4 className="font-bold text-[#1D1B20] dark:text-[#E6E1E5] text-2xl mb-1 group-hover:translate-x-1 transition-transform">{f.title}</h4>
                <p className="text-[#49454F] dark:text-[#CAC4D0] text-sm font-medium opacity-60 group-hover:opacity-100 transition-opacity">{f.desc}</p>
              </div>

              <div className="ml-2 opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                <ChevronRight size={24} strokeWidth={3} className="text-[#6750A4] dark:text-[#D0BCFF]" />
              </div>
            </button>
          ))}
        </div>

        <div className="mt-20 flex flex-col items-center justify-center opacity-[0.05] dark:opacity-[0.1] text-[#1D1B20] dark:text-[#E6E1E5] pointer-events-none select-none">
          <div className="text-[120px] kufi-font">ﷲ</div>
          <div className="w-48 h-[1px] bg-current rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;