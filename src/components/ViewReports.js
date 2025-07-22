import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import axios from 'axios';

const ViewReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/get-reports');
      setReports(response.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (report) => {
    setSelectedReport(report);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Maintenance Reports
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Truck ID</TableCell>
                <TableCell>Issue Description</TableCell>
                <TableCell>Reported Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No reports found
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{report.truck_id}</TableCell>
                    <TableCell>{report.issue_description}</TableCell>
                    <TableCell>{new Date(report.reported_date).toLocaleString()}</TableCell>
                    <TableCell>
                      <span style={{ 
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: report.status === 'pending' ? '#ffd700' : 
                                        report.status === 'in_progress' ? '#007bff' : 
                                        '#28a745',
                        color: 'white'
                      }}>
                        {report.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleViewDetails(report)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Report Details</DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Truck ID: {selectedReport.truck_id}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Issue Description: {selectedReport.issue_description}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Reported Date: {new Date(selectedReport.reported_date).toLocaleString()}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Status: {selectedReport.status}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ViewReports;
