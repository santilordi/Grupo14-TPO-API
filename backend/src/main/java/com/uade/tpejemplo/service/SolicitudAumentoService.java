package com.uade.tpejemplo.service;

import com.uade.tpejemplo.dto.request.SolicitudAumentoRequest;
import com.uade.tpejemplo.dto.response.SolicitudAumentoResponse;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface SolicitudAumentoService {

    @Transactional
    SolicitudAumentoResponse aprobarSolicitud(Long id);

    @Transactional
    SolicitudAumentoResponse rechazarSolicitud(Long id);

    // Para que sepa que cumple con la interfaz
    SolicitudAumentoResponse buscarSolicitudPorId(Long id);

    SolicitudAumentoResponse crearSolicitud(SolicitudAumentoRequest request);

    List<SolicitudAumentoResponse> obtenerPendientes();

    

}
