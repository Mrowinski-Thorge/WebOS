import React from 'react';
import { useOS } from '../../context/OSContext';
import { cn } from '../../utils/cn';
import { Monitor, Moon, Sun, Key, Palette, Languages } from 'lucide-react';

export function SettingsApp() {
  const {
    theme, setTheme,
    glassStyle, setGlassStyle,
    iconStyle, setIconStyle,
    language, setLanguage,
    apiKey, setApiKey
  } = useOS();

  const [activeTab, setActiveTab] = React.useState('display');

  const tabs = [
    { id: 'display', icon: Monitor, label: language === 'en' ? 'Display' : 'Anzeige' },
    { id: 'appearance', icon: Palette, label: language === 'en' ? 'Appearance' : 'Aussehen' },
    { id: 'system', icon: Languages, label: language === 'en' ? 'System' : 'System' },
    { id: 'ai', icon: Key, label: 'AI / API' },
  ];

  return (
    <div className="flex h-full text-white">
      {/* Sidebar */}
      <div className="w-1/4 border-r border-white/10 p-4 flex flex-col gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left",
              activeTab === tab.id
                ? "bg-white/20 shadow-lg"
                : "hover:bg-white/10 opacity-70 hover:opacity-100"
            )}
          >
            <tab.icon className="w-5 h-5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-8 overflow-y-auto">

        {/* Display Settings */}
        {activeTab === 'display' && (
          <div className="space-y-8">
            <section>
              <h3 className="text-xl font-medium mb-4">{language === 'en' ? 'Glass Style' : 'Glas-Stil'}</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setGlassStyle('frosted')}
                  className={cn(
                    "p-4 rounded-xl border flex flex-col items-center gap-2 transition-all",
                    glassStyle === 'frosted' ? "border-blue-500 bg-white/10" : "border-white/10 hover:bg-white/5"
                  )}
                >
                  <div className="w-full h-24 bg-white/20 backdrop-blur-xl rounded-lg mb-2" />
                  <span>Frosted (Matte)</span>
                </button>
                <button
                  onClick={() => setGlassStyle('liquid')}
                  className={cn(
                    "p-4 rounded-xl border flex flex-col items-center gap-2 transition-all",
                    glassStyle === 'liquid' ? "border-blue-500 bg-white/10" : "border-white/10 hover:bg-white/5"
                  )}
                >
                   <div className="w-full h-24 bg-white/5 backdrop-blur-[2px] rounded-lg mb-2 border border-white/30 shadow-inner" />
                  <span>Liquid (Glossy)</span>
                </button>
              </div>
            </section>

            <section>
               <h3 className="text-xl font-medium mb-4">{language === 'en' ? 'Theme Mode' : 'Design Modus'}</h3>
               <div className="flex gap-4 bg-white/5 p-1 rounded-xl inline-flex">
                 <button
                    onClick={() => setTheme('light')}
                    className={cn("px-6 py-2 rounded-lg flex items-center gap-2 transition-all", theme === 'light' ? "bg-white text-black shadow" : "hover:bg-white/10")}
                 >
                    <Sun className="w-4 h-4" /> Light
                 </button>
                 <button
                    onClick={() => setTheme('dark')}
                    className={cn("px-6 py-2 rounded-lg flex items-center gap-2 transition-all", theme === 'dark' ? "bg-black/50 text-white shadow" : "hover:bg-white/10")}
                 >
                    <Moon className="w-4 h-4" /> Dark
                 </button>
               </div>
            </section>
          </div>
        )}

        {/* Appearance Settings */}
        {activeTab === 'appearance' && (
            <div className="space-y-8">
                <section>
                    <h3 className="text-xl font-medium mb-4">{language === 'en' ? 'Icon Style' : 'Icon Stil'}</h3>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setIconStyle('colorful')}
                            className={cn(
                                "px-6 py-3 rounded-xl border transition-all flex items-center gap-2",
                                iconStyle === 'colorful' ? "border-blue-500 bg-white/10" : "border-white/10"
                            )}
                        >
                            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-red-500 to-blue-500" />
                            Colorful
                        </button>
                        <button
                            onClick={() => setIconStyle('monochrome')}
                            className={cn(
                                "px-6 py-3 rounded-xl border transition-all flex items-center gap-2",
                                iconStyle === 'monochrome' ? "border-blue-500 bg-white/10" : "border-white/10"
                            )}
                        >
                            <div className="w-4 h-4 rounded-full bg-white border border-gray-500" />
                            Monochrome
                        </button>
                    </div>
                </section>
            </div>
        )}

        {/* System Settings */}
        {activeTab === 'system' && (
            <div className="space-y-8">
                <section>
                    <h3 className="text-xl font-medium mb-4">{language === 'en' ? 'Language' : 'Sprache'}</h3>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as any)}
                        className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-blue-500"
                    >
                        <option value="en">English</option>
                        <option value="de">Deutsch</option>
                    </select>
                </section>
            </div>
        )}

        {/* AI Settings */}
        {activeTab === 'ai' && (
            <div className="space-y-8">
                <section>
                    <h3 className="text-xl font-medium mb-4">Google AI Studio API</h3>
                    <p className="text-white/60 mb-4 text-sm">
                        {language === 'en'
                            ? 'Enter your API key to enable Gemini Assistant and Image Generation features.'
                            : 'Geben Sie Ihren API-Schlüssel ein, um den Gemini Assistant und die Bildgenerierung zu aktivieren.'}
                    </p>
                    <div className="relative">
                        <Key className="absolute left-4 top-3.5 w-5 h-5 text-white/40" />
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="AIzaSy..."
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-blue-500 font-mono"
                        />
                    </div>
                    <p className="mt-2 text-xs text-white/40">
                        Keys are stored locally in your browser.
                    </p>
                </section>
            </div>
        )}
      </div>
    </div>
  );
}
