// Simple test script to verify webhook functionality
const testWebhook = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/webhooks/clerk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'svix-id': 'test-id',
        'svix-timestamp': Date.now().toString(),
        'svix-signature': 'test-signature'
      },
      body: JSON.stringify({
        type: 'user.created',
        data: {
          id: 'test-user-id',
          email_addresses: [{ email_address: 'test@example.com' }],
          first_name: 'Test',
          last_name: 'User',
          public_metadata: { role: 'agency_user' },
          created_at: Date.now(),
          updated_at: Date.now()
        }
      })
    });

    console.log('Response status:', response.status);
    console.log('Response body:', await response.text());
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testWebhook();
