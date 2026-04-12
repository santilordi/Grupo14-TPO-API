package com.uade.tpejemplo.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CuotaId implements Serializable {

    @Column(name = "id_credito")
    private Long idCredito;

    @Column(name = "id_cuota")
    private Integer idCuota;
}
