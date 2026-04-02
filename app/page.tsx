'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Heart, BookOpen, Coffee, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function Home() {
  // --- States ---
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [magicText, setMagicText] = useState('');
  const [chatStarted, setChatStarted] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Helpers ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Messages change hote hi scroll down karein
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // --- History Logic ---
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/history');
        if (!response.ok) return;
        
        const data = await response.json();
        
        if (data && data.length > 0) {
          const formattedHistory = data.map((msg: any) => ({
            role: msg.role === 'model' ? 'ai' : 'user',
            content: msg.content
          }));
          setMessages(formattedHistory);
          setChatStarted(true); 
        }
      } catch (error) {
        console.error("Failed to load history", error);
      }
    };

    fetchHistory();
  }, []);

  const roles = [
    { id: 'BFF', name: 'BFF', icon: <Coffee className="w-6 h-6" /> },
    { id: 'Life Coach', name: 'Life Coach', icon: <Sparkles className="w-6 h-6" /> },
    { id: 'Partner', name: 'Partner', icon: <Heart className="w-6 h-6" /> },
    { id: 'Teacher', name: 'Teacher', icon: <BookOpen className="w-6 h-6" /> },
  ];

  // --- Handlers ---
  const handleStartChat = () => {
    if (selectedRole || magicText.trim() !== '') {
      setChatStarted(true);
      // Agar history khali hai tabhi welcome message dikhayein
      if (messages.length === 0) {
        setMessages([{ role: 'ai', content: `Hello! I'm here for you. Kaise ho aap?` }]);
      }
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage, 
          selectedRole: selectedRole,
          magicText: magicText 
        }),
      });

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'ai', content: data.text }]);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Chat UI ---
  if (chatStarted) {
    return (
      <div className="flex flex-col h-screen bg-zinc-50 dark:bg-zinc-950">
        <header className="sticky top-0 z-10 p-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
          <h1 className="text-lg font-bold text-center text-zinc-800 dark:text-zinc-100 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            Magic Box
          </h1>
          <p className="text-center text-xs text-zinc-500 uppercase tracking-widest mt-1">
            {selectedRole ? `Talking with ${selectedRole}` : 'Custom Companion'}
          </p>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 max-w-3xl mx-auto w-full">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-bl-none'
              }`}>
                <div className="prose prose-sm md:prose-base prose-zinc dark:prose-invert max-w-none break-words">
                  <ReactMarkdown>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-4 rounded-2xl rounded-bl-none shadow-sm">
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
              </div>
            </div>
          )}
          {/* Invisible anchor for scrolling */}
          <div ref={messagesEndRef} className="h-4" />
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex gap-2 max-w-3xl mx-auto items-end">
            <textarea 
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type your message..." 
              className="flex-1 p-3 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100 resize-none max-h-32"
            />
            <button 
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-800 text-white p-3.5 rounded-2xl transition-all shadow-md active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Onboarding UI ---
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-2xl border border-zinc-100 dark:border-zinc-800">
        <div className="flex justify-center mb-6">
           <div className="bg-zinc-900 dark:bg-blue-600 text-white px-5 py-2 rounded-full flex items-center gap-2 shadow-lg">
              <Sparkles className="w-5 h-5" />
              <span className="font-bold tracking-widest text-sm">MAGIC BOX</span>
           </div>
        </div>
        <h1 className="text-3xl font-extrabold text-center mb-2 text-zinc-900 dark:text-zinc-50">Who do you need today?</h1>
        <p className="text-center text-zinc-500 dark:text-zinc-400 mb-8">Select a persona or tell us what's on your mind.</p>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`p-4 flex flex-col items-center gap-3 rounded-2xl border-2 transition-all duration-200 ${
                selectedRole === role.id 
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600' 
                  : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <div className={`${selectedRole === role.id ? 'scale-110' : ''} transition-transform`}>
                {role.icon}
              </div>
              <span className="font-semibold text-sm">{role.name}</span>
            </button>
          ))}
        </div>

        <div className="relative flex items-center py-6">
          <div className="flex-grow border-t border-zinc-100 dark:border-zinc-800"></div>
          <span className="flex-shrink-0 mx-4 text-zinc-400 text-xs font-bold tracking-widest">OR DESCRIBE YOUR NEED</span>
          <div className="flex-grow border-t border-zinc-100 dark:border-zinc-800"></div>
        </div>

        <div className="mb-6 relative">
          <textarea
            value={magicText}
            onChange={(e) => {
              setMagicText(e.target.value);
              setSelectedRole(null); 
            }}
            placeholder="Tell me what's on your mind, and I'll become exactly who you need right now..."
            className="w-full p-5 pl-12 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-36 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400"
          ></textarea>
          <Sparkles className="absolute top-6 left-5 w-5 h-5 text-zinc-400" />
        </div>

        <button 
          onClick={handleStartChat}
          disabled={!selectedRole && magicText.trim() === ''}
          className="w-full bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white font-bold py-4 rounded-2xl hover:bg-zinc-800 dark:hover:bg-white transition-all shadow-xl disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-400 disabled:cursor-not-allowed flex justify-center items-center gap-2 active:scale-[0.98]"
        >
          Connect Now
        </button>
      </div>
    </div>
  );
}