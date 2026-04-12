package com.uade.tpejemplo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;

@Data
@AllArgsConstructor
public class CuotaResponse {

    private Long idCredito;
    private Integer idCuota;
    private LocalDate fechaVencimiento;
    private boolean pagada;
}
