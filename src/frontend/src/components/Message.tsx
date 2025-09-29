import React from 'react';
import { motion } from 'framer-motion';
import { User, Bot, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';

interface MessageProps {
  content: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean;
}

const Message: React.FC<MessageProps> = ({ content, isUser, timestamp, isTyping = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`flex gap-4 p-6 ${isUser ? 'bg-transparent' : 'bg-gray-50/50'} group`}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser 
          ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
          : 'bg-gradient-to-r from-green-500 to-teal-600'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      <div className="flex-1 space-y-2">
        {/* Header */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">{isUser ? 'You' : 'AI Assistant'}</span>
          <span className="text-gray-400">
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Content */}
        <div className="prose prose-sm max-w-none">
          {isTyping ? (
            <div className="flex items-center space-x-1">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-gray-500 text-sm ml-2">AI is typing...</span>
            </div>
          ) : (
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{content}</p>
          )}
        </div>

        {/* Actions */}
        {!isUser && !isTyping && (
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
              <Copy className="w-4 h-4" />
            </button>
            <button className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors">
              <ThumbsUp className="w-4 h-4" />
            </button>
            <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
              <ThumbsDown className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Message;