import React from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import { clearSession } from '../utils/session';

const Logout = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    axiosInstance.post('/api/auth/logout')
      .finally(() => {
        clearSession();
        navigate('/');
      });
  }, [navigate]);

  return null;
};

export default Logout;
