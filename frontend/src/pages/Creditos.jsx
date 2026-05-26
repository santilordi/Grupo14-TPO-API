import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCreditosPorCliente, addCredito, clearCreditos } from '../store/slices/creditosSlice';
import ConfirmDialog from '../components/ConfirmDialog';

// Función auxiliar para formatear fechas de YYYY-MM-DD a DD/MM/YYYY sin desajustes de zona horaria
const formatearFecha = (fechaStr) => {
  if (!fechaStr) return '';
  return fechaStr.includes('-') ? fechaStr.split('-').reverse().join('/') : fechaStr;
};

export default function Creditos() {
  const dispatch = useDispatch();
  const { lista, loading, error } = useSelector((state) => state.creditos);
  const [dni, setDni] = useState('');
  const [buscado, setBuscado] = useState(false);
  const [form, setForm] = useState({ dniCliente: '', deudaOriginal: '', fecha: '', importeCuota: '', cantidadCuotas: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingCredit, setPendingCredit] = useState(null);

  // --- Estados combinados ---
  const [form, setForm] = useState({ dniCliente: '', deudaOriginal: '', fecha: '', importeCuota: '', cantidadCuotas: '' });
  const [isSubmitting, setIsSubmitting] = useState(false); // Viene de manuel_front
  
  const [expandedIds, setExpandedIds] = useState({}); // Viene de main
  const [validacionError, setValidationError] = useState(''); // Viene de main
  const buscar = async (e) => {
    e.preventDefault();
    dispatch(clearCreditos());
    const result = await dispatch(fetchCreditosPorCliente(dni));
    if (result.meta.requestStatus === 'fulfilled') {
      setBuscado(true);
    }
  };

  // Función para alternar el colapso/expansión de las cuotas
  const toggleExpandir = (id) => {
    setExpandedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handlePreSubmit = (e) => {
    e.preventDefault();
        // REQUERIMIENTO: Validaciones en el frontend antes de enviar
    if (Number(form.deudaOriginal) <= 0) {
      setValidationError('La deuda original debe ser un monto mayor a cero.');
      return;
    }
    if (Number(form.importeCuota) <= 0) {
      setValidationError('El importe de la cuota debe ser mayor a cero.');
      return;
    }
    if (Number(form.cantidadCuotas) <= 0) {
      setValidationError('La cantidad de cuotas debe ser al menos 1.');
      return;
    }
    if (form.dniCliente.trim().length < 7) {
      setValidationError('El DNI debe tener un formato válido (mínimo 7 dígitos).');
      return;
    }

    setValidationError('');
    setIsSubmitting(true);
    
    const payload = {
      ...form,
      deudaOriginal: Number(form.deudaOriginal),
      importeCuota: Number(form.importeCuota),
      cantidadCuotas: Number(form.cantidadCuotas),
    };


    if (!payload.dniCliente.trim() || isNaN(payload.deudaOriginal) || payload.deudaOriginal <= 0 || !payload.fecha || isNaN(payload.importeCuota) || payload.importeCuota <= 0 || isNaN(payload.cantidadCuotas) || payload.cantidadCuotas <= 0) {
      setValidationError('Todos los campos son obligatorios.');
      return;
    }

    setPendingCredit(payload);
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setShowConfirm(false);
    if (!pendingCredit) return;
    
    setIsSubmitting(true);
    const result = await dispatch(addCredito(pendingCredit));
    
    if (result.meta.requestStatus === 'fulfilled') {
      setForm({ dniCliente: '', deudaOriginal: '', fecha: '', importeCuota: '', cantidadCuotas: '' });
      if (pendingCredit.dniCliente === dni) dispatch(fetchCreditosPorCliente(dni));
    }
    
    setIsSubmitting(true);
    setPendingCredit(null);
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setPendingCredit(null);
  };

  const formatCurrency = (amount) => {
    return `$${Number(amount).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div style={styles.page}>
      <style>{`
        .form-input {
          transition: all 0.2s ease;
        }
        .form-input:focus {
          outline: none;
          border-color: #1e3a5f !important;
          box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.15);
        }
        .action-btn {
          transition: all 0.2s ease;
        }
        .action-btn:hover:not(:disabled) {
          background-color: #152b46 !important;
          transform: translateY(-1px);
        }
        .action-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .credito-card {
          transition: box-shadow 0.25s ease;
        }
        .credito-card:hover {
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.05);
        }
      `}</style>

      <h2 style={styles.title}>Créditos</h2>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Buscar créditos por cliente</h3>
        <form onSubmit={buscar} style={styles.row}>
          <input
            className="form-input"
            style={styles.input}
            placeholder="DNI del cliente"
            value={dni}
            onChange={e => setDni(e.target.value)}
            required
          />
          <button className="action-btn" style={styles.btn}>Buscar</button>
        </form>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Nuevo crédito</h3>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handlePreSubmit} style={styles.grid}>
          <input
            className="form-input"
            style={styles.input}
            placeholder="DNI cliente"
            value={form.dniCliente}
            onChange={e => setForm({ ...form, dniCliente: e.target.value })}
            required
          />
          <input
            className="form-input"
            style={styles.input}
            placeholder="Deuda original"
            value={form.deudaOriginal}
            onChange={e => setForm({ ...form, deudaOriginal: e.target.value })}
            type="number"
            step="0.01"
            required
          />
          <input
            className="form-input"
            style={styles.input}
            placeholder="Fecha"
            value={form.fecha}
            onChange={e => setForm({ ...form, fecha: e.target.value })}
            type="date"
            required
          />
          <input
            className="form-input"
            style={styles.input}
            placeholder="Importe cuota"
            value={form.importeCuota}
            onChange={e => setForm({ ...form, importeCuota: e.target.value })}
            type="number"
            step="0.01"
            required
          />
          <input
            className="form-input"
            style={{ ...styles.input, gridColumn: 'span 2' }}
            placeholder="Cant. cuotas"
            value={form.cantidadCuotas}
            onChange={e => setForm({ ...form, cantidadCuotas: e.target.value })}
            type="number"
            min="1"
            required
          />
          <button className="action-btn" style={{ ...styles.btn, gridColumn: 'span 2', marginTop: '8px' }} disabled={loading}>
            {loading ? 'Guardando...' : 'Crear crédito'}

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
          <button type="submit" className="btn btn-primary" disabled={loading && !isSubmitting}>Buscar</button>
        </form>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Nuevo crédito</h3>
        </div>
        {(error || validacionError) && <div className="error-message">{error || validacionError}</div>}
        <form onSubmit={handlePreSubmit} className="form-grid">
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
            lista.map(cr => {
              const totalCuotas = cr.cuotas ? cr.cuotas.length : cr.cantidadCuotas;
              const cuotasPagadas = cr.cuotas ? cr.cuotas.filter(c => c.pagada).length : 0;
              const porcentajeProgreso = totalCuotas > 0 ? (cuotasPagadas / totalCuotas) * 100 : 0;
              const estaExpandido = !!expandedIds[cr.id];

              return (
                <div key={cr.id} style={{ borderLeft: '4px solid #1e3a5f', paddingLeft: '16px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #eee' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    
                    <div style={{ flex: 1, minWidth: '250px' }}>
                      <p style={{ marginBottom: '8px' }}>
                        <strong>ID #{cr.id}</strong> — Deuda: {formatCurrency(cr.deudaOriginal)} — {cr.cantidadCuotas} cuotas de {formatCurrency(cr.importeCuota)}
                      </p>
                      
                      <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '4px' }}>
                        Progreso: {cuotasPagadas}/{totalCuotas} cuotas pagadas
                      </p>
                      <div style={{ width: '100%', maxWidth: '300px', backgroundColor: '#e0e0e0', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', backgroundColor: '#28a745', width: `${porcentajeProgreso}%`, transition: 'width 0.3s ease' }} />
                      </div>
                    </div>

                    <button 
                      type="button" 
                      onClick={() => toggleExpandir(cr.id)} 
                      style={{ backgroundColor: '#f0f4f8', color: '#1e3a5f', border: '1px solid #cce0ff', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      {estaExpandido ? '▲ Ocultar Cuotas' : '▼ Ver Cuotas'}
                    </button>
                    
                  </div>

                  {estaExpandido && cr.cuotas && (
                    <div className="table-wrapper" style={{ marginTop: '16px' }}>
                      <table className="table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Vencimiento</th>
                            <th>Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cr.cuotas.map(c => (
                            <tr key={c.idCuota}>
                              <td>{c.idCuota}</td>
                              <td>{formatearFecha(c.fechaVencimiento)}</td>
                              <td style={{ color: c.pagada ? '#2e7d32' : '#c62828', fontWeight: 'bold' }}>
                                {c.pagada ? 'Pagada' : 'Pendiente'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={showConfirm}
        title="Confirmar Creación de Crédito"
        message={pendingCredit ? `¿Estás seguro de que deseas crear un crédito por ${formatCurrency(pendingCredit.deudaOriginal)} en ${pendingCredit.cantidadCuotas} cuotas de ${formatCurrency(pendingCredit.importeCuota)} para el cliente con DNI ${pendingCredit.dniCliente}? Se generarán automáticamente las cuotas correspondientes.` : ''}
        confirmText="Crear Crédito"
        cancelText="Cancelar"
        type="primary"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
}
