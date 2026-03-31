package com.uade.tpejemplo.service;

public interface SolicitudAumentoService {

    SolicitudAumentoResponse aprobarSolicitud(Long id);

    SolicitudAumentoResponse rechazarSolicitud(Long id);
}
