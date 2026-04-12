package com.uade.tpejemplo.service;

import com.uade.tpejemplo.dto.request.SolicitudAumentoRequest;
import com.uade.tpejemplo.dto.response.SolicitudAumentoResponse;
import java.util.List;

public interface SolicitudAumentoService {

    SolicitudAumentoResponse crearSolicitud(SolicitudAumentoRequest request);

    List<SolicitudAumentoResponse> obtenerPendientes();

    

}
