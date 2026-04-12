package com.uade.tpejemplo.service.impl;

import com.uade.tpejemplo.exception.BusinessException;
import com.uade.tpejemplo.exception.ResourceNotFoundException;
import com.uade.tpejemplo.model.Cliente;
import com.uade.tpejemplo.model.SolicitudAumento;
import com.uade.tpejemplo.repository.ClienteRepository;
import com.uade.tpejemplo.repository.CreditoRepository;
import com.uade.tpejemplo.repository.SolicitudAumentoRepository;
import com.uade.tpejemplo.service.SolicitudAumentoService;
import com.uade.tpejemplo.dto.request.SolicitudAumentoRequest;
import com.uade.tpejemplo.dto.response.SolicitudAumentoResponse;
import com.uade.tpejemplo.model.EstadoSolicitudCredito;
import java.util.List;
import java.util.stream.Collectors;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class SolicitudAumentoServiceImpl implements SolicitudAumentoService {

    private final SolicitudAumentoRepository solicitudAumentoRepository;
    private final ClienteRepository clienteRepository;
    private final CreditoRepository creditoRepository;

    @Override
    @Transactional
    public SolicitudAumentoResponse aprobarSolicitud(Long id) {
        // Buscamos la ENTIDAD directamente para que sea compatible con los métodos de abajo
        SolicitudAumento solicitud = solicitudAumentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SolicitudAumento", "ID", id));

        if (solicitud.getEstado() != EstadoSolicitudCredito.PENDIENTE) {
            throw new BusinessException("Solo se pueden aprobar solicitudes en estado PENDIENTE.");
        }

        Cliente cliente = solicitud.getCliente();

        solicitud.setEstado(EstadoSolicitudCredito.APROBADO);
        cliente.setLimiteCredito(solicitud.getMontoSolicitado());

        clienteRepository.save(cliente);
        solicitudAumentoRepository.save(solicitud);

        return mapearAResponse(solicitud);
    }

    @Override
    @Transactional
    public SolicitudAumentoResponse rechazarSolicitud(Long id) {
        // Buscamos la ENTIDAD directamente acá también
        SolicitudAumento solicitud = solicitudAumentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SolicitudAumento", "ID", id));

        if (solicitud.getEstado() != EstadoSolicitudCredito.PENDIENTE) {
            throw new BusinessException("Solo se pueden rechazar solicitudes en estado PENDIENTE.");
        }

        solicitud.setEstado(EstadoSolicitudCredito.RECHAZADO);
        solicitudAumentoRepository.save(solicitud);

        return mapearAResponse(solicitud);
    }

    @Override // Para que sepa que cumple con la interfaz
    public SolicitudAumentoResponse buscarSolicitudPorId(Long id) {
        // Este método devuelve el Response (DTO) tal cual pide la Interfaz
        SolicitudAumento solicitud = solicitudAumentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SolicitudAumento", "ID", id));
        
        return mapearAResponse(solicitud); 
    }

    // --- MÉTODOS DE S. Morganti ---

    @Override
    @Transactional
    public SolicitudAumentoResponse crearSolicitud(SolicitudAumentoRequest request) {
        // 1. Convertimos el Long a String de forma explícita
        String dniBuscado = String.valueOf(request.getClienteId());

        // 2. Buscamos al cliente en el repositorio
        Cliente cliente = clienteRepository.findById(dniBuscado)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente", "DNI", request.getClienteId()));

        // 3. Creamos la solicitud
        SolicitudAumento nuevaSolicitud = new SolicitudAumento();
        nuevaSolicitud.setCliente(cliente);
        nuevaSolicitud.setMontoSolicitado(request.getMontoSolicitado());
        nuevaSolicitud.setEstado(EstadoSolicitudCredito.PENDIENTE);

        // 4. Guardamos y devolvemos la respuesta mapeada
        SolicitudAumento guardada = solicitudAumentoRepository.save(nuevaSolicitud);
        return mapearAResponse(guardada);
    }

    @Override
    public List<SolicitudAumentoResponse> obtenerPendientes() {
        // Usamos el método findByEstado 
        return solicitudAumentoRepository.findByEstado(EstadoSolicitudCredito.PENDIENTE)
                .stream()
                .map(this::mapearAResponse) // Convertimos cada una a Response 
                .toList();
    }

    // método de mapeo
    private SolicitudAumentoResponse mapearAResponse(SolicitudAumento solicitud) {
        return SolicitudAumentoResponse.builder()
                .id(solicitud.getId())
                .dniCliente(solicitud.getCliente().getDni())
                .nombreCliente(solicitud.getCliente().getNombre())
                .montoSolicitado(solicitud.getMontoSolicitado())
                .fechaSolicitud(solicitud.getFechaSolicitud())
                .estado(String.valueOf(solicitud.getEstado()))
                .build();
    }
}
