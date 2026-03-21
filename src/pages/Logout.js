import React from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('role');
    localStorage.removeItem('adminId');
    // Redirect based on role if needed
    const role = localStorage.getItem('role');
    if (role === 'ADMIN') {
      navigate('/admin-login');
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return null;
};

export default Logout;
