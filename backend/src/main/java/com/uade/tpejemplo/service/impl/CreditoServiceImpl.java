package com.uade.tpejemplo.service.impl;

import com.uade.tpejemplo.dto.request.CreditoRequest;
import com.uade.tpejemplo.dto.response.CreditoResponse;
import com.uade.tpejemplo.dto.response.CuotaResponse;
import com.uade.tpejemplo.exception.BusinessException;
import com.uade.tpejemplo.exception.ResourceNotFoundException;
import com.uade.tpejemplo.model.Cliente;
import com.uade.tpejemplo.model.Credito;
import com.uade.tpejemplo.model.Cuota;
import com.uade.tpejemplo.model.CuotaId;
import com.uade.tpejemplo.repository.ClienteRepository;
import com.uade.tpejemplo.repository.CobranzaRepository;
import com.uade.tpejemplo.repository.CreditoRepository;
import com.uade.tpejemplo.repository.CuotaRepository;
import com.uade.tpejemplo.service.CreditoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CreditoServiceImpl implements CreditoService {

    private final CreditoRepository creditoRepository;
    private final ClienteRepository clienteRepository;
    private final CuotaRepository cuotaRepository;
    private final CobranzaRepository cobranzaRepository;

    // Supongamos un límite máximo de crédito global para este ejemplo
    private static final BigDecimal LIMITE_MAXIMO_CREDITO = new BigDecimal("1000000");

    @Override
    @Transactional
    public CreditoResponse crear(CreditoRequest request) {
        Cliente cliente = clienteRepository.findByDni(request.getDniCliente())
            .orElseThrow(() -> new ResourceNotFoundException("Cliente", "DNI", request.getDniCliente()));

        // 1. Obtener todos los créditos previos del cliente
        List<Credito> creditosPrevios = creditoRepository.findByClienteDni(cliente.getDni());

        // 2. Sumar la deuda original de cada uno de los créditos anteriores
        BigDecimal sumaCreditosPrevios = creditosPrevios.stream()
            .map(Credito::getDeudaOriginal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 3. Sumar el monto del crédito que se está queriendo sacar ahora
        BigDecimal deudaTotalProyectada = sumaCreditosPrevios.add(request.getDeudaOriginal());

        // 4. Verificar que la suma total no sobrepase el límite (Ej. 1.000.000)
        if (deudaTotalProyectada.compareTo(LIMITE_MAXIMO_CREDITO) > 0) {
            throw new BusinessException("El cliente supera el límite de crédito permitido. Límite: $" + LIMITE_MAXIMO_CREDITO + ", Deuda total proyectada: $" + deudaTotalProyectada);
        }

        Credito credito = creditoRepository.save(new Credito(
            null,
            cliente,
            request.getDeudaOriginal(),
            request.getFecha(),
            request.getImporteCuota(),
            request.getCantidadCuotas(),
            null
        ));

        // Generar cuotas automáticamente con vencimiento mensual
        List<Cuota> cuotas = new ArrayList<>();
        for (int i = 1; i <= request.getCantidadCuotas(); i++) {
            Cuota cuota = new Cuota(
                new CuotaId(credito.getId(), i),
                credito,
                request.getFecha().plusMonths(i)
            );
            cuotas.add(cuota);
        }
        cuotaRepository.saveAll(cuotas);

        return toResponse(credito, cuotas);
    }

    @Override
    public CreditoResponse buscarPorId(Long id) {
        Credito credito = creditoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Crédito", "id", id));
        List<Cuota> cuotas = cuotaRepository.findByIdIdCredito(id);
        return toResponse(credito, cuotas);
    }

    @Override
    public List<CreditoResponse> listarPorCliente(String dniCliente) {
        if (!clienteRepository.existsByDni(dniCliente)) {
            throw new ResourceNotFoundException("Cliente", "DNI", dniCliente);
        }
        return creditoRepository.findByClienteDni(dniCliente).stream()
            .map(c -> toResponse(c, cuotaRepository.findByIdIdCredito(c.getId())))
            .toList();
    }

    private CreditoResponse toResponse(Credito credito, List<Cuota> cuotas) {
        List<CuotaResponse> cuotasResponse = cuotas.stream()
            .map(c -> new CuotaResponse(
                c.getId().getIdCredito(),
                c.getId().getIdCuota(),
                c.getFechaVencimiento(),
                cobranzaRepository.existsByCuotaIdIdCreditoAndCuotaIdIdCuota(
                    c.getId().getIdCredito(), c.getId().getIdCuota()
                )
            ))
            .toList();

        return new CreditoResponse(
            credito.getId(),
            credito.getCliente().getDni(),
            credito.getCliente().getNombre(),
            credito.getDeudaOriginal(),
            credito.getFecha(),
            credito.getImporteCuota(),
            credito.getCantidadCuotas(),
            cuotasResponse
        );
    }
}