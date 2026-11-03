const axios = require('axios');

async function runTest() {
  console.log('Testing the Management Service...');
  
  try {
    // 1. Create Business Owner
    console.log('Creating Business Owner...');
    const ownerRes = await axios.post('http://localhost:4000/api/owners', {
      email: 'owner@testbusiness.com',
      password: 'password123',
      name: 'Test Owner'
    });
    console.log('Owner created:', ownerRes.data);

    // 2. Provision Tenant
    console.log('Provisioning Tenant...');
    const tenantRes = await axios.post('http://localhost:4000/api/tenants', {
      ownerId: ownerRes.data.id,
      storeName: 'My Awesome Test Store',
      domain: 'teststore.saas.local'
    });
    console.log('Provisioning response:', tenantRes.data);
    
  } catch (error) {
    console.error('Error during test:', error.response ? error.response.data : error.message);
  }
}

runTest();
