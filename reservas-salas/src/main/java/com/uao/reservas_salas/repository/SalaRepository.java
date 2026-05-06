package com.uao.reservas_salas.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.uao.reservas_salas.entity.Sala;

public interface SalaRepository extends JpaRepository<Sala, Long> {
    
    List<Sala> findByFacultadId(Long facultadId);
    List<Sala> findByFacultadIdAndHabilitadaTrue(Long facultadId);
}
