package ru.kata.spring.boot_security.demo.dto;

import ru.kata.spring.boot_security.demo.entities.Role;

import javax.validation.constraints.*;
import java.util.HashSet;
import java.util.Set;

public class UserRequestDTO {

    private Long id;

    @NotEmpty(message = "Имя не должно быть пустым")
    @Size(min = 2, max = 100, message = "Имя должно быть от 2 до 100 символов")
    private String username;

    private String password;

    @NotEmpty(message = "email не должен быть пустым")
    @Email(message = "email должен быть валидным")
    private String email;

    @Max(value = 150, message = "Введите корректный возраст")
    @Min(value = 0, message = "Введите корректный возраст")
    private Integer age;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    private Set<Role> roles = new HashSet<>();

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public Set<Role> getRoles() {
        return roles;
    }

    public void setRoles(Set<Role> roles) {
        this.roles = roles;
    }
}
