import { useCallback, useEffect, useState } from 'react';
import {
  aprobarSolicitud,
  crearSolicitud,
  listarPendientes,
  listarSolicitudes,
  rechazarSolicitud,
} from '../api/solicitudes';
import '../styles/SolicitudesAumento.css';
import ConfirmDialog from '../components/ConfirmDialog';

const estadoInicialForm = { dniCliente: '', montoSolicitado: '' };

export default function SolicitudesAumento() {
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState(estadoInicialForm);
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [accionId, setAccionId] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [filtro, setFiltro] = useState('todas');

  // Estados para ConfirmDialog – crear solicitud
  const [showCreateConfirm, setShowCreateConfirm] = useState(false);
  const [pendingCreate, setPendingCreate] = useState(null);

  // Estados para ConfirmDialog – aprobar / rechazar
  const [showActionConfirm, setShowActionConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // { solicitud, accion }

  const cargar = useCallback(async (pendientes) => {
    setLoading(true);
    try {
      const data = pendientes ? await listarPendientes() : await listarSolicitudes();
      setLista(data);
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(false); }, [cargar]);

  const cambiarFiltro = (nuevo) => {
    setFiltro(nuevo);
    setMensaje(null);
    cargar(nuevo === 'pendientes');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.dniCliente.trim() || !form.montoSolicitado) return;
    setPendingCreate({ dniCliente: form.dniCliente.trim(), montoSolicitado: Number(form.montoSolicitado) });
    setShowCreateConfirm(true);
  };

  const handleConfirmCreate = async () => {
    setShowCreateConfirm(false);
    if (!pendingCreate) return;
    setGuardando(true);
    setMensaje(null);
    try {
      await crearSolicitud(pendingCreate);
      setForm(estadoInicialForm);
      setMensaje({ tipo: 'exito', texto: 'Solicitud creada correctamente.' });
      await cargar(filtro === 'pendientes');
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message });
    } finally {
      setGuardando(false);
      setPendingCreate(null);
    }
  };

  const handleCancelCreate = () => {
    setShowCreateConfirm(false);
    setPendingCreate(null);
  };

  const cambiarEstado = (solicitud, accion) => {
    setPendingAction({ solicitud, accion });
    setShowActionConfirm(true);
  };

  const handleConfirmAction = async () => {
    setShowActionConfirm(false);
    if (!pendingAction) return;
    const { solicitud, accion } = pendingAction;
    setAccionId(solicitud.id);
    setMensaje(null);
    try {
      if (accion === 'aprobar') {
        await aprobarSolicitud(solicitud.id);
      } else {
        await rechazarSolicitud(solicitud.id);
      }
      setMensaje({ tipo: 'exito', texto: `Solicitud #${solicitud.id} ${accion === 'aprobar' ? 'aprobada' : 'rechazada'} correctamente.` });
      await cargar(filtro === 'pendientes');
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message });
    } finally {
      setAccionId(null);
      setPendingAction(null);
    }
  };

  const handleCancelAction = () => {
    setShowActionConfirm(false);
    setPendingAction(null);
  };

  const badgeClass = (estado) => {
    const map = { PENDIENTE: 'sa-badge-pendiente', APROBADO: 'sa-badge-aprobado', RECHAZADO: 'sa-badge-rechazado' };
    return `sa-badge ${map[estado] ?? ''}`;
  };

  return (
    <div className="container">
      <h2 style={{ color: '#1e3a5f', marginBottom: '24px' }}>Solicitudes de Aumento</h2>


      <div className="card">
        <div className="card-header">
          <h3>Nueva solicitud</h3>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', padding: '0 0 1rem 0' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="dniCliente">DNI cliente</label>
            <input
              id="dniCliente"
              value={form.dniCliente}
              onChange={e => setForm({ ...form, dniCliente: e.target.value })}
              placeholder="DNI"
              required
              disabled={guardando}
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="montoSolicitado">Monto solicitado</label>
            <input
              id="montoSolicitado"
              value={form.montoSolicitado}
              onChange={e => setForm({ ...form, montoSolicitado: e.target.value })}
              placeholder="Monto"
              type="number"
              min="1"
              step="0.01"
              required
              disabled={guardando}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={guardando} style={{ height: '42px' }}>
            {guardando ? 'Guardando...' : 'Crear solicitud'}
          </button>
        </form>
      </div>

      {/* Tarjeta para los filtros y la tabla */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>

          <button
            className={`btn ${filtro === 'todas' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => cambiarFiltro('todas')}
            disabled={loading}
          >
            Todas
          </button>
          <button
            className={`btn ${filtro === 'pendientes' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => cambiarFiltro('pendientes')}
            disabled={loading}
          >
            Solo pendientes
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>
            {filtro === 'pendientes' ? 'Solicitudes pendientes' : 'Todas las solicitudes'}
            <span style={{ backgroundColor: '#e0e0e0', color: '#333', borderRadius: '12px', padding: '0.2rem 0.6rem', fontSize: '0.8rem', marginLeft: '1rem' }}>
              {lista.length}
            </span>
          </h3>
        </div>

        {error && <div className="error-message">{error}</div>}
        
        {mensaje && (
          <div style={{ 
            padding: '10px', 
            marginBottom: '1rem', 
            borderRadius: '4px', 
            backgroundColor: mensaje.tipo === 'error' ? '#ffebee' : '#d4edda', 
            color: mensaje.tipo === 'error' ? '#c62828' : '#155724' 
          }}>
            {mensaje.texto}
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Cargando solicitudes...</p>
          </div>
        ) : !error && lista.length === 0 ? (
          <p style={{ color: '#999', textAlign: 'center', padding: '2rem 0' }}>No hay solicitudes para mostrar.</p>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>DNI Cliente</th>
                  <th>Monto solicitado</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {lista.map(s => (
                  <tr key={s.id}>
                    <td>#{s.id}</td>
                    <td>{s.dniCliente}</td>
                    <td>${Number(s.montoSolicitado).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                    <td>{s.fechaSolicitud}</td>
                    <td><span className={badgeClass(s.estado)}>{s.estado}</span></td>
                    <td>
                      {s.estado === 'PENDIENTE' ? (
                        <div className="sa-actions">
                          <button
                            className="sa-action sa-action-approve"
                            onClick={() => cambiarEstado(s, 'aprobar')}
                            disabled={accionId === s.id}
                          >
                            Aprobar
                          </button>
                          <button
                            className="sa-action sa-action-reject"
                            onClick={() => cambiarEstado(s, 'rechazar')}
                            disabled={accionId === s.id}
                          >
                            Rechazar
                          </button>
                        </div>
                      ) : (
                        <span className="sa-muted">Sin acciones</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal – Crear solicitud */}
      <ConfirmDialog
        isOpen={showCreateConfirm}
        title="Confirmar solicitud de aumento"
        message={pendingCreate ? `¿Estás seguro de que deseas crear una solicitud de aumento por $${Number(pendingCreate.montoSolicitado).toLocaleString('es-AR', { minimumFractionDigits: 2 })} para el cliente con DNI ${pendingCreate.dniCliente}?` : ''}
        confirmText="Crear solicitud"
        cancelText="Cancelar"
        type="primary"
        onConfirm={handleConfirmCreate}
        onCancel={handleCancelCreate}
      />

      {/* Modal – Aprobar / Rechazar */}
      <ConfirmDialog
        isOpen={showActionConfirm}
        title={pendingAction?.accion === 'aprobar' ? 'Aprobar solicitud' : 'Rechazar solicitud'}
        message={pendingAction ? `¿Estás seguro de que deseas ${pendingAction.accion === 'aprobar' ? 'aprobar' : 'rechazar'} la solicitud #${pendingAction.solicitud.id} del cliente ${pendingAction.solicitud.dniCliente}? Esta acción no se puede deshacer.` : ''}
        confirmText={pendingAction?.accion === 'aprobar' ? 'Aprobar' : 'Rechazar'}
        cancelText="Cancelar"
        type={pendingAction?.accion === 'rechazar' ? 'danger' : 'primary'}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
      />
    </div>
  );
}
