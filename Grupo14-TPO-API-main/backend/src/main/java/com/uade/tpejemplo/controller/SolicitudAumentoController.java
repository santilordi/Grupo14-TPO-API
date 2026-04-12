package com.uade.tpejemplo.controller;

import com.uade.tpejemplo.service.SolicitudAumentoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/solicitudes")
@RequiredArgsConstructor
public class SolicitudAumentoController {

    private final SolicitudAumentoService solicitudAumentoService;

    // POST /api/solicitudes → crear una nueva solicitud de aumento
    @PostMapping
    public ResponseEntity<SolicitudAumentoResponse> crear(@Valid @RequestBody SolicitudAumentoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(solicitudAumentoService.crearSolicitud(request));
    }

    // GET /api/solicitudes/pendientes → listar solicitudes pendientes
    @GetMapping("/pendientes")
    public ResponseEntity<List<SolicitudAumentoResponse>> obtenerPendientes() {
        return ResponseEntity.ok(solicitudAumentoService.obtenerPendientes());
    }

    // GET /api/solicitudes/{id} → buscar solicitud por ID
    @GetMapping("/{id}")
    public ResponseEntity<SolicitudAumentoResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(solicitudAumentoService.buscarSolicitudPorId(id));
    }

    // PATCH /api/solicitudes/{id}/aprobar → aprobar una solicitud
    @PatchMapping("/{id}/aprobar")
    public ResponseEntity<SolicitudAumentoResponse> aprobar(@PathVariable Long id) {
        return ResponseEntity.ok(solicitudAumentoService.aprobarSolicitud(id));
    }

    // PATCH /api/solicitudes/{id}/rechazar → rechazar una solicitud
    @PatchMapping("/{id}/rechazar")
    public ResponseEntity<SolicitudAumentoResponse> rechazar(@PathVariable Long id) {
        return ResponseEntity.ok(solicitudAumentoService.rechazarSolicitud(id));
    }
}
