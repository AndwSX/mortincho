package com.example.mortincho.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Desactivar CSRF para APIs
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll() // permitir registro y login
                        .anyRequest().authenticated() // el resto requiere login
                )
                .formLogin(login -> login.disable()) // quitar login por defecto
                .httpBasic(basic -> basic.disable()); // desactivar autenticación básica

        return http.build();
    }
}