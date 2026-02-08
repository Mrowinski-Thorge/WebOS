import React, { useState, useRef, useEffect } from 'react';
import { useOS } from '../context/OSContext';
import { chatWithGemini, generateImage } from '../utils/gemini';
import { Send, Sparkles, Loader2, X } from 'lucide-react';
import { cn } from '../utils/cn';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export function AssistantSidebar({
  isOpen,
  onClose,
  onOpenApp,
  onSetTimer
}: {
  isOpen: boolean;
  onClose: () => void;
  onOpenApp: (id: string) => void;
  onSetTimer: (seconds: number) => void;
}) {
  const { apiKey, glassStyle, setTheme, setGlassStyle, language, setWallpaper } = useOS();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: language === 'en' ? 'Hello! I am your AI Assistant. How can I help you today?' : 'Hallo! Ich bin dein AI-Assistent. Wie kann ich dir helfen?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    if (!apiKey) {
      setMessages(prev => [...prev,
        { role: 'user', text: input },
        { role: 'model', text: language === 'en' ? 'Please set your API Key in Settings first.' : 'Bitte erstelle erst deinen API-Schlüssel in den Einstellungen.' }
      ]);
      setInput('');
      return;
    }

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, parts: m.text }));
      const result = await chatWithGemini(apiKey, history, userMsg);

      setMessages(prev => [...prev, { role: 'model', text: result.response }]);

      // Handle OS Actions
      if (result.action) {
        switch (result.action.type) {
            case 'OPEN_APP':
                if (result.action.payload) onOpenApp(result.action.payload);
                break;
            case 'SET_TIMER':
                if (result.action.payload) onSetTimer(Number(result.action.payload));
                break;
            case 'CHANGE_THEME':
                if (['dark', 'light'].includes(result.action.payload)) setTheme(result.action.payload);
                if (['frosted', 'liquid'].includes(result.action.payload)) setGlassStyle(result.action.payload);
                break;
            case 'GENERATE_WALLPAPER':
                if (result.action.payload) {
                    const loadingText = language === 'en' ? '🎨 Generating wallpaper...' : '🎨 Erstelle Hintergrundbild...';
                    setMessages(prev => [...prev, { role: 'model', text: loadingText }]);

                    try {
                        const imageUrl = await generateImage(apiKey, result.action.payload);
                        setWallpaper(imageUrl);

                        setMessages(prev => {
                             const newMessages = [...prev];
                             // Remove the loading message if it's the last one
                             if (newMessages[newMessages.length - 1].text === loadingText) {
                                 newMessages.pop();
                             }
                             return [...newMessages, { role: 'model', text: `![Generated Wallpaper](${imageUrl})` }];
                        });
                    } catch (err) {
                        console.error("Wallpaper generation failed", err);
                         setMessages(prev => {
                             const newMessages = [...prev];
                             if (newMessages[newMessages.length - 1].text === loadingText) {
                                 newMessages.pop();
                             }
                             return [...newMessages, { role: 'model', text: language === 'en' ? "Failed to generate wallpaper." : "Fehler beim Erstellen des Hintergrundbilds." }];
                        });
                    }
                }
                break;
        }
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: 'Error connecting to Gemini.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={cn(
        "absolute right-0 top-0 h-full w-96 z-[100] border-l transition-all flex flex-col shadow-2xl",
        glassStyle === 'frosted'
            ? "backdrop-blur-2xl bg-black/60 border-white/10"
            : "backdrop-blur-lg bg-white/5 border-white/20"
    )}>
      {/* Header */}
      <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-white/5">
        <div className="flex items-center gap-2 text-white">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <span className="font-medium">Assistant</span>
        </div>
        <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-5 h-5" />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
            <div key={i} className={cn(
                "max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed",
                msg.role === 'user'
                    ? "bg-blue-600 text-white ml-auto rounded-tr-none"
                    : "bg-white/10 text-gray-100 mr-auto rounded-tl-none border border-white/5"
            )}>
                {/* Simple Markdown Image Support */}
                {msg.text.startsWith('![') ? (
                    <div>
                        <p className="mb-2 text-xs opacity-70">Generated Image:</p>
                        <img
                            src={msg.text.match(/\((.*?)\)/)?.[1]}
                            alt="Generated"
                            className="rounded-lg w-full h-auto border border-white/10"
                        />
                    </div>
                ) : msg.text}
            </div>
        ))}
        {isLoading && (
            <div className="flex items-center gap-2 text-white/50 text-xs ml-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Thinking...
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10 bg-white/5">
        <div className="relative">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={language === 'en' ? "Ask me anything..." : "Frag mich etwas..."}
                className="w-full bg-black/20 text-white rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 border border-white/5 placeholder:text-white/20"
            />
            <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-2 p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <Send className="w-4 h-4" />
            </button>
        </div>
      </div>
    </div>
  );
}
