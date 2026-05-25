package com.uade.tpejemplo.repository;

import com.uade.tpejemplo.model.EstadoSolicitudCredito;
import com.uade.tpejemplo.model.SolicitudAumento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SolicitudAumentoRepository extends JpaRepository<SolicitudAumento, Long> {

    List<SolicitudAumento> findByEstado(EstadoSolicitudCredito estado);
}
