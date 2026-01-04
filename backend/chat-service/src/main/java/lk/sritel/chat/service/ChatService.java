package lk.sritel.chat.service;

import lk.sritel.chat.dto.MessageDto;
import lk.sritel.chat.model.*;
import lk.sritel.chat.repository.ChatMessageRepository;
import lk.sritel.chat.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {
    
    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final SimpMessagingTemplate messagingTemplate;
    
    @Transactional
    public ChatRoom createChatRoom(Long userId) {
        // Check if user already has an active chat room
        var existingRoom = chatRoomRepository.findByUserIdAndStatus(userId, ChatStatus.ACTIVE);
        if (existingRoom.isPresent()) {
            return existingRoom.get();
        }
        
        ChatRoom chatRoom = ChatRoom.builder()
                .roomId(UUID.randomUUID().toString())
                .userId(userId)
                .status(ChatStatus.ACTIVE)
                .build();
        
        return chatRoomRepository.save(chatRoom);
    }
    
    public ChatRoom getChatRoom(String roomId) {
        return chatRoomRepository.findByRoomId(roomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));
    }
    
    public List<ChatMessage> getChatHistory(String roomId) {
        return chatMessageRepository.findByRoomIdOrderBySentAtAsc(roomId);
    }
    
    @Transactional
    public ChatRoom closeChatRoom(String roomId) {
        ChatRoom chatRoom = getChatRoom(roomId);
        chatRoom.setStatus(ChatStatus.CLOSED);
        chatRoom.setClosedAt(LocalDateTime.now());
        return chatRoomRepository.save(chatRoom);
    }
    
    public List<ChatRoom> getUserChatRooms(Long userId) {
        return chatRoomRepository.findByUserId(userId);
    }
    
    @Transactional
    public MessageDto saveAndBroadcastMessage(String roomId, MessageDto messageDto) {
        // Save message to database
        ChatMessage chatMessage = ChatMessage.builder()
                .roomId(roomId)
                .senderId(messageDto.getSenderId())
                .senderName(messageDto.getSenderName())
                .messageType(MessageType.valueOf(messageDto.getMessageType()))
                .content(messageDto.getContent())
                .build();
        
        chatMessageRepository.save(chatMessage);
        
        // Broadcast to WebSocket subscribers
        messagingTemplate.convertAndSend(
                "/topic/room/" + roomId,
                messageDto
        );
        
        return messageDto;
    }
    
    public void sendSystemMessage(String roomId, String message) {
        MessageDto systemMessage = MessageDto.builder()
                .roomId(roomId)
                .senderName("System")
                .messageType("CHAT")
                .content(message)
                .sentAt(LocalDateTime.now())
                .build();
        
        messagingTemplate.convertAndSend(
                "/topic/room/" + roomId,
                systemMessage
        );
    }
}