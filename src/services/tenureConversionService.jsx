// /src/services/tenureConversionService.js
import { logAuditTrail } from './auditService';
import { generateDocument } from './documentGenerator';
import { notifyStakeholders } from './notificationService';

class TenureConversionService {
  constructor(apiClient) {
    this.apiClient = apiClient;
    this.conversionWorkflows = {
      tribal_to_freehold: this._handleTribalToFreehold.bind(this),
      state_to_tribal: this._handleStateToTribal.bind(this),
      customary_to_tribal: this._handleCustomaryToTribal.bind(this)
    };
  }

  async initiateConversion(conversionType, parcelId, applicantData) {
    // Validate conversion type
    if (!this.conversionWorkflows[conversionType]) {
      throw new Error(`Unsupported conversion type: ${conversionType}`);
    }

    // Execute the specific conversion workflow
    return this.conversionWorkflows[conversionType](parcelId, applicantData);
  }

  async _handleTribalToFreehold(parcelId, applicantData) {
    const steps = [
      this._verifyEligibility(parcelId, applicantData),
      this._checkRestrictions(parcelId),
      this._generateConversionDocument(parcelId, applicantData, 'freehold'),
      this._notifyRelevantParties(parcelId, 'tribal_to_freehold'),
      this._updateLandRecords(parcelId, 'freehold'),
      this._logConversion(parcelId, applicantData, 'tribal_to_freehold')
    ];

    return this._executeConversionSteps(steps);
  }

  async _handleStateToTribal(parcelId, applicantData) {
    const steps = [
      this._verifyTribalAuthorityApproval(parcelId, applicantData),
      this._conductPublicHearing(parcelId),
      this._generateConversionDocument(parcelId, applicantData, 'tribal'),
      this._notifyRelevantParties(parcelId, 'state_to_tribal'),
      this._updateLandRecords(parcelId, 'tribal'),
      this._logConversion(parcelId, applicantData, 'state_to_tribal')
    ];

    return this._executeConversionSteps(steps);
  }

  async _handleCustomaryToTribal(parcelId, applicantData) {
    const steps = [
      this._verifyCustomaryRights(parcelId, applicantData),
      this._resolvePotentialConflicts(parcelId),
      this._generateConversionDocument(parcelId, applicantData, 'tribal'),
      this._notifyCustomaryRightsholders(parcelId),
      this._updateLandRecords(parcelId, 'tribal'),
      this._logConversion(parcelId, applicantData, 'customary_to_tribal')
    ];

    return this._executeConversionSteps(steps);
  }

  async _executeConversionSteps(steps) {
    const results = [];
    for (const step of steps) {
      try {
        const result = await step;
        results.push({
          step: step.name,
          status: 'completed',
          result
        });
      } catch (error) {
        results.push({
          step: step.name,
          status: 'failed',
          error: error.message
        });
        throw new Error(`Conversion failed at step ${step.name}: ${error.message}`);
      }
    }
    return results;
  }

  async _verifyEligibility(parcelId, applicantData) {
    // Check if applicant meets criteria for conversion
    const eligibility = await this.apiClient.checkEligibility(parcelId, applicantData);
    if (!eligibility.isEligible) {
      throw new Error(`Applicant not eligible: ${eligibility.reason}`);
    }
    return eligibility;
  }

  async _checkRestrictions(parcelId) {
    // Verify there are no restrictions preventing conversion
    const restrictions = await this.apiClient.getParcelRestrictions(parcelId);
    if (restrictions.length > 0) {
      throw new Error(`Parcel has restrictions: ${restrictions.join(', ')}`);
    }
    return true;
  }

  async _generateConversionDocument(parcelId, applicantData, targetTenure) {
    // Generate the legal conversion document
    const templateName = `conversion_to_${targetTenure}`;
    const documentData = {
      parcelId,
      applicant: applicantData,
      conversionDate: new Date().toISOString(),
      legalReferences: this._getLegalReferences(targetTenure)
    };

    const document = await generateDocument(templateName, documentData);
    await this.apiClient.storeConversionDocument(parcelId, document);
    return document;
  }

  async _notifyRelevantParties(parcelId, conversionType) {
    // Notify all stakeholders about the conversion
    const parties = await this.apiClient.getInterestedParties(parcelId);
    const notifications = parties.map(party => 
      notifyStakeholders(party, conversionType, parcelId)
    );
    return Promise.all(notifications);
  }

  async _updateLandRecords(parcelId, newTenureType) {
    // Update the central land registry
    return this.apiClient.updateTenureType(parcelId, newTenureType);
  }

  async _logConversion(parcelId, applicantData, conversionType) {
    // Create audit trail
    return logAuditTrail({
      action: 'tenure_conversion',
      parcelId,
      userId: applicantData.userId,
      conversionType,
      timestamp: new Date().toISOString()
    });
  }

  _getLegalReferences(tenureType) {
    // Return relevant legal statutes based on tenure type
    const references = {
      freehold: [
        "Tribal Land Act Section 24(3)",
        "Land Policy 2019 Article 12",
        "Deeds Registry Act"
      ],
      tribal: [
        "Tribal Land Act Section 18",
        "Customary Rights Recognition Act",
        "Land Board Regulations 2020"
      ]
    };
    return references[tenureType] || [];
  }

  // Additional specialized methods for specific conversion types
  async _verifyTribalAuthorityApproval(parcelId, applicantData) {
    const approval = await this.apiClient.getTribalApproval(parcelId, applicantData.tribe);
    if (!approval.approved) {
      throw new Error(`Tribal authority denied conversion: ${approval.reason}`);
    }
    return approval;
  }

  async _conductPublicHearing(parcelId) {
    const hearing = await this.apiClient.schedulePublicHearing(parcelId);
    if (hearing.objections > 0) {
      throw new Error(`Public hearing received ${hearing.objections} objections`);
    }
    return hearing;
  }

  async _verifyCustomaryRights(parcelId, applicantData) {
    const rightsVerification = await this.apiClient.verifyCustomaryRights(
      parcelId, 
      applicantData.familyId
    );
    if (!rightsVerification.verified) {
      throw new Error(`Customary rights not verified: ${rightsVerification.reason}`);
    }
    return rightsVerification;
  }

  async _resolvePotentialConflicts(parcelId) {
    const conflicts = await this.apiClient.checkCustomaryConflicts(parcelId);
    if (conflicts.length > 0) {
      const resolution = await this.apiClient.mediateCustomaryConflict(parcelId, conflicts);
      if (!resolution.resolved) {
        throw new Error(`Customary conflicts not resolved: ${resolution.unresolved.join(', ')}`);
      }
      return resolution;
    }
    return { resolved: true };
  }

  async _notifyCustomaryRightsholders(parcelId) {
    const rightsholders = await this.apiClient.getCustomaryRightsholders(parcelId);
    const notifications = rightsholders.map(rightsholder =>
      notifyStakeholders(rightsholder, 'customary_to_tribal', parcelId)
    );
    return Promise.all(notifications);
  }
}

export default new TenureConversionService();