import api from './api';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const chatService = {
  createChatRoom: async (userId) => {
    const response = await api.post(`/chat/room/create?userId=${userId}`);
    return response.data;
  },

  getChatHistory: async (roomId) => {
    const response = await api.get(`/chat/room/${roomId}/messages`);
    return response.data;
  },

  connectWebSocket: (roomId, onMessageReceived) => {
    const socket = new SockJS('http://localhost:8086/ws');
    const stompClient = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        stompClient.subscribe(`/topic/room/${roomId}`, (message) => {
          onMessageReceived(JSON.parse(message.body));
        });
      },
    });
    stompClient.activate();
    return stompClient;
  },

  sendMessage: (stompClient, roomId, message) => {
    stompClient.publish({
      destination: `/app/chat/${roomId}/send`,
      body: JSON.stringify(message),
    });
  },
};

export default chatService;