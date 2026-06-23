import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  listarSolicitudes,
  listarPendientes,
  crearSolicitud,
  aprobarSolicitud,
  rechazarSolicitud,
} from '../../api/solicitudes';

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

const initialState = {
  lista: [],
  loading: false,
  error: null,
};

const updateSolicitud = (lista, solicitudActualizada) => {
  const index = lista.findIndex((solicitud) => solicitud.id === solicitudActualizada.id);
  if (index !== -1) {
    lista[index] = solicitudActualizada;
  }
};

const solicitudesSlice = createSlice({
  name: 'solicitudes',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSolicitudes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSolicitudes.fulfilled, (state, action) => {
        state.loading = false;
        state.lista = action.payload;
      })
      .addCase(fetchSolicitudes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPendientes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendientes.fulfilled, (state, action) => {
        state.loading = false;
        state.lista = action.payload;
      })
      .addCase(fetchPendientes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addSolicitud.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addSolicitud.fulfilled, (state, action) => {
        state.loading = false;
        state.lista.push(action.payload);
      })
      .addCase(addSolicitud.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(aprobar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(aprobar.fulfilled, (state, action) => {
        state.loading = false;
        updateSolicitud(state.lista, action.payload);
      })
      .addCase(aprobar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(rechazar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rechazar.fulfilled, (state, action) => {
        state.loading = false;
        updateSolicitud(state.lista, action.payload);
      })
      .addCase(rechazar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = solicitudesSlice.actions;
export default solicitudesSlice.reducer;
