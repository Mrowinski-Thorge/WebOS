import React, { useState, useEffect } from 'react';
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

export function Desktop() {
  const { isLocked, theme, wallpaper } = useOS();

  // App State Management
  const [openApps, setOpenApps] = useState<string[]>([]);
  const [activeApp, setActiveApp] = useState<string | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [timerDuration, setTimerDuration] = useState(0);

  // App Definitions
  const APPS = [
    { id: 'settings', name: 'Settings', icon: Settings, component: SettingsApp },
    { id: 'browser', name: 'Browser', icon: Globe, component: BrowserApp },
    { id: 'notes', name: 'Notes', icon: StickyNote, component: NotesApp },
    { id: 'clock', name: 'Clock', icon: Clock, component: () => <ClockApp initialTimer={timerDuration} /> },
  ];

  const handleOpenApp = (id: string) => {
    if (!openApps.includes(id)) {
      setOpenApps([...openApps, id]);
    }
    setActiveApp(id);
  };

  const handleCloseApp = (id: string) => {
    setOpenApps(openApps.filter(appId => appId !== id));
    if (activeApp === id) setActiveApp(null);
  };

  if (isLocked) {
    return <LockScreen />;
  }

  return (
    <div
        className={cn(
            "w-full h-full relative overflow-hidden transition-colors duration-500 bg-cover bg-center"
        )}
        style={{
            backgroundImage: wallpaper
                ? `url('${wallpaper}')`
                : theme === 'dark'
                    ? "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')"
                    : "url('https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=2070&auto=format&fit=crop')"
        }}
    >
      {/* Overlay for tinting */}
      <div className={cn("absolute inset-0 pointer-events-none", theme === 'dark' ? "bg-black/30" : "bg-white/10")} />

      {/* Windows Area */}
      <div className="absolute inset-0">
        {openApps.map(id => {
          const app = APPS.find(a => a.id === id);
          if (!app) return null;
          const Component = app.component;

          return (
            <Window
              key={id}
              id={id}
              title={app.name}
              isOpen={true}
              onClose={() => handleCloseApp(id)}
              onMinimize={() => {}} // Just visual for now
              isActive={activeApp === id}
              onFocus={() => setActiveApp(id)}
            >
              <Component />
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
            ...APPS.map(a => ({ ...a, isOpen: openApps.includes(a.id) })),
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
