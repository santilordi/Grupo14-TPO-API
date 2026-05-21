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
    <div className="container">
      <h2 style={{ color: '#1e3a5f', marginBottom: '24px' }}>Solicitudes de Aumento</h2>

      <div className="card">
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            className={`btn ${filtro === 'todas' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => cambiarFiltro('todas')}
          >
            Todas
          </button>
          <button
            className={`btn ${filtro === 'pendientes' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => cambiarFiltro('pendientes')}
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
          </div>
        )}
      </div>
    </div>
  );
}
