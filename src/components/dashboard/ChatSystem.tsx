import React, { useState, useRef, useEffect } from 'react';
import { Send, X, MessageCircle, Paperclip } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface ChatMessage {
  id: string;
  sender: 'user' | 'admin';
  senderName: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
}

interface ChatSystemProps {
  userRole: 'seller' | 'zra_officer';
  userName: string;
  targetUser?: string;
  onClose: () => void;
}

export const ChatSystem: React.FC<ChatSystemProps> = ({ 
  userRole, 
  userName, 
  targetUser, 
  onClose 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'admin',
      senderName: 'ZRA Support',
      message: 'Hello! How can we help you today?',
      timestamp: new Date(Date.now() - 3600000),
      isRead: true
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      senderName: userName,
      message: newMessage,
      timestamp: new Date(),
      isRead: false
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate admin response
    if (userRole === 'seller') {
      setIsTyping(true);
      setTimeout(() => {
        const adminResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'admin',
          senderName: 'ZRA Officer',
          message: 'Thank you for your message. We will review your inquiry and get back to you within 24 hours.',
          timestamp: new Date(),
          isRead: true
        };
        setMessages(prev => [...prev, adminResponse]);
        setIsTyping(false);
      }, 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <CardHeader className="border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <MessageCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {userRole === 'seller' ? 'Contact ZRA Support' : `Chat with ${targetUser}`}
                </h3>
                <p className="text-sm text-gray-600">
                  {userRole === 'seller' ? 'Get help with tax compliance and issues' : 'Seller support conversation'}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm font-medium mb-1">{message.senderName}</p>
                <p className="text-sm">{message.message}</p>
                <p className={`text-xs mt-2 ${
                  message.sender === 'user' ? 'text-blue-200' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl px-4 py-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Message Input */}
        <div className="border-t p-4">
          <div className="flex space-x-3">
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                rows={2}
                className="w-full rounded-xl border border-gray-300 bg-white/80 backdrop-blur-sm px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all duration-300 resize-none"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="p-2"
                title="Attach file"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                size="sm"
                className="p-2"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {userRole === 'seller' && (
            <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-800 font-medium mb-2">Common Topics:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  'Tax calculation help',
                  'Compliance issues',
                  'Payment problems',
                  'Account verification',
                  'Technical support'
                ].map((topic) => (
                  <button
                    key={topic}
                    onClick={() => setNewMessage(topic)}
                    className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};