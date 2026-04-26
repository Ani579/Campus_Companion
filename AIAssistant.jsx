import { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from './AuthContext';
import axios from 'axios';
import { Bot, Send, User } from 'lucide-react';

const AIAssistant = () => {
  const { user, apiStr } = useContext(AuthContext);
  const [messages, setMessages] = useState([
    { role: 'ai', text: `Hi ${user?.name?.split(' ')[0]}! I'm your Campus Companion AI Assistant. Ask me to explain a concept, generate a summary, or solve a problem!` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endOfMessagesRef = useRef(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(`${apiStr}/ai/chat`, { message: userMessage.text }, { headers: { Authorization: `Bearer ${user.token}` } });
      const aiMessage = { role: 'ai', text: res.data.reply };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I'm having trouble connecting right now. Ensure your API key is correctly integrated on the backend." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-100px)] flex flex-col">
      <div className="mb-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-lightBlue to-brand-blue flex items-center justify-center shadow-lg shadow-brand-blue/30 text-white">
          <Bot size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Study Assistant</h1>
          <p className="text-gray-500 text-sm">Powered by Gemini AI</p>
        </div>
      </div>

      <div className="flex-1 glass-panel rounded-2xl border border-gray-100 dark:border-gray-700/50 flex flex-col overflow-hidden">
        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex max-w-[80%] ${msg.role === 'user' ? 'self-end' : 'self-start'}`}>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-brand-blue text-white rounded-br-none' 
                  : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none shadow-sm'
              }`}>
                {msg.text.split('\n').map((line, i) => {
                  const imgMatch = line.match(/!\[.*?\]\((.*?)\)/);
                  if (imgMatch) {
                    return <img key={i} src={imgMatch[1]} alt="AI Generated" className="w-full max-w-sm rounded-xl my-2 shadow-md border border-gray-200 dark:border-gray-600" />;
                  }
                  return <p key={i} className="mb-2 last:mb-0">{line}</p>;
                })}
              </div>
            </div>
          ))}
          {loading && (
            <div className="self-start max-w-[80%] p-4 rounded-2xl rounded-bl-none bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-lightBlue animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-brand-lightBlue animate-bounce" style={{animationDelay: "0.2s"}}></div>
              <div className="w-2 h-2 rounded-full bg-brand-lightBlue animate-bounce" style={{animationDelay: "0.4s"}}></div>
            </div>
          )}
          <div ref={endOfMessagesRef} />
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700">
          <form onSubmit={handleSend} className="flex gap-2 relative">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 pl-6 pr-14 py-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-brand-lightBlue outline-none dark:text-white shadow-sm"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 top-2 bottom-2 aspect-square bg-brand-lightBlue hover:bg-blue-400 text-white rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <Send size={18} className="translate-x-0.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
