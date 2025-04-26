// src/main/java/com/fivesum/sumfood/exception/ResourceNotFoundException.java
package com.fivesum.sumfood.exception;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND) // Helps Spring map this to 404 if uncaught
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
