import { createContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { chatService } from '../services/chatService';

export const ChatContext = createContext();

export const ChatProvider = ({ children, user }) => {
  const [socket, setSocket] = useState(null);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);

  useEffect(() => {
    if (user) {
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:4000');
      setSocket(newSocket);

      return () => newSocket.close();
    }
  }, [user]);

  const fetchChats = async () => {
    const data = await chatService.getChats();
    setChats(data.chats);
  };

  const sendMessage = async (chatId, text) => {
    const data = await chatService.sendMessage(chatId, text);
    
    if (socket) {
      socket.emit('send-message', {
        chatId,
        text,
        senderId: user._id
      });
    }
    
    return data;
  };

  return (
    <ChatContext.Provider value={{
      socket,
      chats,
      activeChat,
      fetchChats,
      sendMessage,
      setActiveChat
    }}>
      {children}
    </ChatContext.Provider>
  );
};