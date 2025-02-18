package ru.kata.spring.boot_security.demo.validation;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.validation.Errors;
import org.springframework.validation.Validator;
import ru.kata.spring.boot_security.demo.dto.UserRequestDTO;
import ru.kata.spring.boot_security.demo.entities.User;
import ru.kata.spring.boot_security.demo.repositories.UserRepository;

@Component
public class PasswordValidator implements Validator {

    private final UserRepository userRepository;

    @Autowired
    public PasswordValidator(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public boolean supports(Class<?> clazz) {
        return User.class.equals(clazz);
    }

    @Override
    public void validate(Object target, Errors errors) {
        UserRequestDTO user = (UserRequestDTO) target;
        validatePassword(user.getPassword(), errors);
        validateUsername(user.getUsername(), errors);
        validateEmail(user.getEmail(), errors);
    }

    private void validatePassword(String password, Errors errors) {
        if (password == null || password.length() < 3) {
            errors.rejectValue("password", "", "Пароль должен содержать минимум 3 символа");
        }
    }

    private void validateUsername(String username, Errors errors) {
        if (userRepository.findByName(username).isPresent()) {
            errors.rejectValue("username", "", "Имя уже занято");
        }
    }

    private void validateEmail(String email, Errors errors) {
        User existingUser = userRepository.getUserByEmail(email);
        if (existingUser != null) {
            errors.rejectValue("email", "", "Пользователь с таким email уже существует");
        }
    }
}