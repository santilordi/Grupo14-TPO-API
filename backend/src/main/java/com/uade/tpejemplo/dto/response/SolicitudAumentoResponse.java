package com.uade.tpejemplo.dto.response;

import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;

@Builder
public class SolicitudAumentoResponse {

    private Long id;
    private String dniCliente;
    private BigDecimal montoSolicitado;
    private String estado;
    private LocalDate fechaSolicitud;

    public SolicitudAumentoResponse() {
    }

    public SolicitudAumentoResponse(Long id, String dniCliente, BigDecimal montoSolicitado, String estado, LocalDate fechaSolicitud) {
        this.id = id;
        this.dniCliente = dniCliente;
        this.montoSolicitado = montoSolicitado;
        this.estado = estado;
        this.fechaSolicitud = fechaSolicitud;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDniCliente() {
        return dniCliente;
    }

    public void setDniCliente(String dniCliente) {
        this.dniCliente = dniCliente;
    }

    public BigDecimal getMontoSolicitado() {
        return montoSolicitado;
    }

    public void setMontoSolicitado(BigDecimal montoSolicitado) {
        this.montoSolicitado = montoSolicitado;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public LocalDate getFechaSolicitud() {
        return fechaSolicitud;
    }

    public void setFechaSolicitud(LocalDate fechaSolicitud) {
        this.fechaSolicitud = fechaSolicitud;
    }
}
