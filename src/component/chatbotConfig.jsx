/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';

const config = {
    welcomeMessage: "Welcome to our advanced chatbot! How can I assist you today?",
    responses: [
      {
        triggers: ["hello", "hi", "hey"],
        response: "Hello there! What brings you here today?"
      },
      {
        triggers: ["bye", "goodbye", "exit"],
        richResponse: {
          type: "card",
          title: "Goodbye!",
          description: "Thank you for chatting with us. Come back anytime!",
          image: "/goodbye.png"
        }
      },
      {
        triggers: ["menu", "options", "choices"],
        richResponse: {
          type: "button",
          text: "What would you like to do?",
          options: ["Shop", "Get Support", "Account Help"]
        }
      }
    ],
    flows: [
      {
        trigger: "What would you like to do?",
        options: ["Shop", "Get Support"],
        response: {
          type: "button",
          text: "Please select a category:",
          options: ["Electronics", "Clothing", "Home Goods"]
        }
      }
    ],
    defaultResponse: "I'm not sure I understand. Could you try rephrasing?",
    responseDelay: 800,
    inputPlaceholder: "Type your message here...",
    sendButtonText: "Send",
    theme: {
      backgroundColor: "#ffffff",
      primaryColor: "#4f46e5",
      textColor: "#111827",
      fontFamily: "'Inter', sans-serif"
    }
  };
  
  export default config;