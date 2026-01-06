# Smart Customer Support Chat - Setup Guide

## Overview
This is a complete WebSocket-based chat microservice with AI integration (Google Gemini API) for the Sri-Tel telecommunications dashboard.

## Tech Stack
- **Backend**: Spring Boot 3.x, Java 21, WebSocket (STOMP), JPA, PostgreSQL, WebFlux
- **Frontend**: React (Vite), Material UI, SockJS, STOMP
- **AI**: Google Gemini API with fallback simulation mode

---

## Backend Setup

### 1. Prerequisites
- Java 21
- Maven 3.6+
- PostgreSQL 12+

### 2. Database Configuration

Create a PostgreSQL database:
```sql
CREATE DATABASE chat_db;
```

### 3. Configure Application

Edit `backend/chat-service/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/chat_db
    username: YOUR_DB_USERNAME
    password: YOUR_DB_PASSWORD

gemini:
  api:
    key: YOUR_GEMINI_API_KEY  # Get from: https://aistudio.google.com/app/apikey
  simulation:
    enabled: true  # Enable fallback mode if API fails
```

### 4. Run the Chat Service

```bash
cd backend/chat-service
mvn clean install
mvn spring-boot:run
```

The service will start on **http://localhost:8083**

---

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Run the Frontend

```bash
npm run dev
```

The frontend will start on **http://localhost:5173**

---

## Architecture & Flow

### Message Flow:
1. **User sends message** → WebSocket (`/app/chat.sendMessage`)
2. **Server saves User Message** → PostgreSQL
3. **Server broadcasts User Message** → All clients (`/topic/public`)
4. **Server calls Gemini API** (async) → AI Response
5. **Server saves AI Response** → PostgreSQL
6. **Server broadcasts AI Response** → All clients (`/topic/public`)

### Resilience (Simulation Mode):
If the Gemini API fails (network error, invalid key, etc.), the service automatically falls back to **keyword-based simulation**:

- "bill" → Payment info response
- "data"/"package" → Data plan response
- "recharge" → Recharge instructions
- "service" → Service activation info
- "support" → Support contact info
- Default → Generic help message

---

## API Endpoints

### WebSocket
- **Connection**: `ws://localhost:8083/ws`
- **Subscribe**: `/topic/public`
- **Send**: `/app/chat.sendMessage`

### REST
- **GET** `/api/chat/history?sessionId={sessionId}` - Get chat history

---

## Testing the Chat

### 1. Start Services
```bash
# Terminal 1 - Backend
cd backend/chat-service
mvn spring-boot:run

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 2. Open Browser
Navigate to `http://localhost:5173`, login, and click the chat icon (bottom-right).

### 3. Test Messages
- "Hello" → Welcome message
- "How can I pay my bill?" → Billing info
- "What data packages do you have?" → Data plan info
- "I need help with recharge" → Recharge instructions

---

## Project Structure

### Backend
```
backend/chat-service/
├── src/main/java/lk/slt/chatservice/
│   ├── ChatServiceApplication.java       # Main application
│   ├── config/
│   │   ├── WebSocketConfig.java         # WebSocket configuration
│   │   └── WebClientConfig.java         # WebClient bean
│   ├── controller/
│   │   └── ChatController.java          # WebSocket & REST endpoints
│   ├── entity/
│   │   └── ChatMessage.java             # JPA entity
│   ├── repository/
│   │   └── ChatRepository.java          # Data access
│   └── service/
│       ├── ChatService.java             # Business logic
│       └── GeminiService.java           # AI integration
├── src/main/resources/
│   └── application.yml                  # Configuration
└── pom.xml                              # Dependencies
```

### Frontend
```
frontend/src/components/Chat/
└── ChatWidget.jsx                       # Chat UI component
```

---

## Configuration Options

### Gemini API
Get your API key from: https://aistudio.google.com/app/apikey

Set in `application.yml`:
```yaml
gemini:
  api:
    key: YOUR_API_KEY_HERE
```

### Simulation Mode
Enable/disable fallback:
```yaml
gemini:
  simulation:
    enabled: true  # true = enable fallback, false = return error message
```

---

## Troubleshooting

### Chat Not Connecting
- Check if chat-service is running on port 8083
- Verify WebSocket endpoint: `http://localhost:8083/ws`
- Check browser console for connection errors

### Database Errors
- Ensure PostgreSQL is running
- Verify database credentials in `application.yml`
- Check if database `chat_db` exists

### Gemini API Errors
- Verify API key is correct
- Check API quota/limits
- If API fails, simulation mode will activate automatically

### Port Conflicts
If port 8083 is already in use, change in `application.yml`:
```yaml
server:
  port: 8084  # Use different port
```

And update frontend ChatWidget.jsx:
```jsx
const socket = new SockJS('http://localhost:8084/ws');
```

---

## Features

✅ Real-time WebSocket communication  
✅ AI-powered responses (Google Gemini)  
✅ Fallback simulation mode  
✅ Message persistence (PostgreSQL)  
✅ Typing indicators  
✅ Auto-scroll to latest message  
✅ Elegant Material UI design  
✅ Session-based conversation tracking  

---

## Production Considerations

1. **Security**:
   - Add authentication to WebSocket connections
   - Use environment variables for sensitive data
   - Restrict CORS origins in `WebSocketConfig`

2. **Scaling**:
   - Use external message broker (RabbitMQ/Kafka) instead of simple broker
   - Implement Redis for session management
   - Add rate limiting to prevent abuse

3. **Monitoring**:
   - Add logging and metrics
   - Monitor WebSocket connections
   - Track Gemini API usage/costs

---

## License
MIT License - Sri-Tel Customer Care System

---

**Need Help?**  
Contact: support@sritel.lk
