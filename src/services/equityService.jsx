// /src/services/equityService.js
import api from './api';

class EquityService {
  constructor() {
    this.demographicCache = {};
    this.equityPolicies = {
      genderWeight: 0.3,
      incomeWeight: 0.2,
      tribalWeight: 0.1,
      disabilityWeight: 0.15,
      youthWeight: 0.25,
      minAllocation: 0.3 // Minimum allocation for disadvantaged groups
    };
  }

  async getDemographicData(regionId) {
    if (this.demographicCache[regionId]) {
      return this.demographicCache[regionId];
    }

    try {
      const response = await api.get(`/demographics/${regionId}`);
      const data = response.data;
      
      // Cache the data
      this.demographicCache[regionId] = data;
      
      return data;
    } catch (error) {
      console.error('Error fetching demographic data:', error);
      return this._getDefaultDemographics();
    }
  }

  async calculateEquityScore(applicant, regionId) {
    const demographics = await this.getDemographicData(regionId);
    
    let score = 0;
    
    // Gender equity (favor women applicants)
    if (applicant.gender === 'female') {
      score += this.equityPolicies.genderWeight * 
        (1 - demographics.genderRatio.female);
    }
    
    // Income equity (favor low-income applicants)
    if (applicant.incomeLevel === 'low') {
      score += this.equityPolicies.incomeWeight * 
        (1 - demographics.incomeDistribution.low);
    }
    
    // Tribal affiliation (favor non-tribesmen)
    if (!applicant.isTribesman) {
      score += this.equityPolicies.tribalWeight * 
        demographics.tribalDistribution.nonTribal;
    }
    
    // Disability status
    if (applicant.hasDisability) {
      score += this.equityPolicies.disabilityWeight * 
        (1 - demographics.disabilityRatio);
    }
    
    // Youth status
    if (applicant.age < 35) {
      score += this.equityPolicies.youthWeight * 
        (1 - demographics.ageDistribution.youth);
    }
    
    return Math.min(1, score);
  }

  async getEquityAllocationRecommendation(applications, availablePlots, regionId) {
    const demographics = await this.getDemographicData(regionId);
    
    // Categorize applicants
    const disadvantagedApps = applications.filter(app => 
      app.gender === 'female' || 
      app.incomeLevel === 'low' ||
      !app.isTribesman ||
      app.hasDisability ||
      app.age < 35
    );
    
    const minAllocation = Math.floor(
      availablePlots.length * this.equityPolicies.minAllocation
    );
    
    return {
      totalApplications: applications.length,
      disadvantagedApplications: disadvantagedApps.length,
      recommendedAllocation: Math.max(minAllocation, disadvantagedApps.length),
      demographicData: demographics
    };
  }

  _getDefaultDemographics() {
    // Fallback data if API fails
    return {
      genderRatio: { male: 0.49, female: 0.51 },
      incomeDistribution: { low: 0.4, medium: 0.5, high: 0.1 },
      tribalDistribution: { tribal: 0.8, nonTribal: 0.2 },
      disabilityRatio: 0.05,
      ageDistribution: { youth: 0.35, adult: 0.55, senior: 0.1 }
    };
  }
}

export default new EquityService();