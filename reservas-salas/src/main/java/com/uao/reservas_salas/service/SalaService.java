package com.uao.reservas_salas.service;

import com.uao.reservas_salas.entity.*;
import com.uao.reservas_salas.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SalaService {

    private final SalaRepository salaRepository;
    private final FacultadRepository facultadRepository;
    private final RecursoTecnologicoRepository recursoRepository;

    public List<Sala> listarPorFacultad(Long facultadId) {
        return salaRepository.findByFacultadId(facultadId);
    }

    public List<Sala> listarDisponiblesPorFacultad(Long facultadId) {
        return salaRepository.findByFacultadIdAndHabilitadaTrue(facultadId);
    }

    @Transactional
    public Sala crear(String nombre, String ubicacion, Integer capacidad,
                      Long facultadId, Set<Long> recursoIds) {
        Facultad facultad = facultadRepository.findById(facultadId)
                .orElseThrow(() -> new RuntimeException("Facultad no encontrada."));

        Set<RecursoTecnologico> recursos = recursoIds.stream()
                .map(id -> recursoRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Recurso no encontrado: " + id)))
                .collect(Collectors.toSet());

        Sala sala = Sala.builder()
                .nombre(nombre)
                .ubicacion(ubicacion)
                .capacidad(capacidad)
                .facultad(facultad)
                .recursos(recursos)
                .habilitada(true)
                .build();

        return salaRepository.save(sala);
    }

    @Transactional
    public Sala editar(Long id, String nombre, String ubicacion,
                       Integer capacidad, Set<Long> recursoIds) {
        Sala sala = salaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sala no encontrada."));

        sala.setNombre(nombre);
        sala.setUbicacion(ubicacion);
        sala.setCapacidad(capacidad);

        Set<RecursoTecnologico> recursos = recursoIds.stream()
                .map(rid -> recursoRepository.findById(rid)
                        .orElseThrow(() -> new RuntimeException("Recurso no encontrado: " + rid)))
                .collect(Collectors.toSet());
        sala.setRecursos(recursos);

        return salaRepository.save(sala);
    }

    @Transactional
    public Sala cambiarEstado(Long id, Boolean habilitada) {
        Sala sala = salaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sala no encontrada."));
        sala.setHabilitada(habilitada);
        return salaRepository.save(sala);
    }
}