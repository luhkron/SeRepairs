import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import ReportIssue from './components/ReportIssue';
import ViewReports from './components/ViewReports';
import Login from './components/Login';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/report" element={<ReportIssue />} />
          <Route path="/reports" element={<ViewReports />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
