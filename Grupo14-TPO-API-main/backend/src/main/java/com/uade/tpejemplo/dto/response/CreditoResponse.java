package com.uade.tpejemplo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
public class CreditoResponse {

    private Long id;
    private String dniCliente;
    private String nombreCliente;
    private BigDecimal deudaOriginal;
    private LocalDate fecha;
    private BigDecimal importeCuota;
    private Integer cantidadCuotas;
    private List<CuotaResponse> cuotas;
}
