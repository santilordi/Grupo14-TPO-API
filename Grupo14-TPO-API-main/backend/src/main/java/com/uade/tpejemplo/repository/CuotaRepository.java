package com.uade.tpejemplo.repository;

import com.uade.tpejemplo.model.Cuota;
import com.uade.tpejemplo.model.CuotaId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CuotaRepository extends JpaRepository<Cuota, CuotaId> {

    List<Cuota> findByIdIdCredito(Long idCredito);
}
