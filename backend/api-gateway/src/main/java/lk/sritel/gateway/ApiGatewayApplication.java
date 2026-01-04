package lk.sritel.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.Environment;

/**
 * API Gateway Application
 * 
 * Central entry point for all client requests to microservices.
 * Provides routing, load balancing, authentication, and monitoring.
 * 
 * @author Sri Tel Development Team - Member 1
 * @version 1.0.0
 */
@SpringBootApplication
@EnableDiscoveryClient
public class ApiGatewayApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext context = SpringApplication.run(
            ApiGatewayApplication.class, args
        );
        
        Environment env = context.getEnvironment();
        String port = env.getProperty("server.port", "8080");
        
        printStartupBanner(port);
    }

    private static void printStartupBanner(String port) {
        String banner = """
                
                ╔═══════════════════════════════════════════════════════════════╗
                ║                                                               ║
                ║           🌐 SRI TEL API GATEWAY                             ║
                ║                                                               ║
                ╚═══════════════════════════════════════════════════════════════╝
                
                ✅ API Gateway Started Successfully!
                
                ┌───────────────────────────────────────────────────────────────┐
                │  GATEWAY INFORMATION                                          │
                ├───────────────────────────────────────────────────────────────┤
                │  Port             : %s                                        │
                │  Base URL         : http://localhost:%s                       │
                └───────────────────────────────────────────────────────────────┘
                
                ┌───────────────────────────────────────────────────────────────┐
                │  AVAILABLE ROUTES                                             │
                ├───────────────────────────────────────────────────────────────┤
                │  User Service     : http://localhost:%s/api/users/**          │
                │  Auth Service     : http://localhost:%s/api/auth/**           │
                │  Billing Service  : http://localhost:%s/api/billing/**        │
                │  Payment Service  : http://localhost:%s/api/payments/**       │
                │  Service Activation: http://localhost:%s/api/services/**      │
                │  Notifications    : http://localhost:%s/api/notifications/**  │
                └───────────────────────────────────────────────────────────────┘
                
                ┌───────────────────────────────────────────────────────────────┐
                │  MONITORING ENDPOINTS                                         │
                ├───────────────────────────────────────────────────────────────┤
                │  Health Check     : http://localhost:%s/actuator/health       │
                │  Gateway Routes   : http://localhost:%s/actuator/gateway/routes│
                │  Metrics          : http://localhost:%s/actuator/metrics      │
                └───────────────────────────────────────────────────────────────┘
                
                🔒 JWT Authentication Enabled
                📊 Service Discovery via Eureka (http://localhost:8761)
                ⚡ Load Balancing Enabled
                
                """.formatted(port, port, port, port, port, port, port, port, port, port, port);
        
        System.out.println(banner);
    }
}