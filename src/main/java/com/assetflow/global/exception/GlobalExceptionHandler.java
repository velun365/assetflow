package com.assetflow.global.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResult> illegalExHandle(IllegalStateException e) {
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
}
