package com.hospitalCRUD.dtos;

import com.hospitalCRUD.entity.UserRole;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {

    private String userName;
    private String userFirstName;
    private String userLastName;
    private String email;
    private Boolean enabled;
    private Set<UserRole> roles;
    private Instant dateCreated;
}
