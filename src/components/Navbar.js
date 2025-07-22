import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            '&:hover': {
              color: theme.palette.primary.light,
            },
          }}
        >
          Truck Maintenance Portal
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            color="inherit"
            component={RouterLink}
            to="/report"
            sx={{
              display: 'none',
              [theme.breakpoints.up('sm')]: {
                display: 'block',
              },
            }}
          >
            Report Issue
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/reports"
            sx={{
              display: 'none',
              [theme.breakpoints.up('sm')]: {
                display: 'block',
              },
            }}
          >
            View Reports
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
