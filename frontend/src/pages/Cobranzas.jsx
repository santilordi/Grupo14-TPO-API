import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCobranzasPorCredito, addCobranza, clearCobranzas, anularCobranzaThunk } from '../store/slices/cobranzasSlice';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Cobranzas() {
  const dispatch = useDispatch();
  const { lista, loading, error } = useSelector((state) => state.cobranzas);
  const user = useSelector((state) => state.auth.user);
  
  const [idCredito, setIdCredito] = useState('');
  const [buscado, setBuscado]     = useState(false);
  const [form, setForm]           = useState({ idCredito:'', idCuota:'', importe:'' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [pendingPayment, setPendingPayment] = useState(null);
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

  const confirmarAnulacion = async () => {
    if (!cobranzaPendienteAnular) return;
    const result = await dispatch(anularCobranzaThunk(cobranzaPendienteAnular.id));
    if (anularCobranzaThunk.fulfilled.match(result)) {
      setMensajeAnulacion(`Pago #${cobranzaPendienteAnular.id} anulado correctamente.`);
    }
    setCobranzaPendienteAnular(null);
  };

  const totalCobrado = lista.reduce(
    (acc, curr) => (curr.anulada ? acc : acc + Number(curr.importe)),
    0
  );

  const formatCurrency = (amount) => {
    return `$${Number(amount).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="container">
      <h2>Cobranzas</h2>

      <div className="card">
        <div className="card-header">
          <h3>Buscar cobranzas por crédito</h3>
        </div>
        <form onSubmit={buscar} className="form-grid" style={{ gridTemplateColumns: '1fr auto' }}>
          <div className="form-group">
            <label htmlFor="id-credito-buscar">ID del crédito</label>
            <input id="id-credito-buscar" placeholder="ID del crédito" type="number" value={idCredito} onChange={e => setIdCredito(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'end' }} disabled={loading && !isSubmitting}>Buscar</button>
        </form>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Registrar pago de cuota</h3>
        </div>
        {error && <div className="error-message">{error}</div>}
        {mensajeAnulacion && <div className="error-message" style={{ backgroundColor: '#f1f5f9', color: '#475569', borderColor: '#e2e8f0' }}>{mensajeAnulacion}</div>}
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
              <span className="badge badge-success">
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
            <p className="text-muted" style={{ textAlign: 'center', padding: 'var(--spacing-xl) 0' }}>No hay cobranzas registradas para este crédito.</p>
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
                    const estaAnulada = c.anulada;

                    return (
                    <tr key={c.id} style={{ backgroundColor: estaAnulada ? '#f1f5f9' : 'transparent', color: estaAnulada ? '#64748b' : 'inherit', opacity: estaAnulada ? 0.7 : 1 }}>
                      <td>#{c.id}</td>
                      <td>{c.idCredito}</td>
                      <td>{c.idCuota}</td>
                      <td className="text-success">{formatCurrency(c.importe)}</td>
                      <td><span className={estaAnulada ? 'badge badge-danger' : 'badge badge-success'}>{estaAnulada ? 'Anulada' : 'Registrada'}</span></td>
                      {puedeAnularCobranza && (
                        <td>
                          {!estaAnulada && (
                            <button type="button" onClick={() => setCobranzaPendienteAnular(c)} className="btn btn-danger">
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
        message={pendingPayment ? `¿Estás seguro de que deseas registrar el pago de ${formatCurrency(pendingPayment.importe)} para la cuota ${pendingPayment.idCuota} del crédito #${pendingPayment.idCredito}?` : ''}
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
