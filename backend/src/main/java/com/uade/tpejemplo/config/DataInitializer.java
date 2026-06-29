package com.uade.tpejemplo.config;

import com.uade.tpejemplo.model.Rol;
import com.uade.tpejemplo.model.Usuario;
import com.uade.tpejemplo.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!usuarioRepository.existsByUsername("admin")) {
            Usuario admin = Usuario.builder()
                .username("admin")
                .password(passwordEncoder.encode("admin123"))
                .rol(Rol.ADMIN)
                .puedeAnularCredito(true)
                .puedeAnularCobranza(true)
                .build();
            usuarioRepository.save(admin);
            System.out.println("Admin creado: admin / admin123");
        }
    }
}
