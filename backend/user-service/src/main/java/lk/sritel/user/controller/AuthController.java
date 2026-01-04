package lk.sritel.user.controller;

import jakarta.validation.Valid;
import lk.sritel.user.dto.AuthResponse;
import lk.sritel.user.dto.LoginRequest;
import lk.sritel.user.dto.RegisterRequest;
import lk.sritel.user.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
// @CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        logger.info("Registration request received for mobile: {}", request.getMobileNumber());
        AuthResponse response = userService.register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        logger.info("Login request received for mobile: {}", request.getMobileNumber());
        AuthResponse response = userService.login(request);
        return ResponseEntity.ok(response);
    }
}