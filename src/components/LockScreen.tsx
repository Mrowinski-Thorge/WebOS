import React, { useState } from 'react';
import { useOS } from '../context/OSContext';
import { WelcomeScene } from './ui/WelcomeScene';
import { cn } from '../utils/cn';
import { Lock } from 'lucide-react';

export function LockScreen() {
  const { setIsLocked, language, glassStyle } = useOS();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleUnlock = () => {
    if (pin === '1234') {
      setIsLocked(false);
    } else {
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 500);
    }
  };

  return (
    <div className="relative w-full h-full bg-black flex flex-col items-center justify-center text-white overflow-hidden">
      {/* 3D Background */}
      <WelcomeScene />

      {/* Glass Panel */}
      <div
        className={cn(
            "z-20 p-8 rounded-3xl flex flex-col items-center gap-6 border border-white/20 shadow-2xl transition-all duration-300",
            glassStyle === 'frosted' ? "backdrop-blur-xl bg-white/10" : "backdrop-blur-sm bg-white/5 shadow-[inset_0_0_20px_rgba(255,255,255,0.2)]",
            error ? "animate-shake border-red-500/50" : ""
        )}
      >
        <div className="p-4 rounded-full bg-white/10 mb-2">
            <Lock className="w-8 h-8 text-white" />
        </div>

        <h2 className="text-2xl font-light tracking-wide">
            {language === 'en' ? 'Enter Passcode' : 'Code eingeben'}
        </h2>

        <div className="flex gap-4">
            {[1, 2, 3, 4].map((_, i) => (
                <div
                    key={i}
                    className={cn(
                        "w-4 h-4 rounded-full transition-all duration-300 border border-white/50",
                        pin.length > i ? "bg-white scale-110" : "bg-transparent"
                    )}
                />
            ))}
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '>'].map((key) => (
                <button
                    key={key}
                    onClick={() => {
                        if (key === 'C') setPin('');
                        else if (key === '>') handleUnlock();
                        else if (pin.length < 4) setPin(prev => prev + key);
                    }}
                    className="w-16 h-16 rounded-full text-xl font-medium flex items-center justify-center
                             bg-white/5 hover:bg-white/20 active:bg-white/30 transition-all
                             border border-white/10 backdrop-blur-md"
                >
                    {key}
                </button>
            ))}
        </div>
      </div>
    </div>
  );
}
