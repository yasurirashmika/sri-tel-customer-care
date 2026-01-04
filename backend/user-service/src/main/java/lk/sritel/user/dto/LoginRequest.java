package lk.sritel.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    
    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^07[0-9]{8}$", message = "Mobile number must be in format 07XXXXXXXX")
    private String mobileNumber;
    
    @NotBlank(message = "Password is required")
    private String password;
}