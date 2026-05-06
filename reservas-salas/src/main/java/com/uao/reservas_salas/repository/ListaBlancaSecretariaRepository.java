package com.uao.reservas_salas.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.uao.reservas_salas.entity.ListaBlancaSecretaria;

public interface ListaBlancaSecretariaRepository  extends JpaRepository<ListaBlancaSecretaria, Long> {

    boolean existsByCorreo(String correo);
    Optional<ListaBlancaSecretaria> findByCorreo(String correo);
    
} 