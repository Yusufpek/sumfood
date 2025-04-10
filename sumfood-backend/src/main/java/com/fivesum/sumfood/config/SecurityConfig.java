package com.fivesum.sumfood.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        // Disable CSRF protection (if you are using it)
        http.csrf().disable()
                .authorizeRequests()
                .antMatchers("/api/auth/register/**")
                .permitAll() // unauthenticated access to register endpoint
                .anyRequest()
                .authenticated() // authentication for other requests
                .and()
                .formLogin().disable()
                .httpBasic().disable();
    }
}
