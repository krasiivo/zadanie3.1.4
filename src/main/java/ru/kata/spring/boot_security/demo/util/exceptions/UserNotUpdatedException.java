package ru.kata.spring.boot_security.demo.util.exceptions;

public class UserNotUpdatedException extends RuntimeException {

    public UserNotUpdatedException(String message) {
        super(message);
    }
}
