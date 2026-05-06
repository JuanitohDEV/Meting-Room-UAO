package com.uao.reservas_salas.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.uao.reservas_salas.entity.Auditoria;

public interface AuditoriaRepository extends JpaRepository<Auditoria, Long> {
    
    List<Auditoria> findByUsuarioIdOrderByRealizadoEnDesc(Long usuarioId);
}
