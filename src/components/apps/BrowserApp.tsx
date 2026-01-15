import React, { useState } from 'react';
import { useOS } from '../../context/OSContext';
import { cn } from '../../utils/cn';
import { ArrowLeft, ArrowRight, RotateCw, Search, Lock } from 'lucide-react';

export function BrowserApp() {
  const { theme } = useOS();
  const [url, setUrl] = useState('https://en.wikipedia.org/wiki/Glassmorphism');
  const [inputUrl, setInputUrl] = useState(url);
  const [isLoading, setIsLoading] = useState(false);

  const handleNavigate = (e?: React.FormEvent) => {
    e?.preventDefault();
    let target = inputUrl;
    if (!target.startsWith('http')) {
        target = 'https://' + target;
    }
    setUrl(target);
    setIsLoading(true);
  };

  return (
    <div className="flex flex-col h-full bg-white text-gray-900 rounded-b-xl overflow-hidden">
      {/* Browser Toolbar */}
      <div className={cn(
        "h-12 flex items-center gap-2 px-3 border-b transition-colors",
        theme === 'dark' ? "bg-[#333] border-white/10 text-white" : "bg-gray-100 border-gray-200"
      )}>
        <div className="flex gap-1">
            <button className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30">
                <ArrowLeft className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30">
                <ArrowRight className="w-4 h-4" />
            </button>
            <button
                onClick={() => { setIsLoading(true); const u = url; setUrl(''); setTimeout(() => setUrl(u), 10); }}
                className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10"
            >
                <RotateCw className="w-4 h-4" />
            </button>
        </div>

        <form onSubmit={handleNavigate} className="flex-1">
            <div className={cn(
                "w-full h-8 rounded-full flex items-center px-3 gap-2 text-sm transition-colors",
                theme === 'dark' ? "bg-black/20" : "bg-white border border-gray-200 shadow-sm"
            )}>
                <Lock className="w-3 h-3 opacity-50" />
                <input
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    className="flex-1 bg-transparent outline-none"
                />
            </div>
        </form>
      </div>

      {/* Content */}
      <div className="flex-1 relative bg-white">
        {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )}

        {/* Warning Overlay */}
        <div className="absolute top-0 w-full bg-yellow-100 text-yellow-800 text-xs py-1 px-4 text-center border-b border-yellow-200 z-20">
            Note: Many websites (Google, YouTube) block embedding. Try Wikipedia or simple sites.
        </div>

        <iframe
            src={url}
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            onLoad={() => setIsLoading(false)}
        />
      </div>
    </div>
  );
}
