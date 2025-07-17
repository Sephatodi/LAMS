export const generateDocument = async (templateName, data) => {
  try {
    const response = await fetch('/api/documents/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ templateName, data })
    });
    
    if (!response.ok) {
      throw new Error('Document generation failed');
    }
    
    return await response.blob();
  } catch (error) {
    console.error('Document generation error:', error);
    throw error;
  }
};