package com.uade.tpejemplo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UsuarioResponse {

    private Long id;
    private String username;
    private String rol;
    private Boolean puedeAnularCredito;
    private Boolean puedeAnularCobranza;
}
