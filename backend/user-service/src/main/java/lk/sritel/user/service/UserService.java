package lk.sritel.user.service;

import lk.sritel.user.dto.*;
import lk.sritel.user.model.User;
import lk.sritel.user.exception.DuplicateUserException;
import lk.sritel.user.exception.InvalidCredentialsException;
import lk.sritel.user.exception.UserNotFoundException;
import lk.sritel.user.repository.UserRepository;
import lk.sritel.user.util.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final KafkaProducerService kafkaProducerService;

    public UserService(UserRepository userRepository, 
                      PasswordEncoder passwordEncoder,
                      JwtUtil jwtUtil,
                      KafkaProducerService kafkaProducerService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.kafkaProducerService = kafkaProducerService;
    }

    public AuthResponse register(RegisterRequest request) {
        logger.info("Processing registration for mobile: {}", request.getMobileNumber());
        
        // Check if user already exists
    if (userRepository.existsByMobileNumber(request.getMobileNumber())) {
    return new AuthResponse(
        null,
        null,
        "Mobile number already registered",
        false
    );
}

if (userRepository.existsByEmail(request.getEmail())) {
    return new AuthResponse(
        null,
        null,
        "Email already registered",
        false
    );
}


        // Create new user
        User user = new User();
        user.setMobileNumber(request.getMobileNumber());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setAddress(request.getAddress());
        user.setStatus("ACTIVE");

        User savedUser = userRepository.save(user);
        logger.info("User registered successfully: {}", savedUser.getMobileNumber());

        // Generate JWT token
        String token = jwtUtil.generateToken(savedUser.getMobileNumber(), savedUser.getId());

        // Send Kafka event for user registration
        UserEventDTO event = new UserEventDTO(
            "REGISTRATION",
            savedUser.getId(),
            savedUser.getMobileNumber(),
            savedUser.getEmail(),
            savedUser.getFullName(),
            LocalDateTime.now(),
            "New user registered successfully"
        );
        kafkaProducerService.sendRegistrationEvent(event);

        return new AuthResponse(
            token,
            convertToDTO(savedUser),
            "Registration successful",
            true
        );
    }

    public AuthResponse login(LoginRequest request) {
        logger.info("Processing login for mobile: {}", request.getMobileNumber());
        
        User user = userRepository.findByMobileNumber(request.getMobileNumber())
            .orElseThrow(() -> new InvalidCredentialsException("Invalid mobile number or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid mobile number or password");
        }

        if (!"ACTIVE".equals(user.getStatus())) {
            throw new InvalidCredentialsException("Account is not active");
        }

        logger.info("User logged in successfully: {}", user.getMobileNumber());

        String token = jwtUtil.generateToken(user.getMobileNumber(), user.getId());

        // Send Kafka event for user login
        UserEventDTO event = new UserEventDTO(
            "LOGIN",
            user.getId(),
            user.getMobileNumber(),
            user.getEmail(),
            user.getFullName(),
            LocalDateTime.now(),
            "User logged in successfully"
        );
        kafkaProducerService.sendLoginEvent(event);

        return new AuthResponse(
            token,
            convertToDTO(user),
            "Login successful",
            true
        );
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        return convertToDTO(user);
    }

    public UserDTO getUserByMobileNumber(String mobileNumber) {
        User user = userRepository.findByMobileNumber(mobileNumber)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        return convertToDTO(user);
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public UserDTO updateUser(Long id, UserDTO userDTO) {
        logger.info("Processing update for user ID: {}", id);
        
        User user = userRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (userDTO.getFullName() != null) {
            user.setFullName(userDTO.getFullName());
        }
        if (userDTO.getEmail() != null) {
            user.setEmail(userDTO.getEmail());
        }
        if (userDTO.getAddress() != null) {
            user.setAddress(userDTO.getAddress());
        }
        if (userDTO.getStatus() != null) {
            user.setStatus(userDTO.getStatus());
        }

        User updatedUser = userRepository.save(user);
        logger.info("User updated successfully: {}", updatedUser.getMobileNumber());

        // Send Kafka event for user update
        UserEventDTO event = new UserEventDTO(
            "UPDATE",
            updatedUser.getId(),
            updatedUser.getMobileNumber(),
            updatedUser.getEmail(),
            updatedUser.getFullName(),
            LocalDateTime.now(),
            "User profile updated"
        );
        kafkaProducerService.sendUserEvent(event);

        return convertToDTO(updatedUser);
    }

    private UserDTO convertToDTO(User user) {
        return new UserDTO(
            user.getId(),
            user.getMobileNumber(),
            user.getFullName(),
            user.getEmail(),
            user.getAddress(),
            user.getStatus()
        );
    }
}