import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Send, LogOut, Plus, Trash2, Settings } from 'lucide-react';
import Message from './Message';

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatInterface: React.FC = () => {
  const { user, logout } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Mock AI responses
  const aiResponses = [
    "I'm an AI assistant created to help you with various tasks and questions. How can I assist you today?",
    "That's an interesting question! Let me think about that for a moment...",
    "I'd be happy to help you with that. Here's what I think...",
    "Based on what you've shared, I believe the best approach would be...",
    "That's a great point! Here's my perspective on that topic...",
    "I understand what you're looking for. Let me provide you with a detailed response...",
    "Thanks for sharing that with me. Here's how I would approach this situation...",
    "I appreciate your question. This is definitely something worth exploring further..."
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI typing delay
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500 + Math.random() * 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-64 bg-white border-r border-gray-200 flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">{user?.name}</p>
              <p className="text-gray-500 text-xs">{user?.email}</p>
            </div>
          </div>
          
          <button
            onClick={clearChat}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 p-4">
          <div className="space-y-2">
            <div className="p-3 bg-gray-100 rounded-lg">
              <p className="text-sm font-medium text-gray-900">Current Chat</p>
              <p className="text-xs text-gray-500">{messages.length} messages</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <button
            onClick={clearChat}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear Chat
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white border-b border-gray-200 px-6 py-4"
        >
          <h1 className="text-xl font-semibold text-gray-900">AI Chat Assistant</h1>
          <p className="text-sm text-gray-500">Ask me anything - I'm here to help!</p>
        </motion.div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence>
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 flex items-center justify-center p-8"
              >
                <div className="text-center max-w-md">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Welcome to AI Chat!
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Start a conversation with our AI assistant. Ask questions, get help, or just chat!
                  </p>
                  <div className="space-y-2 text-left">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">💡 Try asking: "What can you help me with?"</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">🚀 Or: "Tell me something interesting"</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="max-w-4xl mx-auto">
                {messages.map((message) => (
                  <Message
                    key={message.id}
                    content={message.content}
                    isUser={message.isUser}
                    timestamp={message.timestamp}
                  />
                ))}
                {isTyping && (
                  <Message
                    content=""
                    isUser={false}
                    timestamp={new Date()}
                    isTyping={true}
                  />
                )}
              </div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white border-t border-gray-200 p-4"
        >
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="flex gap-4">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message here..."
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  rows={1}
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Press Enter to send, Shift + Enter for new line
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ChatInterface;