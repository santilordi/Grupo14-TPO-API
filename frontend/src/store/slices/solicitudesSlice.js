import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  listarSolicitudes,
  listarPendientes,
  crearSolicitud,
  aprobarSolicitud,
  rechazarSolicitud,
} from '../../api/solicitudes';

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchSolicitudes = createAsyncThunk(
  'solicitudes/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await listarSolicitudes();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchPendientes = createAsyncThunk(
  'solicitudes/fetchPendientes',
  async (_, { rejectWithValue }) => {
    try {
      return await listarPendientes();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const addSolicitud = createAsyncThunk(
  'solicitudes/add',
  async (data, { rejectWithValue }) => {
    try {
      return await crearSolicitud(data);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const aprobar = createAsyncThunk(
  'solicitudes/aprobar',
  async (id, { rejectWithValue }) => {
    try {
      return await aprobarSolicitud(id);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const rechazar = createAsyncThunk(
  'solicitudes/rechazar',
  async (id, { rejectWithValue }) => {
    try {
      return await rechazarSolicitud(id);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const solicitudesSlice = createSlice({
  name: 'solicitudes',
  initialState: {
    lista: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      // fetchSolicitudes
      .addCase(fetchSolicitudes.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchSolicitudes.fulfilled, (state, action) => { state.loading = false; state.lista = action.payload; })
      .addCase(fetchSolicitudes.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // fetchPendientes
      .addCase(fetchPendientes.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchPendientes.fulfilled, (state, action) => { state.loading = false; state.lista = action.payload; })
      .addCase(fetchPendientes.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // addSolicitud
      .addCase(addSolicitud.pending, (state) => { state.error = null; })
      .addCase(addSolicitud.fulfilled, (state) => { state.error = null; })
      .addCase(addSolicitud.rejected, (state, action) => { state.error = action.payload; })
      // aprobar
      .addCase(aprobar.pending, (state) => { state.error = null; })
      .addCase(aprobar.fulfilled, (state) => { state.error = null; })
      .addCase(aprobar.rejected, (state, action) => { state.error = action.payload; })
      // rechazar
      .addCase(rechazar.pending, (state) => { state.error = null; })
      .addCase(rechazar.fulfilled, (state) => { state.error = null; })
      .addCase(rechazar.rejected, (state, action) => { state.error = action.payload; });
  },
});

export const { clearError } = solicitudesSlice.actions;
export default solicitudesSlice.reducer;
