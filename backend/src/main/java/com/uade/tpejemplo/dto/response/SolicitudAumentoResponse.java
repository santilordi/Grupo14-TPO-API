package com.uade.tpejemplo.dto.response;

public class SolicitudAumentoResponse {

    private Long id;
    private String dniCliente;
    private Double montoSolicitado;
    private String estado;

    public SolicitudAumentoResponse() {
    }

    public SolicitudAumentoResponse(Long id, String dniCliente, Double montoSolicitado, String estado) {
        this.id = id;
        this.dniCliente = dniCliente;
        this.montoSolicitado = montoSolicitado;
        this.estado = estado;
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

    public Double getMontoSolicitado() {
        return montoSolicitado;
    }

    public void setMontoSolicitado(Double montoSolicitado) {
        this.montoSolicitado = montoSolicitado;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}
