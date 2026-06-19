import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { listarUsuarios, actualizarPermisos } from '../../api/admin';

export const fetchUsuarios = createAsyncThunk('permisos/fetchUsuarios', async (_, { rejectWithValue }) => {
  try {
    return await listarUsuarios();
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const updatePermisos = createAsyncThunk('permisos/updatePermisos', async ({ id, data }, { rejectWithValue }) => {
  try {
    return await actualizarPermisos(id, data);
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const permisosSlice = createSlice({
  name: 'permisos',
  initialState: {
    usuarios: [],
    loading: false,
    error: null,
    updatingId: null,
  },
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsuarios.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsuarios.fulfilled, (state, action) => {
        state.loading = false;
        state.usuarios = action.payload;
      })
      .addCase(fetchUsuarios.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updatePermisos.pending, (state, action) => {
        state.updatingId = action.meta.arg.id;
        state.error = null;
      })
      .addCase(updatePermisos.fulfilled, (state, action) => {
        state.updatingId = null;
        const updated = action.payload;
        const idx = state.usuarios.findIndex((u) => u.id === updated.id);
        if (idx !== -1) state.usuarios[idx] = updated;
      })
      .addCase(updatePermisos.rejected, (state, action) => {
        state.updatingId = null;
        state.error = action.payload;
      });
  },
});

export const { clearError } = permisosSlice.actions;
export default permisosSlice.reducer;
