// /src/services/allocationEngineService.js
import { historicalData, spatialAnalysis } from './gisService';

class AllocationEngine {
  constructor() {
    this.config = {
      equityWeights: {
        gender: 0.3,
        income: 0.2,
        tribalAffiliation: 0.1,
        disability: 0.15,
        youth: 0.25
      },
      suitabilityWeights: {
        environmental: 0.4,
        infrastructure: 0.3,
        zoning: 0.2,
        communityImpact: 0.1
      }
    };
  }

  async evaluatePlotSuitability(plotId, application) {
    // Multi-dimensional evaluation
    const [spatialData, historical, envFactors] = await Promise.all([
      spatialAnalysis.getPlotData(plotId),
      historicalData.getPlotHistory(plotId),
      this._getEnvironmentalFactors(plotId)
    ]);

    // Calculate suitability score (0-100)
    const suitabilityScore = this._calculateSuitabilityScore(
      spatialData, 
      historical, 
      envFactors, 
      application
    );

    // Check for conflicts
    const conflicts = await this._detectConflicts(plotId, application);

    // Equity evaluation
    const equityScore = this._calculateEquityScore(application.applicant);

    return {
      plotId,
      suitabilityScore,
      equityScore,
      conflicts,
      recommendation: suitabilityScore >= 70 && conflicts.length === 0 ? 'approve' : 'review',
      evaluationDate: new Date().toISOString(),
      details: {
        spatialAnalysis: spatialData,
        historicalUse: historical,
        environmentalFactors: envFactors
      }
    };
  }

  async _calculateSuitabilityScore(spatialData, historical, envFactors, application) {
    // Environmental factors (40%)
    const envScore = (
      (envFactors.waterAccess * 0.4) +
      (envFactors.soilQuality * 0.3) +
      (envFactors.floodRisk * 0.2) +
      (envFactors.climateResilience * 0.1)
    ) * 40;

    // Infrastructure factors (30%)
    const infraScore = (
      (spatialData.roadAccess ? 0.4 : 0) +
      (spatialData.utilities ? 0.3 : 0) +
      (spatialData.publicTransport ? 0.2 : 0) +
      (spatialData.communityFacilities ? 0.1 : 0)
    ) * 30;

    // Zoning compliance (20%)
    const zoningScore = spatialData.zoning === application.intendedUse ? 20 : 0;

    // Community impact (10%)
    const communityScore = await this._calculateCommunityImpact(
      spatialData, 
      historical, 
      application
    );

    return envScore + infraScore + zoningScore + communityScore;
  }

  async _detectConflicts(plotId, application) {
    const conflicts = [];
    
    // Boundary conflicts
    const boundaryIssues = await spatialAnalysis.checkBoundaryDisputes(plotId);
    if (boundaryIssues.length > 0) {
      conflicts.push({
        type: 'boundary',
        details: boundaryIssues
      });
    }

    // Historical claims
    const historicalClaims = await historicalData.checkCompetingClaims(plotId);
    if (historicalClaims.length > 0) {
      conflicts.push({
        type: 'historical_claim',
        details: historicalClaims
      });
    }

    // Customary rights
    const customaryRights = await historicalData.checkCustomaryRights(plotId);
    if (customaryRights.length > 0 && !application.acknowledgesCustomaryRights) {
      conflicts.push({
        type: 'customary_rights',
        details: customaryRights
      });
    }

    return conflicts;
  }

  _calculateEquityScore(applicant) {
    // Calculate based on equity weights
    let score = 0;
    
    // Gender equity
    score += applicant.gender === 'female' ? this.config.equityWeights.gender * 100 : 0;
    
    // Income level
    score += applicant.incomeLevel === 'low' ? this.config.equityWeights.income * 100 : 0;
    
    // Tribal affiliation (non-tribesmen get higher equity score)
    score += !applicant.isTribesman ? this.config.equityWeights.tribalAffiliation * 100 : 0;
    
    // Disability status
    score += applicant.hasDisability ? this.config.equityWeights.disability * 100 : 0;
    
    // Youth status
    score += applicant.age < 35 ? this.config.equityWeights.youth * 100 : 0;

    return Math.min(100, score);
  }

  async optimizeAllocation(applications, availablePlots) {
    // Advanced allocation algorithm combining suitability and equity
    const evaluations = [];
    
    for (const plot of availablePlots) {
      for (const application of applications) {
        const evaluation = await this.evaluatePlotSuitability(plot.id, application);
        evaluations.push({
          plot,
          application,
          ...evaluation
        });
      }
    }

    // Sort by combined score (suitability + equity)
    evaluations.sort((a, b) => {
      const scoreA = (a.suitabilityScore * 0.7) + (a.equityScore * 0.3);
      const scoreB = (b.suitabilityScore * 0.7) + (b.equityScore * 0.3);
      return scoreB - scoreA;
    });

    // Greedy algorithm for allocation
    const allocations = [];
    const allocatedPlots = new Set();
    const allocatedApplications = new Set();

    for (const eval of evaluations) {
      if (
        !allocatedPlots.has(eval.plot.id) && 
        !allocatedApplications.has(eval.application.id) &&
        eval.recommendation === 'approve'
      ) {
        allocations.push({
          plot: eval.plot,
          application: eval.application,
          score: (eval.suitabilityScore * 0.7) + (eval.equityScore * 0.3),
          evaluationDate: eval.evaluationDate
        });
        allocatedPlots.add(eval.plot.id);
        allocatedApplications.add(eval.application.id);
      }
    }

    return {
      allocations,
      unallocatedApplications: applications.filter(app => 
        !allocatedApplications.has(app.id))
    };
  }
}

export default new AllocationEngine();