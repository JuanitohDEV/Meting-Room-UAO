package com.uao.reservas_salas.service;

import com.uao.reservas_salas.entity.Usuario;
import com.uao.reservas_salas.repository.ListaBlancaSecretariaRepository;
import com.uao.reservas_salas.repository.UsuarioRepository;
import com.uao.reservas_salas.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final ListaBlancaSecretariaRepository listaBlancaRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public Map<String, String> registrar(String nombre, String correo, String contrasena) {
        if (usuarioRepository.existsByCorreo(correo))
            throw new RuntimeException("El correo ya está registrado.");

        Usuario.Rol rol = listaBlancaRepository.existsByCorreo(correo)
                ? Usuario.Rol.SECRETARIA
                : Usuario.Rol.DOCENTE;

        Usuario usuario = Usuario.builder()
                .nombre(nombre)
                .correo(correo)
                .contrasena(passwordEncoder.encode(contrasena))
                .rol(rol)
                .activo(true)
                .build();

        usuarioRepository.save(usuario);
        String token = jwtUtil.generateToken(correo, rol.name());
        return Map.of("token", token, "rol", rol.name(), "nombre", nombre);
    }

    public Map<String, String> login(String correo, String contrasena) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Credenciales inválidas."));

        if (!passwordEncoder.matches(contrasena, usuario.getContrasena()))
            throw new RuntimeException("Credenciales inválidas.");

        if (!usuario.getActivo())
            throw new RuntimeException("Usuario inactivo.");

        String token = jwtUtil.generateToken(correo, usuario.getRol().name());
        return Map.of(
                "token", token,
                "rol", usuario.getRol().name(),
                "nombre", usuario.getNombre()
        );
    }
}