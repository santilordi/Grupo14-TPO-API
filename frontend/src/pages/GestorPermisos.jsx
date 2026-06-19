import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsuarios, updatePermisos } from '../store/slices/permisosSlice';

export default function GestorPermisos() {
  const dispatch = useDispatch();
  const { usuarios, loading, error, updatingId } = useSelector((state) => state.permisos);

  useEffect(() => {
    dispatch(fetchUsuarios());
  }, [dispatch]);

  const handleToggle = (usuario, campo) => {
    dispatch(updatePermisos({
      id: usuario.id,
      data: {
        puedeAnularCredito: campo === 'puedeAnularCredito' ? !usuario.puedeAnularCredito : usuario.puedeAnularCredito,
        puedeAnularCobranza: campo === 'puedeAnularCobranza' ? !usuario.puedeAnularCobranza : usuario.puedeAnularCobranza,
      },
    }));
  };

  const soloUsers = usuarios.filter((u) => u.rol === 'USER');

  return (
    <div className="container">
      <h2 style={{ color: '#1e3a5f', marginBottom: '24px' }}>Gestión de Permisos</h2>

      <div className="card">
        <div className="card-header">
          <h3>Usuarios y permisos</h3>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Cargando usuarios...</p>
          </div>
        ) : soloUsers.length === 0 ? (
          <p style={{ color: '#999', textAlign: 'center', padding: '2rem 0' }}>
            No hay usuarios con rol USER para gestionar.
          </p>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Puede Anular Crédito</th>
                  <th>Puede Anular Cobranza</th>
                </tr>
              </thead>
              <tbody>
                {soloUsers.map((u) => (
                  <tr key={u.id}>
                    <td>{u.username}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={u.puedeAnularCredito}
                        onChange={() => handleToggle(u, 'puedeAnularCredito')}
                        disabled={updatingId === u.id}
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={u.puedeAnularCobranza}
                        onChange={() => handleToggle(u, 'puedeAnularCobranza')}
                        disabled={updatingId === u.id}
                      />
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
