import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClientes, addCliente } from '../store/slices/clientesSlice';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Clientes() {
  const dispatch = useDispatch();
  const { lista, loading, error } = useSelector((state) => state.clientes);
  const [form, setForm] = useState({ dni: '', nombre: '' });

  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingClient, setPendingClient] = useState(null);

  useEffect(() => { dispatch(fetchClientes()); }, [dispatch]);

  const handlePreSubmit = (e) => {
    e.preventDefault();
    if (!form.dni.trim() || !form.nombre.trim()) return;
    setPendingClient({ ...form });
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setShowConfirm(false);
    if (!pendingClient) return;
    const result = await dispatch(addCliente(pendingClient));
    if (result.meta.requestStatus === 'fulfilled') setForm({ dni: '', nombre: '' });
    setPendingClient(null);
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setPendingClient(null);
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
        .table-row {
          transition: background-color 0.2s ease;
        }
        .table-row:hover {
          background-color: #f8fafc !important;
        }
      `}</style>

      <h2 style={styles.title}>Clientes</h2>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Nuevo cliente</h3>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handlePreSubmit} style={styles.form}>
          <input
            className="form-input"
            style={styles.input}
            placeholder="DNI"
            value={form.dni}
            onChange={e => setForm({ ...form, dni: e.target.value })}
            required
          />
          <input
            className="form-input"
            style={styles.input}
            placeholder="Nombre completo"
            value={form.nombre}
            onChange={e => setForm({ ...form, nombre: e.target.value })}
            required
          />
          <button className="action-btn" style={styles.btn} disabled={loading}>
            {loading ? 'Guardando...' : 'Agregar'}
          </button>
        </form>
      </div>

      <div style={styles.card}>
        <h3 style={{ ...styles.cardTitle, marginBottom: '16px' }}>Lista de clientes ({lista.length})</h3>
        {loading && <p style={styles.empty}>Cargando...</p>}
        {!loading && lista.length === 0 && <p style={styles.empty}>No hay clientes registrados.</p>}
        {!loading && lista.length > 0 && (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>DNI</th>
                <th style={styles.th}>Nombre</th>
              </tr>
            </thead>
            <tbody>
              {lista.map(c => (
                <tr key={c.dni} className="table-row">
                  <td style={styles.td}>{c.dni}</td>
                  <td style={styles.td}>{c.nombre}</td>
                </tr>
              ))}
            </tbody>
          </table>
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

const styles = {
  page: { padding: '32px', maxWidth: '800px', margin: '0 auto' },
  title: { color: '#1e3a5f', marginBottom: '24px', fontWeight: '700', fontSize: '2rem' },
  card: { background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '24px', border: '1px solid #f1f5f9' },
  cardTitle: { fontSize: '1.15rem', color: '#0f172a', fontWeight: '600' },
  form: { display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginTop: '16px' },
  input: { padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', flex: '1', minWidth: '140px', fontSize: '0.95rem' },
  btn: { padding: '10px 22px', backgroundColor: '#1e3a5f', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem' },
  error: { background: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', fontWeight: '500', border: '1px solid #fca5a5' },
  empty: { color: '#64748b', textAlign: 'center', padding: '24px 0', fontSize: '0.95rem' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 16px', background: '#f8fafc', color: '#475569', borderBottom: '2px solid #e2e8f0', fontWeight: '600', textAlign: 'left', fontSize: '0.9rem' },
  td: { padding: '12px 16px', borderBottom: '1px solid #f1f5f9', color: '#334155', fontSize: '0.95rem' }
};

