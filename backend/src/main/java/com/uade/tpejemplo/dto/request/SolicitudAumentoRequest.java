package com.uade.tpejemplo.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class SolicitudAumentoRequest {

    @NotBlank(message = "El DNI del cliente es obligatorio")
    private String dniCliente;

    @NotNull(message = "El monto solicitado es obligatorio")
    @Positive(message = "El monto solicitado debe ser mayor a cero")
    private Double montoSolicitado;

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
}
