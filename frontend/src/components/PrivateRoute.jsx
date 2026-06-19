import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function PrivateRoute({ children, requiredRole }) {
  const user = useSelector((state) => state.auth.user);
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && user.rol !== requiredRole) return <Navigate to="/" replace />;
  return children;
}
