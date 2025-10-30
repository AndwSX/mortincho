package com.example.mortincho.controller;

import com.example.mortincho.model.Usuario;
import com.example.mortincho.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Permite peticiones desde frontend
public class AuthController {
    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/register")
    public Usuario register(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        return usuarioService.registrarUsuario(email, password);
    }

    @PostMapping("/login")
    public String login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        boolean valido = usuarioService.validarLogin(email, password);
        return valido ? "Login exitoso" : "Credenciales inválidas";
    }
}
