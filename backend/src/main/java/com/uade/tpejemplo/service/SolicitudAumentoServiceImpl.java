package com.uade.tpejemplo.service;

import com.uade.tpejemplo.dto.request.SolicitudAumentoRequest;
import com.uade.tpejemplo.dto.response.SolicitudAumentoResponse;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

/**
 * IMPLEMENTACIÓN TEMPORAL (STUB) — solo para probar que el proyecto compila y los endpoints responden.
 * TODO: Reemplazar esta clase con la implementación real una vez que existan
 *       la entidad SolicitudAumento y el SolicitudAumentoRepository.
 */
@Service
public class SolicitudAumentoServiceImpl implements SolicitudAumentoService {

    @Override
    public SolicitudAumentoResponse crearSolicitud(SolicitudAumentoRequest request) {
        // Stub: devuelve una solicitud de prueba con los datos del request
        return new SolicitudAumentoResponse(
                1L,
                request.getDniCliente(),
                request.getMontoSolicitado(),
                request.getMotivo(),
                "PENDIENTE"
        );
    }

    @Override
    public List<SolicitudAumentoResponse> obtenerPendientes() {
        // Stub: devuelve una lista con un elemento de prueba
        return List.of(
                new SolicitudAumentoResponse(1L, "12345678", new BigDecimal("5000"), "Necesito más crédito", "PENDIENTE")
        );
    }

    @Override
    public SolicitudAumentoResponse buscarSolicitudPorId(Long id) {
        // Stub: devuelve siempre la misma solicitud de prueba
        return new SolicitudAumentoResponse(id, "12345678", new BigDecimal("5000"), "Necesito más crédito", "PENDIENTE");
    }

    @Override
    public SolicitudAumentoResponse aprobarSolicitud(Long id) {
        // Stub: devuelve la solicitud como aprobada
        return new SolicitudAumentoResponse(id, "12345678", new BigDecimal("5000"), "Necesito más crédito", "APROBADO");
    }

    @Override
    public SolicitudAumentoResponse rechazarSolicitud(Long id) {
        // Stub: devuelve la solicitud como rechazada
        return new SolicitudAumentoResponse(id, "12345678", new BigDecimal("5000"), "Necesito más crédito", "RECHAZADO");
    }
}
