package com.uade.tpejemplo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class SolicitudAumentoResponse {

    private Long id;
    private String dniCliente;
    private BigDecimal montoSolicitado;
    private String motivo;
    private String estado; // PENDIENTE, APROBADO, RECHAZADO
}
