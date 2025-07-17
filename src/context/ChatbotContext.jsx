/** @jsxRuntime classic */
/** @jsx React.createElement */

// src/context/ChatbotContext.js
import React, { createContext, useContext, useState } from 'react';

const ChatbotContext = createContext();

export const ChatbotProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);

  const addBotMessage = (text) => {
    setMessages(prev => [...prev, {
      text,
      sender: 'bot',
      timestamp: new Date()
    }]);
  };

  return (
    <ChatbotContext.Provider value={{ messages, addBotMessage }}>
      {children}
    </ChatbotContext.Provider>
  );
};

export const useChatbot = () => useContext(ChatbotContext);