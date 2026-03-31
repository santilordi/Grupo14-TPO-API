package com.uade.tpejemplo.service.impl;

import com.uade.tpejemplo.exception.BusinessException;
import com.uade.tpejemplo.exception.ResourceNotFoundException;
import com.uade.tpejemplo.model.Cliente;
import com.uade.tpejemplo.repository.ClienteRepository;
import com.uade.tpejemplo.repository.CreditoRepository;
import com.uade.tpejemplo.service.SolicitudAumentoService;
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
        SolicitudAumento solicitud = buscarSolicitudPorId(id);

        if (solicitud.getEstado() != EstadoSolicitudCredito.PENDIENTE){
            throw new BusinessException("Solo se pueden aprobar solicitudes en estado PENDIENTE.");
        }

        Cliente cliente = solicitud.getCliente();

        solicitud.setEstado(EstadoSolicitudCredito.APROBADO);
        cliente.setLimiteCredito(solicitud.getMontoSolicitado());

        clienteRepository.save(cliente);
        solicitudRepository.save(solicitud);

        return mapearAResponse(solicitud);
    }

    @Override
    public SolicitudAumentoResponse rechazarSolicitud(Long id) {
        SolicitudAumento solicitud = buscarSolicitudPorId(id);

        if (solicitud.getEstado() != EstadoSolicitudCredito.PENDIENTE) {
            throw new BusinessException("Solo se pueden rechazar solicitudes en estado PENDIENTE.");
        }

        solicitud.setEstado(EstadoSolicitudCredito.RECHAZADO);
        solicitudRepository.save(solicitud);

        return mapearAResponse(solicitud);
    }

    private SolicitudAumento buscarSolicitudPorId(Long id) {
        return solicitudAumentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SolicitudAumento", "ID", id));
    }
}
