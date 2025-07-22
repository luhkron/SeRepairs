import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // TODO: Implement actual authentication
    // For now, we'll just navigate to the reports page
    navigate('/reports');
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Login
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            
            {error && (
              <Typography color="error" variant="body2" align="center">
                {error}
              </Typography>
            )}
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default Login;
