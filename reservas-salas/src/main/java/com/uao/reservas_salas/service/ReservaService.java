package com.uao.reservas_salas.service;

import com.uao.reservas_salas.entity.*;
import com.uao.reservas_salas.repository.*;
import lombok.RequiredArgsConstructor;

import org.springframework.cglib.core.Local;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final SalaRepository salaRepository;
    private final UsuarioRepository usuarioRepository;
    private final AuditoriaRepository auditoriaRepository;

    private static final LocalTime HORA_INICIO_MIN = LocalTime.of(7, 0);
    private static final LocalTime HORA_FIN_MAX    = LocalTime.of(21, 30);

    @Transactional
    public Reserva crear(Long salaId, String correoUsuario,
                         LocalDate fecha, LocalTime horaInicio,
                         LocalTime horaFin, String proposito) {

        validarFranja(horaInicio, horaFin);

        if (reservaRepository.existeConflicto(salaId, fecha, horaInicio, horaFin, -1L))
            throw new RuntimeException("La sala no está disponible en ese horario.");

        Sala sala = salaRepository.findById(salaId)
                .orElseThrow(() -> new RuntimeException("Sala no encontrada."));

        if (!sala.getHabilitada())
            throw new RuntimeException("La sala está deshabilitada.");

        Usuario usuario = usuarioRepository.findByCorreo(correoUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado."));

        Reserva reserva = Reserva.builder()
                .sala(sala)
                .usuario(usuario)
                .fecha(fecha)
                .horaInicio(horaInicio)
                .horaFin(horaFin)
                .proposito(proposito)
                .estado(Reserva.Estado.CONFIRMADA)
                .build();

        reserva = reservaRepository.save(reserva);
        registrarAuditoria(usuario, "CREAR_RESERVA", "reservas", reserva.getId());
        return reserva;
    }

    @Transactional
    public Reserva cancelar(Long reservaId, String correoUsuario) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada."));

        Usuario usuario = usuarioRepository.findByCorreo(correoUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado."));

        boolean esSecretaria = usuario.getRol() == Usuario.Rol.SECRETARIA;
        boolean esPropietario = reserva.getUsuario().getId().equals(usuario.getId());

        if (!esSecretaria && !esPropietario)
            throw new RuntimeException("No tienes permiso para cancelar esta reserva.");

        if (reserva.getEstado() == Reserva.Estado.CANCELADA)
            throw new RuntimeException("La reserva ya está cancelada.");

        reserva.setEstado(Reserva.Estado.CANCELADA);
        reserva.setModificadoPor(usuario);
        reserva = reservaRepository.save(reserva);
        registrarAuditoria(usuario, "CANCELAR_RESERVA", "reservas", reserva.getId());
        return reserva;
    }

    @Transactional
    public Reserva ajustar(Long reservaId, LocalDate fecha,
                           LocalTime horaInicio, LocalTime horaFin,
                           String proposito, String correoSecretaria) {

        validarFranja(horaInicio, horaFin);

        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada."));

        if (reservaRepository.existeConflicto(
                reserva.getSala().getId(), fecha, horaInicio, horaFin, reservaId))
            throw new RuntimeException("Conflicto de horario al ajustar la reserva.");

        Usuario secretaria = usuarioRepository.findByCorreo(correoSecretaria)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado."));

        reserva.setFecha(fecha);
        reserva.setHoraInicio(horaInicio);
        reserva.setHoraFin(horaFin);
        reserva.setProposito(proposito);
        reserva.setModificadoPor(secretaria);

        reserva = reservaRepository.save(reserva);
        registrarAuditoria(secretaria, "AJUSTAR_RESERVA", "reservas", reserva.getId());
        return reserva;
    }

    public List<Reserva> historialDocente(String correoUsuario) {
        Usuario usuario = usuarioRepository.findByCorreo(correoUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado."));
        return reservaRepository.findByUsuarioIdOrderByFechaDesc(usuario.getId());
    }

    public List<Reserva> historialFacultad(Long facultadId) {
        return reservaRepository.findBySalaFacultadIdOrderByFechaDesc(facultadId);
    }

    public List<Reserva> reportePorFechas(Long facultadId,
                                          LocalDate desde, LocalDate hasta) {
        return reservaRepository.findReporteByFacultadAndFechas(facultadId, desde, hasta);
    }

    private void validarFranja(LocalTime inicio, LocalTime fin) {
        if (inicio.isBefore(HORA_INICIO_MIN) || fin.isAfter(HORA_FIN_MAX))
            throw new RuntimeException(
                "Las reservas solo pueden realizarse entre 7:00 AM y 9:30 PM.");
        if (!inicio.isBefore(fin))
            throw new RuntimeException("La hora de inicio debe ser menor a la hora de fin.");
    }

    private void registrarAuditoria(Usuario usuario, String accion,
                                     String entidad, Long entidadId) {
        auditoriaRepository.save(Auditoria.builder()
                .usuario(usuario)
                .accion(accion)
                .entidad(entidad)
                .entidadId(entidadId)
                .build());
    }

    public List<Reserva> reservasPorSalaYFecha(Long salaId, LocalDate fecha) {
        return reservaRepository.findBySalaIdAndFechaAndEstado(
            salaId, fecha, Reserva.Estado.CONFIRMADA
        );
    }
}