package com.uade.tpejemplo.service;

import java.util.List;

public interface SolicitudAumentoService {

    SolicitudAumentoResponse crearSolicitud(SolicitudAumentoRequest request);

    List<SolicitudAumentoResponse> obtenerPendientes();

    SolicitudAumentoResponse buscarSolicitudPorId(Long id);

    SolicitudAumentoResponse aprobarSolicitud(Long id);

    SolicitudAumentoResponse rechazarSolicitud(Long id);
}
