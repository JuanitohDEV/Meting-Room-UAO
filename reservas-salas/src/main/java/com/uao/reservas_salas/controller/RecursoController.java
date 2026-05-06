package com.uao.reservas_salas.controller;

import com.uao.reservas_salas.entity.RecursoTecnologico;
import com.uao.reservas_salas.repository.RecursoTecnologicoRepository;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/recursos")
@RequiredArgsConstructor
public class RecursoController {

    private final RecursoTecnologicoRepository recursoRepository;

    @GetMapping
    public ResponseEntity<List<RecursoTecnologico>> listar(){
        return ResponseEntity.ok(recursoRepository.findAll());
    }

}