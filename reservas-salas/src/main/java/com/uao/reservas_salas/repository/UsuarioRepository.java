package com.uao.reservas_salas.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.uao.reservas_salas.entity.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    
    Optional<Usuario> findByCorreo(String correo);
    boolean existsByCorreo(String correo);
    
}