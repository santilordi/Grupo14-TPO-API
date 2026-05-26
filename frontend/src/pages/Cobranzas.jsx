import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCobranzasPorCredito, addCobranza, clearCobranzas } from '../store/slices/cobranzasSlice';

export default function Cobranzas() {
  const dispatch = useDispatch();
  const { lista, loading, error } = useSelector((state) => state.cobranzas);
  const [idCredito, setIdCredito] = useState('');
  const [buscado, setBuscado] = useState(false);
  const [form, setForm] = useState({ idCredito: '', idCuota: '', importe: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const buscar = async (e) => {
    e.preventDefault();
    dispatch(clearCobranzas());
    const result = await dispatch(fetchCobranzasPorCredito(idCredito));
    if (result.meta.requestStatus === 'fulfilled') {
      setBuscado(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload = { idCredito: Number(form.idCredito), idCuota: Number(form.idCuota), importe: Number(form.importe) };
    const result = await dispatch(addCobranza(payload));
    if (result.meta.requestStatus === 'fulfilled') {
      setForm({ idCredito: '', idCuota: '', importe: '' });
      if (String(form.idCredito) === idCredito) {
        dispatch(fetchCobranzasPorCredito(idCredito));
      }
    }
    setIsSubmitting(false);
  };

  return (
    <div className="container">
      <h2 style={{ color: '#1e3a5f', marginBottom: '24px' }}>Cobranzas</h2>

      <div className="card">
        <div className="card-header">
          <h3>Buscar cobranzas por crédito</h3>
        </div>
        <form onSubmit={buscar} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="id-credito-buscar">ID del crédito</label>
            <input id="id-credito-buscar" placeholder="ID del crédito" type="number" value={idCredito} onChange={e => setIdCredito(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary">Buscar</button>
        </form>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Registrar pago de cuota</h3>
        </div>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="form-grid">
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
            <input id="importe" placeholder="Importe" type="number" value={form.importe} onChange={e => setForm({ ...form, importe: e.target.value })} required disabled={isSubmitting} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ gridColumn: 'span 3' }} disabled={isSubmitting}>
            {isSubmitting ? 'Registrando...' : 'Registrar'}
          </button>
        </form>
      </div>

      {buscado && (
        <div className="card">
          <div className="card-header">
            <h3>Cobranzas del crédito #{idCredito} ({lista.length})</h3>
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
                <thead><tr><th>ID</th><th>Crédito</th><th>Cuota</th><th>Importe</th></tr></thead>
                <tbody>
                  {lista.map(c => (
                    <tr key={c.id}><td>#{c.id}</td><td>{c.idCredito}</td><td>{c.idCuota}</td><td>${c.importe}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
