/** @jsxRuntime classic */
/** @jsx React.createElement */

import { FilterAlt, Gavel, Map, MonetizationOn, Search } from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Grid,
    Tab,
    Tabs,
    TextField,
    Typography
} from '@mui/material';
import { useEffect, useState } from 'react';

const ViewLand = () => {
  const [landParcels, setLandParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [filters, _setFilters] = useState({
    region: '',
    priceRange: [0, 1000000],
    sizeRange: [0, 5000]
  });

  useEffect(() => {
    // Simulate API call to fetch land data
    const fetchData = async () => {
      try {
        // In a real app, this would be an API call
        setTimeout(() => {
          setLandParcels([
            { 
              id: 1, 
              plotNumber: 'TL-001', 
              region: 'Gaborone', 
              size: '500 sqm', 
              status: 'available', 
              type: 'private',
              price: 'P250,000',
              seller: 'Private Owner',
              auctionEnd: null,
              description: 'Residential plot in Block 9 with utilities access'
            },
            { 
              id: 2, 
              plotNumber: 'TL-002', 
              region: 'Francistown', 
              size: '750 sqm', 
              status: 'available', 
              type: 'auction',
              price: 'P180,000',
              seller: 'Land Board',
              auctionEnd: '2023-12-15',
              description: 'Commercial plot near CBD, auction ends Dec 15'
            },
            { 
              id: 3, 
              plotNumber: 'TL-003', 
              region: 'Maun', 
              size: '1000 sqm', 
              status: 'reserved', 
              type: 'private',
              price: 'P320,000',
              seller: 'Private Owner',
              auctionEnd: null,
              description: 'Riverfront property with existing structures'
            },
            { 
              id: 4, 
              plotNumber: 'TL-004', 
              region: 'Gaborone', 
              size: '1200 sqm', 
              status: 'available', 
              type: 'auction',
              price: 'P420,000',
              seller: 'Ministry of Lands',
              auctionEnd: '2023-11-30',
              description: 'Prime industrial land in Block 10'
            },
          ]);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching land data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const filteredLand = landParcels.filter(parcel => {
    const matchesSearch = parcel.plotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         parcel.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRegion = filters.region ? parcel.region === filters.region : true;
    const matchesStatus = parcel.status === 'available';
    const matchesType = activeTab === 0 ? true : 
                       activeTab === 1 ? parcel.type === 'private' : 
                       parcel.type === 'auction';

    return matchesSearch && matchesRegion && matchesStatus && matchesType;
  });

  const _regions = [...new Set(landParcels.map(parcel => parcel.region))];

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Available Land for Sale
        </Typography>
        
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="All Listings" />
          <Tab label="Private Sales" />
          <Tab label="Auctions" />
        </Tabs>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by plot number or description..."
            InputProps={{ startAdornment: <Search /> }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="outlined" startIcon={<FilterAlt />}>
            Filters
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredLand.length === 0 ? (
          <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
            No land parcels match your search criteria
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {filteredLand.map((parcel) => (
              <Grid item xs={12} md={6} lg={4} key={parcel.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="h6">{parcel.plotNumber}</Typography>
                      {parcel.type === 'auction' ? (
                        <Chip 
                          icon={<Gavel />} 
                          label="Auction" 
                          color="warning" 
                          size="small" 
                        />
                      ) : (
                        <Chip 
                          icon={<MonetizationOn />} 
                          label="Private Sale" 
                          color="primary" 
                          size="small" 
                        />
                      )}
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {parcel.region} • {parcel.size}
                    </Typography>
                    
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {parcel.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="subtitle1" color="primary">
                        {parcel.price}
                      </Typography>
                      <Typography variant="caption">
                        Seller: {parcel.seller}
                      </Typography>
                    </Box>
                    
                    {parcel.auctionEnd && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Auction ends: {parcel.auctionEnd}
                        </Typography>
                      </Box>
                    )}
                    
                    <Box sx={{ mt: 'auto', display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<Map />}
                        fullWidth
                      >
                        View Details
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        color={parcel.type === 'auction' ? 'warning' : 'primary'}
                        startIcon={parcel.type === 'auction' ? <Gavel /> : <MonetizationOn />}
                      >
                        {parcel.type === 'auction' ? 'Place Bid' : 'Contact Seller'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default ViewLand;