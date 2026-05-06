package com.uao.reservas_salas.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;



@Entity
@Table(name = "salas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sala {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, length = 200)
    private String ubicacion;

    @Column(nullable = false)
    private Integer capacidad;

      @ManyToOne(fetch = FetchType.EAGER)
      @JoinColumn(name = "facultad_id", nullable = false)
      @JsonIgnoreProperties({"salas", "hibernateLazyInitializer", "handler"})
      private Facultad facultad;

      @ManyToMany(fetch = FetchType.EAGER)
      @JoinTable(
         name = "sala_recursos",
         joinColumns = @JoinColumn(name = "sala_id"),
         inverseJoinColumns = @JoinColumn(name = "recurso_id")
      )
      @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
      @Builder.Default
      private Set<RecursoTecnologico> recursos = new HashSet<>();

    @Column(nullable = false)
    private Boolean habilitada = true;

    @Column(name = "creado_en", nullable = false, updatable = false)
    private LocalDateTime creadoEn = LocalDateTime.now();

    @Column(name = "actualizado_en")
    private LocalDateTime actualizadoEn = LocalDateTime.now();
    @PrePersist
 public void prePersist() {
    LocalDateTime now = LocalDateTime.now();
    if (creadoEn == null)     creadoEn     = now;
    if (actualizadoEn == null) actualizadoEn = now;
 }

 @PreUpdate
 public void preUpdate() {
    actualizadoEn = LocalDateTime.now();
 }
}