import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClientes, addCliente } from '../store/slices/clientesSlice';

export default function Clientes() {
  const dispatch = useDispatch();
  const { lista, loading, error } = useSelector((state) => state.clientes);
  const [form, setForm] = useState({ dni: '', nombre: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { dispatch(fetchClientes()); }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await dispatch(addCliente(form));
    if (result.meta.requestStatus === 'fulfilled') {
        setForm({ dni: '', nombre: '' });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="container">
      <h2 style={{ color: '#1e3a5f', marginBottom: '24px' }}>Clientes</h2>

      <div className="card">
        <div className="card-header">
            <h3>Nuevo cliente</h3>
        </div>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="form-grid" style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
          <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="dni">DNI</label>
              <input id="dni" placeholder="DNI" value={form.dni} onChange={e => setForm({...form, dni: e.target.value})} required disabled={isSubmitting} />
          </div>
          <div className="form-group" style={{ flex: 2 }}>
              <label htmlFor="nombre">Nombre completo</label>
              <input id="nombre" placeholder="Nombre completo" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required disabled={isSubmitting} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ height: '42px' }}>
              {isSubmitting ? 'Guardando...' : 'Agregar'}
          </button>
        </form>
      </div>

      <div className="card">
        <div className="card-header">
            <h3>Lista de clientes ({lista.length})</h3>
        </div>
        
        {loading && !isSubmitting ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Cargando clientes...</p>
          </div>
        ) : lista.length === 0 ? (
          <p style={{ color: '#999', textAlign: 'center', padding: '2rem 0' }}>No hay clientes registrados.</p>
        ) : (
          <div className="table-wrapper">
              <table className="table">
                <thead><tr><th>DNI</th><th>Nombre</th></tr></thead>
                <tbody>
                  {lista.map(c => (
                    <tr key={c.dni}><td>{c.dni}</td><td>{c.nombre}</td></tr>
                  ))}
                </tbody>
              </table>
          </div>
        )}
      </div>
    </div>
  );
}
