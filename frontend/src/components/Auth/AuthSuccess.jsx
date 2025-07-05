import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      toast.error('No authentication token received');
      navigate('/');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload?.id || payload?.userId;

      if (!userId) throw new Error('Invalid token payload');

      login(token, { id: userId }); // optionally include name/email if available
      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      console.error('Token parsing error:', error.message);
      toast.error('Login failed');
      navigate('/');
    }
  }, [searchParams, login, navigate]);

  return (
    <div className="auth-success">
      <div className="loading">
        <div className="spinner"></div>
        <p>Completing login...</p>
      </div>
    </div>
  );
};

export default AuthSuccess;
