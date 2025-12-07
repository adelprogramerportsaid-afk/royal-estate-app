import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

interface TrapDoorProps {
  onAdminAccess: () => void;
}

export const TrapDoor: React.FC<TrapDoorProps> = ({ onAdminAccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{text: string, from: 'bot'|'user'}[]>([
    {text: 'مرحباً بك في الدعم الفني للمنصة العقارية. كيف يمكنني مساعدتك؟', from: 'bot'}
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const newMsgs = [...messages, {text: input, from: 'user' as const}];
    setMessages(newMsgs);
    setInput('');

    // THE TRAP DOOR LOGIC
    if (input.trim() === '123456') {
      setTimeout(() => {
        setMessages(prev => [...prev, {text: 'جاري التحقق من الهوية... المستوى الثالث.', from: 'bot'}]);
        setTimeout(() => {
             onAdminAccess();
             setIsOpen(false);
        }, 1500);
      }, 500);
    } else {
      setTimeout(() => {
        setMessages(prev => [...prev, {text: 'جميع ممثلي الخدمة مشغولون حالياً. يرجى ترك رقم هاتفك.', from: 'bot'}]);
      }, 1000);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 w-14 h-14 bg-royal-900 rounded-full shadow-2xl flex items-center justify-center text-white z-50 hover:scale-110 transition-transform hover:rotate-12"
      >
        <MessageCircle size={28} />
      </button>

      {isOpen && (
        <div className="fixed bottom-24 left-6 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden flex flex-col animate-float" style={{animationDuration: '0.3s', animationName: 'fade-in-up'}}>
           {/* Header */}
           <div className="bg-royal-900 p-4 flex justify-between items-center text-white">
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
               <span className="font-bold text-sm">الدعم الفني المباشر</span>
             </div>
             <button onClick={() => setIsOpen(false)}><X size={18} /></button>
           </div>

           {/* Chat Area */}
           <div className="h-80 overflow-y-auto p-4 bg-slate-50 space-y-3">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                     msg.from === 'user' 
                     ? 'bg-royal-900 text-white rounded-br-none' 
                     : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'
                   }`}>
                     {msg.text}
                   </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
           </div>

           {/* Input */}
           <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
             <input 
               className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-royal-900"
               placeholder="اكتب رسالتك..."
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSend()}
             />
             <button onClick={handleSend} className="p-2 bg-royal-400 text-white rounded-full hover:bg-royal-900 transition-colors">
               <Send size={18} />
             </button>
           </div>
        </div>
      )}
    </>
  );
};