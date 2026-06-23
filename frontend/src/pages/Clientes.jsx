import { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClientes, addCliente } from '../store/slices/clientesSlice';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Clientes() {
  const dispatch = useDispatch();
  const { lista, loading, error } = useSelector((state) => state.clientes);
  const [form, setForm] = useState({ dni: '', nombre: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [clienteExpandido, setClienteExpandido] = useState(null);
  const [success, setSuccess] = useState('');
  const [formError, setFormError] = useState('');

  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingClient, setPendingClient] = useState(null);

  useEffect(() => { dispatch(fetchClientes()); }, [dispatch]);

  const handlePreSubmit = (e) => {
    e.preventDefault();
    
    setSuccess('');
    setFormError('');

    const dni = form.dni.trim();
    const nombre = form.nombre.trim();

    if (!dni || !nombre) {
      setFormError('DNI y nombre son obligatorios.');
      return;
    }

    if (!/^\d+$/.test(dni)) {
      setFormError('El DNI debe contener solo números.');
      return;
    }

    if (nombre.length < 3) {
      setFormError('El nombre debe tener al menos 3 caracteres.');
      return;
    }

    setPendingClient({ dni, nombre });
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setShowConfirm(false);
    if (!pendingClient) return;
    
    setIsSubmitting(true);
    
    const result = await dispatch(addCliente(pendingClient));

    if (result.meta.requestStatus === 'fulfilled') {
      setForm({ dni: '', nombre: '' });
      setSuccess('Cliente creado correctamente.');
    }
    
    setIsSubmitting(false);
    setPendingClient(null);
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setPendingClient(null);
  };

  return (
    <div className="container">
      <h2>Clientes</h2>

      <div className="card">
        <div className="card-header">
            <h3>Nuevo cliente</h3>
        </div>
        
        {success && <div className="error-message" style={{ backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)', borderColor: 'var(--color-success)' }}>{success}</div>}
        {formError && <div className="error-message">{formError}</div>}
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handlePreSubmit} className="form-grid" style={{ gridTemplateColumns: '1fr 2fr auto' }}>
          <div className="form-group">
              <label htmlFor="dni">DNI</label>
              <input id="dni" placeholder="DNI" value={form.dni} onChange={e => setForm({...form, dni: e.target.value})} required disabled={isSubmitting} />
          </div>
          <div className="form-group">
              <label htmlFor="nombre">Nombre completo</label>
              <input id="nombre" placeholder="Nombre completo" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required disabled={isSubmitting} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ alignSelf: 'end' }}>
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
          <p className="text-muted" style={{ textAlign: 'center', padding: 'var(--spacing-xl) 0' }}>No hay clientes registrados.</p>
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
                      
                      {clienteExpandido === c.dni && (
                        <tr>
                          <td colSpan="2" style={{ backgroundColor: '#f8f9fa', padding: 'var(--spacing-md)', borderLeft: '4px solid var(--color-primary)' }}>
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

      <ConfirmDialog
        isOpen={showConfirm}
        title="Confirmar Registro de Cliente"
        message={pendingClient ? `¿Estás seguro de que deseas registrar al cliente ${pendingClient.nombre} con DNI ${pendingClient.dni}?` : ''}
        confirmText="Confirmar"
        cancelText="Cancelar"
        type="primary"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
}
