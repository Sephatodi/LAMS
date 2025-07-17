// /src/schemas/documentSchemas.js
export const LandBoardDocumentSchema = {
  residential_application: {
    applicantId: (val) => !!val && /^[A-Z0-9\-]{6,}$/.test(val),
    applicantName: (val) => !!val && val.length >= 3,
    plotNumber: (val) => !!val && /^[A-Z0-9]+$/.test(val)
  },
  commercial_application: {
    applicantId: (val) => !!val && /^[A-Z0-9\-]{6,}$/.test(val),
    businessName: (val) => !!val && val.length >= 3,
    businessType: (val) => !!val
  },
  dispute_complaint: {
    applicantId: (val) => !!val && /^[A-Z0-9\-]{6,}$/.test(val),
    disputeType: (val) => !!val,
    description: (val) => !!val && val.length >= 10
  },
  default: {
    applicantId: (val) => !!val,
    applicantName: (val) => !!val
  }
};