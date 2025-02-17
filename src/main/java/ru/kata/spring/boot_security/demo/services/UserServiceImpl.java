package ru.kata.spring.boot_security.demo.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.kata.spring.boot_security.demo.dto.UserRequestDTO;
import ru.kata.spring.boot_security.demo.entities.Role;
import ru.kata.spring.boot_security.demo.entities.User;
import ru.kata.spring.boot_security.demo.repositories.RoleRepository;
import ru.kata.spring.boot_security.demo.repositories.UserRepository;
import ru.kata.spring.boot_security.demo.util.exceptions.RoleNotFoundException;
import ru.kata.spring.boot_security.demo.util.exceptions.UserNotCreatedException;
import ru.kata.spring.boot_security.demo.util.exceptions.UserNotFoundException;
import ru.kata.spring.boot_security.demo.validation.UserValidator;


import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Primary
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final UserValidator userValidator;

    @Autowired
    @Lazy
    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, RoleRepository roleRepository, UserValidator userValidator) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.roleRepository = roleRepository;
        this.userValidator = userValidator;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<User> user = userRepository.findByName(username);
        if (user.isEmpty()) {
            throw new UsernameNotFoundException("Пользователь с таким именем не найден" + username);
        }

        return user.get();
    }

    @Override
    public List<User> findAll() {
        return userRepository.findAll();
    }

    @Override
    public User getUserById(long id) {
        return userRepository.getUserById(id);
    }

    @Override
    @Transactional
    public void save(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        List<Role> existingRoles = roleRepository.findAll();
        Map<String, Role> rolesMap = existingRoles.stream()
                .collect(Collectors.toMap(Role::getName, Function.identity()));

        Set<Role> receivedRoles = user.getRoles();
        Set<Role> savingRoles = new HashSet<>();

        for (Role role : receivedRoles) {
            Role existingRole = rolesMap.get(role.getName());
            if (existingRole != null) {
                savingRoles.add(existingRole);
            } else {
                throw new RoleNotFoundException("Такой роли не существует: " + role.getName());
            }
        }

        user.setRoles(savingRoles);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void deleteById(long id) {
        userRepository.deleteById(id);
    }

    @Override
    public Optional<User> findByName(String name) {
        return userRepository.findByName(name);
    }

    @Override
    @Transactional
    public void updateUser(User user) {
        User existingUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new UserNotFoundException("Пользователь с таким ID не найден"));

        userValidator.validateUserUpdate(existingUser, user);

        if (user.getPassword() != null && !user.getPassword().isEmpty() &&
            !passwordEncoder.matches(user.getPassword(), existingUser.getPassword())) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        } else {
            user.setPassword(existingUser.getPassword());
        }

        Set<Role> existingRoles = new HashSet<>(roleRepository.findAll());
        Set<Role> savingRoles = new HashSet<>();

        for (Role role : user.getRoles()) {
            existingRoles.stream()
                    .filter(existingRole -> existingRole.getName().equals(role.getName()))
                    .findFirst()
                    .ifPresentOrElse(
                            savingRoles::add,
                            () -> {
                                throw new RoleNotFoundException("Такой роли не существует: " + role.getName());
                            }
                    );
        }

        user.setRoles(savingRoles);
        userRepository.save(user);
    }

    @Override
    public User findById(long id) {
        Optional<User> foundUser = userRepository.findById(id);
        return foundUser.orElseThrow(UserNotFoundException::new);
    }

    @Override
    public User findByUserEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
