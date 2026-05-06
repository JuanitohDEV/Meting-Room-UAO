package com.uao.reservas_salas.controller;

import com.uao.reservas_salas.entity.Sala;
import com.uao.reservas_salas.service.SalaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/salas")
@RequiredArgsConstructor
public class SalaController {

    private final SalaService salaService;

    @GetMapping("/facultad/{facultadId}")
    public ResponseEntity<List<Sala>> listarPorFacultad(@PathVariable Long facultadId) {
        return ResponseEntity.ok(salaService.listarPorFacultad(facultadId));
    }

    @GetMapping("/facultad/{facultadId}/disponibles")
    public ResponseEntity<List<Sala>> listarDisponibles(@PathVariable Long facultadId) {
        return ResponseEntity.ok(salaService.listarDisponiblesPorFacultad(facultadId));
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Map<String, Object> body) {
        try {
            @SuppressWarnings("unchecked")
            Set<Long> recursoIds = Set.copyOf(
                ((List<Integer>) body.get("recursoIds"))
                    .stream().map(Long::valueOf).toList()
            );
            Sala sala = salaService.crear(
                (String) body.get("nombre"),
                (String) body.get("ubicacion"),
                (Integer) body.get("capacidad"),
                Long.valueOf(body.get("facultadId").toString()),
                recursoIds
            );
            return ResponseEntity.ok(sala);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editar(@PathVariable Long id,
                                    @RequestBody Map<String, Object> body) {
        try {
            @SuppressWarnings("unchecked")
            Set<Long> recursoIds = Set.copyOf(
                ((List<Integer>) body.get("recursoIds"))
                    .stream().map(Long::valueOf).toList()
            );
            Sala sala = salaService.editar(
                id,
                (String) body.get("nombre"),
                (String) body.get("ubicacion"),
                (Integer) body.get("capacidad"),
                recursoIds
            );
            return ResponseEntity.ok(sala);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable Long id,
                                           @RequestBody Map<String, Boolean> body) {
        try {
            return ResponseEntity.ok(salaService.cambiarEstado(id, body.get("habilitada")));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}