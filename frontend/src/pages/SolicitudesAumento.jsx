import { useCallback, useEffect, useState } from 'react';
import {
  aprobarSolicitud,
  crearSolicitud,
  listarPendientes,
  listarSolicitudes,
  rechazarSolicitud,
} from '../api/solicitudes';
import '../styles/SolicitudesAumento.css';

const estadoInicialForm = { dniCliente: '', montoSolicitado: '' };

export default function SolicitudesAumento() {
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState(estadoInicialForm);
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [accionId, setAccionId] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [filtro, setFiltro] = useState('todas');

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!window.confirm('Confirmar creacion de la solicitud de aumento?')) return;

    setGuardando(true);
    setMensaje(null);
    try {
      await crearSolicitud({
        dniCliente: form.dniCliente.trim(),
        montoSolicitado: Number(form.montoSolicitado),
      });
      setForm(estadoInicialForm);
      setMensaje({ tipo: 'exito', texto: 'Solicitud creada correctamente.' });
      await cargar(filtro === 'pendientes');
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message });
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEstado = async (solicitud, accion) => {
    const textoAccion = accion === 'aprobar' ? 'aprobar' : 'rechazar';
    if (!window.confirm(`Confirmar ${textoAccion} la solicitud #${solicitud.id}?`)) return;

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
    }
  };

  const badgeClass = (estado) => {
    const map = { PENDIENTE: 'sa-badge-pendiente', APROBADO: 'sa-badge-aprobado', RECHAZADO: 'sa-badge-rechazado' };
    return `sa-badge ${map[estado] ?? ''}`;
  };

  return (
    <div className="sa-page">
      <h2 className="sa-title">Solicitudes de Aumento</h2>

      <div className="sa-card">
        <h3 className="sa-card-title">Nueva solicitud</h3>
        <form className="sa-form" onSubmit={handleSubmit}>
          <label className="sa-field">
            <span>DNI cliente</span>
            <input
              value={form.dniCliente}
              onChange={e => setForm({ ...form, dniCliente: e.target.value })}
              placeholder="DNI"
              required
            />
          </label>
          <label className="sa-field">
            <span>Monto solicitado</span>
            <input
              value={form.montoSolicitado}
              onChange={e => setForm({ ...form, montoSolicitado: e.target.value })}
              placeholder="Monto"
              type="number"
              min="1"
              step="0.01"
              required
            />
          </label>
          <button className="sa-btn sa-btn-activo" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Crear solicitud'}
          </button>
        </form>
      </div>

      <div className="sa-card sa-toolbar-card">
        <div className="sa-filtros">
          <button
            className={`sa-btn ${filtro === 'todas' ? 'sa-btn-activo' : 'sa-btn-inactivo'}`}
            onClick={() => cambiarFiltro('todas')}
            disabled={loading}
          >
            Todas
          </button>
          <button
            className={`sa-btn ${filtro === 'pendientes' ? 'sa-btn-activo' : 'sa-btn-inactivo'}`}
            onClick={() => cambiarFiltro('pendientes')}
            disabled={loading}
          >
            Solo pendientes
          </button>
        </div>
      </div>

      <div className="sa-card">
        <h3 className="sa-card-title">
          {filtro === 'pendientes' ? 'Solicitudes pendientes' : 'Todas las solicitudes'}
          <span className="sa-count">{lista.length}</span>
        </h3>

        {mensaje && <div className={`sa-alert sa-alert-${mensaje.tipo}`}>{mensaje.texto}</div>}

        {loading && <p className="sa-empty">Cargando...</p>}

        {!loading && lista.length === 0 && (
          <p className="sa-empty">No hay solicitudes registradas.</p>
        )}

        {!loading && lista.length > 0 && (
          <div className="sa-table-wrap">
            <table className="sa-table">
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
    </div>
  );
}
