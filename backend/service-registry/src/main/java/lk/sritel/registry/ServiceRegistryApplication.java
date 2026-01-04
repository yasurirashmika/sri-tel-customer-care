package lk.sritel.registry;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.Environment;

import java.net.InetAddress;
import java.net.UnknownHostException;

/**
 * Service Registry (Eureka Server) Application
 * 
 * This is the main entry point for the Service Registry microservice.
 * It acts as a central registry where all microservices register themselves
 * and discover other services for inter-service communication.
 * 
 * Key Features:
 * - Service Registration: All microservices register here on startup
 * - Service Discovery: Services can discover and communicate with each other
 * - Health Monitoring: Automatically removes unhealthy service instances
 * - Load Balancing: Distributes requests across multiple service instances
 * 
 * @author Sri Tel Development Team - Member 1
 * @version 1.0.0
 * @since 2026-01-04
 */
@SpringBootApplication
@EnableEurekaServer  // Enables Eureka Server functionality
public class ServiceRegistryApplication {

    /**
     * Main method - Application entry point
     * 
     * @param args Command line arguments
     */
    public static void main(String[] args) {
        try {
            // Run Spring Boot Application
            ConfigurableApplicationContext context = SpringApplication.run(
                ServiceRegistryApplication.class, args
            );
            
            // Get environment details
            Environment env = context.getEnvironment();
            String port = env.getProperty("server.port", "8761");
            String appName = env.getProperty("spring.application.name", "service-registry");
            String hostAddress = getHostAddress();
            
            // Display startup banner
            printStartupBanner(appName, port, hostAddress);
            
        } catch (Exception e) {
            System.err.println("\n❌ ERROR: Failed to start Service Registry");
            System.err.println("   Reason: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }

    /**
     * Get host address (IP)
     * 
     * @return Host IP address or localhost if unable to determine
     */
    private static String getHostAddress() {
        try {
            return InetAddress.getLocalHost().getHostAddress();
        } catch (UnknownHostException e) {
            return "localhost";
        }
    }

    /**
     * Print professional startup banner with all relevant information
     * 
     * @param appName Application name
     * @param port Server port
     * @param hostAddress Host IP address
     */
    private static void printStartupBanner(String appName, String port, String hostAddress) {
        String banner = """
                
                ╔═══════════════════════════════════════════════════════════════════════╗
                ║                                                                       ║
                ║           🚀 SRI TEL CUSTOMER CARE SYSTEM - SERVICE REGISTRY         ║
                ║                                                                       ║
                ╚═══════════════════════════════════════════════════════════════════════╝
                
                ✅ Service Registry Started Successfully!
                
                ┌───────────────────────────────────────────────────────────────────────┐
                │  APPLICATION INFORMATION                                              │
                ├───────────────────────────────────────────────────────────────────────┤
                │  Application Name    : %s                                  │
                │  Server Port         : %s                                             │
                │  Host Address        : %s                                        │
                │  Profile             : %s                                          │
                └───────────────────────────────────────────────────────────────────────┘
                
                ┌───────────────────────────────────────────────────────────────────────┐
                │  IMPORTANT URLS                                                       │
                ├───────────────────────────────────────────────────────────────────────┤
                │  📊 Eureka Dashboard  : http://localhost:%s                       │
                │  📊 Dashboard (IP)    : http://%s:%s                       │
                │  🏥 Health Check      : http://localhost:%s/actuator/health       │
                │  ℹ️  Application Info  : http://localhost:%s/actuator/info        │
                │  📈 Metrics           : http://localhost:%s/actuator/metrics      │
                │  🔍 Registered Apps   : http://localhost:%s/eureka/apps          │
                └───────────────────────────────────────────────────────────────────────┘
                
                ┌───────────────────────────────────────────────────────────────────────┐
                │  SERVICE REGISTRATION URL (For Other Microservices)                   │
                ├───────────────────────────────────────────────────────────────────────┤
                │  eureka.client.service-url.defaultZone=http://localhost:%s/eureka/│
                └───────────────────────────────────────────────────────────────────────┘
                
                ⏳ Waiting for microservices to register...
                
                📝 Note: All microservices should register themselves with this registry
                         for service discovery and communication.
                
                """.formatted(
                    appName,
                    port,
                    hostAddress,
                    getActiveProfile(),
                    port,
                    hostAddress, port,
                    port,
                    port,
                    port,
                    port,
                    port
                );
        
        System.out.println(banner);
    }

    /**
     * Get active Spring profile
     * 
     * @return Active profile name or "default"
     */
    private static String getActiveProfile() {
        String profile = System.getProperty("spring.profiles.active");
        return (profile != null && !profile.isEmpty()) ? profile : "default";
    }
}