package ru.kata.spring.boot_security.demo.util;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import ru.kata.spring.boot_security.demo.util.errors.UserErrorResponse;
import ru.kata.spring.boot_security.demo.util.exceptions.*;

@ControllerAdvice
public class UserGlobalExceptionHandler {
    @ExceptionHandler
    private ResponseEntity<UserErrorResponse> handleException(UserNotFoundException exception) {
        UserErrorResponse userErrorResponse = new UserErrorResponse(
                "Пользователь с таким ID не найден"
        );

        return new ResponseEntity<>(userErrorResponse, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler
    private ResponseEntity<UserErrorResponse> handleException(UserNotCreatedException exception) {
        UserErrorResponse userErrorResponse = new UserErrorResponse(
                exception.getMessage()
        );

        return new ResponseEntity<>(userErrorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler
    private ResponseEntity<UserErrorResponse> handleException(RoleNotFoundException exception) {
        UserErrorResponse userErrorResponse = new UserErrorResponse(
                exception.getMessage()
        );

        return new ResponseEntity<>(userErrorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler
    private ResponseEntity<UserErrorResponse> handleException(UserNotUpdatedException exception) {
        UserErrorResponse userErrorResponse = new UserErrorResponse(
                exception.getMessage()
        );

        return new ResponseEntity<>(userErrorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler
    private ResponseEntity<UserErrorResponse> handleException(UserAlreadyExistsException exception) {
        UserErrorResponse userErrorResponse = new UserErrorResponse(
                exception.getMessage()
        );

        return new ResponseEntity<>(userErrorResponse, HttpStatus.BAD_REQUEST);
    }
}
