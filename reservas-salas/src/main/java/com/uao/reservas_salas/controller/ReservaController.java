package com.uao.reservas_salas.controller;

import com.uao.reservas_salas.entity.Reserva;
import com.uao.reservas_salas.service.ReservaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/reservas")
@RequiredArgsConstructor
public class ReservaController {

    private final ReservaService reservaService;

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Map<String, String> body,
                                   Authentication auth) {
        try {
            Reserva reserva = reservaService.crear(
                Long.valueOf(body.get("salaId")),
                auth.getName(),
                LocalDate.parse(body.get("fecha")),
                LocalTime.parse(body.get("horaInicio")),
                LocalTime.parse(body.get("horaFin")),
                body.get("proposito")
            );
            return ResponseEntity.ok(reserva);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<?> cancelar(@PathVariable Long id,
                                      Authentication auth) {
        try {
            return ResponseEntity.ok(reservaService.cancelar(id, auth.getName()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/ajustar")
    public ResponseEntity<?> ajustar(@PathVariable Long id,
                                     @RequestBody Map<String, String> body,
                                     Authentication auth) {
        try {
            Reserva reserva = reservaService.ajustar(
                id,
                LocalDate.parse(body.get("fecha")),
                LocalTime.parse(body.get("horaInicio")),
                LocalTime.parse(body.get("horaFin")),
                body.get("proposito"),
                auth.getName()
            );
            return ResponseEntity.ok(reserva);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/mis-reservas")
    public ResponseEntity<List<Reserva>> misReservas(Authentication auth) {
        return ResponseEntity.ok(reservaService.historialDocente(auth.getName()));
    }

    @GetMapping("/facultad/{facultadId}")
    public ResponseEntity<List<Reserva>> porFacultad(@PathVariable Long facultadId) {
        return ResponseEntity.ok(reservaService.historialFacultad(facultadId));
    }

    @GetMapping("/reporte")
    public ResponseEntity<List<Reserva>> reporte(
            @RequestParam Long facultadId,
            @RequestParam String desde,
            @RequestParam String hasta) {
        return ResponseEntity.ok(reservaService.reportePorFechas(
            facultadId,
            LocalDate.parse(desde),
            LocalDate.parse(hasta)
        ));
    }

    @GetMapping("/sala/{salaId}/fecha/{fecha}")
    public ResponseEntity<List<Reserva>> porSalaYFecha(
            @PathVariable Long salaId,
            @PathVariable String fecha) {
        return ResponseEntity.ok(
            reservaService.reservasPorSalaYFecha(salaId, LocalDate.parse(fecha))
        );
    }
    
}

