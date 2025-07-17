export const logAuditTrail = async (auditEntry) => {
  try {
    const response = await fetch('/api/audit/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(auditEntry)
    });
    
    if (!response.ok) {
      throw new Error('Audit logging failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Audit logging error:', error);
    throw error;
  }
};