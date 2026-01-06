# 📱 Sri-Tel Customer Care Portal

A comprehensive microservices-based customer care system for telecommunications, built with Spring Boot 3 (Java 21) and React. This platform enables customers to manage bills, payments, services, and interact with an AI-powered chat support system.

---

## 🌟 Features

### Customer Features
- 🔐 **User Authentication** - Secure login/registration with JWT tokens
- 💳 **Bill Management** - View bills, payment history, and download invoices
- 💰 **Payment Processing** - Multiple payment methods with instant confirmation
- 📞 **Service Activation** - Manage voice, data, SMS packages, roaming, and more
- 🤖 **AI Chat Support** - 24/7 intelligent customer support powered by Google Gemini API
- 🔔 **Notifications** - Email notifications and in-app dashboard alerts for bills and payments
- 📊 **Dashboard** - Comprehensive overview of account status and activities

### Technical Features
- 🏗️ **Microservices Architecture** - Independently deployable services
- 🔄 **Service Discovery** - Eureka for automatic service registration
- 🚪 **API Gateway** - Centralized routing and load balancing
- 💬 **WebSocket Communication** - Real-time chat with STOMP protocol
- � **Event-Driven Architecture** - Apache Kafka for asynchronous messaging
- �🗄️ **PostgreSQL Databases** - Dedicated database per microservice
- 🧠 **AI Integration** - Google Gemini API with fallback simulation mode
- 🔒 **Security** - JWT authentication and authorization

---

## 🏛️ Architecture

### Microservices Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        API Gateway                          │
│                    (Port: 8080)                             │
└─────────────────┬───────────────────────────────────────────┘
                  │
    ┌─────────────┼─────────────┬─────────────┬──────────────┬──────────────┐
    │             │             │             │              │              │
┌───▼───┐   ┌─────▼────┐   ┌────▼────┐   ┌───▼────┐   ┌────▼────┐   ┌────▼─────┐
│ User  │   │ Billing  │   │ Payment │   │Service │   │  Chat   │   │Notification
│Service│   │ Service  │   │ Service │   │Activation   │ Service │   │ Service  │
│:8081  │   │  :8082   │   │  :8084  │   │  :8085 │   │  :8083  │   │  :8086   │
└───┬───┘   └─────┬────┘   └────┬────┘   └───┬────┘   └────┬────┘   └────┬─────┘
    │             │              │            │              │              │
    └─────────────┴──────────────┴────────────┴──────────────┴──────────────┘
                              │                               │
                    ┌─────────▼──────────┐        ┌──────────▼───────────┐
                    │ Service Registry   │        │    Apache Kafka      │
                    │  (Eureka: 8761)    │        │   (Port: 9092)       │
                    └────────────────────┘        └──────────────────────┘
```

### Database Schema
- **User Service** → `userdb` (Users, Authentication)
- **Billing Service** → `billingdb` (Bills, Invoices)
- **Payment Service** → `paymentdb` (Transactions, Payment Methods)
- **Service Activation** → `servicedb` (Subscriptions, Services)
- **Chat Service** → `chat_db` (Messages, Sessions)
- **Notification Service** → `notification_db` (Notifications, Email logs)

---

## 🛠️ Technology Stack

### Backend
- **Java 21** - Latest LTS version
- **Spring Boot 3.5.9** - Application framework
- **Spring Cloud** - Microservices infrastructure
  - Eureka (Service Discovery)
  - Gateway (API Gateway)
- **Apache Kafka** - Event streaming platform
- **Spring Kafka** - Kafka integration
- **Spring WebSocket** - Real-time communication
- **Spring WebFlux** - Reactive API calls
- **Spring Data JPA** - Database ORM
- **PostgreSQL** - Primary database
- **JWT** - Token-based authentication
- **Maven** - Build tool

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool
- **Material UI (MUI)** - Component library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **SockJS + STOMP** - WebSocket client

### AI & Integration
- **Google Gemini API** - AI-powered chat responses
- **Fallback Simulation** - Keyword-based responses when API unavailable

---

## 📋 Prerequisites

- **Java Development Kit (JDK) 21+**
- **Maven 3.6+**
- **Apache Kafka 2.13-4.1.1+** (KRaft mode)
- **Node.js 18+ and npm**
- **PostgreSQL 12+**
- **Google Gemini API Key** (optional, falls back to simulation mode)

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/sri-tel-customer-care.git
cd sri-tel-customer-care
```

### 2. Database Setup

Create the required PostgreSQL databases:

```sql
CREATE DATABASE userdb;
CREATE DATABASE billingdb;
CREATE DATABASE paymentdb;
CREATE DATABASE servicedb;
CREATE DATABASE chat_db;
CREATE DATABASE notification_db;
```

### 3. Backend Configuration

Update database credentials in each microservice's `application.yml`:

**Example** (`backend/user-service/src/main/resources/application.yml`):
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/userdb
    username: postgres
    password: YOUR_PASSWORD
```

Repeat for all services with their respective database names.

### 4. Gemini API Key (Optional)

For the Chat Service, add your Gemini API key:

**File**: `backend/chat-service/src/main/resources/application.yml`
```yaml
gemini:
  api:
    key: YOUR_GEMINI_API_KEY
  simulation:
    enabled: true  # Enable fallback mode
```

Get your API key from: https://aistudio.google.com/app/apikey

### 5. Email Configuration (For Notifications)

For the Notification Service to send emails, configure Gmail SMTP:

**File**: `backend/notification-service/src/main/resources/application.yml`
```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: your-email@gmail.com
    password: your-app-specific-password  # Use Gmail App Password, not regular password
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
```

**To get Gmail App Password:**
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Generate App Password for "Mail"
4. Use that 16-character password in the configuration

### 6. Frontend Configuration

The frontend is pre-configured to connect to `http://localhost:8080` (API Gateway).

---

## ▶️ Running the Application

### Step 0: Start Apache Kafka

This project uses Kafka in **KRaft mode** (no ZooKeeper required):

```bash
cd D:\Softwares\kafka_2.13-4.1.1
bin\windows\kafka-server-start.bat config\server.properties
```

**Kafka runs on**: `localhost:9092`

### Step 1: Start Service Registry (Eureka)

```bash
cd backend/service-registry
mvn spring-boot:run
```

Wait until you see: `Started ServiceRegistryApplication`

**Access Eureka**: http://localhost:8761

### Step 2: Start API Gateway

```bash
cd backend/api-gateway
mvn spring-boot:run
```

**Gateway runs on**: http://localhost:8080

### Step 3: Start Microservices

Open separate terminals for each service:

```bash
# User Service (Port 8081)
cd backend/user-service
mvn spring-boot:run

# Billing Service (Port 8082)
cd backend/billing-service
mvn spring-boot:run

# Chat Service (Port 8083)
cd backend/chat-service
mvn spring-boot:run

# Payment Service (Port 8084)
cd backend/payment-service
mvn spring-boot:run

# Service Activation (Port 8085)
cd backend/service-activation
mvn spring-boot:run

# Notification Service (Port 8086)
cd backend/notification-service
mvn spring-boot:run
```

**Frontend runs on**: http://localhost:5173

---

## 📚 Microservices Details

### 🔐 User Service (Port 8081)
- User registration and authentication
- Profile management
- JWT token generation and validation
### Step 4: Start Frontend

```bash
cd frontend
npm install  # Run this only once
npm run dev
```

- **Database**: `userdb`

**Key Endpoints**:
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/users/{id}` - Get user details

### 💳 Billing Service (Port 8082)
- Bill generation and management
- Invoice retrieval
- Payment status tracking
- **Database**: `billingdb`

**Key Endpoints**:
- `GET /api/bills/user/{userId}` - Get user bills
- `GET /api/bills/{billId}` - Get bill details
- `POST /api/bills/generate/{userId}` - Generate new bill

### 💰 Payment Service (Port 8084)
- Payment processing
- Transaction history
- Multiple payment methods
- **Database**: `paymentdb`

**Key Endpoints**:
- `POST /api/payments/process` - Process payment
- `GET /api/payments/user/{userId}` - Get payment history
- `GET /api/payments/{paymentId}` - Get payment details

### 📞 Service Activation (Port 8085)
- Service subscription management
- Activation/deactivation of services
- Available services: Data, Voice, SMS, Roaming, Ring Tones
- **Database**: `servicedb`

**Key Endpoints**:
- `POST /api/services/activate` - Activate service
- `POST /api/services/deactivate/{serviceId}` - Deactivate service
- `GET /api/services/user/{userId}` - Get user services

### 🤖 Chat Service (Port 8083)
- Real-time WebSocket chat
- AI-powered responses (Gemini API)
- Keyword-based fallback simulation
- Message persistence
- **Database**: `chat_db`

**Key Endpoints**:
- **WebSocket**: `ws://localhost:8083/ws`
- **Subscribe**: `/topic/public`
- **Send**: `/app/chat.sendMessage`
- `GET /api/chat/history` - Get chat history

**Chat Keywords** (Simulation Mode):
- "bill", "payment" → Billing information
- "data", "package" → Data plan details
- "recharge" → Top-up instructions
- "service", "activate" → Service activation help
- "support", "help" → Contact information

### 🔔 Notification Service (Port 8086)
- Email notifications via Gmail SMTP
- In-app notifications displayed on dashboard
- Real-time notification updates (polling every 5 seconds)
- Event-driven notification system with Kafka
- Notification history and management
- **Kafka Consumer**: Listens to billing and payment events
- **Database**: `notification_db`

**Key Endpoints**:
- `POST /api/notifications` - Send notification
- `GET /api/notifications/user/{userId}` - Get user notifications
- `GET /api/notifications/user/{userId}/history` - Get notification history (paginated)
- `GET /api/notifications/{id}` - Get notification by ID
- **WebSocket**: `ws://localhost:8086/ws` (configured for future use)

**Kafka Topics Consumed**:
- `billing-events` - New bills generated, payment due reminders
- `payment-events` - Payment confirmations and transaction updates

**Implemented Features**:
- ✅ **Email Notifications**: Fully functional via Gmail SMTP, sends emails for bills and payments
- ✅ **In-App Notifications**: Stored in PostgreSQL database and displayed on user dashboard
- ✅ **Notification Persistence**: Complete history tracking with timestamp and status
- ✅ **Dashboard Integration**: Real-time notification display with 5-second polling
- ⚠️ **SMS Notifications**: Placeholder code only, not integrated with actual SMS provider
- ⚠️ **WebSocket Push**: Basic configuration present but not actively sending push notifications

## 🗃️ Database Schema Highlights

### User Service
```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  mobile_number VARCHAR(15) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Chat Service
```sql
CREATE TABLE chat_messages (
  id BIGSERIAL PRIMARY KEY,
  content VARCHAR(255) NOT NULL,
  sender VARCHAR(255) NOT NULL,
  user_id VARCHAR(255),
  session_id VARCHAR(255),
  created_at TIMESTAMP NOT NULL
);
```

---

## 🧪 Testing

### Test User Credentials
```json
{
  "username": "dhsjlkz",
  "password": "test123",
  "mobileNumber": "0774810840"
}
```

### API Testing with cURL

**Login**:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"dhsjlkz","password":"test123"}'
```

**Get Bills** (requires token):
```bash
curl http://localhost:8080/api/bills/user/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🎨 Frontend Structure

```
frontend/src/
├── components/
│   ├── auth/           # Login, Register
│   ├── Billing/        # Bill list, details
│   ├── Payment/        # Payment forms
│   ├── Services/       # Service management
│   ├── Chat/           # ChatWidget
│   ├── dashboard/      # Dashboard
│   └── Layout/         # Header, Sidebar
├── context/
│   └── AuthContext.jsx # Authentication state
├── services/
│   ├── api.js          # Axios config, auth, user
│   ├── billingService.js
│   ├── paymentService.js
│   ├── serviceService.js
│   ├── chatService.js
│   └── notificationService.js
└── App.jsx             # Main app component
```

---

## ⚙️ Configuration

### Changing Ports

If you need to change service ports, update:

1. **Backend**: `application.yml` → `server.port`
2. **Eureka Dashboard**: Check registered instances
3. **Frontend**: Update service URLs in respective service files

### Environment Variables

Set environment variables for sensitive data:

```bash
export DB_USERNAME=postgres
export DB_PASSWORD=yourpassword
export GEMINI_API_KEY=your_api_key
```

Reference in `application.yml`:
```yaml
spring:
  datasource:
    username: ${DB_USERNAME:postgres}
    password: ${DB_PASSWORD:postgres}
```

---

## 🐛 Troubleshooting

### Issue: "Connection Refused" on Frontend
**Solution**: Ensure API Gateway is running on port 8080

```bash
cd backend/api-gateway
mvn spring-boot:run
```

### Issue: Services not registering with Eureka
**Solution**: 
1. Start Service Registry first
2. Wait 30 seconds before starting other services
3. Check Eureka dashboard: http://localhost:8761

### Issue: Chat messages not saving
**Solution**: 
1. Verify PostgreSQL is running
2. Check `chat_db` database exists
3. Ensure `application.yml` has `ddl-auto: update` (not `create-drop`)

### Issue: Gemini API errors
**Solution**: 
- Verify API key is correct
- Check internet connection
- Enable simulation mode as fallback in `application.yml`

### Issue: Email notifications not sending
**Solution**: 
1. Check Gmail SMTP configuration in `notification-service/application.yml`
2. Ensure you're using Gmail App Password (not regular password)
3. Verify 2-Step Verification is enabled on Google Account
4. Check email credentials are correct
5. Review notification-service logs for SMTP errors

### Issue: Notifications not showing on dashboard
**Solution**: 
1. Verify notification-service is running on port 8086
2. Check `notification_db` database exists
3. Ensure Kafka is running and notification-service is consuming events
4. Check browser console for API errors

---

## 📂 Project Structure

```
sri-tel-customer-care/
├── backend/
│   ├── api-gateway/          # API Gateway (Port 8080)
│   ├── service-registry/     # Eureka Server (Port 8761)
│   ├── user-service/         # User Management (Port 8081)
│   ├── billing-service/      # Billing (Port 8082)
│   ├── chat-service/         # AI Chat (Port 8083)
│   ├── payment-service/      # Payments (Port 8084)
│   ├── service-activation/   # Services (Port 8085)
│   └── notification-service/ # Notifications (Port 8086)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
└── README.md
```

---

## 📬 How Notifications Work

The notification system follows an event-driven architecture using Apache Kafka:

### Flow:
1. **Event Generation**: When a bill is generated or payment is processed, the respective service publishes an event to Kafka
2. **Kafka Topics**: Events are published to `billing-events` or `payment-events` topics
3. **Notification Service**: Listens to these Kafka topics and consumes the events
4. **Processing**: 
   - Creates a notification record in `notification_db`
   - Sends email via Gmail SMTP (if enabled)
   - Stores notification for dashboard display
5. **Dashboard Display**: Frontend polls the notification API every 5 seconds to fetch new notifications

### Example Flow (Bill Generated):
```
Billing Service → Kafka (billing-events) → Notification Service → Email + Database → Dashboard
```

### What's Implemented:
- ✅ Kafka event-driven architecture
- ✅ Email notifications (Gmail SMTP)
- ✅ Database persistence
- ✅ Dashboard display with real-time polling
- ❌ SMS notifications (placeholder only)
- ❌ Real-time WebSocket push (configured but not used)

---

## 🎯 Future Enhancements

- [ ] Docker containerization
- [ ] Kubernetes orchestration
- [ ] Redis caching layer
- [ ] RabbitMQ message broker (alternative/additional)
- [ ] Prometheus + Grafana monitoring
- [ ] ELK Stack for logging
- [ ] Mobile application (React Native)
- [ ] Two-factor authentication (2FA)
- [ ] Payment gateway integration (Stripe/PayPal)

---

**⭐ If you find this project helpful, please give it a star!**
