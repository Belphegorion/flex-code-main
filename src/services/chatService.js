import api from './api';

export const chatService = {
  createOrGetChat: (participantId, jobId) => 
    api.post('/chat/create', { participantId, jobId }),
  getChats: () => api.get('/chat'),
  sendMessage: (chatId, text) => api.post('/chat/message', { chatId, text }),
  markAsRead: (chatId) => api.put(`/chat/${chatId}/read`)
};