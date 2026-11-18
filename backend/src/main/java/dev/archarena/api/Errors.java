package dev.archarena.api;

import dev.archarena.persistence.JobRepository.*;
import org.slf4j.MDC;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.converter.HttpMessageNotReadableException;
import java.util.Map;

@RestControllerAdvice
public class Errors {
    @ExceptionHandler({IllegalArgumentException.class,HttpMessageNotReadableException.class}) ResponseEntity<ProblemDetail> invalid(Exception error){return problem(400,error instanceof HttpMessageNotReadableException?"Malformed JSON or unsupported field/type":error.getMessage());}
    @ExceptionHandler(Conflict.class) ResponseEntity<ProblemDetail> conflict(Conflict error){return problem(409,error.getMessage());}
    @ExceptionHandler(Missing.class) ResponseEntity<ProblemDetail> missing(Missing error){return problem(404,error.getMessage());}
    @ExceptionHandler(Capacity.class) ResponseEntity<ProblemDetail> capacity(Capacity error){return problem(429,error.getMessage());}
    @ExceptionHandler(org.springframework.dao.DataAccessException.class) ResponseEntity<ProblemDetail> unavailable(Exception error){return problem(503,"Storage is temporarily unavailable; your browser draft has not been saved");}
    private ResponseEntity<ProblemDetail> problem(int status,String detail){ProblemDetail p=ProblemDetail.forStatusAndDetail(HttpStatus.valueOf(status),detail==null?"Request failed":detail);p.setProperty("correlationId",MDC.get("correlationId"));return ResponseEntity.status(status).body(p);}
}
