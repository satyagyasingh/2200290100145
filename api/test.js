const config = require('./config');
const axios = require('axios');

async function testAuth() {
  console.log('Testing authentication...');
  console.log('Using accessCode:', config.accessCode);
  
  const authData = { 
    email: config.email, 
    name: config.name, 
    rollNo: config.rollNo, 
    accessCode: config.accessCode, 
    clientID: config.clientId, 
    clientSecret: config.clientSecret 
  };
  
  try {
    console.log('Auth data:', authData);
    const response = await axios.post(`${config.apiUrl}/auth`, authData);
    console.log('Auth successful:', response.data);
    return response.data.access_token;
  } catch (error) {
    console.error('Auth error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
}

async function testGetStocks(token) {
  console.log('\nTesting get stocks...');
  try {
    const response = await axios.get(`${config.apiUrl}/stocks`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Stocks fetched successfully:', Object.keys(response.data.stocks).length, 'stocks');
    return response.data;
  } catch (error) {
    console.error('Error fetching stocks:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
}

async function runTests() {
  try {
    const token = await testAuth();
    const stocks = await testGetStocks(token);
    console.log('\nAll tests passed successfully!');
  } catch (error) {
    console.error('\nTests failed with error:', error.message);
  }
}

runTests(); 