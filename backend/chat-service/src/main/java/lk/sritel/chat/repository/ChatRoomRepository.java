package lk.sritel.chat.repository;

import lk.sritel.chat.model.ChatRoom;
import lk.sritel.chat.model.ChatStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    Optional<ChatRoom> findByRoomId(String roomId);
    List<ChatRoom> findByUserId(Long userId);
    List<ChatRoom> findByStatus(ChatStatus status);
    Optional<ChatRoom> findByUserIdAndStatus(Long userId, ChatStatus status);
}