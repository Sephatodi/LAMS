export const notifyStakeholders = async (stakeholder, notificationType, data) => {
  try {
    const response = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ stakeholder, notificationType, data })
    });
    
    if (!response.ok) {
      throw new Error('Notification failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Notification error:', error);
    throw error;
  }
};