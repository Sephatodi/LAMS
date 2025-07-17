/** @jsxRuntime classic */
/** @jsx React.createElement */
// Add this
export const LandUseTypes = {
  // your land use definitions
};
export const BotswanaRegions = [
    'Gaborone', 'Francistown', 'Maun', 'Kasane', 'Serowe', 
    'Kanye', 'Molepolole', 'Mahalapye', 'Mochudi', 'Lobatse'
  ];
  
  export const LandPurposes = [
    { value: 'residential', label: 'Residential' },
    { value: 'agricultural', label: 'Agricultural' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'grazing', label: 'Grazing' },
    { value: 'community', label: 'Community Use' }
  ];
  
  export const LandStatuses = [
    { value: 'available', label: 'Available' },
    { value: 'allocated', label: 'Allocated' },
    { value: 'reserved', label: 'Reserved' },
    { value: 'disputed', label: 'Disputed' }
  ];
  
  export const DisputeTypes = [
    'Boundary', 'Ownership', 'Allocation', 'Encroachment', 'Inheritance'
  ];