import { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClientes, addCliente } from '../store/slices/clientesSlice';

export default function Clientes() {
  const dispatch = useDispatch();
  const { lista, loading, error } = useSelector((state) => state.clientes);
  const [form, setForm] = useState({ dni: '', nombre: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [clienteExpandido, setClienteExpandido] = useState(null);
  const [success, setSuccess] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => { dispatch(fetchClientes()); }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setSuccess('');
    setFormError('');
    setIsSubmitting(true);
    
    const dni = form.dni.trim();
    const nombre = form.nombre.trim();

    if (!dni || !nombre) {
      setFormError('DNI y nombre son obligatorios.');
      setIsSubmitting(false);
      return;
    }

    if (!/^\d+$/.test(dni)) {
      setFormError('El DNI debe contener solo numeros.');
      setIsSubmitting(false);
      return;
    }

    if (nombre.length < 3) {
      setFormError('El nombre debe tener al menos 3 caracteres.');
      setIsSubmitting(false);
      return;
    }

    const result = await dispatch(addCliente({ dni, nombre }));

    if (result.meta.requestStatus === 'fulfilled') {
      setForm({ dni: '', nombre: '' });
      setSuccess('Cliente creado correctamente.');
    }
  };

  return (
    <div className="container">
      <h2 style={{ color: '#1e3a5f', marginBottom: '24px' }}>Clientes</h2>

      <div className="card">
        <div className="card-header">
            <h3>Nuevo cliente</h3>
        </div>
        
        {/* Mensajes de validación y éxito combinados */}
        {success && <div style={{ color: '#155724', backgroundColor: '#d4edda', padding: '10px', borderRadius: '4px', marginBottom: '1rem' }}>{success}</div>}
        {formError && <div className="error-message">{formError}</div>}
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
                <thead>
                  <tr>
                    <th>DNI</th>
                    <th>Nombre</th>
                  </tr>
                </thead>
                <tbody>
                  {lista.map(c => (
                    <Fragment key={c.dni}>
                      <tr 
                        onClick={() => setClienteExpandido(clienteExpandido === c.dni ? null : c.dni)}
                        style={{ cursor: 'pointer' }}
                        title="Clic para ver detalle"
                      >
                        <td>{c.dni}</td>
                        <td>{c.nombre}</td>
                      </tr>
                      
                      {/* Fila desplegable con el Límite de Crédito */}
                      {clienteExpandido === c.dni && (
                        <tr>
                          <td colSpan="2" style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderLeft: '4px solid #1e3a5f' }}>
                            <strong>Límite de crédito:</strong>{' '}
                            ${Number(c.limiteCredito ?? 0).toLocaleString('es-AR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
          </div>
        )}
      </div>
    </div>
  );;
}
