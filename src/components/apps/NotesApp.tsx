import React, { useState, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import { cn } from '../../utils/cn';
import { Plus, Trash2, Wand2, Save } from 'lucide-react';
import { chatWithGemini } from '../../utils/gemini';

interface Note {
  id: string;
  title: string;
  content: string;
  date: Date;
}

export function NotesApp() {
  const { apiKey, theme, language } = useOS();
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('os_notes');
    return saved ? JSON.parse(saved, (key, value) => key === 'date' ? new Date(value) : value) : [
        { id: '1', title: 'Welcome', content: 'Welcome to your AI-powered Notes app.', date: new Date() }
    ];
  });
  const [activeNoteId, setActiveNoteId] = useState<string | null>(notes[0]?.id || null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    localStorage.setItem('os_notes', JSON.stringify(notes));
  }, [notes]);

  const activeNote = notes.find(n => n.id === activeNoteId);

  const createNote = () => {
    const newNote = {
        id: Date.now().toString(),
        title: 'New Note',
        content: '',
        date: new Date()
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(notes.map(n => n.id === id ? { ...n, ...updates, date: new Date() } : n));
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
    if (activeNoteId === id) setActiveNoteId(null);
  };

  const handleAIAssist = async (action: 'fix' | 'continue') => {
    if (!activeNote || !apiKey) return;
    setIsProcessing(true);

    const prompt = action === 'fix'
        ? `Fix the grammar and improve the writing style of this text:\n\n${activeNote.content}`
        : `Continue writing this text creatively:\n\n${activeNote.content}`;

    try {
        const result = await chatWithGemini(apiKey, [], prompt);
        if (result.response) {
            updateNote(activeNote.id, { content: action === 'continue' ? activeNote.content + '\n' + result.response : result.response });
        }
    } catch (e) {
        console.error(e);
        alert('AI Error');
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-full text-gray-800 dark:text-gray-100 bg-white/50 dark:bg-black/50">
      {/* Sidebar List */}
      <div className="w-1/3 border-r border-gray-200 dark:border-white/10 flex flex-col bg-white/40 dark:bg-black/20">
        <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-white/10">
            <span className="font-semibold text-sm opacity-60">Notes</span>
            <button onClick={createNote} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors">
                <Plus className="w-4 h-4" />
            </button>
        </div>
        <div className="flex-1 overflow-y-auto">
            {notes.map(note => (
                <button
                    key={note.id}
                    onClick={() => setActiveNoteId(note.id)}
                    className={cn(
                        "w-full text-left p-4 border-b border-gray-100 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors",
                        activeNoteId === note.id && "bg-blue-500/10 dark:bg-blue-500/20"
                    )}
                >
                    <h4 className="font-medium truncate">{note.title || 'Untitled'}</h4>
                    <p className="text-xs opacity-50 truncate mt-1">{note.content || 'No additional text'}</p>
                    <span className="text-[10px] opacity-40 mt-2 block">
                        {note.date.toLocaleDateString()}
                    </span>
                </button>
            ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col bg-white dark:bg-[#1a1a1a]">
        {activeNote ? (
            <>
                {/* Toolbar */}
                <div className="h-12 border-b border-gray-200 dark:border-white/10 flex items-center justify-between px-4">
                    <span className="text-xs opacity-40">Last edited: {activeNote.date.toLocaleTimeString()}</span>
                    <div className="flex gap-2">
                        {apiKey && (
                            <>
                                <button
                                    onClick={() => handleAIAssist('fix')}
                                    disabled={isProcessing}
                                    className="px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-medium flex items-center gap-2 hover:bg-purple-500/20"
                                >
                                    <Wand2 className="w-3 h-3" /> Fix
                                </button>
                                <button
                                    onClick={() => handleAIAssist('continue')}
                                    disabled={isProcessing}
                                    className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-medium flex items-center gap-2 hover:bg-blue-500/20"
                                >
                                    <Wand2 className="w-3 h-3" /> Continue
                                </button>
                            </>
                        )}
                        <button
                            onClick={() => deleteNote(activeNote.id)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Input Area */}
                <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
                    <input
                        type="text"
                        value={activeNote.title}
                        onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
                        placeholder="Title"
                        className="text-3xl font-bold bg-transparent border-none outline-none placeholder:opacity-30"
                    />
                    <textarea
                        value={activeNote.content}
                        onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
                        placeholder="Start typing..."
                        className="flex-1 resize-none bg-transparent border-none outline-none leading-relaxed text-lg placeholder:opacity-30 font-light"
                    />
                </div>
            </>
        ) : (
            <div className="flex-1 flex items-center justify-center opacity-30">
                Select or create a note
            </div>
        )}
      </div>
    </div>
  );
}
