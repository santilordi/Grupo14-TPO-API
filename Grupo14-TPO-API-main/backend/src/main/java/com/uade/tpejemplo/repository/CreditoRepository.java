package com.uade.tpejemplo.repository;

import com.uade.tpejemplo.model.Credito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CreditoRepository extends JpaRepository<Credito, Long> {

    List<Credito> findByClienteDni(String dni);
}
