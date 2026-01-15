import React, { useState, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import { cn } from '../../utils/cn';
import { Play, Pause, RotateCcw } from 'lucide-react';

export function ClockApp({ initialTimer = 0 }: { initialTimer?: number }) {
  const { theme, glassStyle } = useOS();
  const [time, setTime] = useState(new Date());

  // Timer Logic
  const [duration, setDuration] = useState(initialTimer);
  const [timeLeft, setTimeLeft] = useState(initialTimer);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (initialTimer > 0) {
        setDuration(initialTimer);
        setTimeLeft(initialTimer);
        setIsRunning(true);
    }
  }, [initialTimer]);

  useEffect(() => {
    let interval: any;
    if (isRunning && timeLeft > 0) {
        interval = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
    } else if (timeLeft === 0) {
        setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 gap-8 text-white">
        {/* Clock */}
        <div className="text-center space-y-2">
            <h2 className="text-8xl font-thin tracking-tighter tabular-nums drop-shadow-2xl">
                {formatTime(time)}
            </h2>
            <p className="text-xl opacity-60 font-light tracking-widest uppercase">
                {time.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
        </div>

        {/* Timer */}
        <div className={cn(
            "w-full max-w-sm p-6 rounded-3xl border flex flex-col items-center gap-4 transition-all",
            glassStyle === 'frosted' ? "bg-white/5 border-white/10" : "bg-white/10 border-white/20 shadow-inner"
        )}>
            <div className="text-4xl font-mono font-medium tabular-nums">
                {formatTimer(timeLeft)}
            </div>

            <div className="flex gap-4">
                <button
                    onClick={() => setIsRunning(!isRunning)}
                    className="p-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                >
                    {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <button
                    onClick={() => {
                        setIsRunning(false);
                        setTimeLeft(duration || 300); // Default reset to set duration or 5 mins
                    }}
                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                    <RotateCcw className="w-5 h-5" />
                </button>
            </div>

            {/* Quick Add */}
            <div className="flex gap-2 text-xs">
                {[1, 5, 15].map(min => (
                    <button
                        key={min}
                        onClick={() => {
                            const s = min * 60;
                            setDuration(s);
                            setTimeLeft(s);
                            setIsRunning(false);
                        }}
                        className="px-3 py-1 rounded-full border border-white/10 hover:bg-white/10 transition-colors"
                    >
                        +{min}m
                    </button>
                ))}
            </div>
        </div>
    </div>
  );
}
