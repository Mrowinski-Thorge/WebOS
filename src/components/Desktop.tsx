import React, { useState } from 'react';
import { useOS } from '../context/OSContext';
import { Window } from './Window';
import { Taskbar } from './Taskbar';
import { LockScreen } from './LockScreen';
import { Settings, Globe, StickyNote, Clock, Sparkles } from 'lucide-react';
import { cn } from '../utils/cn';
import { SettingsApp } from './apps/SettingsApp';
import { BrowserApp } from './apps/BrowserApp';
import { NotesApp } from './apps/NotesApp';
import { ClockApp } from './apps/ClockApp';
import { AssistantSidebar } from './AssistantSidebar';

// App Definitions moved outside to prevent recreation on every render
const APPS_CONFIG = [
  { id: 'settings', name: 'Settings', icon: Settings, component: SettingsApp },
  { id: 'browser', name: 'Browser', icon: Globe, component: BrowserApp },
  { id: 'notes', name: 'Notes', icon: StickyNote, component: NotesApp },
  { id: 'clock', name: 'Clock', icon: Clock, component: ClockApp },
];

export function Desktop() {
  const { isLocked, theme } = useOS();

  // App State Management
  const [openApps, setOpenApps] = useState<string[]>([]);
  const [minimizedApps, setMinimizedApps] = useState<string[]>([]);
  const [activeApp, setActiveApp] = useState<string | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [timerDuration, setTimerDuration] = useState(0);

  const handleOpenApp = (id: string) => {
    if (minimizedApps.includes(id)) {
      setMinimizedApps(minimizedApps.filter(appId => appId !== id));
    }
    if (!openApps.includes(id)) {
      setOpenApps([...openApps, id]);
    }
    setActiveApp(id);
  };

  const handleCloseApp = (id: string) => {
    setOpenApps(openApps.filter(appId => appId !== id));
    setMinimizedApps(minimizedApps.filter(appId => appId !== id));
    if (activeApp === id) setActiveApp(null);
  };

  const handleMinimizeApp = (id: string) => {
    if (!minimizedApps.includes(id)) {
      setMinimizedApps([...minimizedApps, id]);
    }
    if (activeApp === id) {
      setActiveApp(null);
    }
  };

  if (isLocked) {
    return <LockScreen />;
  }

  return (
    <div
        className={cn(
            "w-full h-full relative overflow-hidden transition-colors duration-500",
            theme === 'dark'
                ? "bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover"
                : "bg-[url('https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=2070&auto=format&fit=crop')] bg-cover"
        )}
    >
      {/* Overlay for tinting */}
      <div className={cn("absolute inset-0 pointer-events-none", theme === 'dark' ? "bg-black/30" : "bg-white/10")} />

      {/* Windows Area */}
      <div className="absolute inset-0">
        {openApps.map(id => {
          const app = APPS_CONFIG.find(a => a.id === id);
          if (!app) return null;
          const Component = app.component;

          // Determine extra props dynamically
          const extraProps = id === 'clock' ? { initialTimer: timerDuration } : {};

          return (
            <Window
              key={id}
              id={id}
              title={app.name}
              isOpen={true}
              onClose={() => handleCloseApp(id)}
              onMinimize={() => handleMinimizeApp(id)}
              isMinimized={minimizedApps.includes(id)}
              isActive={activeApp === id}
              onFocus={() => setActiveApp(id)}
            >
              <Component {...extraProps} />
            </Window>
          );
        })}
      </div>

      {/* Assistant */}
      <AssistantSidebar
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        onOpenApp={handleOpenApp}
        onSetTimer={(s) => {
            setTimerDuration(s);
            handleOpenApp('clock');
        }}
      />

      {/* Taskbar */}
      <Taskbar
        apps={[
            ...APPS_CONFIG.map(a => ({ ...a, isOpen: openApps.includes(a.id) })),
            { id: 'assistant', name: 'Assistant', icon: Sparkles, isOpen: isAssistantOpen }
        ]}
        onAppClick={(id) => {
            if (id === 'assistant') setIsAssistantOpen(!isAssistantOpen);
            else handleOpenApp(id);
        }}
      />
    </div>
  );
}
