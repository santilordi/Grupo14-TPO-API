package com.uade.tpejemplo.service.impl;

import com.uade.tpejemplo.dto.request.CobranzaRequest;
import com.uade.tpejemplo.dto.response.CobranzaResponse;
import com.uade.tpejemplo.exception.BusinessException;
import com.uade.tpejemplo.exception.ResourceNotFoundException;
import com.uade.tpejemplo.model.Cobranza;
import com.uade.tpejemplo.model.Cuota;
import com.uade.tpejemplo.model.CuotaId;
import com.uade.tpejemplo.repository.CobranzaRepository;
import com.uade.tpejemplo.repository.CuotaRepository;
import com.uade.tpejemplo.service.CobranzaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CobranzaServiceImpl implements CobranzaService {

    private final CobranzaRepository cobranzaRepository;
    private final CuotaRepository cuotaRepository;

    @Override
    public CobranzaResponse registrar(CobranzaRequest request) {
        CuotaId cuotaId = new CuotaId(request.getIdCredito(), request.getIdCuota());

        Cuota cuota = cuotaRepository.findById(cuotaId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Cuota", "idCredito/idCuota", request.getIdCredito() + "/" + request.getIdCuota()
            ));

        if (cobranzaRepository.existsByCuotaIdIdCreditoAndCuotaIdIdCuota(request.getIdCredito(), request.getIdCuota())) {
            throw new BusinessException(
                "La cuota " + request.getIdCuota() + " del crédito " + request.getIdCredito() + " ya fue pagada"
            );
        }

        Cobranza cobranza = new Cobranza(null, cuota, request.getImporte());
        cobranzaRepository.save(cobranza);
        return toResponse(cobranza);
    }

    @Override
    public List<CobranzaResponse> listarPorCredito(Long idCredito) {
        return cobranzaRepository.findByCuotaIdIdCredito(idCredito).stream()
            .map(this::toResponse)
            .toList();
    }

    private CobranzaResponse toResponse(Cobranza cobranza) {
        return new CobranzaResponse(
            cobranza.getId(),
            cobranza.getCuota().getId().getIdCredito(),
            cobranza.getCuota().getId().getIdCuota(),
            cobranza.getImporte()
        );
    }
}
