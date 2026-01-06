package lk.sritel.chat.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class GeminiService {
    
    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    
    @Value("${gemini.api.key}")
    private String apiKey;
    
    @Value("${gemini.api.url}")
    private String apiUrl;
    
    @Value("${gemini.simulation.enabled:true}")
    private boolean simulationEnabled;
    
    public GeminiService(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
    }
    
    /**
     * Generate AI response using Gemini API with fallback to simulation mode
     */
    public String generateResponse(String userMessage) {
        try {
            log.info("Attempting to call Gemini API for message: {}", userMessage);
            
            // Try to call Gemini API
            String response = callGeminiApi(userMessage);
            log.info("Successfully received response from Gemini API");
            return response;
            
        } catch (Exception e) {
            log.error("Error calling Gemini API: {}. Falling back to simulation mode.", e.getMessage());
            
            // Fallback to simulation mode
            if (simulationEnabled) {
                return generateSimulatedResponse(userMessage);
            } else {
                return "I apologize, but I'm currently experiencing technical difficulties. Please try again later or contact our support team.";
            }
        }
    }
    
    /**
     * Call the actual Gemini API
     */
    private String callGeminiApi(String userMessage) {
        try {
            // Build request body
            Map<String, Object> requestBody = buildGeminiRequest(userMessage);
            
            // Make API call
            String response = webClient.post()
                    .uri(apiUrl + "?key=" + apiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(10))
                    .block();
            
            // Parse response
            return parseGeminiResponse(response);
            
        } catch (Exception e) {
            log.error("Exception in callGeminiApi: {}", e.getMessage());
            throw new RuntimeException("Failed to call Gemini API", e);
        }
    }
    
    /**
     * Build request body for Gemini API
     */
    private Map<String, Object> buildGeminiRequest(String userMessage) {
        Map<String, Object> request = new HashMap<>();
        
        Map<String, Object> part = new HashMap<>();
        part.put("text", "You are a helpful customer support assistant for Sri-Tel, a telecommunications company. " +
                "Answer the following customer query concisely and professionally: " + userMessage);
        
        Map<String, Object> content = new HashMap<>();
        content.put("parts", new Object[]{part});
        
        request.put("contents", new Object[]{content});
        
        return request;
    }
    
    /**
     * Parse Gemini API response
     */
    private String parseGeminiResponse(String responseJson) {
        try {
            JsonNode rootNode = objectMapper.readTree(responseJson);
            JsonNode candidates = rootNode.path("candidates");
            
            if (candidates.isArray() && candidates.size() > 0) {
                JsonNode firstCandidate = candidates.get(0);
                JsonNode content = firstCandidate.path("content");
                JsonNode parts = content.path("parts");
                
                if (parts.isArray() && parts.size() > 0) {
                    String text = parts.get(0).path("text").asText();
                    return text.trim();
                }
            }
            
            throw new RuntimeException("Invalid response format from Gemini API");
            
        } catch (Exception e) {
            log.error("Error parsing Gemini response: {}", e.getMessage());
            throw new RuntimeException("Failed to parse Gemini response", e);
        }
    }
    
    /**
     * Generate simulated response based on keywords (Fallback mode)
     */
    private String generateSimulatedResponse(String userMessage) {
        log.info("Generating simulated response for: {}", userMessage);
        
        String lowerMessage = userMessage.toLowerCase();
        
        // Keyword-based responses
        if (lowerMessage.contains("bill") || lowerMessage.contains("payment") || lowerMessage.contains("pay")) {
            return "You can view and pay your bills through the Billing section on your dashboard. " +
                   "We accept multiple payment methods including credit cards, debit cards, and online banking.";
        }
        
        if (lowerMessage.contains("data") || lowerMessage.contains("internet") || lowerMessage.contains("package")) {
            return "Sri-Tel offers various data packages to suit your needs. You can check available packages " +
                   "in the Services section and activate them instantly. Would you like to know about specific data plans?";
        }
        
        if (lowerMessage.contains("recharge") || lowerMessage.contains("reload") || lowerMessage.contains("top up")) {
            return "You can recharge your account easily through the Payment section on your dashboard. " +
                   "We support instant recharges with real-time balance updates.";
        }
        
        if (lowerMessage.contains("service") || lowerMessage.contains("activate") || lowerMessage.contains("subscription")) {
            return "To activate or manage services, please visit the Service Activation section. " +
                   "You can subscribe to voice, data, and special services with just a few clicks.";
        }
        
        if (lowerMessage.contains("support") || lowerMessage.contains("help") || lowerMessage.contains("contact")) {
            return "For immediate assistance, you can reach our 24/7 customer support at 1234 or email us at support@sritel.lk. " +
                   "How can I help you today?";
        }
        
        if (lowerMessage.contains("hello") || lowerMessage.contains("hi") || lowerMessage.contains("hey")) {
            return "Hello! Welcome to Sri-Tel Customer Support. I'm here to assist you with billing, services, " +
                   "payments, and any questions you may have. How can I help you today?";
        }
        
        if (lowerMessage.contains("thank")) {
            return "You're welcome! If you have any other questions, feel free to ask. We're here to help!";
        }
        
        // Default response
        return "Thank you for contacting Sri-Tel. I'm here to help you with billing, payments, data packages, " +
               "service activation, and general inquiries. Could you please provide more details about your query?";
    }
}
