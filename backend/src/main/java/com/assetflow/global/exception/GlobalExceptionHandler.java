package com.assetflow.global.exception;

import com.assetflow.auth.exception.LoginFailedException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler({IllegalStateException.class, IllegalArgumentException.class})
    public ResponseEntity<ErrorResult> illegalExHandle(RuntimeException e) {
        ErrorResult errorResponse = new ErrorResult("BAD_REQUEST", e.getMessage());

        return ResponseEntity
                .badRequest()
                .body(errorResponse);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResult> MethodArgumentNotValidHandle(MethodArgumentNotValidException e) {
        String message = e.getBindingResult()
                .getFieldError()
                .getDefaultMessage();
        ErrorResult response = new ErrorResult("VALIDATION_ERROR", message);
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(LoginFailedException.class)
    public ResponseEntity<ErrorResult> loginFiledHandle(LoginFailedException e) {
        ErrorResult errorResponse = new ErrorResult("LOGIN_FAILED", e.getMessage());

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(errorResponse);
    }
}
