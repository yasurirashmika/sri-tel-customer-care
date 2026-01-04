package lk.sritel.user.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String mobileNumber;
    private String fullName;
    private String email;
    private String address;
    private String status;
}