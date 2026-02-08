import React from 'react';
import { useOS } from '../context/OSContext';
import { cn } from '../utils/cn';
import { AppIcon } from './AppIcon';
import { LucideIcon } from 'lucide-react';

interface TaskbarProps {
  apps: Array<{ id: string; name: string; icon: LucideIcon; isOpen: boolean }>;
  onAppClick: (id: string) => void;
}

export function Taskbar({ apps, onAppClick }: TaskbarProps) {
  const { glassStyle, theme } = useOS();

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div
        className={cn(
          "flex items-center gap-4 px-6 py-3 rounded-3xl border transition-all duration-300",
          glassStyle === 'frosted'
            ? "backdrop-blur-xl bg-black/40 border-white/10"
            : "backdrop-blur-md bg-white/10 border-white/20 shadow-[inset_0_0_15px_rgba(255,255,255,0.15)]",
          theme === 'light' && "bg-white/40 border-black/5"
        )}
      >
        {apps.map((app) => (
          <button
            key={app.id}
            onClick={() => onAppClick(app.id)}
            className="group relative flex flex-col items-center justify-center transition-all hover:-translate-y-2"
          >
            <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                "bg-gradient-to-br from-white/10 to-white/5 shadow-lg",
                app.isOpen && "ring-2 ring-white/30"
            )}>
                <AppIcon icon={app.icon} name={app.name} />
            </div>
            {app.isOpen && (
                <div className="absolute -bottom-2 w-1 h-1 bg-white rounded-full" />
            )}

            {/* Tooltip */}
            <span className="absolute -top-10 opacity-0 group-hover:opacity-100 bg-black/80 text-white text-xs px-2 py-1 rounded backdrop-blur-md transition-opacity whitespace-nowrap">
                {app.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
