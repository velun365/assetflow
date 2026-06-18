package com.assetflow.global.exception;

import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(basePackages = "com.assetflow.member")
public class MemberExceptionHandler {

    @ExceptionHandler(IllegalStateException.class)
    public ErrorResult illegalExHandle(IllegalStateException e) {
        return new ErrorResult("BAD_REQUEST", e.getMessage());
    }
}
