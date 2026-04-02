'use client';

import { useState, useEffect } from 'react';
import { Send, Sparkles, Heart, BookOpen, Coffee, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
export default function Home() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [magicText, setMagicText] = useState('');
  const [chatStarted, setChatStarted] = useState(false);
  
  // Naye Chat States
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
// App khulte hi history fetch karne wala Jadoo
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/history');
        const data = await response.json();
        
        // Agar database mein purani chat hai, toh direct chat screen open karo
        if (data && data.length > 0) {
          const formattedHistory = data.map((msg: any) => ({
            role: msg.role === 'model' ? 'ai' : 'user', // DB mein 'model' hai, frontend mein hum 'ai' use karte hain
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

  const handleStartChat = () => {
    if (selectedRole || magicText.trim() !== '') {
      setChatStarted(true);
      // Pehla welcome message
      setMessages([{ role: 'ai', content: `Hello! I'm here for you. Kaise ho aap?` }]);
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

  if (chatStarted) {
    return (
      <div className="flex flex-col h-screen bg-zinc-50 dark:bg-zinc-900">
        <header className="p-4 bg-white dark:bg-zinc-800 shadow-sm border-b border-zinc-200 dark:border-zinc-700">
          <h1 className="text-xl font-bold text-center text-zinc-800 dark:text-zinc-100 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            Magic Box
          </h1>
          <p className="text-center text-sm text-zinc-500">
            {selectedRole ? `Talking with ${selectedRole}` : 'Custom Companion'}
          </p>
        </header>

        <div className="flex-1 p-4 overflow-y-auto space-y-4 max-w-3xl mx-auto w-full">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] p-3 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-black dark:text-white rounded-bl-none shadow-sm'
              }`}>
                <div className="prose prose-sm md:prose-base prose-zinc dark:prose-invert max-w-none">
                  <ReactMarkdown>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-zinc-200 p-3 rounded-2xl rounded-bl-none shadow-sm">
                <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-white dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700">
          <div className="flex gap-2 max-w-3xl mx-auto">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..." 
              className="flex-1 p-3 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
            />
            <button 
              onClick={sendMessage}
              disabled={isLoading}
              className="bg-black hover:bg-zinc-800 disabled:bg-zinc-400 text-white p-3 rounded-xl transition-colors"
            >
              <Send className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Onboarding UI (same as before)
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white p-8 rounded-2xl shadow-xl">
        <div className="flex justify-center mb-6">
           <div className="bg-black text-white px-4 py-2 rounded-full flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span className="font-bold tracking-wider">MAGIC BOX</span>
           </div>
        </div>
        <h1 className="text-3xl font-bold text-center mb-2 text-zinc-800">Who do you need today?</h1>
        <p className="text-center text-zinc-500 mb-8">Select a persona or tell us what's on your mind.</p>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`p-4 flex flex-col items-center gap-2 rounded-xl border-2 transition-all ${
                selectedRole === role.id 
                  ? 'border-black bg-zinc-50 text-black' 
                  : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-600'
              }`}
            >
              {role.icon}
              <span className="font-medium">{role.name}</span>
            </button>
          ))}
        </div>

        <div className="relative flex items-center py-5">
          <div className="flex-grow border-t border-zinc-200"></div>
          <span className="flex-shrink-0 mx-4 text-zinc-400 text-sm font-medium">OR USE THE MAGIC BOX</span>
          <div className="flex-grow border-t border-zinc-200"></div>
        </div>

        <div className="mb-6 relative">
          <textarea
            value={magicText}
            onChange={(e) => {
              setMagicText(e.target.value);
              setSelectedRole(null); 
            }}
            placeholder="Tell me what's on your mind, and I'll become exactly who you need right now..."
            className="w-full p-4 pl-12 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none h-32 bg-zinc-50 text-zinc-800"
          ></textarea>
          <Sparkles className="absolute top-5 left-4 w-5 h-5 text-zinc-400" />
        </div>

        <button 
          onClick={handleStartChat}
          disabled={!selectedRole && magicText.trim() === ''}
          className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-zinc-800 transition-colors disabled:bg-zinc-300 disabled:cursor-not-allowed flex justify-center items-center gap-2"
        >
          Connect Now
        </button>
      </div>
    </div>
  );
}