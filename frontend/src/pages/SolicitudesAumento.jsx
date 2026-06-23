import { useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchSolicitudes,
  fetchPendientes,
  addSolicitud,
  aprobar,
  rechazar,
  clearError,
} from '../store/slices/solicitudesSlice';
import '../styles/SolicitudesAumento.css';
import ConfirmDialog from '../components/ConfirmDialog';

const estadoInicialForm = { dniCliente: '', montoSolicitado: '' };

export default function SolicitudesAumento() {
  // ── Redux state ─────────────────────────────────────────────────────────────
  const dispatch = useDispatch();
  const { lista, loading, error } = useSelector((state) => state.solicitudes);

  // ── UI-only local state ──────────────────────────────────────────────────────
  const [form, setForm] = useState(estadoInicialForm);
  const [guardando, setGuardando] = useState(false);
  const [accionId, setAccionId] = useState(null);
  const [mensajeExito, setMensajeExito] = useState(null);
  const [filtro, setFiltro] = useState('todas');

  const [showCreateConfirm, setShowCreateConfirm] = useState(false);
  const [pendingCreate, setPendingCreate] = useState(null);

  const [showActionConfirm, setShowActionConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // ── Carga de datos ───────────────────────────────────────────────────────────
  const cargar = useCallback((pendientes) => {
    dispatch(pendientes ? fetchPendientes() : fetchSolicitudes());
  }, [dispatch]);

  useEffect(() => { cargar(false); }, [cargar]);

  const cambiarFiltro = (nuevo) => {
    setFiltro(nuevo);
    setMensajeExito(null);
    dispatch(clearError());
    cargar(nuevo === 'pendientes');
  };

  // ── Crear solicitud ──────────────────────────────────────────────────────────
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
    setMensajeExito(null);
    dispatch(clearError());
    try {
      const result = await dispatch(addSolicitud(pendingCreate));
      if (addSolicitud.fulfilled.match(result)) {
        setForm(estadoInicialForm);
        setMensajeExito('Solicitud creada correctamente.');
        cargar(filtro === 'pendientes');
      }
    } finally {
      setGuardando(false);
      setPendingCreate(null);
    }
  };

  const handleCancelCreate = () => {
    setShowCreateConfirm(false);
    setPendingCreate(null);
  };

  // ── Aprobar / Rechazar ───────────────────────────────────────────────────────
  const cambiarEstado = (solicitud, accion) => {
    setPendingAction({ solicitud, accion });
    setShowActionConfirm(true);
  };

  const handleConfirmAction = async () => {
    setShowActionConfirm(false);
    if (!pendingAction) return;
    const { solicitud, accion } = pendingAction;
    setAccionId(solicitud.id);
    setMensajeExito(null);
    dispatch(clearError());
    try {
      const thunk = accion === 'aprobar' ? aprobar : rechazar;
      const result = await dispatch(thunk(solicitud.id));
      if (thunk.fulfilled.match(result)) {
        setMensajeExito(`Solicitud #${solicitud.id} ${accion === 'aprobar' ? 'aprobada' : 'rechazada'} correctamente.`);
        cargar(filtro === 'pendientes');
      }
    } finally {
      setAccionId(null);
      setPendingAction(null);
    }
  };

  const handleCancelAction = () => {
    setShowActionConfirm(false);
    setPendingAction(null);
  };

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const badgeClass = (estado) => {
    const map = { PENDIENTE: 'sa-badge-pendiente', APROBADO: 'sa-badge-aprobado', RECHAZADO: 'sa-badge-rechazado' };
    return `sa-badge ${map[estado] ?? ''}`;
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="container">
      <h2>Solicitudes de Aumento</h2>

      <div className="card">
        <div className="card-header">
          <h3>Nueva solicitud</h3>
        </div>
        <form onSubmit={handleSubmit} className="form-grid" style={{ gridTemplateColumns: '1fr 1fr auto' }}>
          <div className="form-group">
            <label htmlFor="dniCliente">DNI cliente</label>
            <input id="dniCliente" value={form.dniCliente} onChange={e => setForm({ ...form, dniCliente: e.target.value })} placeholder="DNI" required disabled={guardando} />
          </div>
          <div className="form-group">
            <label htmlFor="montoSolicitado">Monto solicitado</label>
            <input id="montoSolicitado" value={form.montoSolicitado} onChange={e => setForm({ ...form, montoSolicitado: e.target.value })} placeholder="Monto" type="number" min="1" step="0.01" required disabled={guardando} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={guardando} style={{ alignSelf: 'end' }}>
            {guardando ? 'Guardando...' : 'Crear solicitud'}
          </button>
        </form>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button className={`btn ${filtro === 'todas' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => cambiarFiltro('todas')} disabled={loading}>
            Todas
          </button>
          <button className={`btn ${filtro === 'pendientes' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => cambiarFiltro('pendientes')} disabled={loading}>
            Solo pendientes
          </button>
        </div>
        <div className="card-header">
          <h3>
            {filtro === 'pendientes' ? 'Solicitudes pendientes' : 'Todas las solicitudes'}
            <span className="badge" style={{ marginLeft: 'var(--spacing-md)' }}>{lista.length}</span>
          </h3>
        </div>

        {mensajeExito && (
          <div className="error-message" style={{ backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)', borderColor: 'var(--color-success)' }}>
            {mensajeExito}
          </div>
        )}
        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Cargando solicitudes...</p>
          </div>
        ) : lista.length === 0 ? (
          <p className="text-muted" style={{ textAlign: 'center', padding: 'var(--spacing-xl) 0' }}>No hay solicitudes para mostrar.</p>
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
                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                          <button className="btn btn-success" onClick={() => cambiarEstado(s, 'aprobar')} disabled={accionId === s.id}>
                            Aprobar
                          </button>
                          <button className="btn btn-danger" onClick={() => cambiarEstado(s, 'rechazar')} disabled={accionId === s.id}>
                            Rechazar
                          </button>
                        </div>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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

      <ConfirmDialog
        isOpen={showActionConfirm}
        title={pendingAction?.accion === 'aprobar' ? 'Aprobar solicitud' : 'Rechazar solicitud'}
        message={pendingAction ? `¿Estás seguro de que deseas ${pendingAction.accion === 'aprobar' ? 'aprobar' : 'rechazar'} la solicitud #${pendingAction.solicitud.id} del cliente ${pendingAction.solicitud.dniCliente}?` : ''}
        confirmText={pendingAction?.accion === 'aprobar' ? 'Aprobar' : 'Rechazar'}
        cancelText="Cancelar"
        type={pendingAction?.accion === 'rechazar' ? 'danger' : 'primary'}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
      />
    </div>
  );
}
