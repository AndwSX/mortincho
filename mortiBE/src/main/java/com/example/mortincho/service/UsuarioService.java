package com.example.mortincho.service;

import com.example.mortincho.model.Usuario;
import com.example.mortincho.repository.UsuarioRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UsuarioService {
    @Autowired
    private UsuarioRepo usuarioRepo;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public Usuario registrarUsuario(String email, String password) {
        // Verificar si el correo ya está registrado
        Optional<Usuario> existente = usuarioRepo.findByEmail(email);
        if (existente.isPresent()) {
            throw new RuntimeException("El correo ya está registrado");
        }

        // Cifrar contraseña
        String passwordCifrada = passwordEncoder.encode(password);
        Usuario usuario = new Usuario(email, passwordCifrada);
        return usuarioRepo.save(usuario);
    }

    public boolean validarLogin(String email, String password) {
        Optional<Usuario> usuarioOpt = usuarioRepo.findByEmail(email);
        if (usuarioOpt.isEmpty()) return false;

        Usuario usuario = usuarioOpt.get();
        return passwordEncoder.matches(password, usuario.getPassword());
    }
}
