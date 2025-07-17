import {
    CheckCircle as CheckCircleIcon,
    DoneAll as DoneAllIcon,
    Error as ErrorIcon,
    Warning as WarningIcon
} from '@mui/icons-material';
import { Box, LinearProgress, Tooltip, Typography } from '@mui/material';
import React from 'react';

const PasswordStrengthMeter = ({ password }) => {
  const calculateStrength = () => {
    if (!password) return 0;
    
    let strength = 0;
    const requirements = {
      minLength: password.length >= 8,
      goodLength: password.length >= 12,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[^A-Za-z0-9]/.test(password),
      hasRepeated: /(.)\1/.test(password)
    };

    // Length contributes more to strength
    if (requirements.minLength) strength += 25;
    if (requirements.goodLength) strength += 15;
    
    // Character type checks
    if (requirements.hasUpper) strength += 15;
    if (requirements.hasLower) strength += 15;
    if (requirements.hasNumber) strength += 15;
    if (requirements.hasSpecial) strength += 15;
    
    // Penalties
    if (requirements.hasRepeated) strength -= 10;
    
    return Math.min(Math.max(strength, 0), 100);
  };

  const strength = calculateStrength();
  
  const getStrengthData = () => {
    if (strength === 0) return {
      label: '',
      color: 'inherit',
      icon: null,
      description: 'Enter a password to check strength'
    };
    if (strength < 40) return {
      label: 'Weak',
      color: 'error',
      icon: <ErrorIcon color="error" fontSize="small" />,
      description: 'Easy to crack. Add more character types and length.'
    };
    if (strength < 70) return {
      label: 'Moderate',
      color: 'warning',
      icon: <WarningIcon color="warning" fontSize="small" />,
      description: 'Could be stronger. Add more complexity.'
    };
    if (strength < 90) return {
      label: 'Strong',
      color: 'success',
      icon: <CheckCircleIcon color="success" fontSize="small" />,
      description: 'Good password. Meets most security standards.'
    };
    return {
      label: 'Very Strong',
      color: 'success',
      icon: <DoneAllIcon color="success" fontSize="small" />,
      description: 'Excellent password. Very hard to crack.'
    };
  };

  const strengthData = getStrengthData();

  return (
    <Box sx={{ mt: 1, mb: 2 }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 0.5
      }}>
        <Typography variant="caption" color="text.secondary">
          Password Strength:
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {strengthData.icon && (
            <Tooltip title={strengthData.description}>
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                {strengthData.icon}
              </Box>
            </Tooltip>
          )}
          <Typography 
            variant="caption" 
            color={`${strengthData.color}.main`}
            sx={{ fontWeight: 'bold' }}
          >
            {strengthData.label} {password && `(${Math.round(strength)}%)`}
          </Typography>
        </Box>
      </Box>
      
      <LinearProgress
        variant="determinate"
        value={strength}
        color={strengthData.color}
        sx={{ 
          height: 8, 
          borderRadius: 4,
          backgroundColor: (theme) => theme.palette.grey[300],
          '& .MuiLinearProgress-bar': {
            borderRadius: 4,
          }
        }}
      />
      
      {password && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          mt: 0.5
        }}>
          <Typography variant="caption" color="text.secondary">
            {password.length < 8 ? (
              <span style={{ color: 'error.main' }}>Too short (min 8 chars)</span>
            ) : password.length < 12 ? (
              'Could be longer'
            ) : (
              'Good length'
            )}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Complexity: {[
              /[A-Z]/.test(password) ? 'Uppercase' : null,
              /[a-z]/.test(password) ? 'Lowercase' : null,
              /\d/.test(password) ? 'Numbers' : null,
              /[^A-Za-z0-9]/.test(password) ? 'Special' : null
            ].filter(Boolean).join(', ')}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default PasswordStrengthMeter;