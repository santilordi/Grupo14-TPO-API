import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCreditosPorCliente, addCredito, clearCreditos } from '../store/slices/creditosSlice';

export default function Creditos() {
  const dispatch = useDispatch();
  const { lista, loading, error } = useSelector((state) => state.creditos);
  const [dni, setDni] = useState('');
  const [buscado, setBuscado] = useState(false);
  const [form, setForm] = useState({ dniCliente: '', deudaOriginal: '', fecha: '', importeCuota: '', cantidadCuotas: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const buscar = async (e) => {
    e.preventDefault();
    dispatch(clearCreditos());
    const result = await dispatch(fetchCreditosPorCliente(dni));
    if (result.meta.requestStatus === 'fulfilled') {
      setBuscado(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload = {
      ...form,
      deudaOriginal: Number(form.deudaOriginal),
      importeCuota: Number(form.importeCuota),
      cantidadCuotas: Number(form.cantidadCuotas),
    };
    const result = await dispatch(addCredito(payload));
    if (result.meta.requestStatus === 'fulfilled') {
      setForm({ dniCliente: '', deudaOriginal: '', fecha: '', importeCuota: '', cantidadCuotas: '' });
      if (form.dniCliente === dni) {
        dispatch(fetchCreditosPorCliente(dni));
      }
    }
    setIsSubmitting(false);
  };

  return (
    <div className="container">
      <h2 style={{ color: '#1e3a5f', marginBottom: '24px' }}>Créditos</h2>

      <div className="card">
        <div className="card-header">
          <h3>Buscar créditos por cliente</h3>
        </div>
        <form onSubmit={buscar} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="dni-buscar">DNI del cliente</label>
            <input id="dni-buscar" placeholder="DNI del cliente" value={dni} onChange={e => setDni(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary">Buscar</button>
        </form>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Nuevo crédito</h3>
        </div>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label htmlFor="dniCliente">DNI cliente</label>
            <input id="dniCliente" placeholder="DNI cliente" value={form.dniCliente} onChange={e => setForm({ ...form, dniCliente: e.target.value })} required disabled={isSubmitting} />
          </div>
          <div className="form-group">
            <label htmlFor="deudaOriginal">Deuda original</label>
            <input id="deudaOriginal" placeholder="Deuda original" value={form.deudaOriginal} onChange={e => setForm({ ...form, deudaOriginal: e.target.value })} type="number" required disabled={isSubmitting} />
          </div>
          <div className="form-group">
            <label htmlFor="fecha">Fecha</label>
            <input id="fecha" placeholder="Fecha" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} type="date" required disabled={isSubmitting} />
          </div>
          <div className="form-group">
            <label htmlFor="importeCuota">Importe cuota</label>
            <input id="importeCuota" placeholder="Importe cuota" value={form.importeCuota} onChange={e => setForm({ ...form, importeCuota: e.target.value })} type="number" required disabled={isSubmitting} />
          </div>
          <div className="form-group">
            <label htmlFor="cantidadCuotas">Cant. cuotas</label>
            <input id="cantidadCuotas" placeholder="Cant. cuotas" value={form.cantidadCuotas} onChange={e => setForm({ ...form, cantidadCuotas: e.target.value })} type="number" min="1" required disabled={isSubmitting} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ gridColumn: 'span 2' }} disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Crear crédito'}
          </button>
        </form>
      </div>

      {buscado && (
        <div className="card">
          <div className="card-header">
            <h3>Créditos del cliente ({lista.length})</h3>
          </div>
          {loading && !isSubmitting ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Cargando créditos...</p>
            </div>
          ) : lista.length === 0 ? (
            <p style={{ color: '#999', textAlign: 'center', padding: '2rem 0' }}>El cliente no tiene créditos registrados.</p>
          ) : (
            lista.map(cr => (
              <div key={cr.id} style={{ borderLeft: '4px solid #1e3a5f', paddingLeft: '16px', marginBottom: '20px' }}>
                <p><strong>ID #{cr.id}</strong> — Deuda: ${cr.deudaOriginal} — {cr.cantidadCuotas} cuotas de ${cr.importeCuota}</p>
                <div className="table-wrapper">
                  <table className="table">
                    <thead><tr><th>#</th><th>Vencimiento</th><th>Estado</th></tr></thead>
                    <tbody>
                      {cr.cuotas.map(c => (
                        <tr key={c.idCuota}>
                          <td>{c.idCuota}</td>
                          <td>{c.fechaVencimiento}</td>
                          <td style={{ color: c.pagada ? '#2e7d32' : '#c62828' }}>{c.pagada ? '✔ Pagada' : '✘ Pendiente'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
