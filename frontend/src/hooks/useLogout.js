import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const useLogout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return () => {
    logout();
    navigate('/login', { replace: true });
  };
};
