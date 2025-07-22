import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import axios from 'axios';

const ReportIssue = () => {
  const [formData, setFormData] = useState({
    truck_id: '',
    issue_description: '',
    driver_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:5000/api/report-issue', formData);
      alert('Issue reported successfully!');
      setFormData({ truck_id: '', issue_description: '', driver_id: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to report issue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Report Truck Issue
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Truck ID</InputLabel>
              <Select
                name="truck_id"
                value={formData.truck_id}
                onChange={handleChange}
                required
              >
                <MenuItem value="TRK123">TRK123</MenuItem>
                <MenuItem value="TRK456">TRK456</MenuItem>
                <MenuItem value="TRK789">TRK789</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Driver ID"
              name="driver_id"
              value={formData.driver_id}
              onChange={handleChange}
              required
            />
            
            <TextField
              fullWidth
              label="Issue Description"
              name="issue_description"
              value={formData.issue_description}
              onChange={handleChange}
              multiline
              rows={4}
              required
            />
            
            {error && (
              <Typography color="error" variant="body2">
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
              {loading ? 'Submitting...' : 'Submit Report'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default ReportIssue;
