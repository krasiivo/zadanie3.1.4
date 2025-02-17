package ru.kata.spring.boot_security.demo.services;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import ru.kata.spring.boot_security.demo.dto.UserRequestDTO;
import ru.kata.spring.boot_security.demo.entities.User;

import java.util.List;
import java.util.Optional;

public interface UserService extends UserDetailsService {

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException;

    public List<User> findAll();

    public User getUserById(long id);

    public void save(User user);

    public void deleteById(long id);

    public Optional<User> findByName(String name);

    void updateUser(User user);

    User findById(long id);

    User findByUserEmail(String email);
}
