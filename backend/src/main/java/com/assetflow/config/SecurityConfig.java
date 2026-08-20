package com.assetflow.config;

import com.assetflow.auth.security.CustomAccessDeniedHandler;
import com.assetflow.auth.security.CustomAuthenticationEntryPoint;
import com.assetflow.auth.security.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;

@Configuration
public class SecurityConfig {
    private final CustomAuthenticationEntryPoint customAuthenticationEntryPoint;
    private final CustomAccessDeniedHandler customAccessDeniedHandler;
    public SecurityConfig(CustomAuthenticationEntryPoint customAuthenticationEntryPoint, CustomAccessDeniedHandler customAccessDeniedHandler) {
        this.customAuthenticationEntryPoint = customAuthenticationEntryPoint;
        this.customAccessDeniedHandler = customAccessDeniedHandler;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()))
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(customAuthenticationEntryPoint)
                        .accessDeniedHandler(customAccessDeniedHandler))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/auth/login",
                                "/api/auth/csrf"
                        ).permitAll()

                        .requestMatchers(HttpMethod.POST, "/api/members")
                        .permitAll()

                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/api/members/me",
                                "/api/members/me/password"
                        ).authenticated()

                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/api/members/*"
                        ).hasRole("ADMIN")

                        .requestMatchers("/api/members/search")
                        .hasAnyRole("ADMIN", "MANAGER")

                        .requestMatchers(HttpMethod.GET, "/api/asset-items")
                        .hasAnyRole("ADMIN", "MANAGER")

                        .requestMatchers("/api/departments/**")
                        .hasAnyRole("ADMIN", "MANAGER")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/loans",
                                "/api/loans/search",
                                "/api/reservations",
                                "/api/reservations/search"
                        ).hasAnyRole("ADMIN", "MANAGER")

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/assets",
                                "/api/asset-items",
                                "/api/categories",
                                "/api/loans/*/return-approve"
                        ).hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/api/assets/*",
                                "/api/asset-items/*"
                        ).hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/api/assets/*/image"
                        ).hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/assets/**",
                                "/api/asset-items/**",
                                "/api/categories/**"
                        ).hasRole("ADMIN")

                        .anyRequest().authenticated()
                );

        return http.build();
    }

    @Bean
    public DaoAuthenticationProvider daoAuthenticationProvider(
            CustomUserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder
    ) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);

        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration
    )throws Exception {
        return configuration.getAuthenticationManager();
    }
}
