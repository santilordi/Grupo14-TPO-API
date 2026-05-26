package com.uade.tpejemplo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudAumentoResponse {

    private Long id;
    private String dniCliente;
    private BigDecimal montoSolicitado;
    private String estado;
    private LocalDate fechaSolicitud;
}
