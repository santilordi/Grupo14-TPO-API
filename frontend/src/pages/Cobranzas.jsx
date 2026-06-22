import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCobranzasPorCredito, addCobranza, clearCobranzas } from '../store/slices/cobranzasSlice';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Cobranzas() {
  const dispatch = useDispatch();
  const { lista, loading, error } = useSelector((state) => state.cobranzas);
  const user = useSelector((state) => state.auth.user);
  
  const [idCredito, setIdCredito] = useState('');
  const [buscado, setBuscado]     = useState(false);
  const [form, setForm]           = useState({ idCredito:'', idCuota:'', importe:'' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  //Estaods para el dialogo de confirmacion
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [pendingPayment, setPendingPayment] = useState(null);
  const [cobranzasAnuladas, setCobranzasAnuladas] = useState(() => new Set());
  const [cobranzaPendienteAnular, setCobranzaPendienteAnular] = useState(null);
  const [mensajeAnulacion, setMensajeAnulacion] = useState('');

  const puedeAnularCobranza = user?.rol === 'ADMIN' || user?.puedeAnularCobranza === true;

  const buscar = async (e) => {
    e.preventDefault();
    dispatch(clearCobranzas());
    const result = await dispatch(fetchCobranzasPorCredito(idCredito));
    if (result.meta.requestStatus === 'fulfilled') {
      setBuscado(true);
    }
  };

  const handlePreSubmit = (e) => {
    e.preventDefault();
    const payload = { 
      idCredito: Number(form.idCredito), 
      idCuota: Number(form.idCuota), 
      importe: Number(form.importe) 
    };

    if (isNaN(payload.idCredito) || payload.idCredito <= 0) return;
    if (isNaN(payload.idCuota) || payload.idCuota <= 0) return;
    if (isNaN(payload.importe) || payload.importe <= 0) return;

    setPendingPayment(payload);
    setShowPaymentConfirm(true);
  };

  const handleConfirmPayment = async () => {
    setShowPaymentConfirm(false);
    if (!pendingPayment) return;
    
    setIsSubmitting(true);

    const result = await dispatch(addCobranza(pendingPayment));
    if (result.meta.requestStatus === 'fulfilled') {
      setForm({ idCredito:'', idCuota:'', importe:'' });
      if (String(pendingPayment.idCredito) === idCredito) {
        dispatch(fetchCobranzasPorCredito(idCredito));
      }
    }
    setIsSubmitting(false);
    setPendingPayment(null);
  };

  const handleCancelPayment = () => {
    setShowPaymentConfirm(false);
    setPendingPayment(null);
  };

  const confirmarAnulacion = () => {
    if (!cobranzaPendienteAnular) return;
    setCobranzasAnuladas((prev) => new Set(prev).add(cobranzaPendienteAnular.id));
    setMensajeAnulacion(`Pago #${cobranzaPendienteAnular.id} marcado como anulado.`);
    setCobranzaPendienteAnular(null);
  };

  const totalCobrado = lista.reduce(
    (acc, curr) => (curr.anulada || cobranzasAnuladas.has(curr.id) ? acc : acc + Number(curr.importe)),
    0
  );

  const formatCurrency = (amount) => {
    return `$${Number(amount).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="container">
      <h2 style={{ color: '#1e3a5f', marginBottom: '24px' }}>Cobranzas</h2>

      {/* Buscar Cobranzas */}
      <div className="card">
        <div className="card-header">
          <h3>Buscar cobranzas por crédito</h3>
        </div>
        <form onSubmit={buscar} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="id-credito-buscar">ID del crédito</label>
            <input id="id-credito-buscar" placeholder="ID del crédito" type="number" value={idCredito} onChange={e => setIdCredito(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading && !isSubmitting}>Buscar</button>
        </form>
      </div>

      {/* Registrar Nuevo Pago */}
      <div className="card">
        <div className="card-header">
          <h3>Registrar pago de cuota</h3>
        </div>
        {error && <div className="error-message">{error}</div>}
        {mensajeAnulacion && <div style={{ color: '#475569', backgroundColor: '#f1f5f9', padding: '10px', borderRadius: '4px', marginBottom: '1rem' }}>{mensajeAnulacion}</div>}
        <form onSubmit={handlePreSubmit} className="form-grid">
          <div className="form-group">
            <label htmlFor="idCredito">ID crédito</label>
            <input id="idCredito" placeholder="ID crédito" type="number" value={form.idCredito} onChange={e => setForm({ ...form, idCredito: e.target.value })} required disabled={isSubmitting} />
          </div>
          <div className="form-group">
            <label htmlFor="idCuota">Nro. cuota</label>
            <input id="idCuota" placeholder="Nro. cuota" type="number" min="1" value={form.idCuota} onChange={e => setForm({ ...form, idCuota: e.target.value })} required disabled={isSubmitting} />
          </div>
          <div className="form-group">
            <label htmlFor="importe">Importe</label>
            <input id="importe" placeholder="Importe" type="number" step="0.01" value={form.importe} onChange={e => setForm({ ...form, importe: e.target.value })} required disabled={isSubmitting} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ gridColumn: 'span 3' }} disabled={isSubmitting}>
            {isSubmitting ? 'Registrando...' : 'Registrar'}
          </button>
        </form>
      </div>

      {buscado && (
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <h3>Cobranzas del crédito #{idCredito} ({lista.length})</h3>
            {lista.length > 0 && (
              <span style={{ backgroundColor: '#e8f5e9', color: '#1b5e20', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold' }}>
                Total Cobrado: {formatCurrency(totalCobrado)}
              </span>
            )}
          </div>
          {loading && !isSubmitting ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Cargando cobranzas...</p>
            </div>
          ) : lista.length === 0 ? (
            <p style={{ color: '#999', textAlign: 'center', padding: '2rem 0' }}>No hay cobranzas registradas para este crédito.</p>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID Pago</th>
                    <th>ID Crédito</th>
                    <th>Nro. Cuota</th>
                    <th>Importe</th>
                    <th>Estado</th>
                    {puedeAnularCobranza && <th>Acciones</th>}
                  </tr>
                </thead>
                <tbody>
                  {lista.map(c => {
                    const estaAnulada = c.anulada || cobranzasAnuladas.has(c.id);

                    return (
                    <tr key={c.id} style={{ backgroundColor: estaAnulada ? '#f1f5f9' : 'transparent', color: estaAnulada ? '#64748b' : 'inherit', opacity: estaAnulada ? 0.7 : 1 }}>
                      <td>#{c.id}</td>
                      <td>{c.idCredito}</td>
                      <td>{c.idCuota}</td>
                      <td style={{ fontWeight: 'bold', color: '#166534' }}>{formatCurrency(c.importe)}</td>
                      <td>{estaAnulada ? 'Anulada' : 'Registrada'}</td>
                      {puedeAnularCobranza && (
                        <td>
                          {!estaAnulada && (
                            <button
                              type="button"
                              onClick={() => setCobranzaPendienteAnular(c)}
                              style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                              Anular
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={showPaymentConfirm}
        title="Confirmar Registro de Pago"
        message={pendingPayment ? `¿Estás seguro de que deseas registrar el pago de ${formatCurrency(pendingPayment.importe)} para la cuota ${pendingPayment.idCuota} del crédito #${pendingPayment.idCredito}? Esta operación quedará registrada en el sistema.` : ''}
        confirmText="Confirmar Pago"
        cancelText="Cancelar"
        type="primary"
        onConfirm={handleConfirmPayment}
        onCancel={handleCancelPayment}
      />

      <ConfirmDialog
        isOpen={Boolean(cobranzaPendienteAnular)}
        title="Anular pago"
        message={cobranzaPendienteAnular ? `¿Confirmás la anulación del pago #${cobranzaPendienteAnular.id}?` : ''}
        confirmText="Anular"
        cancelText="Cancelar"
        type="danger"
        onConfirm={confirmarAnulacion}
        onCancel={() => setCobranzaPendienteAnular(null)}
      />
    </div>
  );
}
