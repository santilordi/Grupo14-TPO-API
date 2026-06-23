import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import clientesReducer from './slices/clientesSlice';
import creditosReducer from './slices/creditosSlice';
import cobranzasReducer from './slices/cobranzasSlice';
import permisosReducer from './slices/permisosSlice';
import solicitudesReducer from './slices/solicitudesSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    clientes: clientesReducer,
    creditos: creditosReducer,
    cobranzas: cobranzasReducer,
    permisos: permisosReducer,
    solicitudes: solicitudesReducer,
  },
});

export default store;
