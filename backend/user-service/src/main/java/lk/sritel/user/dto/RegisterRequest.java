package lk.sritel.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^07[0-9]{8}$", message = "Invalid mobile number")
    private String mobileNumber;
    
    @NotBlank(message = "Password is required")
    private String password;
    
    @NotBlank(message = "Full name is required")
    private String fullName;
    
    @Email(message = "Invalid email")
    @NotBlank(message = "Email is required")
    private String email;
    
    private String address;
}