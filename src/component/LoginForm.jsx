/* eslint-disable unused-imports/no-unused-vars */
 
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    Divider,
    Link,
    Paper,
    TextField,
    Typography
} from '@mui/material';
import { useFormik } from 'formik';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
});

const EmailLogin = () => {
  const { loginWithEmail } = useAuth();
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await loginWithEmail(values.email, values.password);
      } catch (err) {
        // Error handled in AuthContext
      } finally {
        setSubmitting(false);
      }
    }
  });

  const isSubmitDisabled = !formik.isValid || formik.isSubmitting;

  return (
    <form onSubmit={formik.handleSubmit}>
      <TextField
        fullWidth
        margin="normal"
        label="Email"
        name="email"
        autoComplete="email"
        value={formik.values.email}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.email && Boolean(formik.errors.email)}
        helperText={formik.touched.email && formik.errors.email}
      />
      <TextField
        fullWidth
        margin="normal"
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        value={formik.values.password}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.password && Boolean(formik.errors.password)}
        helperText={formik.touched.password && formik.errors.password}
      />
      <Box sx={{ textAlign: 'right', mt: 1 }}>
        <Link 
          component="button" 
          type="button"
          onClick={() => navigate('/forgot-password')}
          sx={{ cursor: 'pointer' }}
        >
          Forgot password?
        </Link>
      </Box>
      <Button 
        fullWidth 
        type="submit" 
        variant="contained"
        size="large"
        disabled={isSubmitDisabled}
        sx={{ mt: 2, py: 1.5 }}
      >
        {formik.isSubmitting ? <CircularProgress size={24} /> : 'Login'}
      </Button>
    </form>
  );
};

const PhoneLogin = ({ onBack }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const { loginWithPhone, verifyPhoneOtp } = useAuth();

  const isValidPhoneNumber = phoneNumber.match(/^\+?\d{10,15}$/);

  const handleSendCode = async () => {
    setIsSendingCode(true);
    try {
      const result = await loginWithPhone(phoneNumber);
      setConfirmationResult(result);
    } catch (err) {
      // Error handled in AuthContext
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyOtp = async () => {
    setIsVerifying(true);
    try {
      await verifyPhoneOtp(confirmationResult, otp);
    } catch (err) {
      // Error handled in AuthContext
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Phone Verification
      </Typography>
      <TextField
        fullWidth
        margin="normal"
        label="Phone Number"
        type="tel"
        placeholder="+267XXXXXXXX"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        disabled={!!confirmationResult || isSendingCode}
      />
      
      {!confirmationResult ? (
        <Button
          fullWidth
          onClick={handleSendCode}
          disabled={!isValidPhoneNumber || isSendingCode}
          variant="contained"
          size="large"
          sx={{ mt: 2, py: 1.5 }}
        >
          {isSendingCode ? <CircularProgress size={24} /> : 'Send Verification Code'}
        </Button>
      ) : (
        <>
          <TextField
            fullWidth
            margin="normal"
            label="Verification Code"
            placeholder="6-digit code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            disabled={isVerifying}
            sx={{ mt: 3 }}
          />
          <Button 
            fullWidth 
            onClick={handleVerifyOtp}
            disabled={!otp || otp.length < 6 || isVerifying}
            variant="contained"
            size="large"
            sx={{ mt: 2, py: 1.5 }}
          >
            {isVerifying ? <CircularProgress size={24} /> : 'Verify Code'}
          </Button>
        </>
      )}
      
      <Button 
        fullWidth 
        onClick={onBack}
        disabled={isSendingCode || isVerifying}
        sx={{ mt: 2 }}
        variant="text"
      >
        Back to Email Login
      </Button>
    </>
  );
};

const SocialAuth = ({ onPhoneLogin }) => {
  const { socialLogin } = useAuth();
  const [loading, setLoading] = useState({
    google: false,
    facebook: false,
    phone: false
  });

  const handleSocialLogin = async (provider) => {
    setLoading(prev => ({ ...prev, [provider]: true }));
    try {
      await socialLogin(provider);
    } catch (err) {
      // Error handled in AuthContext
    } finally {
      setLoading(prev => ({ ...prev, [provider]: false }));
    }
  };

  const handlePhoneLogin = () => {
    setLoading(prev => ({ ...prev, phone: true }));
    try {
      onPhoneLogin();
    } finally {
      setLoading(prev => ({ ...prev, phone: false }));
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Button 
        fullWidth 
        onClick={() => handleSocialLogin('google')}
        disabled={loading.google || loading.facebook || loading.phone}
        variant="outlined"
        startIcon={<img src="/google-icon.png" alt="Google" width={20} />}
        sx={{ py: 1.5 }}
      >
        {loading.google ? <CircularProgress size={24} /> : 'Continue with Google'}
      </Button>
      <Button 
        fullWidth 
        onClick={() => handleSocialLogin('facebook')}
        disabled={loading.facebook || loading.google || loading.phone}
        variant="outlined"
        startIcon={<img src="/facebook-icon.png" alt="Facebook" width={20} />}
        sx={{ py: 1.5 }}
      >
        {loading.facebook ? <CircularProgress size={24} /> : 'Continue with Facebook'}
      </Button>
      <Button 
        fullWidth 
        onClick={handlePhoneLogin}
        disabled={loading.phone || loading.google || loading.facebook}
        variant="outlined"
        startIcon={<img src="/phone-icon.png" alt="Phone" width={20} />}
        sx={{ py: 1.5 }}
      >
        {loading.phone ? <CircularProgress size={24} /> : 'Continue with Phone'}
      </Button>
    </Box>
  );
};

const LoginForm = () => {
  const [phoneLogin, setPhoneLogin] = useState(false);
  const { error, clearError } = useAuth();

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
          Welcome Back
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
            {error}
          </Alert>
        )}

        {!phoneLogin ? (
          <>
            <EmailLogin />
            <Divider sx={{ my: 3 }}>OR</Divider>
            <SocialAuth onPhoneLogin={() => setPhoneLogin(true)} />
          </>
        ) : (
          <PhoneLogin onBack={() => {
            setPhoneLogin(false);
            clearError();
          }} />
        )}
        
        <div id="recaptcha-container"></div>
      </Paper>
    </Container>
  );
};

export default LoginForm;