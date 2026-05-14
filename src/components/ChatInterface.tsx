import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, RefreshCcw, MapPin, Phone, Globe, ExternalLink } from 'lucide-react';
import { gemini } from '../services/gemini';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'bot',
      text: "สวัสดีครับ! ยินดีต้อนรับสู่ **พะเยา เอ็ดดูบอท** โดยสำนักงานศึกษาธิการจังหวัดพะเยา มีอะไรให้ผมช่วยข้อมูลในวันนี้ไหมครับ? 😊"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Map history for Gemini
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const botResponseText = await gemini.chat(input, history);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: botResponseText || "ขออภัยครับ เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง",
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat Error:', error);
      setMessages(prev => [
        ...prev,
        {
          id: 'error',
          role: 'bot',
          text: "ขออภัยครับ ไม่สามารถเชื่อมต่อกับระบบได้ในขณะนี้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตของคุณ",
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    setMessages([messages[0]]);
  };

  const suggestions = [
    "ข้อมูลพื้นที่การศึกษาพะเยา",
    "ติดต่อศึกษาธิการจังหวัด",
    "ทุนการศึกษาจังหวัดพะเยา",
    "นโยบายเรียนดี มีความสุข",
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-brand-primary p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Bot size={24} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg leading-none">พะเยา เอ็ดดูบอท</h2>
            <p className="text-blue-200 text-xs mt-1">Smart Education Assistant</p>
          </div>
        </div>
        <button 
          onClick={clearHistory}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
          title="เริ่มใหม่"
        >
          <RefreshCcw size={20} />
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50"
      >
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex w-full mb-4",
                message.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div className={cn(
                "flex max-w-[85%] gap-2",
                message.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}>
                <div className={cn(
                  "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1",
                  message.role === 'user' ? "bg-brand-accent" : "bg-brand-primary"
                )}>
                  {message.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
                </div>
                <div className={cn(
                  "p-3 rounded-2xl shadow-sm",
                  message.role === 'user' 
                    ? "bg-brand-primary text-white rounded-tr-none font-medium" 
                    : "bg-white text-slate-800 rounded-tl-none border border-slate-100"
                )}>
                  <div className={cn(
                    "markdown-body", 
                    message.role === 'user' ? "prose-invert !text-white" : "text-slate-800"
                  )}>
                    <ReactMarkdown>{message.text}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="flex gap-2 items-center bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center">
                <Loader2 size={16} className="text-white animate-spin" />
              </div>
              <p className="text-slate-400 text-sm animate-pulse">กำลังพิมพ์...</p>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="px-4 py-2 flex flex-wrap gap-2 bg-white border-t border-slate-100">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => {
                setInput(s);
              }}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 py-1 px-3 rounded-full transition-colors duration-200 border border-slate-200"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="พิมพ์คำถามของคุณที่นี่..."
            className="flex-1 bg-slate-100 focus:bg-white border-none focus:ring-2 focus:ring-brand-primary/20 rounded-xl py-3 px-4 outline-none transition-all duration-200"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl shadow-lg shadow-brand-primary/20 transition-all active:scale-95"
          >
            <Send size={20} />
          </button>
        </form>
        <p className="text-[10px] text-center text-slate-400 mt-2">
          พะเยา เอ็ดดูบอท ให้ข้อมูลเบื้องต้นเท่านั้น โปรดตรวจสอบข้อมูลที่เป็นทางการอีกครั้ง
        </p>
      </div>
    </div>
  );
}
