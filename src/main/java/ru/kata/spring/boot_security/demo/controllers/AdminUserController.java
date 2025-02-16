package ru.kata.spring.boot_security.demo.controllers;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;
import ru.kata.spring.boot_security.demo.dto.UserRequestDTO;
import ru.kata.spring.boot_security.demo.dto.UserResponseDTO;
import ru.kata.spring.boot_security.demo.entities.Role;
import ru.kata.spring.boot_security.demo.entities.User;
import ru.kata.spring.boot_security.demo.services.RoleService;
import ru.kata.spring.boot_security.demo.services.UserService;
import ru.kata.spring.boot_security.demo.util.exceptions.UserNotCreatedException;
import ru.kata.spring.boot_security.demo.util.exceptions.UserNotFoundException;
import ru.kata.spring.boot_security.demo.util.exceptions.UserNotUpdatedException;
import ru.kata.spring.boot_security.demo.validation.PasswordValidator;

import javax.validation.Valid;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/v1")
public class AdminUserController {
    private final UserService userService;
    private final RoleService roleService;
    private final ModelMapper modelMapper;
    private final PasswordValidator passwordValidator;

    @Autowired
    public AdminUserController(UserService userService, RoleService roleService, ModelMapper modelMapper,
                               PasswordValidator passwordValidator) {
        this.userService = userService;
        this.roleService = roleService;
        this.modelMapper = modelMapper;
        this.passwordValidator = passwordValidator;
    }

    @GetMapping("/users")
    public List<UserResponseDTO> getUsers() {
        return userService.findAll().stream().map(this::convertToUserResponseDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/users/{id}")
    public UserResponseDTO getUser(@PathVariable(value = "id") long id) {
        return convertToUserResponseDTO(userService.findById(id));
    }

    @PostMapping("/users")
    public ResponseEntity<HttpStatus> createUser(@RequestBody @Valid UserRequestDTO userRequestDTO, BindingResult bindingResult) {
        passwordValidator.validate(userRequestDTO, bindingResult);

        if (bindingResult.hasErrors()) {
            StringBuilder errorMessage = new StringBuilder();

            List<FieldError> fieldErrorList = bindingResult.getFieldErrors();
            for (FieldError fieldError : fieldErrorList) {
                errorMessage.append(fieldError.getField())
                        .append(" - ").append(fieldError.getDefaultMessage())
                        .append("; ");
            }

            throw new UserNotCreatedException(errorMessage.toString());
        }

        userService.save(convertToUser(userRequestDTO));
        return ResponseEntity.ok(HttpStatus.OK);
    }

    @PatchMapping("/users/{id}")
    public ResponseEntity<HttpStatus> updateUser(@PathVariable("id") long id, @RequestBody @Valid UserRequestDTO userRequestDTO,
                                                 BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            StringBuilder errorMessage = new StringBuilder();

            List<FieldError> fieldErrorList = bindingResult.getFieldErrors();
            for (FieldError error : fieldErrorList) {
                errorMessage.append(error.getField())
                        .append(" - ").append(error.getDefaultMessage())
                        .append("; ");

            }

            throw new UserNotUpdatedException(errorMessage.toString());
        }

        userRequestDTO.setId(id);
        userService.updateUser(convertToUser(userRequestDTO));
        return ResponseEntity.ok(HttpStatus.OK);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<HttpStatus> deleteUser(@PathVariable("id") long id) {
        User user = userService.getUserById(id);
        if (user == null) {
            throw new UserNotFoundException("Пользователь с таким ID не найден");
        }

        userService.deleteById(id);
        return ResponseEntity.ok(HttpStatus.OK);
    }

    @GetMapping("/user")
    public User showUser(@AuthenticationPrincipal User user) {
        return userService.findByName(user.getUsername()).get();
    }

    @GetMapping("/roles")
    public Set<Role> getAllRoles() {
        return roleService.getAllRoles();
    }

    private UserResponseDTO convertToUserResponseDTO(User user) {
        return modelMapper.map(user, UserResponseDTO.class);
    }

    private User convertToUser(UserRequestDTO userRequestDTO) {
        return modelMapper.map(userRequestDTO, User.class);
    }
}
