package com.fivesum.sumfood.config;

import com.fivesum.sumfood.service.JwtService;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;
import org.springframework.stereotype.Component;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureException;

import com.fivesum.sumfood.service.CourierService;
import com.fivesum.sumfood.service.CustomerService;
import com.fivesum.sumfood.service.RestaurantService;

import lombok.AllArgsConstructor;

import java.io.IOException;

@AllArgsConstructor
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final CourierService courierService;
    private final CustomerService customerService;
    private final RestaurantService restaurantService;
    private final CustomAuthEntryPoint customAuthEntryPoint; // Added this

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String role = request.getHeader("Role");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);
        String userEmail = null;

        try {
            userEmail = jwtService.extractUsername(jwt);
        } catch (ExpiredJwtException e) {
            handleAuthException(request, response, "Token expired");
            return;
        } catch (SignatureException e) {
            handleAuthException(request, response, "Invalid token signature");
            return;
        } catch (MalformedJwtException e) {
            handleAuthException(request, response, "Malformed token");
            return;
        } catch (Exception e) {
            handleAuthException(request, response, "Invalid token");
            return;
        }

        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = null;

            if ("CUSTOMER".equals(role)) {
                userDetails = customerService.loadUserByUsername(userEmail);
            } else if ("COURIER".equals(role)) {
                userDetails = courierService.loadUserByUsername(userEmail);
            } else if ("RESTAURANT".equals(role)) {
                userDetails = restaurantService.loadUserByUsername(userEmail);
            }

            if (userDetails != null && jwtService.isTokenValid(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            } else {
                handleAuthException(request, response, "Invalid or expired token");
                return;
            }
        }
        filterChain.doFilter(request, response);
    }

    private void handleAuthException(HttpServletRequest request, HttpServletResponse response, String message) throws IOException, ServletException {
        SecurityContextHolder.clearContext();
        customAuthEntryPoint.commence(request, response, new AuthenticationCredentialsNotFoundException(message));
    }
}