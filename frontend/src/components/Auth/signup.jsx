import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 20px;
`;

const LoginCard = styled.div`
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
  width: 100%;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin: 10px 0;
  border-radius: 8px;
  border: 1px solid #ccc;
  &:focus {
    outline: none;
    border-color: #4285f4;
    box-shadow: 0 0 5px rgba(66, 133, 244, 0.3);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background-color: #4285f4;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 10px;
  opacity: ${(props) => (props.disabled ? 0.6 : 1)};
  &:hover {
    background-color: #357ae8;
  }
`;

const ToggleLink = styled.button`
  color: #555;
  font-size: 14px;
  margin-top: 10px;
  cursor: pointer;
  background: none;
  border: none;
  &:hover {
    color: #4285f4;
  }
  &:focus {
    outline: none;
    color: #4285f4;
  }
`;

const ErrorMessage = styled.p`
  color: #d32f2f;
  font-size: 12px;
  margin: 5px 0 0 0;
`;

const AuthForm = () => {
  const [isSignup, setIsSignup] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const validateForm = () => {
    const newErrors = {};
    if (isSignup && !form.name.trim()) {
      newErrors.name = 'Full name is required';
    }
    if (!form.email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
      newErrors.email = 'Invalid email address';
    }
    if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' }); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    const endpoint = isSignup ? '/signup' : '/login';

    try {
      const res = await axios.post(`${apiUrl}/api/auth${endpoint}`, form);
      alert(res.data.message || 'Success');
      // Store token (example using localStorage)
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        navigate('/dashboard'); // Redirect to dashboard or another route
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        (err.code === 'ERR_NETWORK' ? 'Network error. Please try again later.' : 'Something went wrong');
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <h1>🏥 Medical History App</h1>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          {isSignup ? 'Create an account' : 'Log in to your account'}
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {isSignup && (
            <>
              <Input
                type="text"
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                aria-label="Full Name"
                aria-describedby={errors.name ? 'name-error' : undefined}
                required
              />
              {errors.name && <ErrorMessage id="name-error">{errors.name}</ErrorMessage>}
            </>
          )}
          <Input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            aria-label="Email"
            aria-describedby={errors.email ? 'email-error' : undefined}
            required
          />
          {errors.email && <ErrorMessage id="email-error">{errors.email}</ErrorMessage>}
          <Input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            aria-label="Password"
            aria-describedby={errors.password ? 'password-error' : undefined}
            required
          />
          {errors.password && <ErrorMessage id="password-error">{errors.password}</ErrorMessage>}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Processing...' : isSignup ? 'Sign Up' : 'Login'}
          </Button>
        </form>

        <ToggleLink onClick={() => setIsSignup(!isSignup)}>
          {isSignup ? 'Already have an account? Login' : 'Don’t have an account? Sign Up'}
        </ToggleLink>
      </LoginCard>
    </LoginContainer>
  );
};

export default AuthForm;