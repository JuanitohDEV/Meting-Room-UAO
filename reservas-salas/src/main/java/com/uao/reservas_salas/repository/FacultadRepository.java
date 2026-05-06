package com.uao.reservas_salas.repository;

import java.util.List;
import com.uao.reservas_salas.entity.Facultad;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FacultadRepository extends JpaRepository<Facultad, Long> {

    List<Facultad> findByActivaTrue();
    
}
