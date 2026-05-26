import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCreditosPorCliente, addCredito, clearCreditos } from '../store/slices/creditosSlice';

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
  
  // Estado para manejar qué créditos están expandidos (ej: { [id]: true })
  const [expandedIds, setExpandedIds] = useState({});
  
  // Estado para capturar errores de validación del frontend
  const [validacionError, setValidationError] = useState('');

  const [form, setForm] = useState({ dniCliente:'', deudaOriginal:'', fecha:'', importeCuota:'', cantidadCuotas:'' });

  const buscar = async (e) => {
    e.preventDefault();
    dispatch(clearCreditos());
    const result = await dispatch(fetchCreditosPorCliente(dni));
    if (result.meta.requestStatus === 'fulfilled') setBuscado(true);
  };

  // Función para alternar el colapso/expansión de las cuotas
  const toggleExpandir = (id) => {
    setExpandedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSubmit = async (e) => {
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

    setValidationError(''); // Limpiamos errores de validación si pasa todo

    const payload = {
      ...form,
      deudaOriginal:  Number(form.deudaOriginal),
      importeCuota:   Number(form.importeCuota),
      cantidadCuotas: Number(form.cantidadCuotas),
    };

    const result = await dispatch(addCredito(payload));
    if (result.meta.requestStatus === 'fulfilled') {
      setForm({ dniCliente:'', deudaOriginal:'', fecha:'', importeCuota:'', cantidadCuotas:'' });
      if (form.dniCliente === dni) dispatch(fetchCreditosPorCliente(dni));
    }
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Créditos</h2>

      <div style={styles.card}>
        <h3>Buscar créditos por cliente</h3>
        <form onSubmit={buscar} style={styles.row}>
          <input style={styles.input} placeholder="DNI del cliente" value={dni} onChange={e => setDni(e.target.value)} required />
          <button style={styles.btn}>Buscar</button>
        </form>
      </div>

      <div style={styles.card}>
        <h3>Nuevo crédito</h3>
        {/* Mostramos tanto el error del backend como la validación local */}
        {(error || validacionError) && <div style={styles.error}>{error || validacionError}</div>}
        
        <form onSubmit={handleSubmit} style={styles.grid}>
          <input style={styles.input} placeholder="DNI cliente"          value={form.dniCliente}     onChange={e => setForm({...form, dniCliente: e.target.value})}     required />
          <input style={styles.input} placeholder="Deuda original"       value={form.deudaOriginal}  onChange={e => setForm({...form, deudaOriginal: e.target.value})}  type="number" required />
          <input style={styles.input} placeholder="Fecha"                value={form.fecha}          onChange={e => setForm({...form, fecha: e.target.value})}          type="date"   required />
          <input style={styles.input} placeholder="Importe cuota"        value={form.importeCuota}   onChange={e => setForm({...form, importeCuota: e.target.value})}   type="number" required />
          <input style={styles.input} placeholder="Cant. cuotas"         value={form.cantidadCuotas} onChange={e => setForm({...form, cantidadCuotas: e.target.value})} type="number" min="1" required />
          <button style={{...styles.btn, gridColumn:'span 2'}} disabled={loading}>{loading ? 'Guardando...' : 'Crear crédito'}</button>
        </form>
      </div>

      {buscado && (
        <div style={styles.card}>
          <h3>Créditos del cliente ({lista.length})</h3>
          {loading && <p style={styles.empty}>Cargando...</p>}
          {!loading && lista.length === 0 && <p style={styles.empty}>Sin créditos.</p>}
          
          {lista.map(cr => {
            // REQUERIMIENTO: Cálculo para el progreso de pagos
            const totalCuotas = cr.cuotas ? cr.cuotas.length : cr.cantidadCuotas;
            const cuotasPagadas = cr.cuotas ? cr.cuotas.filter(c => c.pagada).length : 0;
            const porcentajeProgreso = totalCuotas > 0 ? (cuotasPagadas / totalCuotas) * 100 : 0;
            const estaExpandido = !!expandedIds[cr.id];

            return (
              <div key={cr.id} style={styles.creditoBox}>
                <div style={styles.creditoHeader}>
                  <div>
                    <p><strong>ID #{cr.id}</strong> — Deuda: ${cr.deudaOriginal} — {cr.cantidadCuotas} cuotas de ${cr.importeCuota}</p>
                    
                    {/* REQUERIMIENTO: Barra de Progreso UX */}
                    <p style={styles.progresoTexto}>Progreso: {cuotasPagadas}/{totalCuotas} cuotas pagadas</p>
                    <div style={styles.progressContainer}>
                      <div style={{...styles.progressBar, width: `${porcentajeProgreso}%`}} />
                    </div>
                  </div>
                  
                  {/* REQUERIMIENTO: Botón para expandir/colapsar detalle */}
                  <button type="button" onClick={() => toggleExpandir(cr.id)} style={styles.toggleBtn}>
                    {estaExpandido ? '▲ Ocultar' : '▼ Ver Cuotas'}
                  </button>
                </div>

                {/* Si está expandido, se muestra la tabla */}
                {estaExpandido && cr.cuotas && (
                  <table style={styles.table}>
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
                          {/* REQUERIMIENTO: Fecha formateada */}
                          <td>{formatearFecha(c.fechaVencimiento)}</td>
                          <td style={{ color: c.pagada ? '#2e7d32' : '#c62828', fontWeight: 'bold' }}>
                            {c.pagada ? '✔ Pagada' : '✘ Pendiente'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  page:             { padding:'32px', maxWidth:'900px', margin:'0 auto', fontFamily: 'Arial, sans-serif' },
  title:            { color:'#1e3a5f', marginBottom:'24px' },
  card:             { background:'white', padding:'24px', borderRadius:'12px', boxShadow:'0 2px 10px rgba(0,0,0,0.08)', marginBottom:'24px' },
  row:              { display:'flex', gap:'12px' },
  grid:             { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' },
  input:            { padding:'10px', border:'1px solid #ccc', borderRadius:'6px', width:'100%', boxSizing:'border-box' },
  btn:              { padding:'10px 20px', backgroundColor:'#1e3a5f', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'bold' },
  error:            { background:'#ffebee', color:'#c62828', padding:'10px', borderRadius:'6px', marginBottom:'12px', fontSize:'0.9rem', fontWeight: 'bold' },
  empty:            { color:'#999' },
  creditoBox:       { borderLeft:'4px solid #1e3a5f', paddingLeft:'16px', marginBottom:'24px', background: '#f8f9fa', padding: '16px', borderRadius: '0 8px 8px 0' },
  creditoHeader:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  toggleBtn:        { background: 'none', border: 'none', color: '#1e3a5f', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' },
  progressContainer:{ background: '#e0e0e0', borderRadius: '8px', height: '10px', width: '250px', marginTop: '6px', overflow: 'hidden' },
  progressBar:      { background: '#2e7d32', height: '100%', transition: 'width 0.4s ease' },
  progresoTexto:    { margin: '4px 0 0 0', fontSize: '0.85rem', color: '#555' },
  table:            { width:'100%', borderCollapse:'collapse', marginTop:'16px', background: 'white', borderRadius: '6px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
};