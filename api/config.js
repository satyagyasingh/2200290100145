require('dotenv').config();

// Ensure accessCode is exactly 6 characters long
const accessCode = process.env.ACCESS_CODE || 'a1b2c3';
const sixCharAccessCode = accessCode.substring(0, 6);

module.exports = {
  port: process.env.PORT || 4000,
  apiUrl: 'http://20.244.56.144/evaluation-service',
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  email: process.env.EMAIL,
  name: process.env.NAME,
  rollNo: process.env.ROLL_NO,
  accessCode: sixCharAccessCode
}; 