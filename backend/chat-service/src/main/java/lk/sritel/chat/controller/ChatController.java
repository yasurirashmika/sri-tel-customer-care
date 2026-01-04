package lk.sritel.chat.controller;

import lk.sritel.chat.dto.MessageDto;
import lk.sritel.chat.model.ChatMessage;
import lk.sritel.chat.model.ChatRoom;
import lk.sritel.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class ChatController {
    
    private final ChatService chatService;
    
    @PostMapping("/room/create")
    public ResponseEntity<ChatRoom> createRoom(@RequestParam Long userId) {
        return ResponseEntity.ok(chatService.createChatRoom(userId));
    }
    
    @GetMapping("/room/{roomId}")
    public ResponseEntity<ChatRoom> getRoom(@PathVariable String roomId) {
        return ResponseEntity.ok(chatService.getChatRoom(roomId));
    }
    
    @GetMapping("/room/{roomId}/messages")
    public ResponseEntity<List<ChatMessage>> getMessages(@PathVariable String roomId) {
        return ResponseEntity.ok(chatService.getChatHistory(roomId));
    }
    
    @PostMapping("/room/{roomId}/close")
    public ResponseEntity<ChatRoom> closeRoom(@PathVariable String roomId) {
        return ResponseEntity.ok(chatService.closeChatRoom(roomId));
    }
    
    @GetMapping("/user/{userId}/rooms")
    public ResponseEntity<List<ChatRoom>> getUserRooms(@PathVariable Long userId) {
        return ResponseEntity.ok(chatService.getUserChatRooms(userId));
    }
}