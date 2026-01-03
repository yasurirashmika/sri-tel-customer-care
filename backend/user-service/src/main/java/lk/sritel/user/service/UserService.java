package main.java.lk.sritel.user.service;

import lk.sritel.user.dto.*;
import lk.sritel.user.model.User;
import lk.sritel.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByMobileNumber(request.getMobileNumber())) {
            return new AuthResponse(null, null, "Mobile number already registered", false);
        }
        
        if (userRepository.existsByEmail(request.getEmail())) {
            return new AuthResponse(null, null, "Email already registered", false);
        }
        
        User user = new User();
        user.setMobileNumber(request.getMobileNumber());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setAddress(request.getAddress());
        user.setStatus(User.AccountStatus.ACTIVE);
        user.setCreatedAt(LocalDateTime.now());
        
        user = userRepository.save(user);
        
        String token = UUID.randomUUID().toString();
        UserDTO userDTO = convertToDTO(user);
        
        return new AuthResponse(token, userDTO, "Registration successful", true);
    }
    
    @Transactional
    public AuthResponse login(LoginRequest request) {
        Optional<User> userOpt = userRepository.findByMobileNumber(request.getMobileNumber());
        
        if (userOpt.isEmpty()) {
            return new AuthResponse(null, null, "Invalid credentials", false);
        }
        
        User user = userOpt.get();
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return new AuthResponse(null, null, "Invalid credentials", false);
        }
        
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
        
        String token = UUID.randomUUID().toString();
        UserDTO userDTO = convertToDTO(user);
        
        return new AuthResponse(token, userDTO, "Login successful", true);
    }
    
    public UserDTO getUserById(Long id) {
        return userRepository.findById(id)
                .map(this::convertToDTO)
                .orElse(null);
    }
    
    public UserDTO getUserByMobileNumber(String mobileNumber) {
        return userRepository.findByMobileNumber(mobileNumber)
                .map(this::convertToDTO)
                .orElse(null);
    }
    
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public UserDTO updateUser(Long id, UserDTO userDTO) {
        Optional<User> userOpt = userRepository.findById(id);
        
        if (userOpt.isEmpty()) {
            return null;
        }
        
        User user = userOpt.get();
        user.setFullName(userDTO.getFullName());
        user.setEmail(userDTO.getEmail());
        user.setAddress(userDTO.getAddress());
        
        user = userRepository.save(user);
        return convertToDTO(user);
    }
    
    private UserDTO convertToDTO(User user) {
        return new UserDTO(
            user.getId(),
            user.getMobileNumber(),
            user.getFullName(),
            user.getEmail(),
            user.getAddress(),
            user.getStatus().toString()
        );
    }
}
