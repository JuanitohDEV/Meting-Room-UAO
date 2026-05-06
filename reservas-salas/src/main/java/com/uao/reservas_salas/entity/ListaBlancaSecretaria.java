package com.uao.reservas_salas.entity;


import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "lista_blanca_secretarias")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ListaBlancaSecretaria {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 150)
    private String correo;

    @Column(nullable = false, length = 150)
    private String facultad;

    @Column(name = "creado_en", nullable = false, updatable = false)
    private LocalDateTime creadoEn = LocalDateTime.now();
}
