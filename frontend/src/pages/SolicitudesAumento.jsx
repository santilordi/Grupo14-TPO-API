import { useEffect, useState } from 'react';
import { listarSolicitudes, listarPendientes } from '../api/solicitudes';
import '../styles/SolicitudesAumento.css';

export default function SolicitudesAumento() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState('todas');

  const cargar = async (pendientes) => {
    setLoading(true);
    setError(null);
    try {
      const data = pendientes ? await listarPendientes() : await listarSolicitudes();
      setLista(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(false); }, []);

  const cambiarFiltro = (nuevo) => {
    setFiltro(nuevo);
    cargar(nuevo === 'pendientes');
  };

  const badgeClass = (estado) => {
    const map = { PENDIENTE: 'sa-badge-pendiente', APROBADO: 'sa-badge-aprobado', RECHAZADO: 'sa-badge-rechazado' };
    return `sa-badge ${map[estado] ?? ''}`;
  };

  return (
    <div className="sa-page">
      <h2 className="sa-title">Solicitudes de Aumento</h2>

      <div className="sa-card">
        <div className="sa-filtros">
          <button
            className={`sa-btn ${filtro === 'todas' ? 'sa-btn-activo' : 'sa-btn-inactivo'}`}
            onClick={() => cambiarFiltro('todas')}
          >
            Todas
          </button>
          <button
            className={`sa-btn ${filtro === 'pendientes' ? 'sa-btn-activo' : 'sa-btn-inactivo'}`}
            onClick={() => cambiarFiltro('pendientes')}
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

        {error && <div className="sa-error">{error}</div>}

        {loading && <p className="sa-empty">Cargando...</p>}

        {!loading && !error && lista.length === 0 && (
          <p className="sa-empty">No hay solicitudes registradas.</p>
        )}

        {!loading && lista.length > 0 && (
          <table className="sa-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>DNI Cliente</th>
                <th>Monto solicitado</th>
                <th>Fecha</th>
                <th>Estado</th>
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
