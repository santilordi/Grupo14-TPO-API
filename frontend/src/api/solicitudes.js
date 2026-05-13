import { api } from './apiClient';

export const listarSolicitudes   = ()    => api.get('/solicitudes');
export const listarPendientes    = ()    => api.get('/solicitudes/pendientes');
export const crearSolicitud      = (data) => api.post('/solicitudes', data);
export const aprobarSolicitud    = (id)  => api.patch(`/solicitudes/${id}/aprobar`);
export const rechazarSolicitud   = (id)  => api.patch(`/solicitudes/${id}/rechazar`);
