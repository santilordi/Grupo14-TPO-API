package com.uade.tpejemplo.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "solicitudes_aumento")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudAumento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dni_cliente", nullable = false)
    private Cliente cliente;

    @NotNull
    @Column(name = "monto_solicitado", nullable = false, precision = 12, scale = 2)
    private BigDecimal montoSolicitado;

    @NotNull
    @Column(name = "fecha_solicitud", nullable = false)
    private LocalDate fechaSolicitud;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    private EstadoSolicitudCredito estado;
}
