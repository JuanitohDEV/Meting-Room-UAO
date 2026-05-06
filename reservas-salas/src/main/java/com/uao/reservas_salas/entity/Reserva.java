package com.uao.reservas_salas.entity;


import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "reservas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reserva {

    public enum Estado { CONFIRMADA, CANCELADA }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

      @ManyToOne(fetch = FetchType.EAGER)
      @JoinColumn(name = "sala_id", nullable = false)
      @JsonIgnoreProperties({"recursos", "hibernateLazyInitializer", "handler"})
      private Sala sala;

      @ManyToOne(fetch = FetchType.EAGER)
      @JoinColumn(name = "usuario_id", nullable = false)
      @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
      private Usuario usuario;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    @Column(name = "hora_fin", nullable = false)
    private LocalTime horaFin;

    @Column(length = 255)
    private String proposito;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Estado estado = Estado.CONFIRMADA;

      @ManyToOne(fetch = FetchType.EAGER)
      @JoinColumn(name = "modificado_por")
      @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
      private Usuario modificadoPor;

    @Column(name = "creado_en", nullable = false, updatable = false)
    private LocalDateTime creadoEn = LocalDateTime.now();

    @Column(name = "actualizado_en")
    private LocalDateTime actualizadoEn = LocalDateTime.now();

    @PrePersist
 public void prePersist() {
    LocalDateTime now = LocalDateTime.now();
    if (creadoEn == null)     creadoEn     = now;
    if (actualizadoEn == null) actualizadoEn = now;
    if (estado == null)        estado        = Estado.CONFIRMADA;
 }

 @PreUpdate
 public void preUpdate() {
    actualizadoEn = LocalDateTime.now();
 }
}