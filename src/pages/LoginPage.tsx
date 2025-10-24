import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Login from '../components/Login';

const LoginPage: React.FC = () => {
  const { login, error, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (username: string, password: string) => {
    const success = await login(username, password);
    if (success) {
      navigate('/');
    }
  };

  return (
    <Login
      onLogin={handleLogin}
      isLoading={isLoading}
      error={error}
    />
  );
};

export default LoginPage;



