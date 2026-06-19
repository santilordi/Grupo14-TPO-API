import { api } from './apiClient';

export const listarUsuarios = () => api.get('/admin/usuarios');
export const actualizarPermisos = (id, data) => api.put(`/admin/usuarios/${id}/permisos`, data);
