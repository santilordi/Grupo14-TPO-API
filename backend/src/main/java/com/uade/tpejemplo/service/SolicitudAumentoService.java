package com.uade.tpejemplo.service;

<<<<<<< gian
import com.uade.tpejemplo.dto.request.SolicitudAumentoRequest;
import com.uade.tpejemplo.dto.response.SolicitudAumentoResponse;

import java.util.List;

public interface SolicitudAumentoService {

    SolicitudAumentoResponse crearSolicitud(SolicitudAumentoRequest request);

    List<SolicitudAumentoResponse> obtenerPendientes();

    SolicitudAumentoResponse buscarSolicitudPorId(Long id);

=======
public interface SolicitudAumentoService {

>>>>>>> main
    SolicitudAumentoResponse aprobarSolicitud(Long id);

    SolicitudAumentoResponse rechazarSolicitud(Long id);
}
