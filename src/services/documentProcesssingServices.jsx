// /src/services/documentProcessingService.js
import Tesseract from 'tesseract.js';
import { LandBoardDocumentSchema } from '../schemas/documentSchemas';

class DocumentProcessingService {
  constructor(apiClient) {
    this.apiClient = apiClient;
    this.ocrWorker = Tesseract.createWorker();
  }

  async initialize() {
    await this.ocrWorker.load();
    await this.ocrWorker.loadLanguage('eng');
    await this.ocrWorker.initialize('eng');
  }

  async processDocument(file) {
    try {
      // Step 1: OCR Processing
      const { data: ocrText } = await this.ocrWorker.recognize(file);
      
      // Step 2: Document Classification
      const docType = this.classifyDocument(ocrText);
      
      // Step 3: Data Extraction
      const extractedData = this.extractData(ocrText, docType);
      
      // Step 4: Validation
      const validationResult = this.validateDocument(extractedData, docType);
      
      if (!validationResult.isValid) {
        throw new Error(`Document validation failed: ${validationResult.errors.join(', ')}`);
      }
      
      // Step 5: Save to system
      const savedDoc = await this.apiClient.saveDocument({
        ...extractedData,
        originalText: ocrText,
        documentType: docType,
        status: 'processed'
      });
      
      return {
        success: true,
        document: savedDoc,
        metadata: {
          processingTime: new Date(),
          pagesProcessed: ocrText.pages || 1
        }
      };
    } catch (error) {
      console.error('Document processing error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  classifyDocument(text) {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('application form') && lowerText.includes('land board')) {
      if (lowerText.includes('residential')) return 'residential_application';
      if (lowerText.includes('commercial')) return 'commercial_application';
      if (lowerText.includes('agricultural')) return 'agricultural_application';
    }
    
    if (lowerText.includes('complaint') && lowerText.includes('land dispute')) {
      return 'dispute_complaint';
    }
    
    if (lowerText.includes('transfer') && lowerText.includes('ownership')) {
      return 'ownership_transfer';
    }
    
    return 'general_document';
  }

  extractData(text, docType) {
    const data = { rawText: text };
    
    // Extract common fields
    const idMatch = text.match(/ID No:?\s*([A-Z0-9\-]+)/i);
    if (idMatch) data.applicantId = idMatch[1];
    
    const nameMatch = text.match(/Full Name:?\s*([A-Za-z\s]+)/i);
    if (nameMatch) data.applicantName = nameMatch[1].trim();
    
    // Type-specific extraction
    switch(docType) {
      case 'residential_application':
        const plotMatch = text.match(/Plot No:?\s*([A-Z0-9]+)/i);
        if (plotMatch) data.plotNumber = plotMatch[1];
        break;
        
      case 'commercial_application':
        const businessMatch = text.match(/Business Name:?\s*([A-Za-z0-9\s&]+)/i);
        if (businessMatch) data.businessName = businessMatch[1].trim();
        break;
        
      case 'dispute_complaint':
        const disputeMatch = text.match(/Dispute Type:?\s*([A-Za-z\s]+)/i);
        if (disputeMatch) data.disputeType = disputeMatch[1].trim();
        break;
    }
    
    return data;
  }

  validateDocument(data, docType) {
    const schema = LandBoardDocumentSchema[docType] || LandBoardDocumentSchema.default;
    const errors = [];
    
    for (const [field, validator] of Object.entries(schema)) {
      if (!validator(data[field])) {
        errors.push(`Missing or invalid ${field}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async cleanup() {
    await this.ocrWorker.terminate();
  }
}

export default DocumentProcessingService;