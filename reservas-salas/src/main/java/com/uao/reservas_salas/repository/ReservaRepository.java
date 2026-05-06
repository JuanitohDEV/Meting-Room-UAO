package com.uao.reservas_salas.repository;

import com.uao.reservas_salas.entity.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    List<Reserva> findByUsuarioIdOrderByFechaDesc(Long usuarioId);

    List<Reserva> findBySalaFacultadIdOrderByFechaDesc(Long facultadId);

    @Query("""
        SELECT COUNT(r) > 0 FROM Reserva r
        WHERE r.sala.id = :salaId
          AND r.fecha = :fecha
          AND r.estado = 'CONFIRMADA'
          AND r.id <> :excluirId
          AND r.horaInicio < :horaFin
          AND r.horaFin > :horaInicio
    """)
    boolean existeConflicto(
        @Param("salaId")     Long salaId,
        @Param("fecha")      LocalDate fecha,
        @Param("horaInicio") LocalTime horaInicio,
        @Param("horaFin")    LocalTime horaFin,
        @Param("excluirId")  Long excluirId
    );

    @Query("""
        SELECT r FROM Reserva r
        WHERE r.sala.facultad.id = :facultadId
          AND r.fecha BETWEEN :desde AND :hasta
          AND r.estado = 'CONFIRMADA'
    """)
    List<Reserva> findReporteByFacultadAndFechas(
        @Param("facultadId") Long facultadId,
        @Param("desde")      LocalDate desde,
        @Param("hasta")      LocalDate hasta
    );

    List<Reserva> findBySalaIdAndFechaAndEstado(
        Long salaId, LocalDate fecha, Reserva.Estado estado
    );
}