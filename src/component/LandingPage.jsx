import {
    AccountBalance as AccountIcon,
    Notifications as AlertIcon,
    ArrowForward as ArrowIcon,
    Business as BusinessIcon,
    CheckCircle as CheckIcon,
    Description as DocumentIcon,
    Download as DownloadIcon,
    ExpandMore as ExpandMoreIcon,
    Home as HomeIcon,
    Gavel as LawIcon,
    LocationOn as LocationIcon,
    Map as MapIcon,
    People as PeopleIcon,
    Phone as PhoneIcon,
    Receipt as ReceiptIcon
} from '@mui/icons-material';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    AppBar,
    Avatar,
    Box,
    Button,
    Card,
    Container,
    Grid,
    Paper,
    Toolbar,
    Typography,
    styled,
    useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
const FeatureCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  transition: 'transform 0.3s',
  borderRadius: theme.shape.borderRadius * 2,
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: theme.shadows[10]
  }
}));

const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  // Sample services data
  const services = [
    {
      id: 1,
      title: 'Certificate Replacement',
      icon: <ReceiptIcon />,
      desc: 'Replace lost/burnt deeds in 30 days',
      color: 'primary'
    },
    {
      id: 2,
      title: 'Plot Inheritance',
      icon: <AccountIcon />,
      desc: 'Transfer land rights legally',
      color: 'secondary'
    },
    {
      id: 3,
      title: 'Land Conversion',
      icon: <BusinessIcon />,
      desc: 'Customary to Common Law',
      color: 'success'
    },
    {
      id: 4,
      title: 'New Land Applications',
      icon: <HomeIcon />,
      desc: 'Residential/Agricultural',
      color: 'warning'
    }
  ];

  const features = [
    { icon: <CheckIcon />, text: 'Instant eligibility verification' },
    { icon: <DocumentIcon />, text: 'Pre-filled government forms' },
    { icon: <AlertIcon />, text: 'SMS application updates' },
    { icon: <LawIcon />, text: 'Latest land law changes' }
  ];

  const testimonials = [
    {
      quote: "Replaced my burnt lease certificate during lunch break!",
      author: "Onalenna B., Gaborone"
    },
    {
      quote: "Completed inheritance paperwork without visiting offices",
      author: "Kagiso T., Francistown"
    }
  ];

  const systemFeatures = [
    {
      icon: <MapIcon color="primary" sx={{ fontSize: 60 }} />,
      title: 'Land Allocation',
      description: 'Transparent and efficient land allocation process'
    },
    {
      icon: <DocumentIcon color="primary" sx={{ fontSize: 60 }} />,
      title: 'Online Applications',
      description: 'Submit land applications from anywhere'
    },
    {
      icon: <PeopleIcon color="primary" sx={{ fontSize: 60 }} />,
      title: 'Public Queue',
      description: 'Track your application status in real-time'
    }
  ];

  return (
    <Box>
      {/* Navigation Bar */}
      <AppBar position="static" elevation={0} sx={{ backgroundColor: 'white', color: theme.palette.primary.main }}>
        <Container maxWidth="xl">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              Botswana Land Services Portal
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                color="inherit" 
                onClick={() => navigate('/')}
                startIcon={<HomeIcon />}
              >
                Home
              </Button>
              <Button 
                color="inherit" 
                onClick={() => navigate('/services')}
                startIcon={<ReceiptIcon />}
              >
                Services
              </Button>
              <Button 
                color="inherit" 
                onClick={() => navigate('/education-portal')}
                startIcon={<MapIcon />}
              >
                Education
              </Button>
              <Button 
                color="inherit" 
                onClick={() => navigate('/contact')}
                startIcon={<PhoneIcon />}
              >
                Contact
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => navigate('/login')}
                sx={{ ml: 2 }}
              >
                Login
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          textAlign: 'center',
          py: 12,
          mb: 8,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          borderRadius: 2,
          boxShadow: 3
        }}
      >
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              Botswana Land Services Portal
            </Typography>
            <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 4 }}>
              Your land rights managed digitally - faster, simpler, transparent
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                onClick={() => navigate('/services')}
                sx={{ px: 6, py: 1.5, fontSize: '1.1rem' }}
                endIcon={<ArrowIcon />}
              >
                Explore Services
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                size="large"
                onClick={() => navigate('/education-portal')}
                sx={{ px: 6, py: 1.5, fontSize: '1.1rem' }}
              >
                Learn More
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Services Grid */}
        <Typography variant="h3" component="h2" gutterBottom sx={{ mt: 6, mb: 4, textAlign: 'center' }}>
          Our Land Services
        </Typography>
        <Grid container spacing={4} sx={{ mb: 8 }}>
{services.map((service) => (
  <Grid item xs={12} sm={6} md={3} key={service.id}>
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <Card elevation={3} sx={{ height: '100%' }}>
        {/* Remove CardActionArea and handle click on the Card directly */}
        <Box 
          sx={{ 
            p: 3, 
            height: '100%',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'action.hover'
            }
          }}
          onClick={() => navigate(`/services/${service.id}`)}
        >
          <Avatar sx={{ 
            bgcolor: `${service.color}.main`, 
            color: `${service.color}.contrastText`,
            mb: 2,
            width: 56, 
            height: 56
          }}>
            {service.icon}
          </Avatar>
          <Typography variant="h5" gutterBottom>
            {service.title}
          </Typography>
          <Typography color="text.secondary">
            {service.desc}
          </Typography>
          {/* Change Button to a styled Typography or Box */}
          <Box 
            sx={{ 
              mt: 2,
              display: 'flex',
              alignItems: 'center',
              color: 'primary.main',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
          >
            <Typography variant="body2">Details</Typography>
            <ArrowIcon fontSize="small" sx={{ ml: 1 }} />
          </Box>
        </Box>
      </Card>
    </motion.div>
  </Grid>
))}
        </Grid>

        {/* Features Section */}
        <Paper elevation={0} sx={{ p: 4, mb: 6, bgcolor: 'background.paper' }}>
          <Typography variant="h3" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
            Why Use Our Portal?
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={3} key={index}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    p: 3,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 1,
                    height: '100%'
                  }}>
                    <Avatar sx={{ bgcolor: 'primary.main', color: 'white', mr: 2 }}>
                      {feature.icon}
                    </Avatar>
                    <Typography variant="h6">{feature.text}</Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* System Features */}
        <Typography variant="h3" component="h2" gutterBottom sx={{ mt: 8, mb: 4, textAlign: 'center' }}>
          Key Features
        </Typography>
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {systemFeatures.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <FeatureCard elevation={3}>
                  {feature.icon}
                  <Typography variant="h5" component="h3" sx={{ mt: 2, mb: 1 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1">{feature.description}</Typography>
                </FeatureCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Testimonials */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h3" component="h2" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
            What Citizens Say
          </Typography>
          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={6} key={index}>
                <motion.div
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Paper sx={{ p: 3, height: '100%' }}>
                    <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 2 }}>
                      &quot;{testimonial.quote}&quot;
                    </Typography>
                    <Typography color="text.secondary">
                      — {testimonial.author}
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Process Infographic */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h3" component="h2" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
            How It Works
          </Typography>
          <Grid container spacing={2} sx={{ textAlign: 'center' }}>
            {[1, 2, 3, 4].map((step) => (
              <Grid item xs={12} sm={3} key={step}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Avatar sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'white', 
                    width: 56, 
                    height: 56,
                    mx: 'auto',
                    mb: 2
                  }}>
                    {step}
                  </Avatar>
                  <Typography variant="h6" gutterBottom>
                    {[
                      'Select Service',
                      'Verify Identity',
                      'Submit Documents',
                      'Track Progress'
                    ][step - 1]}
                  </Typography>
                  <Typography color="text.secondary">
                    {[
                      'Choose from 6 land services',
                      'Secure Omang verification',
                      'Upload required files',
                      'Get real-time updates'
                    ][step - 1]}
                  </Typography>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* About Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Paper elevation={3} sx={{ p: 4, mb: 8, borderRadius: 2 }}>
            <Typography variant="h3" component="h2" gutterBottom align="center">
              About the System
            </Typography>
            <Typography variant="body1" paragraph>
              The Botswana Land Services Portal provides a transparent and efficient platform for all land-related
              government services, from document replacement to inheritance processing. Our system eliminates
              bureaucracy and reduces waiting times through digital automation.
            </Typography>
            <Typography variant="body1" paragraph>
              The platform is designed to provide full visibility into land processes while maintaining secure,
              tamper-proof records of all transactions. We combine legal accuracy with user-friendly interfaces.
            </Typography>
          </Paper>
        </motion.div>

        {/* CTA Section */}
        <Paper sx={{ 
          p: 4, 
          mb: 6, 
          bgcolor: 'primary.main', 
          color: 'primary.contrastText',
          textAlign: 'center',
          borderRadius: 2
        }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
            Ready to Manage Your Land?
          </Typography>
          <Typography variant="h5" sx={{ mb: 4 }}>
            Average processing time reduced by 72%
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            sx={{ 
              bgcolor: 'white', 
              color: 'primary.main',
              px: 6,
              '&:hover': { bgcolor: '#f5f5f5' }
            }}
            onClick={() => navigate('/register')}
          >
            Get Started Today
          </Button>
        </Paper>

        {/* Trust Badges */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
                2,314+
              </Typography>
              <Typography>Applications processed</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
                100%
              </Typography>
              <Typography>Government certified</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
                24/7
              </Typography>
              <Typography>Mobile access</Typography>
            </Box>
          </Grid>
        </Grid>

        {/* FAQ Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h3" component="h2" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
            Frequently Asked Questions
          </Typography>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>How long does certificate replacement take?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Standard processing is 30 days from submission of complete documents including police affidavit.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Can I apply for land conversion online?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Yes, our portal handles the entire conversion process digitally, including payment of P260 in fees.
                You will need your original plot certificate and marriage documents if applicable.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>

        {/* Footer CTA */}
        <Box sx={{ 
          p: 4, 
          borderTop: '1px solid',
          borderColor: 'divider',
          textAlign: 'center'
        }}>
          <Typography variant="h5" gutterBottom>
            Need human assistance?
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 3 }}>
            <Button 
              variant="outlined" 
              startIcon={<LocationIcon />}
              onClick={() => navigate('/offices')}
            >
              Find Offices
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<PhoneIcon />}
              onClick={() => navigate('/contact')}
            >
              Call Support
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<DownloadIcon />}
              onClick={() => navigate('/downloads')}
            >
              Download Forms
            </Button>
          </Box>
        </Box>

        {/* Footer */}
        <Box sx={{ 
          py: 4, 
          textAlign: 'center', 
          backgroundColor: theme.palette.grey[200], 
          borderRadius: 2,
          mt: 4
        }}>
          <Typography variant="body2">
            &copy; {new Date().getFullYear()} Botswana Land Services Portal. All rights reserved.
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Button size="small" color="primary" onClick={() => navigate('/terms')}>
              Terms of Service
            </Button>
            <Button size="small" color="primary" onClick={() => navigate('/privacy')}>
              Privacy Policy
            </Button>
            <Button size="small" color="primary" onClick={() => navigate('/contact')}>
              Contact Us
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;