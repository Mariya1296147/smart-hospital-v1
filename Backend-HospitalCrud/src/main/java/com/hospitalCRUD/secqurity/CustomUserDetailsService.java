package com.hospitalCRUD.secqurity;

import com.hospitalCRUD.entity.User;
import com.hospitalCRUD.repository.UserRepository;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@Transactional
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        User myUser = userRepository.findByEmailIgnoreCase(username.trim())
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "User not found: " + username
                        )
                );

        return new org.springframework.security.core.userdetails.User(
                myUser.getEmail(),
                myUser.getPassword(),
                Boolean.TRUE.equals(myUser.getEnabled()),
                Boolean.TRUE.equals(myUser.getAccountNonExpired()),
                Boolean.TRUE.equals(myUser.getCredentialsNonExpired()),
                Boolean.TRUE.equals(myUser.getAccountNonLocked()),
                getAuthorities(myUser)
        );
    }

    private Collection<? extends GrantedAuthority> getAuthorities(User user) {
        return user.getRoles()
                .stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.name()))
                .collect(Collectors.toSet());
    }
}
