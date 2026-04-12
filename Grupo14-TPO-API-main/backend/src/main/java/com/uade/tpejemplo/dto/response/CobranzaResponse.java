package com.uade.tpejemplo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class CobranzaResponse {

    private Long id;
    private Long idCredito;
    private Integer idCuota;
    private BigDecimal importe;
}
