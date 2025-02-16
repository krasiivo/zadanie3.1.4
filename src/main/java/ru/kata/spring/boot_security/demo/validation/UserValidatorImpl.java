package ru.kata.spring.boot_security.demo.validation;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import ru.kata.spring.boot_security.demo.entities.User;
import ru.kata.spring.boot_security.demo.repositories.UserRepository;
import ru.kata.spring.boot_security.demo.util.exceptions.UserAlreadyExistsException;

@Component
public class UserValidatorImpl implements UserValidator {
    private final UserRepository userRepository;

    @Autowired
    public UserValidatorImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void validateUserUpdate(User existingUser, User updatedUser) throws UserAlreadyExistsException {
        if (!existingUser.getEmail().equals(updatedUser.getEmail())) {
            if (userRepository.existsByEmail(updatedUser.getEmail())) {
                throw new UserAlreadyExistsException("Данный email уже используется");
            }
        }

        if (!existingUser.getUsername().equals(updatedUser.getUsername())) {
            if (userRepository.existsByUsername(updatedUser.getUsername())) {
                throw new UserAlreadyExistsException("Данное имя пользователя уже используется");
            }
        }
    }
}

