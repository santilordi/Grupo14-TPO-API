package com.uade.tpejemplo.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class SolicitudAumentoRequest {

    @NotBlank(message = "El DNI del cliente es obligatorio")
    private String dniCliente;

    @NotNull(message = "El monto solicitado es obligatorio")
    @Positive(message = "El monto solicitado debe ser mayor a cero")
    private BigDecimal montoSolicitado;

    @NotBlank(message = "El motivo es obligatorio")
    private String motivo;
}
