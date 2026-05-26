import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCreditosPorCliente, addCredito, clearCreditos } from '../store/slices/creditosSlice';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Creditos() {
  const dispatch = useDispatch();
  const { lista, loading, error } = useSelector((state) => state.creditos);
  const [dni, setDni] = useState('');
  const [buscado, setBuscado] = useState(false);
  const [form, setForm] = useState({ dniCliente: '', deudaOriginal: '', fecha: '', importeCuota: '', cantidadCuotas: '' });

  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingCredit, setPendingCredit] = useState(null);

  const buscar = async (e) => {
    e.preventDefault();
    dispatch(clearCreditos());
    const result = await dispatch(fetchCreditosPorCliente(dni));
    if (result.meta.requestStatus === 'fulfilled') setBuscado(true);
  };

  const handlePreSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      deudaOriginal: Number(form.deudaOriginal),
      importeCuota: Number(form.importeCuota),
      cantidadCuotas: Number(form.cantidadCuotas),
    };

    if (!payload.dniCliente.trim() || isNaN(payload.deudaOriginal) || payload.deudaOriginal <= 0 || !payload.fecha || isNaN(payload.importeCuota) || payload.importeCuota <= 0 || isNaN(payload.cantidadCuotas) || payload.cantidadCuotas <= 0) {
      return;
    }

    setPendingCredit(payload);
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setShowConfirm(false);
    if (!pendingCredit) return;
    const result = await dispatch(addCredito(pendingCredit));
    if (result.meta.requestStatus === 'fulfilled') {
      setForm({ dniCliente: '', deudaOriginal: '', fecha: '', importeCuota: '', cantidadCuotas: '' });
      if (pendingCredit.dniCliente === dni) dispatch(fetchCreditosPorCliente(dni));
    }
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
          </button>
        </form>
      </div>

      {buscado && (
        <div style={styles.card}>
          <h3 style={{ ...styles.cardTitle, marginBottom: '20px' }}>Créditos del cliente ({lista.length})</h3>
          {loading && <p style={styles.empty}>Cargando...</p>}
          {!loading && lista.length === 0 && <p style={styles.empty}>Sin créditos.</p>}
          {!loading && lista.length > 0 && lista.map(cr => (
            <div key={cr.id} className="credito-card" style={styles.creditoBox}>
              <p style={styles.creditoHeader}>
                <strong>ID #{cr.id}</strong> — Deuda: <span style={styles.highlightText}>{formatCurrency(cr.deudaOriginal)}</span> — {cr.cantidadCuotas} cuotas de <span style={styles.highlightText}>{formatCurrency(cr.importeCuota)}</span>
              </p>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}># Cuota</th>
                    <th style={styles.th}>Vencimiento</th>
                    <th style={styles.th}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {cr.cuotas.map(c => (
                    <tr key={c.idCuota}>
                      <td style={styles.td}>{c.idCuota}</td>
                      <td style={styles.td}>{c.fechaVencimiento}</td>
                      <td style={{ ...styles.td, fontWeight: '600', color: c.pagada ? '#166534' : '#b91c1c' }}>
                        {c.pagada ? '✔ Pagada' : '✘ Pendiente'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
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

const styles = {
  page: { padding: '32px', maxWidth: '900px', margin: '0 auto' },
  title: { color: '#1e3a5f', marginBottom: '24px', fontWeight: '700', fontSize: '2rem' },
  card: { background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '24px', border: '1px solid #f1f5f9' },
  cardTitle: { fontSize: '1.15rem', color: '#0f172a', fontWeight: '600' },
  row: { display: 'flex', gap: '12px', marginTop: '16px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' },
  input: { padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', width: '100%', boxSizing: 'border-box', fontSize: '0.95rem' },
  btn: { padding: '10px 22px', backgroundColor: '#1e3a5f', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem' },
  error: { background: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', fontWeight: '500', border: '1px solid #fca5a5' },
  empty: { color: '#64748b', textAlign: 'center', padding: '24px 0', fontSize: '0.95rem' },
  creditoBox: { borderLeft: '4px solid #1e3a5f', paddingLeft: '16px', marginBottom: '24px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '0 12px 12px 0', border: '1px solid #e2e8f0', borderLeftWidth: '4px' },
  creditoHeader: { fontSize: '0.95rem', color: '#334155', marginBottom: '12px' },
  highlightText: { color: '#0f172a', fontWeight: '600' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '8px', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid #f1f5f9' },
  th: { padding: '10px 12px', background: '#f1f5f9', color: '#475569', borderBottom: '2px solid #e2e8f0', fontWeight: '600', textAlign: 'left', fontSize: '0.85rem' },
  td: { padding: '10px 12px', borderBottom: '1px solid #f1f5f9', color: '#475569', fontSize: '0.9rem' }
};

