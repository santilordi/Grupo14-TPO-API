package com.uade.tpejemplo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "clientes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cliente {

    @Id
    @Column(name = "dni", length = 15)
    private String dni;

    @NotBlank
    @Column(name = "nombre", nullable = false)
    private String nombre;

    @OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Credito> creditos;

    @Column(name = "limite_credito", precision = 12, scale = 2)
    private BigDecimal limiteCredito;
}
