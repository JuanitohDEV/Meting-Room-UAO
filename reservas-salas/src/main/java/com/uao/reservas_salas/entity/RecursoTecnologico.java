package com.uao.reservas_salas.entity;


import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "recursos_tecnologicos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecursoTecnologico {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String nombre;

    @Column(length = 255)
    private String descripcion;
}
