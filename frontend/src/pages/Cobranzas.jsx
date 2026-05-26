import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCobranzasPorCredito, addCobranza, clearCobranzas } from '../store/slices/cobranzasSlice';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Cobranzas() {
  const dispatch = useDispatch();
  const { lista, loading, error } = useSelector((state) => state.cobranzas);
  
  const [idCredito, setIdCredito] = useState('');
  const [buscado, setBuscado]     = useState(false);
  const [form, setForm]           = useState({ idCredito:'', idCuota:'', importe:'' });
  
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [pendingPayment, setPendingPayment] = useState(null);

  const buscar = async (e) => {
    e.preventDefault();
    dispatch(clearCobranzas());
    const result = await dispatch(fetchCobranzasPorCredito(idCredito));
    if (result.meta.requestStatus === 'fulfilled') setBuscado(true);
  };

  const handlePreSubmit = (e) => {
    e.preventDefault();
    const payload = { 
      idCredito: Number(form.idCredito), 
      idCuota: Number(form.idCuota), 
      importe: Number(form.importe) 
    };

    if (isNaN(payload.idCredito) || payload.idCredito <= 0) return;
    if (isNaN(payload.idCuota) || payload.idCuota <= 0) return;
    if (isNaN(payload.importe) || payload.importe <= 0) return;

    setPendingPayment(payload);
    setShowPaymentConfirm(true);
  };

  const handleConfirmPayment = async () => {
    setShowPaymentConfirm(false);
    if (!pendingPayment) return;

    const result = await dispatch(addCobranza(pendingPayment));
    if (result.meta.requestStatus === 'fulfilled') {
      setForm({ idCredito:'', idCuota:'', importe:'' });
      if (String(pendingPayment.idCredito) === idCredito) {
        dispatch(fetchCobranzasPorCredito(idCredito));
      }
    }
    setPendingPayment(null);
  };

  const handleCancelPayment = () => {
    setShowPaymentConfirm(false);
    setPendingPayment(null);
  };

  const totalCobrado = lista.reduce((acc, curr) => acc + Number(curr.importe), 0);

  const formatCurrency = (amount) => {
    return `$${Number(amount).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div style={styles.page}>
      <style>{`
        .payment-card {
          transition: all 0.25s ease;
        }
        .payment-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
          background-color: #f1f5f9 !important;
          border-color: #cbd5e1 !important;
        }
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
      `}</style>

      <h2 style={styles.title}>Cobranzas</h2>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Buscar cobranzas por crédito</h3>
        <form onSubmit={buscar} style={styles.row}>
          <input 
            className="form-input"
            style={styles.input} 
            placeholder="ID del crédito" 
            type="number" 
            value={idCredito} 
            onChange={e => setIdCredito(e.target.value)} 
            required 
          />
          <button className="action-btn" style={styles.btn}>Buscar</button>
        </form>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Registrar pago de cuota</h3>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handlePreSubmit} style={styles.row}>
          <input 
            className="form-input"
            style={styles.input} 
            placeholder="ID crédito" 
            type="number" 
            value={form.idCredito} 
            onChange={e => setForm({...form, idCredito: e.target.value})} 
            required 
          />
          <input 
            className="form-input"
            style={styles.input} 
            placeholder="Nro. cuota"  
            type="number" 
            min="1" 
            value={form.idCuota}   
            onChange={e => setForm({...form, idCuota: e.target.value})}   
            required 
          />
          <input 
            className="form-input"
            style={styles.input} 
            placeholder="Importe"     
            type="number" 
            step="0.01"
            value={form.importe}    
            onChange={e => setForm({...form, importe: e.target.value})}    
            required 
          />
          <button className="action-btn" style={styles.btn} disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar'}
          </button>
        </form>
      </div>

      {buscado && (
        <div style={styles.card}>
          <h3 style={{...styles.cardTitle, marginBottom: '20px'}}>Cobranzas del crédito #{idCredito}</h3>
          {loading && <p style={styles.empty}>Cargando...</p>}
          {!loading && lista.length === 0 && <p style={styles.empty}>Sin cobranzas registradas.</p>}
          {!loading && lista.length > 0 && (
            <div style={styles.listContainer}>
              <div style={styles.summaryCard}>
                <div style={styles.summaryItem}>
                  <span style={styles.summaryLabel}>Total Cobrado</span>
                  <span style={styles.summaryValue}>{formatCurrency(totalCobrado)}</span>
                </div>
                <div style={styles.summaryDivider}></div>
                <div style={styles.summaryItem}>
                  <span style={styles.summaryLabel}>Pagos Registrados</span>
                  <span style={styles.summaryValue}>{lista.length}</span>
                </div>
              </div>

              <div style={styles.paymentsGrid}>
                {lista.map(c => (
                  <div key={c.id} className="payment-card" style={styles.paymentCard}>
                    <div style={styles.paymentIconContainer}>
                      💵
                    </div>
                    <div style={styles.paymentMainInfo}>
                      <div style={styles.paymentHeader}>
                        <span style={styles.paymentTitle}>Pago #{c.id}</span>
                        <span style={styles.successBadge}>✓ Registrado</span>
                      </div>
                      <div style={styles.paymentDetails}>
                        <span><strong>Crédito:</strong> #{c.idCredito}</span>
                        <span style={styles.detailDivider}>•</span>
                        <span><strong>Cuota:</strong> {c.idCuota}</span>
                      </div>
                    </div>
                    <div style={styles.paymentAmount}>
                      {formatCurrency(c.importe)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={showPaymentConfirm}
        title="Confirmar Registro de Pago"
        message={pendingPayment ? `¿Estás seguro de que deseas registrar el pago de ${formatCurrency(pendingPayment.importe)} para la cuota ${pendingPayment.idCuota} del crédito #${pendingPayment.idCredito}? Esta operación quedará registrada en el sistema.` : ''}
        confirmText="Confirmar Pago"
        cancelText="Cancelar"
        type="primary"
        onConfirm={handleConfirmPayment}
        onCancel={handleCancelPayment}
      />
    </div>
  );
}

const styles = {
  page:  { padding:'32px', maxWidth:'800px', margin:'0 auto' },
  title: { color:'#1e3a5f', marginBottom:'24px', fontWeight:'700', fontSize:'2rem' },
  card:  { background:'white', padding:'24px', borderRadius:'16px', boxShadow:'0 4px 20px rgba(0,0,0,0.05)', marginBottom:'24px', border:'1px solid #f1f5f9' },
  cardTitle: { fontSize:'1.15rem', color:'#0f172a', fontWeight:'600', marginBottom:'16px' },
  row:   { display:'flex', gap:'12px', flexWrap:'wrap' },
  input: { padding:'10px 14px', border:'1px solid #cbd5e1', borderRadius:'8px', flex:'1', minWidth:'120px', fontSize:'0.95rem' },
  btn:   { padding:'10px 22px', backgroundColor:'#1e3a5f', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'600', fontSize:'0.95rem' },
  error: { background:'#fee2e2', color:'#b91c1c', padding:'12px', borderRadius:'8px', marginBottom:'16px', fontSize:'0.9rem', fontWeight:'500', border:'1px solid #fca5a5' },
  empty: { color:'#64748b', textAlign:'center', padding:'24px 0', fontSize:'0.95rem' },
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  summaryCard: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #1e3a5f 0%, #0f1e31 100%)',
    color: '#ffffff',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(30, 58, 95, 0.15)',
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  summaryLabel: {
    fontSize: '0.75rem',
    color: '#93c5fd',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
  },
  summaryDivider: {
    width: '1px',
    height: '40px',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  paymentsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  paymentCard: {
    display: 'flex',
    alignItems: 'center',
    background: '#f8fafc',
    padding: '14px 20px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
  },
  paymentIconContainer: {
    fontSize: '1.4rem',
    marginRight: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    width: '42px',
    height: '42px',
    borderRadius: '50%',
  },
  paymentMainInfo: {
    flex: '1',
  },
  paymentHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '2px',
  },
  paymentTitle: {
    fontWeight: '600',
    color: '#0f172a',
    fontSize: '0.95rem',
  },
  successBadge: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    padding: '2px 8px',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  paymentDetails: {
    fontSize: '0.8rem',
    color: '#64748b',
    display: 'flex',
    gap: '6px',
  },
  detailDivider: {
    color: '#cbd5e1',
  },
  paymentAmount: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#166534',
  },
};

