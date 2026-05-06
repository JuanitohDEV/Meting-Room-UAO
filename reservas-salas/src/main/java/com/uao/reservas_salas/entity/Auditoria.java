package com.uao.reservas_salas.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity // Marca la clase como una entidad de JPA
@Table(name = "auditoria")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Auditoria {
    
    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "reservas"})
    private Usuario usuario;

    @Column(nullable = false, length = 100)
    private String accion;

    @Column(nullable = false, length = 50)
    private String entidad;

    @Column(name = "entidad_id")
    private Long entidadId;

    @Column(columnDefinition = "TEXT")
    private String detalle;

    @Column(name = "ip_origen", length = 45)
    private String ipOrigen;

    @Column(name = "realizado_en", nullable = false, updatable = false)
    private LocalDateTime realizadoEn = LocalDateTime.now();

    @PrePersist
    public void prePersit() {
        if (realizadoEn == null) realizadoEn = LocalDateTime.now();
    }
}
