package ru.kata.spring.boot_security.demo.validation;

import ru.kata.spring.boot_security.demo.entities.User;
import ru.kata.spring.boot_security.demo.util.exceptions.UserAlreadyExistsException;

public interface UserValidator {
    void validateUserUpdate(User existingUser, User updatedUser) throws UserAlreadyExistsException;
}
