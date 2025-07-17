/** @jsxRuntime classic */
/** @jsx React.createElement */


import  React, { useCallback, useEffect, useState } from 'react';
import chatbotConfig from './chatbotConfig';

const ChatbotAdvanced = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState('');

  useEffect(() => {
    const savedConversation = localStorage.getItem('chatbot-conversation');
    if (savedConversation) {
      const { id, messages: savedMessages } = JSON.parse(savedConversation);
      setConversationId(id);
      setMessages(savedMessages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      })));
    } else {
      const newId = Math.random().toString(36).substring(2, 11);
      setConversationId(newId);
      if (chatbotConfig.welcomeMessage) {
        addBotMessage({
          type: 'text',
          text: chatbotConfig.welcomeMessage
        });
      }
    }
   
  }, [addBotMessage]);

  useEffect(() => {
    if (messages.length > 0) {
      const conversation = {
        id: conversationId,
        messages: messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp.toISOString()
        }))
      };
      localStorage.setItem('chatbot-conversation', JSON.stringify(conversation));
    }
  }, [messages, conversationId]);

  const addMessage = (content, sender) => {
    setMessages(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 11),
        content,
        sender,
        timestamp: new Date()
      }
    ]);
  };

  const addBotMessage = (content) => {
    addMessage(content, 'bot');
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    addMessage({ type: 'text', text: inputValue }, 'user');
    setInputValue('');
    setIsTyping(true);

    const response = await generateAdvancedResponse(inputValue, messages);
    addBotMessage(response);
    setIsTyping(false);
  };

  const handleButtonSelect = (option) => {
    addMessage({ type: 'text', text: option }, 'user');
    setIsTyping(true);
    
    setTimeout(() => {
      const response = generateAdvancedResponse(option, messages);
      addBotMessage(response);
      setIsTyping(false);
    }, chatbotConfig.responseDelay || 800);
  };

  const generateAdvancedResponse = useCallback(
    async (input, history) => {
      const exactMatch = chatbotConfig.responses.find(r =>
        r.triggers.some(trigger => 
          new RegExp(`\\b${trigger}\\b`, 'i').test(input)
        )
      );

      if (exactMatch) {
        if (exactMatch.richResponse) return exactMatch.richResponse;
        return { type: 'text', text: exactMatch.response };
      }

      const lastMessage = history[history.length - 2]?.content;
      if (lastMessage?.type === 'button') {
        const flowRule = chatbotConfig.flows?.find(flow =>
          flow.trigger === lastMessage.text &&
          flow.options.includes(input)
        );
        if (flowRule) {
          return flowRule.response;
        }
      }

      const detectedIntent = detectIntent(input);
      if (detectedIntent) {
        return {
          type: 'button',
          text: detectedIntent.question,
          options: detectedIntent.options
        };
      }

      return {
        type: 'text',
        text: chatbotConfig.defaultResponse || "I'm not sure I understand."
      };
    },
    []
  );

  const detectIntent = (input) => {
    if (/help|support|assist/i.test(input)) {
      return {
        question: "What do you need help with?",
        options: ["Account Issues", "Product Info", "Technical Support"]
      };
    }
    if (/product|item|goods/i.test(input)) {
      return {
        question: "Which product category interests you?",
        options: ["Electronics", "Clothing", "Home Goods"]
      };
    }
    return null;
  };

  const renderContent = (content) => {
    switch (content.type) {
      case 'text':
        return <p>{content.text}</p>;
      case 'button':
        return (
          <div className="button-options">
            <p>{content.text}</p>
            {content.options.map((option, i) => (
              <button 
                key={i} 
                onClick={() => handleButtonSelect(option)}
              >
                {option}
              </button>
            ))}
          </div>
        );
      case 'image':
        return (
          <div className="image-content">
            <img src={content.url} alt={content.caption || ''} />
            {content.caption && <p>{content.caption}</p>}
          </div>
        );
      case 'card':
        return (
          <div className="card-content">
            {content.image && <img src={content.image} alt={content.title} />}
            <h4>{content.title}</h4>
            <p>{content.description}</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="chatbot-container" style={chatbotConfig.theme}>
      <div className="chatbot-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.sender}`}>
            {renderContent(msg.content)}
            <small>{msg.timestamp.toLocaleTimeString()}</small>
          </div>
        ))}
        {isTyping && (
          <div className="message bot typing-indicator">
            <div className="typing-dots">
              <span>.</span><span>.</span><span>.</span>
            </div>
          </div>
        )}
      </div>
      <div className="chatbot-input">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={chatbotConfig.inputPlaceholder}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} disabled={isTyping}>
          {isTyping ? '...' : chatbotConfig.sendButtonText}
        </button>
      </div>
    </div>
  );
};

export default ChatbotAdvanced;